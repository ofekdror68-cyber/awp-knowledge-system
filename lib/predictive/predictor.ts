import { getAnthropicClient } from '@/lib/anthropic'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

const PREDICTOR_SYSTEM = `You are a fleet maintenance expert for an Israeli AWP (aerial work platform) rental company.
Analyze machine data and predict component failures. Be realistic and calibrated — only flag genuine risks.
Reasoning must be in Hebrew. Return ONLY a valid JSON array, no other text.`

interface RawPrediction {
  predicted_failure_type: string
  predicted_component: string
  probability: number
  confidence: number
  predicted_window_days_min: number
  predicted_window_days_max: number
  reasoning: string
  evidence: {
    current_hours_vs_typical?: string
    fleet_pattern_match?: string
    precursor_signals_found?: string[]
    similar_recent_failures?: string[]
  }
  recommended_action: string
  recommended_action_cost_estimate: string
  cost_if_ignored_estimate: string
}

function computeRiskScores(
  patterns: Record<string, unknown>[],
  currentHours: number,
  recentNotes: string,
  fleetRecentFailures: string[],
  daysSinceService: number
): Record<string, number> {
  const scores: Record<string, number> = {}

  for (const p of patterns) {
    let risk = Number(p.base_rate_percent) || 5

    const minH = Number(p.typical_age_hours_min) || 0
    const maxH = Number(p.typical_age_hours_max) || 99999
    if (currentHours >= minH * 0.8 && currentHours <= maxH * 1.2) {
      risk *= 1.3
    }

    const signals = (p.precursor_signals as string[]) || []
    const notesLower = recentNotes.toLowerCase()
    if (signals.some((s) => notesLower.includes(s.toLowerCase()))) {
      risk *= 1.5
    }

    const ft = p.failure_type as string
    if (fleetRecentFailures.includes(ft)) {
      risk *= 1.4
    }

    if (daysSinceService < 30) risk *= 0.8
    if (daysSinceService > 365) risk *= 1.2

    scores[ft] = Math.min(95, Math.round(risk * 10) / 10)
  }

  return scores
}

async function predictForMachine(
  machine: Record<string, unknown>,
  context: {
    patterns: Record<string, unknown>[]
    recentRepairs: Record<string, unknown>[]
    componentWear: Record<string, unknown>[]
    hoursGrowthPerWeek: number
    fleetRecentFailures: string[]
  }
): Promise<RawPrediction[]> {
  const currentHours = Number(machine.current_hours) || 0
  const daysSinceService = machine.last_service_date
    ? Math.floor((Date.now() - new Date(machine.last_service_date as string).getTime()) / 86400000)
    : 999

  const recentNotes = context.recentRepairs
    .map((r) => `${r.technician_notes || ''} ${r.symptom || ''}`)
    .join(' ')

  const riskScores = computeRiskScores(
    context.patterns,
    currentHours,
    recentNotes,
    context.fleetRecentFailures,
    daysSinceService
  )

  const repairLines = context.recentRepairs
    .slice(0, 8)
    .map((r) => `- ${String(r.created_at || '').slice(0, 10)}: ${r.symptom} → ${r.actual_fix || 'לא ידוע'}`)
    .join('\n') || 'אין תיקונים רשומים'

  const componentLines = context.componentWear
    .map((c) => `- ${c.component_name}: הותקן ב-${c.installed_hours}ש', חיי-שירות: ${c.expected_lifetime_hours}ש', בדיקה אחרונה: ${c.last_inspection_result || 'לא ידוע'}`)
    .join('\n') || 'אין נתוני רכיבים'

  const patternLines = context.patterns
    .map((p) => `- ${p.failure_type}: קורה ב-${p.typical_age_hours_min}-${p.typical_age_hours_max}ש', שכיחות ${p.base_rate_percent}%/שנה, סימני אזהרה: ${(p.precursor_signals as string[])?.join(', ') || 'אין'}`)
    .join('\n') || 'עדיין אין דפוסים ללומוד'

  const riskLines = Object.entries(riskScores)
    .map(([type, score]) => `- ${type}: ${score.toFixed(0)}%`)
    .join('\n') || 'אין ניקוד סיכון'

  const prompt = `מכונה: ${machine.brand} ${machine.model} (מע"צ: ${machine.mavaatz || machine.internal_id})
מספר סידורי: ${machine.serial_number || 'לא ידוע'}
שעות נוכחיות: ${currentHours}
קצב גידול שעות: ~${context.hoursGrowthPerWeek.toFixed(1)} שעות/שבוע
שירות אחרון: ${machine.last_service_date || 'לא ידוע'} ב-${machine.last_service_hours || '?'} שעות (לפני ${daysSinceService} ימים)
מיקום: ${machine.location || 'לא ידוע'}

תיקונים אחרונים (6 חודשים):
${repairLines}

מצב רכיבים:
${componentLines}

דפוסי כשל ב-${machine.brand} ${machine.model}:
${patternLines}

ניקוד סיכון מחושב מראש:
${riskLines}

צור תחזיות JSON. כלול רק probability >= 40%. הנמקה בעברית.
החזר אך ורק מערך JSON תקין:
[{
  "predicted_failure_type": "<type>",
  "predicted_component": "<component in English>",
  "probability": <0-100>,
  "confidence": <0-100>,
  "predicted_window_days_min": <int>,
  "predicted_window_days_max": <int>,
  "reasoning": "<2-3 משפטים בעברית>",
  "evidence": {
    "current_hours_vs_typical": "<phrase>",
    "fleet_pattern_match": "<phrase>",
    "precursor_signals_found": [],
    "similar_recent_failures": []
  },
  "recommended_action": "<פעולה מומלצת בעברית>",
  "recommended_action_cost_estimate": "<₪X-Y>",
  "cost_if_ignored_estimate": "<₪X-Y + השבתה>"
}]`

  try {
    const client = getAnthropicClient()
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: PREDICTOR_SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '[]'
    const match = text.match(/\[[\s\S]*\]/)?.[0]
    if (!match) return []

    const parsed: RawPrediction[] = JSON.parse(match)
    return parsed.filter((p) => p.probability >= 40)
  } catch (e) {
    console.error('[Predictor] Claude error:', e)
    return []
  }
}

