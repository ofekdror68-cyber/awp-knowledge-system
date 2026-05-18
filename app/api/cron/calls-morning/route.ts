import { NextRequest, NextResponse } from 'next/server'
import { sendMorningSummary } from '@/lib/calls/missed-calls'
import { toJerusalemHour } from '@/lib/calls/tz-utils'

export const maxDuration = 30

// Scheduled at both 04:00 UTC (summer, UTC+3) and 05:00 UTC (winter, UTC+2).
// Guard: only act if Jerusalem time is between 06:45 and 07:20.
export async function GET(req: NextRequest) {
  const now = new Date()
  const { hour, minute } = toJerusalemHour(now)
  const jMins = hour * 60 + minute
  const inWindow = jMins >= 6 * 60 + 45 && jMins <= 7 * 60 + 20

  if (!inWindow) {
    return NextResponse.json({ ok: true, skipped: `Jerusalem time is ${hour}:${String(minute).padStart(2,'0')}` })
  }

  try {
    const result = await sendMorningSummary(now)
    console.log('[CRON] calls-morning:', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    console.error('[CRON] calls-morning failed:', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
