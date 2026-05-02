// Agent 2: Distributor Hunter — authorized dealer/distributor sites
// Runs when OEM Hunter fails.

import {
  isValidPdf, uploadToStorage, registerDocument,
  markCompleted, markFailed, sleep, QueueItem,
} from './shared'
import { scrapeUrl, tryDownloadPdf } from '@/skills/web-learning/scraper'

const DISTRIBUTOR_SEARCH_URLS = [
  (brand: string, model: string) =>
    `https://www.manualslib.com/search.php?q=${encodeURIComponent(`${brand} ${model}`)}&search=Search+Manuals`,
  (brand: string, model: string) =>
    `https://www.manualzz.com/search#q=${encodeURIComponent(`${brand} ${model}`)}`,
  (brand: string, model: string) =>
    `https://manuals.plus/?s=${encodeURIComponent(`${brand} ${model} manual`)}`,
  (brand: string, model: string) =>
    `https://www.all-guides.com/search.php?q=${encodeURIComponent(`${brand} ${model}`)}`,
  (brand: string, model: string) =>
    `https://www.equipmentshare.com/search?q=${encodeURIComponent(`${brand} ${model} manual`)}`,
]

// ManualsLib direct parse — it lists documents in a structured way
async function searchManualsLib(brand: string, model: string): Promise<string[]> {
  const searchUrl = `https://www.manualslib.com/search.php?q=${encodeURIComponent(`${brand} ${model}`)}&search=Search+Manuals`
  const result = await scrapeUrl(searchUrl)
  if (!result.text || result.error) return []

  // Extract manual page links from manualslib results
  const links: string[] = []
  const re = /href="(\/manual\/\d+\/[^"]+)"/g
  const raw = result.text
  let m
  while ((m = re.exec(raw)) !== null) {
    links.push(`https://www.manualslib.com${m[1]}`)
  }
  return [...new Set(links)].slice(0, 5)
}

// From a ManualsLib manual page, try to get download link
async function getManualsLibPdf(pageUrl: string): Promise<string | null> {
  const result = await scrapeUrl(pageUrl)
  if (!result.links?.length) return null
  const pdfLink = result.links.find(l => l.includes('view_online') || l.includes('.pdf'))
  return pdfLink || null
}

export async function runDistributorHunter(item: QueueItem): Promise<'success' | 'failed'> {
  const triedUrls: string[] = []
  const errors: string[] = []

  // 1. Try ManualsLib (most reliable free source)
  try {
    const manualPages = await searchManualsLib(item.brand, item.model)
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

  // 2. Try other distributor/archive search URLs
  for (const buildUrl of DISTRIBUTOR_SEARCH_URLS.slice(1)) {
    const url = buildUrl(item.brand, item.model)
    triedUrls.push(url)
    try {
      const result = await scrapeUrl(url)
      await sleep(2000)

      if (result.links?.length) {
        const downloaded = await tryDownloadPdf(result.links.slice(0, 5))
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

  // 3. Israeli importers (try known public pages)
  const israeliUrls = [
    `https://www.electra-leasing.co.il/search?q=${encodeURIComponent(`${item.brand} ${item.model}`)}`,
  ]
  for (const url of israeliUrls) {
    triedUrls.push(url)
    try {
      const result = await scrapeUrl(url)
      await sleep(2000)
      if (result.links?.length) {
        const downloaded = await tryDownloadPdf(result.links.slice(0, 3))
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
