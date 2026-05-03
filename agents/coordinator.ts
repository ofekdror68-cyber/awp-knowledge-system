// Agent 5: Coordinator — brain of the acquisition system
// Reads audit data, builds queue, dispatches agents 1→2→3, runs forum scraper in parallel.

import { sbGet, sbPost, sbPatch, SUPABASE_URL, SUPABASE_KEY, sleep, QueueItem } from './shared'
import { runOemHunter } from './oem-hunter'
import { runDistributorHunter } from './distributor-hunter'
import { runArchiveHunter } from './archive-hunter'
import { runForumScraper } from './forum-scraper'

const CATEGORIES_COUNT = 22

// Categories ordered by operational priority (not by ID)
// Critical first: service, schematics, fault codes → then PM → then operator → then parts
const CATEGORY_PRIORITY: number[] = [
  2,  // service manual         🔴
  8,  // fault codes            🔴
  5,  // electrical schematic   🔴
  6,  // hydraulic schematic    🔴
  7,  // wiring diagram         🔴
  9,  // troubleshooting        🔴
  4,  // PM schedule            🟡
  10, // diagnostic procedures  🟡
  18, // service bulletins      🟡
  19, // recall notices         🟡
  1,  // operator manual        🟢
  3,  // parts catalog          🟢
  17, // load chart             🟢
  11, 12, 13, 14, 15, 16, 20, 21, 22,
]

interface AuditModel {
  brand: string
  model: string
  coverageCells: Record<number, unknown[]>
}

interface AuditData {
  models: AuditModel[]
  totalDocs: number
  overallCoverage: number
}

const CATEGORY_NAMES: Record<number, string> = {
  1: 'מדריך הפעלה', 2: 'מדריך שירות', 3: 'קטלוג חלקים', 4: 'לוח תחזוקה',
  5: 'סכמת חשמל', 6: 'סכמת הידראוליקה', 7: 'תרשים חיווט', 8: 'קודי שגיאה',
  9: 'עץ אבחון', 10: 'נהלי בדיקה', 11: 'מדריך מנוע', 12: 'מפרט סוללות',
  13: 'מפרט הידראולי', 14: 'תיעוד בקר / ECU', 15: 'תוויות בטיחות',
  16: 'בדיקה שנתית', 17: 'תרשים עומסים', 18: 'עדכוני שירות', 19: 'הודעות החזרה',
  20: 'עדכוני תוכנה', 21: 'מפרטי שמנים', 22: 'נוהלי כיול',
}

export interface CoordinatorResult {
  startedAt: string
  completedAt: string
  docsBefore: number
  docsAfter: number
  coverageBefore: number
  coverageAfter: number
  queued: number
  completed: number
  failed: number
  manualRequired: number
  forumThreads: number
  manualTodo: ManualTodoItem[]
  log: string[]
}

export interface ManualTodoItem {
  brand: string
  model: string
  category: number
  categoryName: string
  triedUrls: string[]
  notes: string
}

const BRAND_NOTES: Record<string, string> = {
  JLG: 'יצרן: JLG Industries | נציג ישראלי: חפש "JLG ישראל" | פייסבוק: "JLG Mechanics" | service@jlg.com',
  Genie: 'יצרן: Genie/Terex | נציג ישראלי: electra-leasing.co.il | פייסבוק: "Genie AWP Technicians"',
  Dingli: 'יצרן: SINOBOOM/Dingli סין | אירופה: dingli.eu | email: service@dingli.eu | WhatsApp יצרן',
  Manitou: 'יצרן: Manitou Group | נציג ישראלי: manitou-il.com | פייסבוק: "Manitou Telehandler Technicians"',
}

