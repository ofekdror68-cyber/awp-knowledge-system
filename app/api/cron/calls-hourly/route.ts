import { NextResponse } from 'next/server'
import { sendHourlySummary } from '@/lib/calls/missed-calls'

export const maxDuration = 30

export async function GET() {
  try {
    const result = await sendHourlySummary()
    console.log('[CRON] calls-hourly:', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    console.error('[CRON] calls-hourly failed:', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
