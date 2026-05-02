// Web scraper — fetch HTML or PDF from any URL
// Returns cleaned text or raw buffer for PDFs

import { fetchWithRetry, randomUA } from '@/agents/shared'

export interface ScrapeResult {
  url: string
  type: 'html' | 'pdf' | 'unknown'
  text?: string
  buffer?: ArrayBuffer
  title?: string
  links?: string[]
  error?: string
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  try {
    const res = await fetchWithRetry(url, {
      headers: {
        'User-Agent': randomUA(),
        Referer: new URL(url).origin,
      },
    })

    if (!res.ok) {
      if (res.status === 403) return { url, type: 'unknown', error: 'FORBIDDEN_403' }
      if (res.status === 404) return { url, type: 'unknown', error: 'NOT_FOUND_404' }
      if (res.status === 401 || res.status === 302) return { url, type: 'unknown', error: 'AUTH_REQUIRED' }
      return { url, type: 'unknown', error: `HTTP_${res.status}` }
    }

    const contentType = res.headers.get('content-type') || ''

    if (contentType.includes('pdf') || url.toLowerCase().endsWith('.pdf')) {
      const buffer = await res.arrayBuffer()
      return { url, type: 'pdf', buffer }
    }

    const html = await res.text()

    if (html.includes('<html') || html.includes('<!DOCTYPE')) {
      return {
        url,
        type: 'html',
        text: cleanHtml(html),
        title: extractTitle(html),
        links: extractLinks(html, url),
      }
    }

    return { url, type: 'unknown', error: 'UNRECOGNIZED_CONTENT' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('captcha') || msg.includes('CAPTCHA')) return { url, type: 'unknown', error: 'CAPTCHA_BLOCKED' }
    return { url, type: 'unknown', error: msg }
  }
}

function cleanHtml(html: string): string {
  // Remove scripts, styles, nav, footer
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s{3,}/g, '\n\n')
    .trim()

  // Reject if too short (likely a paywall or error page)
  if (text.length < 500) return ''
  return text.substring(0, 15000)
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return m ? m[1].trim() : ''
}

function extractLinks(html: string, baseUrl: string): string[] {
  const links: string[] = []
  const re = /href=["']([^"']+)["']/gi
  let m
  while ((m = re.exec(html)) !== null) {
    try {
      const abs = new URL(m[1], baseUrl).href
      if (abs.match(/\.(pdf|PDF)($|\?)/)) links.push(abs)
    } catch { /* skip */ }
  }
  return [...new Set(links)].slice(0, 50)
}

// Search a site for PDFs matching keywords
export async function searchSiteForPdf(
  searchUrl: string,
  keywords: string[],
): Promise<string[]> {
  const result = await scrapeUrl(searchUrl)
  if (!result.links?.length) return []

  const kw = keywords.map(k => k.toLowerCase())
  return result.links.filter(link => {
    const lower = link.toLowerCase()
    return kw.some(k => lower.includes(k))
  })
}

// Try to download a PDF from a list of candidate URLs
export async function tryDownloadPdf(urls: string[]): Promise<{ url: string; buffer: ArrayBuffer } | null> {
  for (const url of urls) {
    try {
      const res = await scrapeUrl(url)
      if (res.type === 'pdf' && res.buffer) {
        const bytes = new Uint8Array(res.buffer.slice(0, 5))
        const header = String.fromCharCode(...bytes)
        if (header.startsWith('%PDF') && res.buffer.byteLength > 50_000) {
          return { url, buffer: res.buffer }
        }
      }
      // If HTML page with PDF links, try those
      if (res.type === 'html' && res.links?.length) {
        for (const link of res.links.slice(0, 5)) {
          const pdfRes = await scrapeUrl(link)
          if (pdfRes.type === 'pdf' && pdfRes.buffer) {
            const bytes = new Uint8Array(pdfRes.buffer.slice(0, 5))
            if (String.fromCharCode(...bytes).startsWith('%PDF') && pdfRes.buffer.byteLength > 50_000) {
              return { url: link, buffer: pdfRes.buffer }
            }
          }
        }
      }
    } catch { /* continue to next URL */ }
  }
  return null
}