export async function runPredictor(): Promise<{ machines_processed: number; predictions_created: number }> {
  const supabase = getSupabaseServiceClient()

  const { data: fleet } = await supabase
    .from('fleet_machines')
    .select('*')
    .eq('status', 'active')

  if (!fleet?.length) return { machines_processed: 0, predictions_created: 0 }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
  const { data: recentFleetRepairs } = await supabase
    .from('repair_history')
    .select('machine_model, symptom')
    .gte('created_at', thirtyDaysAgo)

  let predictions_created = 0

  for (const machine of fleet) {
    try {
      const { data: patterns } = await supabase
        .from('failure_patterns')
        .select('*')
        .eq('brand', machine.brand)
        .ilike('model', `%${machine.model}%`)

      // Repairs for this specific machine (by serial) plus fleet-wide repairs for same model
      const { data: recentRepairs } = await supabase
        .from('repair_history')
        .select('*')
        .or(
          machine.serial_number
            ? `serial_number.eq.${machine.serial_number},machine_model.ilike.%${machine.model}%`
            : `machine_model.ilike.%${machine.model}%`
        )
        .order('created_at', { ascending: false })
        .limit(20)

      const { data: componentWear } = await supabase
        .from('component_wear')
        .select('*')
        .eq('machine_id', machine.id)

      const { data: hoursLog } = await supabase
        .from('machine_hours_log')
        .select('reading_hours, reading_date')
        .eq('machine_id', machine.id)
        .order('reading_date', { ascending: false })
        .limit(10)

      let hoursGrowthPerWeek = 0
      if (hoursLog && hoursLog.length >= 2) {
        const newest = hoursLog[0]
        const oldest = hoursLog[hoursLog.length - 1]
        const daysDiff =
          (new Date(newest.reading_date).getTime() - new Date(oldest.reading_date).getTime()) / 86400000
        if (daysDiff > 0) {
          hoursGrowthPerWeek = ((newest.reading_hours - oldest.reading_hours) / daysDiff) * 7
        }
      }

      const fleetRecentFailures = (recentFleetRepairs || [])
        .filter((r) => r.machine_model?.includes(machine.model))
        .map((r) => r.symptom || '')
        .filter(Boolean)

      // Skip if truly no data (no patterns AND no history)
      if (!patterns?.length && !recentRepairs?.length) continue

      const newPredictions = await predictForMachine(machine, {
        patterns: (patterns || []) as Record<string, unknown>[],
        recentRepairs: (recentRepairs || []) as Record<string, unknown>[],
        componentWear: (componentWear || []) as Record<string, unknown>[],
        hoursGrowthPerWeek,
        fleetRecentFailures,
      })

      for (const pred of newPredictions) {
        const windowMax = Number(pred.predicted_window_days_max) || 30
        const expiresAt = new Date(Date.now() + windowMax * 1.5 * 86400000)

        // Expire previous active prediction for same machine + failure_type
        await supabase
          .from('predictions')
          .update({ status: 'expired' })
          .eq('machine_id', machine.id)
          .eq('predicted_failure_type', pred.predicted_failure_type)
          .eq('status', 'active')

        const { error } = await supabase.from('predictions').insert({
          machine_id: machine.id,
          predicted_failure_type: pred.predicted_failure_type,
          predicted_component: pred.predicted_component,
          probability: pred.probability,
          confidence: pred.confidence,
          predicted_window_days_min: pred.predicted_window_days_min,
          predicted_window_days_max: pred.predicted_window_days_max,
          reasoning: pred.reasoning,
          evidence: pred.evidence,
          recommended_action: pred.recommended_action,
          recommended_action_cost_estimate: pred.recommended_action_cost_estimate,
          cost_if_ignored_estimate: pred.cost_if_ignored_estimate,
          expires_at: expiresAt.toISOString(),
        })

        if (!error) predictions_created++
        else console.error('[Predictor] Insert error:', error.message)
      }

      // Rate-limit Claude calls
      await new Promise((r) => setTimeout(r, 400))
    } catch (e) {
      console.error(`[Predictor] Error for machine ${machine.id}:`, e)
    }
  }

  return { machines_processed: fleet.length, predictions_created }
}
