import Anthropic from '@anthropic-ai/sdk'
import { dbGet, dbPost, markLayerDone, markError, addCost } from './db'
import type { Document, ProcessingResult } from './types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const REL_PROMPT = (brand: string, model: string) =>
  `You have entities for AWP brand=${brand} model=${model}. Find relationships between them.

Relationship types:
- causes: A causes B (e.g. low_battery causes fault_63)
- requires: A requires B (procedure requires tool)
- controls: A controls B (solenoid controls valve)
- connects_to: A connects to B (wire connects terminal)
- part_of: A is part of B (cylinder part_of hydraulic_system)
- replaces: A replaces B (new_part replaces old_part)
- tested_by: A is tested by B (sensor tested_by multimeter_check)
- located_at: A is at B (fuse located_at fuse_panel)

Return JSON array:
[{"from":"<entity name>","to":"<entity name>","type":"<rel_type>","notes":"<short>"}]

Be aggressive — a typical model has 100-300 relationships.
Return ONLY the JSON array.`

interface RawRel {
  from: string
  to: string
  type: string
  notes?: string
}

export async function processLayer5(doc: Document): Promise<ProcessingResult> {
  try {
    const brand = doc.machine_brand || 'unknown'
    const model = doc.machine_model || 'unknown'

    const entities = await dbGet<{ id: string; name: string; entity_type: string; description?: string }>(
      `kb_entities?brand=eq.${encodeURIComponent(brand)}&model=eq.${encodeURIComponent(model)}&select=id,name,entity_type,description`
    )
    if (entities.length < 5) {
      await markLayerDone(doc.id, 5)
      return { success: true, itemsProcessed: 0, costCents: 0 }
    }

    const entityText = entities.map(e => `${e.entity_type}: ${e.name}${e.description ? ' — ' + e.description.substring(0, 100) : ''}`).join('\n')
    const nameToId = new Map(entities.map(e => [e.name.toLowerCase(), e.id]))

    let raw = ''
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const resp = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 8192,
          messages: [{ role: 'user', content: `${REL_PROMPT(brand, model)}\n\n---ENTITIES---\n${entityText.substring(0, 50000)}` }],
        })
        raw = resp.content[0].type === 'text' ? resp.content[0].text : ''
        break
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('429') || msg.includes('rate')) {
          await new Promise(r => setTimeout(r, Math.min(60000, 5000 * Math.pow(2, attempt))))
          continue
        }
        throw err
      }
    }

    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      await markLayerDone(doc.id, 5)
      return { success: true, itemsProcessed: 0, costCents: 0 }
    }

    let rels: RawRel[] = []
    try { rels = JSON.parse(jsonMatch[0]) } catch { rels = [] }

    const rows = []
    for (const r of rels) {
      const fromId = nameToId.get(r.from?.toLowerCase())
      const toId = nameToId.get(r.to?.toLowerCase())
      if (!fromId || !toId || fromId === toId) continue
      rows.push({
        from_entity_id: fromId,
        to_entity_id: toId,
        relationship_type: r.type,
        notes: r.notes || null,
        evidence_doc_ids: [doc.id],
      })
    }

    for (let i = 0; i < rows.length; i += 20) {
      await dbPost('kb_relationships', rows.slice(i, i + 20))
    }

    const costCents = Math.round(entities.length * 0.2)
    await addCost(doc.id, costCents)
    await markLayerDone(doc.id, 5)
    return { success: true, itemsProcessed: rows.length, costCents }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await markError(doc.id, `L5: ${msg}`)
    return { success: false, error: msg, itemsProcessed: 0, costCents: 0 }
  }
}
