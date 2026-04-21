import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServiceClient()
  const body = await req.json()

  const { data, error } = await supabase.from('service_logs').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Update machine record
  const machineUpdates: Record<string, unknown> = {
    hours_last_service: body.hours_at_service,
    last_service_date: body.date,
    hours_current: body.hours_at_service,
    status: 'תקין',
  }
  if (body.next_service_hours) {
    machineUpdates.next_service_due_hours = body.next_service_hours
  }
  if (body.next_service_date) {
    machineUpdates.next_service_due_date = body.next_service_date
  }

  await supabase.from('machines').update(machineUpdates).eq('id', body.machine_id)

  return NextResponse.json(data)
}

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServiceClient()
  const machineId = new URL(req.url).searchParams.get('machine_id')
  const query = supabase.from('service_logs').select('*').order('date', { ascending: false })
  if (machineId) query.eq('machine_id', machineId)
  const { data } = await query
  return NextResponse.json(data || [])
}
