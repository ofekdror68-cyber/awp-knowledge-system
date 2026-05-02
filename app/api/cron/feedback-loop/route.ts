import { NextResponse } from 'next/server'
import { processExpiredPredictions, getPredictionAccuracy } from '@/lib/predictive/feedback_loop'

export const maxDuration = 120

export async function GET() {
  try {
    const result = await processExpiredPredictions()
    const accuracy = await getPredictionAccuracy()
    console.log('[CRON] Feedback loop completed:', result)
    return NextResponse.json({ ok: true, ...result, accuracy })
  } catch (e) {
    console.error('[CRON] Feedback loop failed:', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
