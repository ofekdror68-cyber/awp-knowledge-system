import { getSupabaseServiceClient } from '@/lib/supabase/server'

const FAILURE_KEYWORDS: Record<string, string[]> = {
  hydraulic_leak: ['hydraulic', 'הידראוליק', 'leak', 'דליפ', 'oil leak', 'שמן'],
  battery_failure: ['battery', 'מצבר', 'charge', 'טעינה', 'voltage', 'מתח', 'dead battery'],
  drive_motor: ['drive', 'motor', 'מנוע הנעה', 'wheel motor', 'גלגל'],
  cylinder_seal: ['seal', 'אטם', 'cylinder', 'בוכנ', 'piston seal'],
  hydraulic_pump: ['pump', 'משאב', 'pressure', 'לחץ הידראולי'],
  electrical_fault: ['electric', 'חשמל', 'wire', 'חיל', 'fuse', 'נתיך', 'short circuit'],
  brake_system: ['brake', 'בלם', 'braking'],
  load_sensor: ['sensor', 'חיישן', 'load', 'עומס', 'overload'],
  chain_wear: ['chain', 'שרשרת', 'wear', 'בלאי שרשרת'],
  tire_wear: ['tire', 'צמיג', 'flat', 'puncture'],
  engine_failure: ['engine', 'מנוע', 'start', 'wont start', 'לא מניע'],
  cooling_system: ['cool', 'קירור', 'overheat', 'temperature', 'טמפרטור', 'radiator'],
}

function isFailureMatch(failureType: string, symptom: string, fix: string): boolean {
  const text = `${symptom} ${fix}`.toLowerCase()
  const keywords = FAILURE_KEYWORDS[failureType] || []
  return keywords.some((w) => text.includes(w))
}

export async function processExpiredPredictions(): Promise<{
  processed: number
  correct: number
  incorrect: number
}> {
  const supabase = getSupabaseServiceClient()

  const { data: expired } = await supabase
    .from('predictions')
    .select('*, fleet_machines(serial_number, model, brand)')
    .eq('status', 'active')
    .lt('expires_at', new Date().toISOString())
    .is('outcome', null)
    .limit(50)

  let correct = 0
  let incorrect = 0

  for (const pred of expired || []) {
    const machine = pred.fleet_machines as Record<string, unknown> | null

    const windowStart = new Date(pred.created_at)
    const windowEnd = new Date(pred.expires_at || Date.now())

    const orFilter = machine?.serial_number
      ? `serial_number.eq.${machine.serial_number},machine_model.ilike.%${machine?.model}%`
      : `machine_model.ilike.%${machine?.model}%`

    const { data: matchingRepairs } = await supabase
      .from('repair_history')
      .select('symptom, actual_fix')
      .or(orFilter)
      .gte('created_at', windowStart.toISOString())
      .lte('created_at', windowEnd.toISOString())

    const isCorrect =
      matchingRepairs &&
      matchingRepairs.length > 0 &&
      matchingRepairs.some((r) =>
        isFailureMatch(pred.predicted_failure_type, r.symptom || '', r.actual_fix || '')
      )

    const outcome = isCorrect ? 'correct' : 'incorrect'

    await supabase
      .from('predictions')
      .update({
        status: 'expired',
        outcome,
        outcome_notes: isCorrect
          ? `תקלה אומתה בהיסטוריית תיקונים ${windowStart.toLocaleDateString('he-IL')}–${windowEnd.toLocaleDateString('he-IL')}`
          : 'לא נמצאה תקלה תואמת בחלון הזמן החזוי',
      })
      .eq('id', pred.id)

    if (isCorrect) {
      // Increment occurrence count in failure_patterns
      const { data: pattern } = await supabase
        .from('failure_patterns')
        .select('id, occurrence_count')
        .eq('brand', machine?.brand || '')
        .ilike('model', `%${machine?.model}%`)
        .eq('failure_type', pred.predicted_failure_type)
        .single()

      if (pattern) {
        await supabase
          .from('failure_patterns')
          .update({ occurrence_count: (pattern.occurrence_count || 0) + 1 })
          .eq('id', pattern.id)
      }

      correct++
    } else {
      incorrect++
    }
  }

  return { processed: (expired || []).length, correct, incorrect }
}

export async function processNewRepair(repairId: string): Promise<void> {
  const supabase = getSupabaseServiceClient()

  const { data: repair } = await supabase
    .from('repair_history')
    .select('*')
    .eq('id', repairId)
    .single()

  if (!repair) return

  const orFilter = repair.serial_number
    ? `serial_number.eq.${repair.serial_number},model.ilike.%${repair.machine_model}%`
    : `model.ilike.%${repair.machine_model}%`

  const { data: machines } = await supabase
    .from('fleet_machines')
    .select('id, brand, model')
    .or(orFilter)
    .limit(5)

  for (const machine of machines || []) {
    const { data: activePredictions } = await supabase
      .from('predictions')
      .select('id, predicted_failure_type')
      .eq('machine_id', machine.id)
      .eq('status', 'active')

    for (const pred of activePredictions || []) {
      if (isFailureMatch(pred.predicted_failure_type, repair.symptom, repair.actual_fix || '')) {
        await supabase
          .from('predictions')
          .update({
            status: 'happened',
            outcome: 'correct',
            outcome_notes: `תקלה אומתה ע"י תיקון ${repairId}`,
          })
          .eq('id', pred.id)
      }
    }
  }
}

export async function getPredictionAccuracy(): Promise<Record<string, { correct: number; incorrect: number; rate: number }>> {
  const supabase = getSupabaseServiceClient()

  const { data } = await supabase
    .from('predictions')
    .select('predicted_failure_type, outcome')
    .not('outcome', 'is', null)

  const stats: Record<string, { correct: number; incorrect: number }> = {}

  for (const p of data || []) {
    if (!stats[p.predicted_failure_type]) stats[p.predicted_failure_type] = { correct: 0, incorrect: 0 }
    if (p.outcome === 'correct' || p.outcome === 'prevented') stats[p.predicted_failure_type].correct++
    else if (p.outcome === 'incorrect') stats[p.predicted_failure_type].incorrect++
  }

  return Object.fromEntries(
    Object.entries(stats).map(([type, s]) => {
      const total = s.correct + s.incorrect
      return [type, { ...s, rate: total > 0 ? Math.round((s.correct / total) * 100) : 0 }]
    })
  )
}
