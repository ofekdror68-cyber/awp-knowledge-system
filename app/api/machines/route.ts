import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

const INSERT_FIELDS = ['brand', 'model', 'serial_number', 'year', 'hours_current', 'status', 'location', 'notes'] as const
const UPDATE_FIELDS = ['hours_current', 'status', 'location', 'notes', 'next_service_due_hours', 'next_service_due_date'] as const

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServiceClient()
  const raw = await req.json()

  const body = Object.fromEntries(INSERT_FIELDS.filter(k => raw[k] !== undefined).map(k => [k, raw[k]]))

  const { data, error } = await supabase.from('machines').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (data && data.hours_current > 0) {
    const nextHours = Math.ceil((data.hours_current + 1) / 250) * 250
    await supabase.from('machines').update({ next_service_due_hours: nextHours }).eq('id', data.id)
  }

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabaseServiceClient()
  const raw = await req.json()
  const { id } = raw

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const updates = Object.fromEntries(UPDATE_FIELDS.filter(k => raw[k] !== undefined).map(k => [k, raw[k]]))

  if (updates.hours_current !== undefined) {
    const { data: machine } = await supabase.from('machines').select('next_service_due_hours').eq('id', id).single()
    if (!machine?.next_service_due_hours) {
      updates.next_service_due_hours = Math.ceil((Number(updates.hours_current) + 1) / 250) * 250
    }
  }

  const { data, error } = await supabase.from('machines').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function GET() {
  const supabase = getSupabaseServiceClient()
  const { data } = await supabase.from('machines').select('*').order('brand')
  return NextResponse.json(data || [])
}