async function getAuditData(): Promise<AuditData> {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/audit`, { signal: AbortSignal.timeout(30000) })
  if (!res.ok) throw new Error(`Audit API failed: ${res.status}`)
  return res.json()
}

async function buildQueue(auditData: AuditData): Promise<number> {
  let queued = 0

  for (const modelEntry of auditData.models) {
    const { brand, model, coverageCells } = modelEntry

    // Use priority order instead of sequential 1→22
    for (const catId of CATEGORY_PRIORITY) {
      const covered = coverageCells[catId] && coverageCells[catId].length > 0
      if (covered) continue

      // Check if already in queue
      const existing = await sbGet<{ id: string; status: string }>(
        'acquisition_queue',
        `brand=eq.${encodeURIComponent(brand)}&model=eq.${encodeURIComponent(model)}&category=eq.${catId}&status=neq.completed`
      )
      if (existing.length > 0) continue

      await sbPost('acquisition_queue', {
        brand,
        model,
        category: catId,
        category_name: CATEGORY_NAMES[catId] || `Category ${catId}`,
        status: 'pending',
        retry_count: 0,
        attempted_urls: [],
      })
      queued++
    }
  }
  return queued
}

const CRITICAL_CATS = new Set([2, 5, 6, 7, 8, 9])

async function processItem(item: QueueItem, log: string[]): Promise<'completed' | 'failed' | 'manual'> {
  const isCritical = CRITICAL_CATS.has(item.category)
  log.push(`[${item.brand} ${item.model} cat${item.category}${isCritical ? ' 🔴' : ''}] → OEM Hunter...`)

  const oemResult = await runOemHunter(item)
  if (oemResult === 'success') {
    log.push(`  ✓ OEM Hunter succeeded`)
    return 'completed'
  }

  await sleep(isCritical ? 1000 : 2000)
  log.push(`  → Distributor Hunter...`)
  const distResult = await runDistributorHunter(item)
  if (distResult === 'success') {
    log.push(`  ✓ Distributor Hunter succeeded`)
    return 'completed'
  }

  await sleep(isCritical ? 1000 : 2000)
  log.push(`  → Archive Hunter...`)
  const archResult = await runArchiveHunter(item)
  if (archResult === 'success') {
    log.push(`  ✓ Archive Hunter succeeded`)
    return 'completed'
  }
  if (archResult === 'manual') {
    log.push(`  ⚠ Manual required for ${item.brand} ${item.model} cat${item.category}`)
    return 'manual'
  }

  // For critical categories: if all 3 failed, retry OEM + Distributor in parallel one more time
  if (isCritical && item.retry_count < 2) {
    log.push(`  🔄 Critical cat — parallel retry (OEM + Distributor)...`)
    await sleep(3000)
    const [retryOem, retryDist] = await Promise.allSettled([
      runOemHunter(item),
      runDistributorHunter(item),
    ])
    const oemOk = retryOem.status === 'fulfilled' && retryOem.value === 'success'
    const distOk = retryDist.status === 'fulfilled' && retryDist.value === 'success'
    if (oemOk || distOk) {
      log.push(`  ✓ Parallel retry succeeded`)
      return 'completed'
    }
  }

  log.push(`  ✗ All agents failed`)
  return 'failed'
}

export async function runCoordinator(options?: {
  batchSize?: number
  includeForums?: boolean
  onProgress?: (msg: string) => void
}): Promise<CoordinatorResult> {
  const startedAt = new Date().toISOString()
  const log: string[] = []
  const batchSize = options?.batchSize || 20

  const emit = (msg: string) => {
    log.push(msg)
    options?.onProgress?.(msg)
  }

  emit('=== AWP Acquisition Coordinator Starting ===')
  emit(`Batch size: ${batchSize}`)

  // 1. Get current audit data
  emit('Reading audit data...')
  let auditData: AuditData
  try {
    auditData = await getAuditData()
  } catch (e) {
    throw new Error(`Failed to get audit data: ${e}`)
  }
  const docsBefore = auditData.totalDocs
  const coverageBefore = auditData.overallCoverage
  emit(`Before: ${docsBefore} docs, ${coverageBefore}% coverage, ${auditData.models.length} models`)

  // 2. Build queue
  emit('Building acquisition queue...')
  const queued = await buildQueue(auditData)
  emit(`Queued ${queued} new items`)

  // 3. Process queue in batches
  // Fetch pending items — critical categories first (lower catId in CATEGORY_PRIORITY = higher priority)
  // We do two fetches: critical first, then rest
  const criticalCats = [2, 5, 6, 7, 8, 9]
  const criticalFilter = criticalCats.map(c => `category.eq.${c}`).join(',')
  const criticalItems = await sbGet<QueueItem>(
    'acquisition_queue',
    `status=eq.pending&or=(${criticalFilter})&order=retry_count.asc,created_at.asc&limit=${Math.ceil(batchSize * 0.7)}`
  )
  const normalItems = await sbGet<QueueItem>(
    'acquisition_queue',
    `status=eq.pending&order=retry_count.asc,created_at.asc&limit=${batchSize}`
  )
  // Merge: critical first, then fill remaining from normal (dedup by id)
  const criticalIds = new Set(criticalItems.map(i => i.id))
  const pendingItems = [
    ...criticalItems,
    ...normalItems.filter(i => !criticalIds.has(i.id)),
  ].slice(0, batchSize)
  emit(`Processing ${pendingItems.length} pending items...`)

  let completed = 0, failed = 0, manualRequired = 0

  // Process up to 5 concurrently
  const CONCURRENCY = 5
  for (let i = 0; i < pendingItems.length; i += CONCURRENCY) {
    const batch = pendingItems.slice(i, i + CONCURRENCY)
    const results = await Promise.allSettled(batch.map(item => processItem(item, log)))
    for (const result of results) {
      if (result.status === 'fulfilled') {
        if (result.value === 'completed') completed++
        else if (result.value === 'manual') manualRequired++
        else failed++
      } else {
        failed++
      }
    }
    await sleep(3000)
  }

  // 4. Run forum scraper in parallel (if requested)
  let forumThreads = 0
  if (options?.includeForums !== false) {
    emit('Running forum scraper...')
    try {
      const forumResult = await runForumScraper({ limit: 8 })
      forumThreads = forumResult.saved
      emit(`Forum scraper: ${forumThreads} threads saved. Sources: ${JSON.stringify(forumResult.sources)}`)
    } catch (e) {
      emit(`Forum scraper error: ${e}`)
    }
  }

  // 5. Get manual required items for report
  const manualItems = await sbGet<QueueItem>(
    'acquisition_queue',
    'status=eq.manual_required&limit=100'
  )
  const manualTodo: ManualTodoItem[] = manualItems.map(item => ({
    brand: item.brand,
    model: item.model,
    category: item.category,
    categoryName: item.category_name,
    triedUrls: item.attempted_urls || [],
    notes: BRAND_NOTES[item.brand] || 'פנה ליצרן ישירות',
  }))

  // 6. Get updated stats
  let docsAfter = docsBefore, coverageAfter = coverageBefore
  try {
    const updatedAudit = await getAuditData()
    docsAfter = updatedAudit.totalDocs
    coverageAfter = updatedAudit.overallCoverage
  } catch { /* ignore */ }

  const completedAt = new Date().toISOString()

  emit(`=== DONE ===`)
  emit(`Completed: ${completed} | Failed: ${failed} | Manual: ${manualRequired} | Forum: ${forumThreads}`)
  emit(`Coverage: ${coverageBefore}% → ${coverageAfter}% (${docsAfter - docsBefore} new docs)`)

  return {
    startedAt, completedAt,
    docsBefore, docsAfter,
    coverageBefore, coverageAfter,
    queued, completed, failed, manualRequired, forumThreads,
    manualTodo, log,
  }
}
