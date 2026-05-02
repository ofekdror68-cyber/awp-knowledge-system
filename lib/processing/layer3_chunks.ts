import Anthropic from '@anthropic-ai/sdk'
import { dbGet, dbPost, markLayerDone, markError, addCost } from './db'
import type { Document, DocPage, DocChunk, ProcessingResult } from './types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const CHUNK_PROMPT = `You are processing an AWP (aerial work platform) service manual.
Split the text into semantic chunks. Each chunk must be a complete, self-contained unit of meaning.

Chunk types:
- procedure: step-by-step instructions for one task
- spec: specifications table or list
- warning: safety warning with its context
- fault_explanation: fault code + meaning + remedy
- component_description: one component described
- schematic_legend: symbol/wiring legend
- general: important info that doesn't fit above

For each chunk return JSON:
{
  "chunk_type": "<type>",
  "title": "<short title in original language, max 60 chars>",
  "content": "<full text>",
  "page_numbers": [<page numbers spanned>],
  "related_components": ["<component names>"],
  "related_systems": ["hydraulic"|"electrical"|"drive"|"battery"|"engine"|"control"|"safety"],
  "importance_score": <1-10, 10=critical for diagnostics>,
  "summary": "<one sentence>"
}

Skip: page numbers headers/footers, table of contents, cover art, copyright.
Return ONLY a JSON array of chunks. No other text.`

async function callClaude(text: string, retries = 5): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const resp = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8192,
        messages: [{ role: 'user', content: `${CHUNK_PROMPT}\n\n---MANUAL TEXT---\n${text}` }],
      })
      return resp.content[0].type === 'text' ? resp.content[0].text : ''
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('429') || msg.includes('rate')) {
        await new Promise(r => setTimeout(r, Math.min(60000, 5000 * Math.pow(2, i))))
        continue
      }
      throw err
    }
  }
  throw new Error('Max retries')
}

export async function processLayer3(doc: Document): Promise<ProcessingResult> {
  try {
    const pages = await dbGet<DocPage & { id: string }>(
      `doc_pages?document_id=eq.${doc.id}&order=page_number.asc&select=id,page_number,raw_text`
    )
    if (!pages.length) throw new Error('No pages')

    const WINDOW = 30
    const OVERLAP = 2
    let allChunks: DocChunk[] = []
    let totalCostCents = 0

    for (let i = 0; i < pages.length; i += WINDOW - OVERLAP) {
      const window = pages.slice(i, i + WINDOW)
      const text = window
        .filter(p => (p.raw_text || '').trim().length > 50)
        .map(p => `[PAGE ${p.page_number}]\n${p.raw_text}`)
        .join('\n\n')

      if (!text.trim()) continue

      const pageIdMap: Record<number, string> = {}
      for (const p of window) pageIdMap[p.page_number] = p.id

      let raw = ''
      try {
        raw = await callClaude(text.substring(0, 60000))
        // ~$3/1M input tokens ≈ 15 tokens/char → 60k chars ≈ 9k tokens ≈ $0.027 per window
        totalCostCents += Math.round(window.length * 1.5)
      } catch {
        continue
      }

      const jsonMatch = raw.match(/\[[\s\S]*\]/)
      if (!jsonMatch) continue

      let chunks: Array<{
        chunk_type: string; title?: string; content: string; summary?: string
        page_numbers?: number[]; related_components?: string[]; related_systems?: string[]
        importance_score?: number
      }> = []
      try { chunks = JSON.parse(jsonMatch[0]) } catch { continue }

      for (const c of chunks) {
        if (!c.content?.trim()) continue
        const pageIds = (c.page_numbers || []).map((n: number) => pageIdMap[n]).filter(Boolean)
        allChunks.push({
          document_id: doc.id,
          page_ids: pageIds,
          chunk_type: c.chunk_type || 'general',
          title: c.title,
          content: c.content.substring(0, 10000),
          summary: c.summary,
          related_components: c.related_components || [],
          related_systems: c.related_systems || [],
          importance_score: c.importance_score || 5,
        })
      }
    }

    // Deduplicate by content similarity (same first 100 chars = duplicate)
    const seen = new Set<string>()
    allChunks = allChunks.filter(c => {
      const key = c.content.substring(0, 100).replace(/\s+/g, ' ')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Add context_before and context_after
    for (let i = 0; i < allChunks.length; i++) {
      if (i > 0) allChunks[i].context_before = allChunks[i - 1].summary || allChunks[i - 1].content.substring(0, 200)
      if (i < allChunks.length - 1) allChunks[i].context_after = allChunks[i + 1].summary || allChunks[i + 1].content.substring(0, 200)
    }

    // Insert in batches
    for (let i = 0; i < allChunks.length; i += 20) {
      await dbPost('doc_chunks', allChunks.slice(i, i + 20))
    }

    await addCost(doc.id, totalCostCents)
    await markLayerDone(doc.id, 3, { total_chunks: allChunks.length })
    return { success: true, itemsProcessed: allChunks.length, costCents: totalCostCents }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await markError(doc.id, `L3: ${msg}`)
    return { success: false, error: msg, itemsProcessed: 0, costCents: 0 }
  }
}
