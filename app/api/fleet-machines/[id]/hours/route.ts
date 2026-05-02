import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabaseServiceClient()
  const { id } = await params
  const { hours, source, recorded_by } = await req.json()

  if (typeof hours !== 'number' || hours < 0) {
    return NextResponse.json({ error: 'hours must be a non-negative number' }, { status: 400 })
  }

  const { error: logError } = await supabase.from('machine_hours_log').insert({
    machine_id: id,
    reading_hours: hours,
    reading_date: new Date().toISOString().slice(0, 10),
    source: source || 'manual_entry',
    recorded_by: recorded_by || 'unknown',
  })

  if (logError) return NextResponse.json({ error: logError.message }, { status: 500 })

  await supabase
    .from('fleet_machines')
    .update({ current_hours: hours, last_hours_update: new Date().toISOString() })
    .eq('id', id)

  return NextResponse.json({ ok: true })
}
