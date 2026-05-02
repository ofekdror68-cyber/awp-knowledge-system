import Anthropic from '@anthropic-ai/sdk'
import { dbGet, dbPatch, markLayerDone, markError, addCost, downloadFile } from './db'
import type { Document, DocPage, ProcessingResult } from './types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const VISION_PROMPT = `You are an expert AWP (aerial work platform) service technician analyzing a service manual.
I will give you a PDF. Analyze EACH page and return a JSON array (one object per page, indexed from 1).
For EVERY page return:
{
  "page_number": <int>,
  "page_type": "text"|"schematic_electrical"|"schematic_hydraulic"|"parts_diagram"|"table"|"fault_code_list"|"procedure"|"cover"|"index"|"mixed",
  "visual_description": "<2-3 sentences about what is shown>",
  "components_detected": [{"name":"<name>","id":"<id if visible>","role":"<function>"}],
  "wires_detected": [],
  "fault_codes_on_page": ["<code>"],
  "systems_referenced": ["hydraulic"|"electrical"|"drive"|"battery"|"engine"|"control"|"safety"|"steering"],
  "cross_refs": {"see_page":[],"see_doc":[]},
  "key_specs": [{"name":"<spec>","value":"<val>","unit":"<unit>"}],
  "warnings": ["<warning text>"]
}
For schematic pages: list every component and wire color you can identify.
Return ONLY the JSON array. No other text.`

interface PageAnalysis {
  page_number: number
  page_type?: string
  visual_description?: string
  components_detected?: unknown
  wires_detected?: unknown
  fault_codes_on_page?: string[]
  systems_referenced?: string[]
  cross_refs?: unknown
  key_specs?: unknown
  warnings?: string[]
}

async function analyzeWithVision(pdfBuffer: Buffer, startPage: number, endPage: number): Promise<PageAnalysis[]> {
  const base64 = pdfBuffer.toString('base64')

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const resp = await (anthropic.beta.messages.create as (params: unknown) => Promise<Anthropic.Message>)({
        model: 'claude-sonnet-4-6',
        max_tokens: 8192,
        betas: ['pdfs-2024-09-25'],
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 },
            },
            {
              type: 'text',
              text: `${VISION_PROMPT}\n\nAnalyze pages ${startPage} through ${endPage} only.`,
            },
          ],
        }],
      })

      const text = resp.content[0].type === 'text' ? resp.content[0].text : ''
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('No JSON array in response')
      return JSON.parse(jsonMatch[0]) as PageAnalysis[]
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('429') || msg.includes('rate')) {
        const delay = Math.min(60000, 5000 * Math.pow(2, attempt))
        await new Promise(r => setTimeout(r, delay))
        continue
      }
      throw err
    }
  }
  throw new Error('Max retries exceeded')
}

export async function processLayer2(doc: Document): Promise<ProcessingResult> {
  try {
    const pages = await dbGet<DocPage>(
      `doc_pages?document_id=eq.${doc.id}&order=page_number.asc&select=id,page_number,raw_text`
    )
    if (!pages.length) throw new Error('No pages from Layer 1')

    if (!doc.file_url) throw new Error('No file_url')
    const pdfBuffer = await downloadFile(doc.file_url)

    const totalPages = pages.length
    let totalCostCents = 0
    const BATCH = 30

    for (let i = 0; i < totalPages; i += BATCH) {
      const batchPages = pages.slice(i, i + BATCH)
      const startPage = batchPages[0].page_number
      const endPage = batchPages[batchPages.length - 1].page_number

      let analyses: PageAnalysis[] = []
      try {
        analyses = await analyzeWithVision(pdfBuffer, startPage, endPage)
        // Sonnet: ~$3/1M input + $15/1M output, rough estimate per page
        totalCostCents += Math.round(batchPages.length * 3)
      } catch {
        // Vision failed for this batch — use text-based classification fallback
        analyses = batchPages.map(p => ({
          page_number: p.page_number,
          page_type: classifyByText(p.raw_text || ''),
          visual_description: '',
          fault_codes_on_page: extractFaultCodes(p.raw_text || ''),
          systems_referenced: extractSystems(p.raw_text || ''),
        }))
      }

      // Update each page
      for (const a of analyses) {
        const page = batchPages.find(p => p.page_number === a.page_number)
        if (!page?.id) continue
        await dbPatch('doc_pages', `id=eq.${page.id}`, {
          page_type: a.page_type || 'text',
          visual_description: a.visual_description || '',
          components_detected: a.components_detected || [],
          wires_detected: a.wires_detected || [],
          fault_codes_on_page: a.fault_codes_on_page || [],
          systems_referenced: a.systems_referenced || [],
          cross_refs: a.cross_refs || {},
          key_specs: a.key_specs || [],
          warnings: a.warnings || [],
        })
      }
    }

    await addCost(doc.id, totalCostCents)
    await markLayerDone(doc.id, 2)
    return { success: true, itemsProcessed: totalPages, costCents: totalCostCents }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await markError(doc.id, `L2: ${msg}`)
    return { success: false, error: msg, itemsProcessed: 0, costCents: 0 }
  }
}

function classifyByText(text: string): string {
  const t = text.toLowerCase()
  if (text.length < 100) return 'mixed'
  if (/warning|caution|danger|אזהרה|זהירות/.test(t)) return 'procedure'
  if (/step \d|שלב \d|\d\.\s+[A-Z]/.test(text)) return 'procedure'
  if (/fault|error|code|שגיאה|תקלה|f\d{2}|e\d{2,3}/.test(t)) return 'fault_code_list'
  if (/part\s*no|p\/n|item\s*no|חלק/.test(t)) return 'parts_diagram'
  if (/\btable\b|לוח/.test(t)) return 'table'
  return 'text'
}

function extractFaultCodes(text: string): string[] {
  const codes = text.match(/\b([EF]\d{2,4}|fault\s+\d+|\d{2,4}[A-Z]{0,2})\b/gi) || []
  return [...new Set(codes.map(c => c.toUpperCase()))].slice(0, 20)
}

function extractSystems(text: string): string[] {
  const systems: string[] = []
  const t = text.toLowerCase()
  if (/hydraul|הידראול/.test(t)) systems.push('hydraulic')
  if (/electric|חשמל|wiring/.test(t)) systems.push('electrical')
  if (/drive|הנעה|motor/.test(t)) systems.push('drive')
  if (/battery|סוללה/.test(t)) systems.push('battery')
  if (/engine|מנוע/.test(t)) systems.push('engine')
  if (/control|בקר/.test(t)) systems.push('control')
  if (/safety|בטיחות/.test(t)) systems.push('safety')
  return systems
}
