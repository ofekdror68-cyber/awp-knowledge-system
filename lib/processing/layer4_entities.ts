import Anthropic from '@anthropic-ai/sdk'
import { dbGet, dbPost, markLayerDone, markError, addCost } from './db'
import type { Document, DocChunk, KbEntity, ProcessingResult } from './types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const ENTITY_PROMPT = (brand: string, model: string) =>
  `You are building a structured knowledge base for AWP brand=${brand} model=${model}.
From the manual chunks below, extract every distinct entity.

Entity types:
- component: physical part (solenoid, sensor, valve, relay, fuse, motor, pump, contactor)
- fault_code: error codes (e.g. "63", "F02", "E15")
- procedure: named maintenance/repair procedures
- spec: numerical or categorical specifications
- tool: tools required for procedures
- fluid: oils, hydraulic fluids, coolants
- fastener: bolts/screws with torque specs

For each entity return JSON:
{
  "entity_type": "<type>",
  "name": "<canonical name>",
  "aliases": ["<alternate names mechanics use>"],
  "description": "<1-3 sentences>",
  "attributes": { <key: value pairs> },
  "confidence": <1-5>
}

Be exhaustive — a full service manual yields 200+ entities.
Return ONLY a JSON array. No other text.`

async function callClaude(prompt: string, content: string, retries = 5): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const resp = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8192,
        messages: [{ role: 'user', content: `${prompt}\n\n---CHUNKS---\n${content}` }],
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

// Layer 4 processes by (brand, model) group, called per document but tracks at group level
export async function processLayer4(doc: Document): Promise<ProcessingResult> {
  try {
    const brand = doc.machine_brand || 'unknown'
    const model = doc.machine_model || 'unknown'

    const chunks = await dbGet<DocChunk & { id: string }>(
      `doc_chunks?document_id=eq.${doc.id}&select=id,content,chunk_type,title,related_components,related_systems`
    )
    if (!chunks.length) throw new Error('No chunks from Layer 3')

    // Batch chunks into groups (Claude context window limit)
    const BATCH_CHARS = 40000
    let current = ''
    const batches: string[] = []
    const chunkIds: string[][] = []
    let currentIds: string[] = []

    for (const c of chunks) {
      const entry = `[${c.chunk_type}] ${c.title || ''}\n${c.content}\n---\n`
      if (current.length + entry.length > BATCH_CHARS && current) {
        batches.push(current)
        chunkIds.push(currentIds)
        current = ''
        currentIds = []
      }
      current += entry
      currentIds.push(c.id)
    }
    if (current) { batches.push(current); chunkIds.push(currentIds) }

    const allEntities: KbEntity[] = []
    let totalCostCents = 0

    for (let b = 0; b < batches.length; b++) {
      let raw = ''
      try {
        raw = await callClaude(ENTITY_PROMPT(brand, model), batches[b])
        totalCostCents += Math.round(chunks.length * 0.5)
      } catch { continue }

      const jsonMatch = raw.match(/\[[\s\S]*\]/)
      if (!jsonMatch) continue

      let entities: Array<{
        entity_type?: string; name?: string; aliases?: string[];
        description?: string; attributes?: Record<string, unknown>; confidence?: number
      }> = []
      try { entities = JSON.parse(jsonMatch[0]) } catch { continue }

      for (const e of entities) {
        if (!e.name || !e.entity_type) continue
        allEntities.push({
          entity_type: e.entity_type,
          brand,
          model,
          name: e.name.substring(0, 200),
          aliases: e.aliases || [],
          description: e.description,
          attributes: e.attributes || {},
          source_doc_ids: [doc.id],
          confidence: e.confidence || 3,
        })
      }
    }

    // Deduplicate by (entity_type, name) — keep highest confidence
    const seen = new Map<string, KbEntity>()
    for (const e of allEntities) {
      const key = `${e.entity_type}::${e.name.toLowerCase()}`
      const existing = seen.get(key)
      if (!existing || (e.confidence || 0) > (existing.confidence || 0)) {
        seen.set(key, e)
      } else if (existing) {
        // Merge aliases
        existing.aliases = [...new Set([...(existing.aliases || []), ...(e.aliases || [])])]
      }
    }

    const unique = Array.from(seen.values())
    for (let i = 0; i < unique.length; i += 20) {
      await dbPost('kb_entities', unique.slice(i, i + 20))
    }

    await addCost(doc.id, totalCostCents)
    await markLayerDone(doc.id, 4, { total_entities: unique.length })
    return { success: true, itemsProcessed: unique.length, costCents: totalCostCents }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await markError(doc.id, `L4: ${msg}`)
    return { success: false, error: msg, itemsProcessed: 0, costCents: 0 }
  }
}
