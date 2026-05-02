import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = getSupabaseServiceClient()
  const { data, error } = await supabase
    .from('fleet_machines')
    .select('*')
    .order('brand')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServiceClient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('fleet_machines')
    .upsert(body, { onConflict: 'internal_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
