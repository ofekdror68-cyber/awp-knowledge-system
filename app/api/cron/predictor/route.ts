import { NextResponse } from 'next/server'
import { runPredictor } from '@/lib/predictive/predictor'

export const maxDuration = 300

export async function GET() {
  try {
    const result = await runPredictor()
    console.log('[CRON] Predictor completed:', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    console.error('[CRON] Predictor failed:', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
