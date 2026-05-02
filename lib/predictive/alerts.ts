import { getSupabaseServiceClient } from '@/lib/supabase/server'
import { labelFor } from './types'

export interface AlertSummary {
  high: AlertItem[]
  medium: AlertItem[]
  total: number
}

export interface AlertItem {
  prediction_id: string
  machine_label: string
  failure_label: string
  probability: number
  window_min: number
  window_max: number
  recommended_action: string
  cost_preventive?: string
  cost_ignored?: string
}

export async function runAlerts(): Promise<{ alerts_fired: number; summary: AlertSummary }> {
  const supabase = getSupabaseServiceClient()

  const { data: predictions } = await supabase
    .from('predictions')
    .select('*, fleet_machines(brand, model, mavaatz, serial_number, location, current_hours)')
    .eq('status', 'active')
    .or('probability.gte.70,and(probability.gte.50,predicted_window_days_max.lte.14)')
    .is('acknowledged_at', null)
    .order('probability', { ascending: false })
    .limit(20)

  const empty: AlertSummary = { high: [], medium: [], total: 0 }
  if (!predictions?.length) return { alerts_fired: 0, summary: empty }

  function toItem(p: Record<string, unknown>): AlertItem {
    const m = p.fleet_machines as Record<string, unknown>
    return {
      prediction_id: p.id as string,
      machine_label: `${m?.brand} ${m?.model} מע"צ-${m?.mavaatz}`,
      failure_label: labelFor(p.predicted_failure_type as string),
      probability: p.probability as number,
      window_min: p.predicted_window_days_min as number,
      window_max: p.predicted_window_days_max as number,
      recommended_action: p.recommended_action as string,
      cost_preventive: p.recommended_action_cost_estimate as string | undefined,
      cost_ignored: p.cost_if_ignored_estimate as string | undefined,
    }
  }

  const high = predictions.filter((p) => p.probability >= 70).map(toItem)
  const medium = predictions
    .filter((p) => p.probability >= 50 && p.probability < 70 && p.predicted_window_days_max <= 14)
    .map(toItem)

  const summary: AlertSummary = { high, medium, total: predictions.length }

  // Log formatted summary
  const today = new Date().toLocaleDateString('he-IL')
  const lines = [`🔔 התראות תחזוקה חזויה — ${today}`, '']

  if (high.length) {
    lines.push('🔴 דחוף (סבירות 70%+):')
    for (const a of high) {
      lines.push(`• ${a.machine_label} — ${a.failure_label} (${a.probability}%)`)
      lines.push(`  תוך ${a.window_min}-${a.window_max} ימים`)
      lines.push(`  מומלץ: ${a.recommended_action}`)
      if (a.cost_preventive) lines.push(`  עלות מנע: ${a.cost_preventive}`)
      if (a.cost_ignored) lines.push(`  עלות אם תיקרה: ${a.cost_ignored}`)
      lines.push('')
    }
  }

  if (medium.length) {
    lines.push('🟡 לב לאזור (50-69%, תוך 14 ימים):')
    for (const a of medium) {
      lines.push(`• ${a.machine_label} — ${a.failure_label} (${a.probability}%)`)
      lines.push(`  מומלץ: ${a.recommended_action}`)
      lines.push('')
    }
  }

  console.log('[Alerts]', lines.join('\n'))
  // Future: send via WhatsApp/email

  return { alerts_fired: predictions.length, summary }
}
