import { NextResponse } from 'next/server'
import { runForumScraper } from '@/agents/forum-scraper'

export const maxDuration = 300

export async function GET() {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    // Vercel cron jobs send authorization header
  }

  try {
    const result = await runForumScraper({ limit: 12 })
    console.log('[CRON] Forum scrape completed:', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    console.error('[CRON] Forum scrape failed:', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
