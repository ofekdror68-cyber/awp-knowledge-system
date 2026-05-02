import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServiceClient()
  const { searchParams } = new URL(req.url)
  const machine_id = searchParams.get('machine_id')
  const status = searchParams.get('status') || 'active'
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)

  let query = supabase
    .from('predictions')
    .select('*, fleet_machines(id, brand, model, mavaatz, serial_number, location, current_hours, category)')
    .order('probability', { ascending: false })
    .limit(limit)

  if (machine_id) query = query.eq('machine_id', machine_id)
  if (status !== 'all') query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Compute basic stats
  const active = (data || []).filter((p) => p.status === 'active')
  const withOutcome = (data || []).filter((p) => p.outcome)
  const correct = withOutcome.filter((p) => p.outcome === 'correct' || p.outcome === 'prevented').length
  const accuracy = withOutcome.length > 0 ? Math.round((correct / withOutcome.length) * 100) : null

  return NextResponse.json({
    predictions: data || [],
    meta: {
      total: (data || []).length,
      active: active.length,
      accuracy,
    },
  })
}
