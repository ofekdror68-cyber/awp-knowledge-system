import { NextResponse } from 'next/server'
import { runAlerts } from '@/lib/predictive/alerts'

export const maxDuration = 60

export async function GET() {
  try {
    const result = await runAlerts()
    console.log('[CRON] Alerts completed:', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    console.error('[CRON] Alerts failed:', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
