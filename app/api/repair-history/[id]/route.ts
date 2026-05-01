import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = getSupabaseServiceClient()
  const { id } = await params
  const body = await req.json()
  const { worked, actual_fix, technician_notes } = body

  const update: Record<string, unknown> = { resolved_at: new Date().toISOString() }
  if (worked !== undefined) update.worked = worked
  if (actual_fix !== undefined) update.actual_fix = actual_fix
  if (technician_notes !== undefined) update.technician_notes = technician_notes

  const { error } = await supabase.from('repair_history').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
