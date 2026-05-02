import { NextResponse } from 'next/server'
import { runPatternLearner } from '@/lib/predictive/pattern_learner'

export const maxDuration = 300

export async function GET() {
  try {
    const result = await runPatternLearner()
    console.log('[CRON] Pattern learner completed:', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    console.error('[CRON] Pattern learner failed:', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
