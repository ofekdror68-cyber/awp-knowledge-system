// Agent 2: Distributor Hunter — authorized dealer/distributor sites
// Priority: Service → Fault Codes → Schematics → PM → Operator → Parts

import {
  isValidPdf, uploadToStorage, registerDocument,
  markCompleted, markFailed, sleep, QueueItem,
} from './shared'
import { scrapeUrl, tryDownloadPdf } from '@/skills/web-learning/scraper'

const CRITICAL_CATEGORIES = new Set([2, 5, 6, 7, 8, 9])

const CATEGORY_KEYWORDS: Record<number, string> = {
  1: 'operator manual', 2: 'service manual', 3: 'parts manual',
  4: 'maintenance schedule', 5: 'electrical schematic', 6: 'hydraulic schematic',
  7: 'wiring diagram', 8: 'fault code', 9: 'troubleshooting',
  10: 'diagnostic', 11: 'engine', 12: 'battery', 13: 'hydraulic spec',
  14: 'control module', 15: 'safety', 16: 'inspection', 17: 'load chart',
  18: 'service bulletin', 19: 'recall', 20: 'firmware', 21: 'lubricant', 22: 'calibration',
}

// Build category-aware search URLs
function buildSearchUrls(brand: string, model: string, category: number): string[] {
  const catKw = CATEGORY_KEYWORDS[category] || 'manual'
  const isCritical = CRITICAL_CATEGORIES.has(category)
  const q = `${brand} ${model} ${catKw}`
  const qEnc = encodeURIComponent(q)
  const modelEnc = encodeURIComponent(`${brand} ${model}`)

  const urls: string[] = [
    // ManualsLib with category keyword — much better results than generic
    `https://www.manualslib.com/search.php?q=${qEnc}&search=Search+Manuals`,
    `https://www.manualzz.com/search#q=${qEnc}`,
    `https://manuals.plus/?s=${encodeURIComponent(q)}`,
  ]

  if (isCritical) {
    urls.push(
      // Specialized equipment dealer/service sites
      `https://www.lift-service.com/search?q=${qEnc}`,
      `https://accessliftandhandlers.com/search?q=${qEnc}`,
      `https://www.equipmentshare.com/search?q=${qEnc}`,
      // heavyequipmentforums often links to service manuals
      `https://www.heavyequipmentforums.com/search?q=${encodeURIComponent(`${brand} ${model} ${catKw}`)}&forums[]=14`,
    )

    // Brand-specific authorized dealer/parts portals
    if (brand === 'JLG') {
      urls.push(
        `https://partsdirect-jlg.com/search?q=${encodeURIComponent(`${model} ${catKw}`)}`,
        `https://www.mcneilus.com/search?q=JLG+${encodeURIComponent(model)}`,
      )
    } else if (brand === 'Genie') {
      urls.push(
        `https://partsandservice.terex.com/search?q=${encodeURIComponent(`${model} ${catKw}`)}`,
        `https://www.ahern.com/search?q=Genie+${encodeURIComponent(model)}`,
      )
    } else if (brand === 'Dingli') {
      urls.push(
        `https://dinglinorthamerica.com/service/?s=${encodeURIComponent(`${model} ${catKw}`)}`,
        `https://www.dingli.eu/service/?s=${encodeURIComponent(model)}`,
      )
    }
  }

  urls.push(`https://www.all-guides.com/search.php?q=${modelEnc}`)

  return urls
}

async function searchManualsLib(brand: string, model: string, catKw: string): Promise<string[]> {
  const q = encodeURIComponent(`${brand} ${model} ${catKw}`)
  const searchUrl = `https://www.manualslib.com/search.php?q=${q}&search=Search+Manuals`
  const result = await scrapeUrl(searchUrl)
  if (!result.text || result.error) return []

  const links: string[] = []
  const re = /href="(\/manual\/\d+\/[^"]+)"/g
  let m
  while ((m = re.exec(result.text)) !== null) {
    links.push(`https://www.manualslib.com${m[1]}`)
  }
  return [...new Set(links)].slice(0, 8)
}

async function getManualsLibPdf(pageUrl: string): Promise<string | null> {
  const result = await scrapeUrl(pageUrl)
  if (!result.links?.length) return null
  return result.links.find(l => l.includes('view_online') || l.includes('.pdf')) || null
}

