import { NextRequest, NextResponse } from 'next/server'
import { sendDailySummary } from '@/lib/calls/missed-calls'
import { toJerusalemHour } from '@/lib/calls/tz-utils'

export const maxDuration = 30

// Scheduled at both 10:20 UTC (summer, UTC+3) and 11:20 UTC (winter, UTC+2).
// The code guards against running outside the 13:10–13:35 Jerusalem window to
// avoid double-sending when both cron triggers fire on a DST transition day.
export async function GET(req: NextRequest) {
  const now = new Date()
  const { hour, minute } = toJerusalemHour(now)
  const jMins = hour * 60 + minute
  const inWindow = jMins >= 13 * 60 + 10 && jMins <= 13 * 60 + 35

  if (!inWindow) {
    return NextResponse.json({ ok: true, skipped: `Jerusalem time is ${hour}:${String(minute).padStart(2,'0')}` })
  }

  try {
    const result = await sendDailySummary(now)
    console.log('[CRON] calls-daily:', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    console.error('[CRON] calls-daily failed:', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
