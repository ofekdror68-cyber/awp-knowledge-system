import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabaseServiceClient()
  const { id } = await params
  const body = await req.json()
  const { action, acknowledged_by, outcome, outcome_notes } = body

  const updates: Record<string, unknown> = {}

  if (action === 'acknowledge') {
    updates.status = 'acknowledged'
    updates.acknowledged_at = new Date().toISOString()
    updates.acknowledged_by = acknowledged_by || 'אופק'
  } else if (action === 'prevent') {
    updates.status = 'prevented'
    updates.outcome = 'prevented'
    updates.outcome_notes = outcome_notes || 'טיפול מניעתי בוצע'
    updates.acknowledged_at = new Date().toISOString()
  } else if (action === 'dismiss') {
    updates.status = 'expired'
    updates.outcome = 'incorrect'
    updates.outcome_notes = outcome_notes || 'נדחה ידנית'
  } else if (outcome) {
    updates.outcome = outcome
    updates.outcome_notes = outcome_notes
    updates.status = 'expired'
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid action' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('predictions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
