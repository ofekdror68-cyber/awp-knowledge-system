import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServiceClient()
  const raw = await req.json()

  const {
    machine_id, date, hours_at_service, service_type,
    technician_name, notes, next_service_hours, next_service_date,
    parts_replaced, checklist_completed,
  } = raw

  if (!machine_id || !service_type) {
    return NextResponse.json({ error: 'machine_id and service_type are required' }, { status: 400 })
  }

  const { data, error } = await supabase.from('service_logs').insert({
    machine_id,
    date: date || new Date().toISOString().split('T')[0],
    hours_at_service: hours_at_service || null,
    service_type,
    technician_name: technician_name || null,
    notes: notes || null,
    next_service_hours: next_service_hours || null,
    next_service_date: next_service_date || null,
    parts_replaced: parts_replaced || [],
    checklist_completed: checklist_completed || [],
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const machineUpdates: Record<string, unknown> = {
    last_service_date: date || new Date().toISOString().split('T')[0],
    status: 'תקין',
  }
  if (hours_at_service) {
    machineUpdates.hours_last_service = hours_at_service
    machineUpdates.hours_current = hours_at_service
  }
  if (next_service_hours) machineUpdates.next_service_due_hours = next_service_hours
  if (next_service_date) machineUpdates.next_service_due_date = next_service_date

  await supabase.from('machines').update(machineUpdates).eq('id', machine_id)

  return NextResponse.json(data)
}

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServiceClient()
  const machineId = new URL(req.url).searchParams.get('machine_id')
  let query = supabase.from('service_logs').select('*').order('date', { ascending: false })
  if (machineId) query = query.eq('machine_id', machineId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data || [])
}
