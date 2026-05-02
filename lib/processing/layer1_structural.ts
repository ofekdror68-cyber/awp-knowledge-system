import { dbPost, dbPatch, markLayerDone, markError, downloadFile } from './db'
import type { Document, ProcessingResult } from './types'

function detectLanguage(text: string): string {
  const hebrewChars = (text.match(/[א-ת]/g) || []).length
  const chineseChars = (text.match(/[一-鿿㐀-䶿]/g) || []).length
  const total = text.length || 1
  if (hebrewChars / total > 0.05) return 'he'
  if (chineseChars / total > 0.05) return 'zh'
  return 'en'
}

export async function processLayer1(doc: Document): Promise<ProcessingResult> {
  const start = Date.now()
  try {
    if (!doc.file_url) throw new Error('No file_url')

    const buffer = await downloadFile(doc.file_url)

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')

    const pageTexts: string[] = []
    const data = await pdfParse(buffer, {
      pagerender: (pageData: { pageIndex?: number; getTextContent: () => Promise<{ items: Array<{ str: string }> }> }) => {
        return pageData.getTextContent().then((content) => {
          const text = content.items.map((item) => item.str).join(' ')
          pageTexts.push(text)
          return text
        })
      },
    })

    const numPages: number = data.numpages || pageTexts.length || 1
    const rows = []

    for (let i = 0; i < numPages; i++) {
      const rawText = (pageTexts[i] || '').trim()
      rows.push({
        document_id: doc.id,
        page_number: i + 1,
        raw_text: rawText.substring(0, 8000),
        language: detectLanguage(rawText),
        page_image_url: `${doc.file_url}#page=${i + 1}`,
      })
    }

    // Upsert pages in batches of 20
    for (let i = 0; i < rows.length; i += 20) {
      await dbPost('doc_pages', rows.slice(i, i + 20), { upsert: true })
    }

    await markLayerDone(doc.id, 1, { total_pages: numPages })
    await dbPatch('documents', `id=eq.${doc.id}`, { page_count: numPages })

    return {
      success: true,
      itemsProcessed: numPages,
      costCents: 0,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await markError(doc.id, `L1: ${msg}`)
    return { success: false, error: msg, itemsProcessed: 0, costCents: 0 }
  }
}