export async function runDistributorHunter(item: QueueItem): Promise<'success' | 'failed'> {
  const triedUrls: string[] = []
  const errors: string[] = []
  const catKw = CATEGORY_KEYWORDS[item.category] || 'manual'
  const isCritical = CRITICAL_CATEGORIES.has(item.category)

  // 1. ManualsLib with category keyword
  try {
    const manualPages = await searchManualsLib(item.brand, item.model, catKw)
    await sleep(2000)

    for (const pageUrl of manualPages) {
      triedUrls.push(pageUrl)
      const pdfUrl = await getManualsLibPdf(pageUrl)
      if (pdfUrl) {
        triedUrls.push(pdfUrl)
        const result = await scrapeUrl(pdfUrl)
        if (result.type === 'pdf' && result.buffer && await isValidPdf(result.buffer)) {
          const path = `${item.brand}/${item.model}/cat${item.category}_distributor.pdf`
          const publicUrl = await uploadToStorage(path, result.buffer)
          if (publicUrl) {
            await registerDocument({
              brand: item.brand, model: item.model,
              category: item.category, categoryName: item.category_name,
              title: `${item.brand} ${item.model} ${item.category_name} (ManualsLib)`,
              fileUrl: publicUrl, fileSizeBytes: result.buffer.byteLength, source: 'distributor',
            })
            await markCompleted(item.id, pdfUrl, path, result.buffer.byteLength)
            return 'success'
          }
        }
      }
      await sleep(1500)
    }
  } catch (e) {
    errors.push(`ManualsLib: ${e instanceof Error ? e.message : String(e)}`)
  }

  // 2. Other distributor/dealer sites
  const allUrls = buildSearchUrls(item.brand, item.model, item.category)
  for (const url of allUrls) {
    if (triedUrls.includes(url)) continue
    triedUrls.push(url)
    try {
      const result = await scrapeUrl(url)
      await sleep(isCritical ? 1500 : 2000)

      if (result.links?.length) {
        // Filter links by category keyword for better precision
        const filtered = result.links.filter(l => {
          const ll = l.toLowerCase()
          return ll.endsWith('.pdf') || catKw.split(' ').some(w => ll.includes(w))
        })
        const toTry = filtered.length > 0 ? filtered.slice(0, 6) : result.links.slice(0, 4)

        const downloaded = await tryDownloadPdf(toTry)
        if (downloaded && await isValidPdf(downloaded.buffer)) {
          const path = `${item.brand}/${item.model}/cat${item.category}_distributor.pdf`
          const publicUrl = await uploadToStorage(path, downloaded.buffer)
          if (publicUrl) {
            await registerDocument({
              brand: item.brand, model: item.model,
              category: item.category, categoryName: item.category_name,
              title: `${item.brand} ${item.model} ${item.category_name}`,
              fileUrl: publicUrl, fileSizeBytes: downloaded.buffer.byteLength, source: 'distributor',
            })
            await markCompleted(item.id, downloaded.url, path, downloaded.buffer.byteLength)
            return 'success'
          }
        }
      }
    } catch (e) {
      errors.push(`${url}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // 3. Israeli importers
  const israeliUrls: string[] = []
  if (item.brand === 'Genie') israeliUrls.push(`https://www.electra-leasing.co.il/search?q=${encodeURIComponent(`${item.model} ${catKw}`)}`)
  if (item.brand === 'Manitou') israeliUrls.push(`https://manitou-il.com/search?q=${encodeURIComponent(`${item.model} ${catKw}`)}`)

  for (const url of israeliUrls) {
    triedUrls.push(url)
    try {
      const result = await scrapeUrl(url)
      await sleep(2000)
      if (result.links?.length) {
        const downloaded = await tryDownloadPdf(result.links.slice(0, 4))
        if (downloaded && await isValidPdf(downloaded.buffer)) {
          const path = `${item.brand}/${item.model}/cat${item.category}_distributor.pdf`
          const publicUrl = await uploadToStorage(path, downloaded.buffer)
          if (publicUrl) {
            await registerDocument({
              brand: item.brand, model: item.model,
              category: item.category, categoryName: item.category_name,
              title: `${item.brand} ${item.model} ${item.category_name} (IL)`,
              fileUrl: publicUrl, fileSizeBytes: downloaded.buffer.byteLength, source: 'distributor_il',
            })
            await markCompleted(item.id, downloaded.url, path, downloaded.buffer.byteLength)
            return 'success'
          }
        }
      }
    } catch (e) {
      errors.push(`Israeli: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  await markFailed(item.id, errors.join(' | '), triedUrls)
  return 'failed'
}
