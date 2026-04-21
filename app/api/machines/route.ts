import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServiceClient()
  const body = await req.json()

  const { data, error } = await supabase.from('machines').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Auto-calculate next service
  if (data && data.hours_current > 0) {
    const nextHours = Math.ceil((data.hours_current + 1) / 250) * 250
    await supabase.from('machines').update({ next_service_due_hours: nextHours }).eq('id', data.id)
  }

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabaseServiceClient()
  const { id, ...updates } = await req.json()

  if (updates.hours_current !== undefined) {
    const currentHours = updates.hours_current
    const { data: machine } = await supabase.from('machines').select('next_service_due_hours').eq('id', id).single()
    if (!machine?.next_service_due_hours) {
      updates.next_service_due_hours = Math.ceil((currentHours + 1) / 250) * 250
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
