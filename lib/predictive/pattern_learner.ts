import { getAnthropicClient } from '@/lib/anthropic'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

const CLASSIFY_SYSTEM = `Classify each repair record into a normalized failure_type and component.
Return ONLY a JSON array with exactly the same count as input.
failure_type options: hydraulic_leak | battery_failure | drive_motor | cylinder_seal | hydraulic_pump | electrical_fault | brake_system | load_sensor | chain_wear | tire_wear | engine_failure | cooling_system | other`

async function batchClassifyRepairs(
  repairs: Array<{ symptom: string; actual_fix?: string; technician_notes?: string }>
): Promise<Array<{ failure_type: string; component: string }>> {
  if (repairs.length === 0) return []
  const fallback = repairs.map(() => ({ failure_type: 'other', component: 'unknown' }))
  try {
    const client = getAnthropicClient()
    const lines = repairs
      .slice(0, 30)
      .map((r, i) => `[${i}] symptom: ${r.symptom} | fix: ${r.actual_fix || 'n/a'} | notes: ${r.technician_notes || 'n/a'}`)
      .join('\n')

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: CLASSIFY_SYSTEM,
      messages: [{ role: 'user', content: `Classify ${repairs.slice(0, 30).length} repairs:\n${lines}\nReturn JSON array: [{"failure_type":"...","component":"..."}, ...]` }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '[]'
    const match = text.match(/\[[\s\S]*?\]/)?.[0]
    if (!match) return fallback
    const parsed: Array<{ failure_type: string; component: string }> = JSON.parse(match)
    return parsed.slice(0, repairs.length)
  } catch (e) {
    console.error('[PatternLearner] classify error:', e)
    return fallback
  }
}

async function extractPrecursorSignals(notes: string[]): Promise<string[]> {
  if (notes.length === 0) return []
  try {
    const client = getAnthropicClient()
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `These are technician notes before/during AWP failures. What symptoms appeared BEFORE the failure? Return JSON array of short English phrases (3-5 words, max 8).
Notes:\n${notes.slice(0, 15).join('\n---\n')}\nReturn only: ["signal1","signal2",...]`,
      }],
    })
    const text = msg.content[0].type === 'text' ? msg.content[0].text : '[]'
    const match = text.match(/\[[\s\S]*?\]/)?.[0]
    return match ? (JSON.parse(match) as string[]).slice(0, 8) : []
  } catch {
    return []
  }
}

export async function runPatternLearner(): Promise<{ patterns_updated: number; brands_processed: number }> {
  const supabase = getSupabaseServiceClient()

  const { data: fleet } = await supabase
    .from('fleet_machines')
    .select('brand, model')
    .eq('status', 'active')

  if (!fleet?.length) return { patterns_updated: 0, brands_processed: 0 }

  const brandModels = [
    ...new Set(fleet.map((m) => `${m.brand}|||${m.model}`)),
  ].map((s) => {
    const [brand, model] = s.split('|||')
    return { brand, model }
  })

  let patterns_updated = 0

  for (const { brand, model } of brandModels) {
    try {
      const { data: repairs } = await supabase
        .from('repair_history')
        .select('symptom, actual_fix, technician_notes, system_category')
        .ilike('machine_model', `%${model}%`)
        .not('symptom', 'is', null)
        .limit(80)

      const { data: community } = await supabase
        .from('community_knowledge')
        .select('symptom, solution, mechanic_advice')
        .ilike('model', `%${model}%`)
        .gte('quality', 3)
        .limit(40)

      const { count: machineCount } = await supabase
        .from('fleet_machines')
        .select('id', { count: 'exact', head: true })
        .eq('brand', brand)
        .ilike('model', `%${model}%`)

      const allRepairs = [
        ...(repairs || []),
        ...(community || []).map((c) => ({
          symptom: c.symptom || '',
          actual_fix: c.solution,
          technician_notes: Array.isArray(c.mechanic_advice)
            ? c.mechanic_advice.join(' ')
            : String(c.mechanic_advice || ''),
          system_category: null,
        })),
      ].filter((r) => r.symptom)

      if (allRepairs.length === 0) continue

      const classified = await batchClassifyRepairs(allRepairs)

      const byType: Record<string, Array<{ classified: { failure_type: string; component: string }; notes: string }>> = {}
      for (let i = 0; i < allRepairs.length; i++) {
        const cls = classified[i] || { failure_type: 'other', component: 'unknown' }
        if (!byType[cls.failure_type]) byType[cls.failure_type] = []
        byType[cls.failure_type].push({ classified: cls, notes: allRepairs[i].technician_notes || allRepairs[i].symptom })
      }

      const totalMachines = machineCount || 1

      for (const [failure_type, items] of Object.entries(byType)) {
        const notes = items.map((i) => i.notes).filter(Boolean)
        const precursor_signals = await extractPrecursorSignals(notes)

        const occurrenceCount = items.length
        // Annualized rate: occurrences / machines, assume 3-year fleet window
        const baseRate = Math.min(100, Math.round(((occurrenceCount / totalMachines / 3) * 100) * 10) / 10)

        await supabase.from('failure_patterns').upsert(
          {
            brand,
            model,
            failure_type,
            occurrence_count: occurrenceCount,
            total_machines_tracked: totalMachines,
            base_rate_percent: baseRate,
            precursor_signals,
            last_updated: new Date().toISOString(),
          },
          { onConflict: 'brand,model,failure_type' }
        )

        patterns_updated++
      }
    } catch (e) {
      console.error(`[PatternLearner] Error for ${brand} ${model}:`, e)
    }
  }

  return { patterns_updated, brands_processed: brandModels.length }
}
