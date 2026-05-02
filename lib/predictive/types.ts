export interface FleetMachine {
  id: string
  internal_id: string
  mavaatz: string
  brand: string
  model: string
  serial_number: string
  year_manufactured?: number
  category: string
  current_hours: number
  last_hours_update?: string
  last_service_date?: string
  last_service_hours?: number
  next_scheduled_service_hours?: number
  next_scheduled_service_date?: string
  location: string
  status: 'active' | 'in_repair' | 'retired'
  notes?: string
  created_at: string
  updated_at: string
}

export interface PredictionEvidence {
  current_hours_vs_typical?: string
  fleet_pattern_match?: string
  precursor_signals_found?: string[]
  similar_recent_failures?: string[]
}

export interface Prediction {
  id: string
  machine_id: string
  predicted_failure_type: string
  predicted_component?: string
  probability: number
  confidence: number
  predicted_window_days_min: number
  predicted_window_days_max: number
  reasoning: string
  evidence: PredictionEvidence
  recommended_action: string
  recommended_action_cost_estimate?: string
  cost_if_ignored_estimate?: string
  status: 'active' | 'acknowledged' | 'prevented' | 'happened' | 'expired'
  created_at: string
  expires_at?: string
  acknowledged_at?: string
  acknowledged_by?: string
  outcome?: 'correct' | 'incorrect' | 'prevented'
  outcome_notes?: string
  fleet_machines?: FleetMachine
}

export interface FailurePattern {
  id: string
  brand: string
  model: string
  failure_type: string
  typical_age_hours_min?: number
  typical_age_hours_max?: number
  typical_age_months_min?: number
  typical_age_months_max?: number
  precursor_signals: string[]
  occurrence_count: number
  total_machines_tracked: number
  base_rate_percent: number
  last_updated: string
}

export const FAILURE_TYPE_LABELS: Record<string, string> = {
  hydraulic_leak: 'דליפת הידראוליקה',
  battery_failure: 'כשל מצבר',
  drive_motor: 'מנוע הנעה',
  cylinder_seal: 'אטם בוכנה',
  hydraulic_pump: 'משאבת הידראוליקה',
  electrical_fault: 'תקלה חשמלית',
  brake_system: 'מערכת בלמים',
  load_sensor: 'חיישן עומס',
  chain_wear: 'בלאי שרשרת',
  tire_wear: 'בלאי צמיגים',
  engine_failure: 'כשל מנוע',
  cooling_system: 'מערכת קירור',
  other: 'תקלה כללית',
}

export function labelFor(type: string): string {
  return FAILURE_TYPE_LABELS[type] || type
}
