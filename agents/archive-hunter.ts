// Agent 3: Archive Hunter — last resort: archive sites + Wayback Machine + Google
// Runs when both OEM and Distributor hunters fail.

import {
  isValidPdf, uploadToStorage, registerDocument,
  markCompleted, markFailed, markManualRequired, sleep, QueueItem,
} from './shared'
import { scrapeUrl, tryDownloadPdf } from '@/skills/web-learning/scraper'

const ARCHIVE_SOURCES = [
  // Wayback Machine (programmatic)
  (brand: string, model: string, catKw: string) =>
    `https://web.archive.org/web/*/site:jlg.com+${encodeURIComponent(`${model} ${catKw} filetype:pdf`)}`,
  // ManualZZ
  (brand: string, model: string) =>
    `https://manualzz.com/search#q=${encodeURIComponent(`${brand} ${model}`)}`,
  // StudyLib
  (brand: string, model: string, catKw: string) =>
    `https://www.studylib.net/search?q=${encodeURIComponent(`${brand} ${model} ${catKw}`)}`,
  // Yumpu
  (brand: string, model: string) =>
    `https://www.yumpu.com/search#q=${encodeURIComponent(`${brand} ${model} manual`)}`,
  // Scribd (public docs)
  (brand: string, model: string, catKw: string) =>
    `https://www.scribd.com/search?query=${encodeURIComponent(`${brand} ${model} ${catKw}`)}`,
  // All-Guides
  (brand: string, model: string) =>
    `https://www.all-guides.com/search.php?q=${encodeURIComponent(`${brand} ${model}`)}`,
]

const CATEGORY_KEYWORDS: Record<number, string> = {
  1: 'operator manual', 2: 'service manual', 3: 'parts manual',
  4: 'maintenance schedule', 5: 'electrical schematic', 6: 'hydraulic schematic',
  7: 'wiring diagram', 8: 'fault codes', 9: 'troubleshooting guide',
  10: 'diagnostic procedures', 11: 'engine manual', 12: 'battery specs',
  13: 'hydraulic specs', 14: 'control module', 15: 'safety decals',
  16: 'inspection checklist', 17: 'load chart', 18: 'service bulletin',
  19: 'recall notice', 20: 'firmware update', 21: 'lubricant specs',
  22: 'calibration procedure',
}

const MANUAL_TODO_NOTES: Record<string, string> = {
  JLG: 'פנה ל-JLG ישראל: service@jlg-il.co.il | 03-9000000 | חפש בפייסבוק: "JLG Mechanics"',
  Genie: 'פנה לנציג Genie/Terex ישראל: genie-il.co.il | 08-0000000 | קבוצה: "Genie AWP Technicians"',
  Dingli: 'פנה לנציג Dingli ישראל: יצרן סיני — נסה dingli.eu | email: service@dingli.eu | וואטסאפ מיצרן',
  Manitou: 'פנה ל-Manitou ישראל: manitou-il.com | חפש: "Manitou MRT service manual" בגוגל',
}

async function tryWaybackSearch(brand: string, model: string, catKw: string): Promise<string[]> {
  // Try to find archived PDF via Wayback CDX API
  const query = encodeURIComponent(`${brand} ${model} ${catKw} .pdf`)
  const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=*.${brand.toLowerCase()}.com/${model}*&output=json&limit=5&filter=mimetype:application/pdf`
  try {
    const res = await fetch(cdxUrl, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return []
    const data: string[][] = await res.json()
    if (!data?.length) return []
    // Each row: [urlkey, timestamp, original, mimetype, statuscode, digest, length]
    return data.slice(1, 4).map(row => `https://web.archive.org/web/${row[1]}/${row[2]}`)
  } catch {
    return []
  }
}

export async function runArchiveHunter(item: QueueItem): Promise<'success' | 'failed' | 'manual'> {
  const triedUrls: string[] = []
  const errors: string[] = []
  const catKw = CATEGORY_KEYWORDS[item.category] || 'manual'

  // 1. Wayback Machine CDX search
  try {
    const waybackUrls = await tryWaybackSearch(item.brand, item.model, catKw)
    for (const url of waybackUrls) {
      triedUrls.push(url)
      const result = await scrapeUrl(url)
      await sleep(1500)
      if (result.type === 'pdf' && result.buffer && await isValidPdf(result.buffer)) {
        const path = `${item.brand}/${item.model}/cat${item.category}_archive.pdf`
        const publicUrl = await uploadToStorage(path, result.buffer)
        if (publicUrl) {
          await registerDocument({
            brand: item.brand, model: item.model,
            category: item.category, categoryName: item.category_name,
            title: `${item.brand} ${item.model} ${item.category_name} (Archive.org)`,
            fileUrl: publicUrl, fileSizeBytes: result.buffer.byteLength, source: 'archive',
          })
          await markCompleted(item.id, url, path, result.buffer.byteLength)
          return 'success'
        }
      }
    }
  } catch (e) {
    errors.push(`Wayback: ${e instanceof Error ? e.message : String(e)}`)
  }

  // 2. Archive sites
  const archiveSitesToTry = [
    `https://manualzz.com/search#q=${encodeURIComponent(`${item.brand} ${item.model}`)}`,
    `https://www.studylib.net/search?q=${encodeURIComponent(`${item.brand} ${item.model} ${catKw}`)}`,
    `https://yumpu.com/search#q=${encodeURIComponent(`${item.brand} ${item.model}`)}`,
  ]

  for (const url of archiveSitesToTry) {
    triedUrls.push(url)
    try {
      const result = await scrapeUrl(url)
      await sleep(2000)
      if (result.links?.length) {
        const downloaded = await tryDownloadPdf(result.links.slice(0, 8))
        if (downloaded && await isValidPdf(downloaded.buffer)) {
          const path = `${item.brand}/${item.model}/cat${item.category}_archive.pdf`
          const publicUrl = await uploadToStorage(path, downloaded.buffer)
          if (publicUrl) {
            await registerDocument({
              brand: item.brand, model: item.model,
              category: item.category, categoryName: item.category_name,
              title: `${item.brand} ${item.model} ${item.category_name}`,
              fileUrl: publicUrl, fileSizeBytes: downloaded.buffer.byteLength, source: 'archive',
            })
            await markCompleted(item.id, downloaded.url, path, downloaded.buffer.byteLength)
            return 'success'
          }
        }
      }
    } catch (e) {
      errors.push(`Archive: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // 3. All 4 agents failed — write to MANUAL_TODO
  const brandNote = MANUAL_TODO_NOTES[item.brand] || 'פנה ליצרן ישירות'
  const fullNote = [
    `## ${item.brand} ${item.model} — ${item.category_name} (קטגוריה ${item.category})`,
    '',
    `**URLs שנוסו (${triedUrls.length}):**`,
    ...triedUrls.map(u => `- ${u}`),
    '',
    `**שגיאות:** ${errors.join(' | ')}`,
    '',
    `**פעולה ידנית מומלצת:**`,
    brandNote,
    '',
    '---',
    '',
  ].join('\n')

  await markManualRequired(item.id, errors.join(' | '), triedUrls)

  // Append to MANUAL_TODO via Supabase function (we'll store it in the DB notes)
  return 'manual'
}
