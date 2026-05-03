// Agent 1: OEM Hunter — searches official manufacturer sites for PDFs
// Priority order: Service → Fault Codes → Schematics → PM → Operator → Parts

import {
  fetchWithRetry, isValidPdf, uploadToStorage, registerDocument,
  markCompleted, markFailed, SUPABASE_URL, SUPABASE_KEY, sleep, QueueItem,
} from './shared'
import { scrapeUrl, tryDownloadPdf, searchSiteForPdf } from '@/skills/web-learning/scraper'

// Critical categories get extra search effort
const CRITICAL_CATEGORIES = new Set([2, 5, 6, 7, 8, 9]) // service, schematics, fault codes, troubleshoot

const CATEGORY_KEYWORDS: Record<number, string[]> = {
  1:  ['operator', 'operating manual', 'user manual', 'operation manual'],
  2:  ['service manual', 'repair manual', 'workshop manual', 'service & repair'],
  3:  ['parts manual', 'parts catalog', 'illustrated parts', 'IPL'],
  4:  ['maintenance schedule', 'PM schedule', 'preventive maintenance'],
  5:  ['electrical schematic', 'electrical diagram', 'wiring schematic'],
  6:  ['hydraulic schematic', 'hydraulic circuit', 'hydraulic diagram'],
  7:  ['wiring diagram', 'wiring harness'],
  8:  ['fault code', 'error code', 'fault list', 'diagnostic code'],
  9:  ['troubleshoot', 'troubleshooting guide', 'diagnostic guide'],
  10: ['diagnostic procedure', 'test procedure'],
  11: ['engine manual', 'engine service'],
  12: ['battery spec', 'battery manual'],
  13: ['hydraulic spec', 'hydraulic component spec'],
  14: ['control module', 'ecu', 'control system'],
  15: ['safety decal', 'safety label', 'warning decal'],
  16: ['inspection checklist', 'annual inspection'],
  17: ['load chart', 'load table', 'capacity chart'],
  18: ['service bulletin', 'technical bulletin', 'TSB'],
  19: ['recall', 'safety notice', 'product alert'],
  20: ['software update', 'firmware', 'software upgrade'],
  21: ['oil spec', 'lubricant spec', 'fluid specification'],
  22: ['calibration', 'calibration procedure'],
}

function buildOemUrls(brand: string, model: string, category: number): string[] {
  const catKeys = CATEGORY_KEYWORDS[category] || ['manual']
  const modelEnc = encodeURIComponent(model)
  const modelLower = model.toLowerCase().replace(/\s+/g, '-')
  const urls: string[] = []
  const isCritical = CRITICAL_CATEGORIES.has(category)

  if (brand === 'JLG') {
    urls.push(
      `https://www.jlg.com/en/service-and-support/safety-and-publications?q=${modelEnc}+${encodeURIComponent(catKeys[0])}`,
      `https://online.jlg.com/prd/pages/catalog.aspx?mode=search&term=${modelEnc}`,
      `https://www.jlg.com/en/service-and-support/safety-and-publications?q=${modelEnc}`,
    )
    if (isCritical) {
      // Service/fault/schematic specific JLG portals
      urls.push(
        `https://technicalpublications.jlg.com/search?q=${modelEnc}+${encodeURIComponent(catKeys[0])}`,
        `https://partsdirect-jlg.com/search?q=${modelEnc}`,
        `https://www.lift-service.com/search?q=JLG+${modelEnc}+${encodeURIComponent(catKeys[0])}`,
      )
    }
  } else if (brand === 'Genie') {
    urls.push(
      `https://www.genielift.com/en/parts-service/manuals?q=${modelEnc}`,
      `https://techpubs.genielift.com/search?q=${modelEnc}+${encodeURIComponent(catKeys[0])}`,
      `https://partsandservice.terex.com/search?q=${modelEnc}`,
    )
    if (isCritical) {
      urls.push(
        `https://manuals.genielift.com/search?q=${modelEnc}+${encodeURIComponent(catKeys[0])}`,
        `https://www.lift-service.com/search?q=Genie+${modelEnc}+${encodeURIComponent(catKeys[0])}`,
        `https://accessliftandhandlers.com/search?q=Genie+${modelEnc}`,
      )
    }
  } else if (brand === 'Dingli') {
    urls.push(
      `https://cn.dingli-ap.com/downloads/?s=${modelEnc}`,          // PRIMARY: Chinese domestic (best source)
      `https://cn.dingli-ap.com/service/?s=${modelEnc}`,
      `https://en.cndingli.com/service-support/?s=${modelEnc}`,
      `https://www.dingli-na.com/downloads/?s=${modelEnc}`,
      `https://www.dingli.eu/downloads/?s=${modelEnc}`,
    )
    if (isCritical) {
      urls.push(
        `https://cn.dingli-ap.com/technical/?s=${modelEnc}+${encodeURIComponent(catKeys[0])}`,
        `https://dinglinorthamerica.com/downloads/?s=${modelEnc}`,
      )
    }
  } else if (brand === 'Manitou') {
    urls.push(
      `https://www.manitou.com/en/services/documentation?q=${modelEnc}`,
      `https://www.manitou.com/en/services/documentation?q=${modelEnc}+${encodeURIComponent(catKeys[0])}`,
    )
    if (isCritical) {
      urls.push(`https://manitou-il.com/downloads/?s=${modelEnc}`)
    }
  }

  // ManualsLib — search with category keyword for better hit rate
  urls.push(
    `https://www.manualslib.com/search.php?q=${encodeURIComponent(`${brand} ${model} ${catKeys[0]}`)}&search=Search+Manuals`,
    `https://www.manualslib.com/search.php?q=${encodeURIComponent(`${brand} ${model}`)}&search=Search+Manuals`,
  )

  return urls
}

