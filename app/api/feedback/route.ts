import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServiceClient()
  const { how_was_solved, worked, context } = await req.json()

  // Store feedback
  const { data: feedbackData } = await supabase.from('fault_feedback').insert({
    how_was_solved,
    worked,
    original_symptoms: context?.substring(0, 500),
  }).select().single()

  // If it worked, also store as a fault solution
  if (worked && how_was_solved) {
    // Check if similar fault exists
    const { data: existing } = await supabase
      .from('faults')
      .select('id, times_used')
      .ilike('symptoms', `%${context?.substring(0, 40) || how_was_solved.substring(0, 40)}%`)
      .limit(1)
      .single()

    if (existing) {
      const timesUsed = (existing.times_used || 0) + 1
      await supabase.from('faults').update({
        solution: how_was_solved,
        source: 'learned',
        times_used: timesUsed,
        verified: timesUsed >= 3,
      }).eq('id', existing.id)
    } else {
      await supabase.from('faults').insert({
        symptoms: context?.substring(0, 500) || how_was_solved.substring(0, 200),
        solution: how_was_solved,
        source: 'learned',
        times_used: 1,
      })
    }
  }

  return NextResponse.json({ ok: true })
}
