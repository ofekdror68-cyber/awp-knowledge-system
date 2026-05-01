import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

const ALLOWED_FIELDS = [
  'machine_id', 'date', 'hours_at_service', 'service_type',
  'technician', 'notes', 'next_service_hours', 'next_service_date', 'parts_replaced',
] as const

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServiceClient()
  const raw = await req.json()

  const body = Object.fromEntries(ALLOWED_FIELDS.filter(k => raw[k] !== undefined).map(k => [k, raw[k]]))

  if (!body.machine_id) return NextResponse.json({ error: 'Missing machine_id' }, { status: 400 })

  const { data, error } = await supabase.from('service_logs').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const machineUpdates: Record<string, unknown> = {
    hours_last_service: raw.hours_at_service,
    last_service_date: raw.date,
    hours_current: raw.hours_at_service,
    status: 'תקין',
  }
  if (raw.next_service_hours) machineUpdates.next_service_due_hours = raw.next_service_hours
  if (raw.next_service_date) machineUpdates.next_service_due_date = raw.next_service_date

  await supabase.from('machines').update(machineUpdates).eq('id', raw.machine_id)

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