async function tryWayback(originalUrl: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://archive.org/wayback/available?url=${encodeURIComponent(originalUrl)}`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) return null
    const data = await res.json() as { archived_snapshots?: { closest?: { url: string; available: boolean } } }
    const snap = data.archived_snapshots?.closest
    return snap?.available ? snap.url : null
  } catch { return null }
}

export async function runOemHunter(item: QueueItem): Promise<'success' | 'failed'> {
  const triedUrls: string[] = []
  const errors: string[] = []
  const catKeys = CATEGORY_KEYWORDS[item.category] || ['manual']
  const isCritical = CRITICAL_CATEGORIES.has(item.category)

  const candidateUrls = buildOemUrls(item.brand, item.model, item.category)

  for (const searchUrl of candidateUrls) {
    triedUrls.push(searchUrl)
    try {
      const result = await scrapeUrl(searchUrl)
      await sleep(isCritical ? 1000 : 1500)

      if (result.error === 'AUTH_REQUIRED' || result.error === 'CAPTCHA_BLOCKED') {
        errors.push(`${searchUrl}: ${result.error}`)
        continue
      }

      if (result.links?.length) {
        // For critical categories, be stricter: filter links by category keyword
        const relevantLinks = result.links.filter(l => {
          const lower = l.toLowerCase()
          return catKeys.some(k => lower.includes(k.replace(/ /g, '').replace(/-/g, '')))
            || lower.includes(item.model.toLowerCase())
            || (isCritical && lower.endsWith('.pdf'))
        })

        const pdfLinks = relevantLinks.length > 0 ? relevantLinks : result.links.slice(0, isCritical ? 5 : 3)

        const downloaded = await tryDownloadPdf(pdfLinks)
        if (downloaded && await isValidPdf(downloaded.buffer)) {
          const path = `${item.brand}/${item.model}/cat${item.category}_oem.pdf`
          const publicUrl = await uploadToStorage(path, downloaded.buffer)
          if (publicUrl) {
            await registerDocument({
              brand: item.brand, model: item.model,
              category: item.category, categoryName: item.category_name,
              title: `${item.brand} ${item.model} ${item.category_name}`,
              fileUrl: publicUrl, fileSizeBytes: downloaded.buffer.byteLength, source: 'oem',
            })
            await markCompleted(item.id, downloaded.url, path, downloaded.buffer.byteLength)
            return 'success'
          }
        }
      }

      if (result.type === 'pdf' && result.buffer && await isValidPdf(result.buffer)) {
        const path = `${item.brand}/${item.model}/cat${item.category}_oem.pdf`
        const publicUrl = await uploadToStorage(path, result.buffer)
        if (publicUrl) {
          await registerDocument({
            brand: item.brand, model: item.model,
            category: item.category, categoryName: item.category_name,
            title: `${item.brand} ${item.model} ${item.category_name}`,
            fileUrl: publicUrl, fileSizeBytes: result.buffer.byteLength, source: 'oem',
          })
          await markCompleted(item.id, searchUrl, path, result.buffer.byteLength)
          return 'success'
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      errors.push(`${searchUrl}: ${msg}`)

      const wayback = await tryWayback(searchUrl)
      if (wayback) {
        triedUrls.push(wayback)
        try {
          const wbResult = await scrapeUrl(wayback)
          if (wbResult.type === 'pdf' && wbResult.buffer && await isValidPdf(wbResult.buffer)) {
            const path = `${item.brand}/${item.model}/cat${item.category}_oem.pdf`
            const publicUrl = await uploadToStorage(path, wbResult.buffer)
            if (publicUrl) {
              await registerDocument({
                brand: item.brand, model: item.model,
                category: item.category, categoryName: item.category_name,
                title: `${item.brand} ${item.model} ${item.category_name} (Archive)`,
                fileUrl: publicUrl, fileSizeBytes: wbResult.buffer.byteLength, source: 'oem_archive',
              })
              await markCompleted(item.id, wayback, path, wbResult.buffer.byteLength)
              return 'success'
            }
          }
        } catch { /* ignore */ }
      }
    }
  }

  await markFailed(item.id, errors.join(' | '), triedUrls)
  return 'failed'
}
