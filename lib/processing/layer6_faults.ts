import Anthropic from '@anthropic-ai/sdk'
import { dbGet, dbPost, markLayerDone, markError, addCost } from './db'
import type { Document, ProcessingResult } from './types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const FAULT_PROMPT = (brand: string, model: string, faultCode: string) =>
  `You are a 30-year AWP mechanic building a diagnostic playbook.
Fault: ${faultCode} on ${brand} ${model}

Sources provided below. Build the diagnostic intelligence for this fault. Return JSON ONLY:
{
  "fault_description": "<what this fault means>",
  "symptoms": ["<phrases a tech would describe, include Hebrew>"],
  "affected_systems": ["hydraulic"|"electrical"|"drive"|"battery"|"engine"|"control"|"safety"],
  "possible_causes": [
    {
      "cause": "<root cause>",
      "probability": <0-100>,
      "test_to_verify": "<exact test>",
      "test_difficulty": "trivial"|"easy"|"medium"|"hard",
      "test_time_minutes": <int>,
      "fix_if_confirmed": "<what to do>"
    }
  ],
  "diagnostic_sequence": [
    {"step": 1, "action": "<action>", "if_pass": "<next or done>", "if_fail": "<next>"}
  ],
  "required_tools": ["<tools>"],
  "estimated_repair_time_minutes": <int>,
  "estimated_cost_range": "<range in NIS>",
  "safety_warnings": ["<warnings>"],
  "common_misdiagnosis": "<what is often wrongly blamed>",
  "tribal_knowledge": "<insider tip not obvious from manual>"
}

Probabilities must sum to ~100. Order causes by probability descending.
Diagnostic sequence must minimize total expected diagnosis time (cheapest/fastest test first).
Return ONLY the JSON object. No other text.`

export async function processLayer6(doc: Document): Promise<ProcessingResult> {
  try {
    const brand = doc.machine_brand || 'unknown'
    const model = doc.machine_model || 'unknown'

    // Get all fault_code entities for this doc
    const faultEntities = await dbGet<{ id: string; name: string; description?: string }>(
      `kb_entities?entity_type=eq.fault_code&brand=eq.${encodeURIComponent(brand)}&model=eq.${encodeURIComponent(model)}&select=id,name,description`
    )

    // Also get fault codes from doc_pages for this doc
    const pagesWithFaults = await dbGet<{ fault_codes_on_page: string[] }>(
      `doc_pages?document_id=eq.${doc.id}&fault_codes_on_page=not.is.null&select=fault_codes_on_page`
    )
    const pageFaultCodes = [...new Set(pagesWithFaults.flatMap(p => p.fault_codes_on_page || []))]

    // Merge fault codes from both sources
    const allFaultCodes = new Map<string, string | undefined>()
    for (const e of faultEntities) allFaultCodes.set(e.name, e.description)
    for (const code of pageFaultCodes) if (!allFaultCodes.has(code)) allFaultCodes.set(code, undefined)

    if (!allFaultCodes.size) {
      await markLayerDone(doc.id, 6)
      return { success: true, itemsProcessed: 0, costCents: 0 }
    }

    let totalCostCents = 0
    let processed = 0

    for (const [faultCode, entityDesc] of allFaultCodes) {
      // Check if already processed
      const existing = await dbGet<{ id: string }>(
        `fault_intelligence?fault_code=eq.${encodeURIComponent(faultCode)}&brand=eq.${encodeURIComponent(brand)}&model=eq.${encodeURIComponent(model)}&select=id&limit=1`
      )
      if (existing.length) continue

      // Gather supporting evidence
      const [chunks, repairHistory, community] = await Promise.all([
        dbGet<{ content: string; chunk_type: string }>(`doc_chunks?document_id=eq.${doc.id}&content=ilike.*${encodeURIComponent(faultCode)}*&select=content,chunk_type&limit=5`),
        dbGet<{ symptom: string; actual_fix: string }>(`repair_history?machine_model=eq.${encodeURIComponent(model)}&symptom=ilike.*${encodeURIComponent(faultCode)}*&worked=eq.true&select=symptom,actual_fix&limit=3`),
        dbGet<{ solution: string; mechanic_advice: unknown }>(`community_knowledge?fault_code=eq.${encodeURIComponent(faultCode)}&select=solution,mechanic_advice&limit=3`),
      ])

      const sources = [
        entityDesc ? `Manual description: ${entityDesc}` : '',
        chunks.length ? `Manual chunks:\n${chunks.map(c => c.content.substring(0, 500)).join('\n---\n')}` : '',
        repairHistory.length ? `Past repairs:\n${repairHistory.map(r => `Q: ${r.symptom} → A: ${r.actual_fix}`).join('\n')}` : '',
        community.length ? `Community:\n${community.map(c => c.solution).join('\n')}` : '',
      ].filter(Boolean).join('\n\n')

      let raw = ''
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const resp = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 2048,
            messages: [{ role: 'user', content: `${FAULT_PROMPT(brand, model, faultCode)}\n\n---SOURCES---\n${sources.substring(0, 30000)}` }],
          })
          raw = resp.content[0].type === 'text' ? resp.content[0].text : ''
          break
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          if (msg.includes('429') || msg.includes('rate')) {
            await new Promise(r => setTimeout(r, Math.min(60000, 5000 * Math.pow(2, attempt))))
            continue
          }
          break
        }
      }

      if (!raw) continue

      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) continue

      let fi: {
        fault_description?: string; symptoms?: string[]; affected_systems?: string[]
        possible_causes?: unknown; diagnostic_sequence?: unknown; required_tools?: string[]
        estimated_repair_time_minutes?: number; estimated_cost_range?: string
        safety_warnings?: string[]; common_misdiagnosis?: string; tribal_knowledge?: string
      } = {}
      try { fi = JSON.parse(jsonMatch[0]) } catch { continue }

      await dbPost('fault_intelligence', {
        brand,
        model,
        fault_code: faultCode,
        fault_description: fi.fault_description || '',
        symptoms: fi.symptoms || [],
        affected_systems: fi.affected_systems || [],
        possible_causes: fi.possible_causes || [],
        diagnostic_sequence: fi.diagnostic_sequence || [],
        required_tools: fi.required_tools || [],
        estimated_repair_time_minutes: fi.estimated_repair_time_minutes,
        estimated_cost_range: fi.estimated_cost_range,
        safety_warnings: fi.safety_warnings || [],
        common_misdiagnosis: fi.common_misdiagnosis,
        tribal_knowledge: fi.tribal_knowledge,
        source_type: sources.includes('Past repairs') || sources.includes('Community') ? 'combined' : 'manual',
        source_ids: [doc.id],
        confidence: chunks.length > 0 ? 4 : 2,
      })

      totalCostCents += 5
      processed++
    }

    await addCost(doc.id, totalCostCents)
    await markLayerDone(doc.id, 6)
    return { success: true, itemsProcessed: processed, costCents: totalCostCents }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await markError(doc.id, `L6: ${msg}`)
    return { success: false, error: msg, itemsProcessed: 0, costCents: 0 }
  }
}
