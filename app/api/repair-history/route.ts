import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServiceClient()
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '50')

  const { data, error } = await supabase
    .from('repair_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ repairs: data })
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabaseServiceClient()
  const { id, worked, actual_fix, technician_notes } = await req.json()

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabase.from('repair_history').update({
    worked,
    actual_fix,
    technician_notes,
    resolved_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
