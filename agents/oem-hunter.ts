// Agent 1: OEM Hunter — searches official manufacturer sites for PDFs
// Priority source. Runs first in the fallback chain.

import {
  fetchWithRetry, isValidPdf, uploadToStorage, registerDocument,
  markCompleted, markFailed, SUPABASE_URL, SUPABASE_KEY, sleep, QueueItem,
} from './shared'
import { scrapeUrl, tryDownloadPdf, searchSiteForPdf } from '@/skills/web-learning/scraper'

const CATEGORY_KEYWORDS: Record<number, string[]> = {
  1:  ['operator', 'operating', 'user manual'],
  2:  ['service', 'repair manual'],
  3:  ['parts', 'part manual', 'parts catalog'],
  4:  ['maintenance', 'maintenance schedule'],
  5:  ['electrical schematic', 'electric schematic'],
  6:  ['hydraulic schematic', 'hydraulic circuit'],
  7:  ['wiring', 'wiring diagram'],
  8:  ['fault code', 'error code', 'fault list'],
  9:  ['troubleshoot'],
  10: ['diagnostic'],
  11: ['engine manual'],
  12: ['battery spec'],
  13: ['hydraulic spec', 'hydraulic component'],
  14: ['control module', 'ecu'],
  15: ['safety decal', 'safety label'],
  16: ['inspection checklist', 'annual inspection'],
  17: ['load chart', 'load table'],
  18: ['service bulletin', 'technical bulletin'],
  19: ['recall', 'safety notice'],
  20: ['software update', 'firmware'],
  21: ['oil spec', 'lubricant', 'fluid spec'],
  22: ['calibration'],
}

// Build candidate OEM URLs for a given brand/model/category
function buildOemUrls(brand: string, model: string, category: number): string[] {
  const catKeys = CATEGORY_KEYWORDS[category] || ['manual']
  const modelLower = model.toLowerCase().replace(/\s+/g, '-')
  const modelUpper = model.toUpperCase()
  const urls: string[] = []

  if (brand === 'JLG') {
    urls.push(
      `https://www.jlg.com/en/service-and-support/safety-and-publications?q=${encodeURIComponent(model)}`,
      `https://online.jlg.com/prd/pages/catalog.aspx?mode=search&term=${encodeURIComponent(model)}`,
      `https://www.jlg.com/en/equipment/${modelLower}/specifications`,
      `https://www.manualslib.com/search.php?q=JLG+${encodeURIComponent(model)}&search=Search+Manuals`,
    )
  } else if (brand === 'Genie') {
    urls.push(
      `https://www.genielift.com/en/service-support/manuals?q=${encodeURIComponent(model)}`,
      `https://techpubs.genielift.com/search?q=${encodeURIComponent(model)}`,
      `https://www.manualslib.com/search.php?q=Genie+${encodeURIComponent(model)}&search=Search+Manuals`,
      `https://partsandservice.terex.com/search?q=${encodeURIComponent(model)}`,
    )
  } else if (brand === 'Dingli') {
    urls.push(
      `https://en.cndingli.com/service-support/?s=${encodeURIComponent(model)}`,
      `https://www.dingli-na.com/downloads/?s=${encodeURIComponent(model)}`,
      `https://www.dingli.eu/downloads/?s=${encodeURIComponent(model)}`,
      `https://www.manualslib.com/search.php?q=Dingli+${encodeURIComponent(model)}&search=Search+Manuals`,
    )
  } else if (brand === 'Manitou') {
    urls.push(
      `https://www.manitou.com/en/services/documentation?q=${encodeURIComponent(model)}`,
      `https://www.manualslib.com/search.php?q=Manitou+${encodeURIComponent(model)}&search=Search+Manuals`,
    )
  }

  // Generic Google-style search on ManualsLib (works without JS)
  urls.push(
    `https://www.manualslib.com/search.php?q=${encodeURIComponent(`${brand} ${model} ${catKeys[0]}`)}&search=Search+Manuals`
  )

  return urls
}

// Try Wayback Machine for a given URL
async function tryWayback(originalUrl: string): Promise<string | null> {
  try {
    const checkUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(originalUrl)}`
    const res = await fetch(checkUrl, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return null
    const data = await res.json() as { archived_snapshots?: { closest?: { url: string; available: boolean } } }
    const snap = data.archived_snapshots?.closest
    if (snap?.available && snap.url) return snap.url
    return null
  } catch {
    return null
  }
}

export async function runOemHunter(item: QueueItem): Promise<'success' | 'failed'> {
  const triedUrls: string[] = []
  const errors: string[] = []

  const candidateUrls = buildOemUrls(item.brand, item.model, item.category)
  const catKeys = CATEGORY_KEYWORDS[item.category] || ['manual']

  for (const searchUrl of candidateUrls) {
    triedUrls.push(searchUrl)
    try {
      const result = await scrapeUrl(searchUrl)
      await sleep(1500)

      if (result.error === 'AUTH_REQUIRED' || result.error === 'CAPTCHA_BLOCKED') {
        errors.push(`${searchUrl}: ${result.error}`)
        continue
      }

      // If we got PDF links from search results
      if (result.links?.length) {
        const relevantLinks = result.links.filter(l => {
          const lower = l.toLowerCase()
          return catKeys.some(k => lower.includes(k.replace(/ /g, '')))
            || lower.includes(item.model.toLowerCase())
        })

        const pdfLinks = relevantLinks.length > 0 ? relevantLinks : result.links.slice(0, 3)

        const downloaded = await tryDownloadPdf(pdfLinks)
        if (downloaded) {
          const path = `${item.brand}/${item.model}/cat${item.category}_oem.pdf`
          const publicUrl = await uploadToStorage(path, downloaded.buffer)
          if (publicUrl) {
            await registerDocument({
              brand: item.brand,
              model: item.model,
              category: item.category,
              categoryName: item.category_name,
              title: `${item.brand} ${item.model} ${item.category_name}`,
              fileUrl: publicUrl,
              fileSizeBytes: downloaded.buffer.byteLength,
              source: 'oem',
            })
            await markCompleted(item.id, downloaded.url, path, downloaded.buffer.byteLength)
            return 'success'
          }
        }
      }

      // If the URL itself is a PDF
      if (result.type === 'pdf' && result.buffer) {
        const valid = await isValidPdf(result.buffer)
        if (valid) {
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
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      errors.push(`${searchUrl}: ${msg}`)

      // Try Wayback Machine on failure
      const wayback = await tryWayback(searchUrl)
      if (wayback) {
        triedUrls.push(wayback)
        const wbResult = await scrapeUrl(wayback)
        if (wbResult.type === 'pdf' && wbResult.buffer) {
          const valid = await isValidPdf(wbResult.buffer)
          if (valid) {
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
        }
      }
    }
  }

  await markFailed(item.id, errors.join(' | '), triedUrls)
  return 'failed'
}
