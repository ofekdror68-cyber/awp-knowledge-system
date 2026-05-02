import { NextRequest, NextResponse } from 'next/server'
import { runCoordinator } from '@/agents/coordinator'

export const maxDuration = 300

export async function GET() {
  return run({ batchSize: 20, includeForums: false })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  return run({ batchSize: body.batchSize || 20, includeForums: body.includeForums ?? false })
}

async function run(opts: { batchSize: number; includeForums: boolean }) {
  try {
    const result = await runCoordinator({
      batchSize: opts.batchSize,
      includeForums: opts.includeForums,
    })
    console.log('[CRON] OEM recheck completed:', {
      completed: result.completed,
      failed: result.failed,
      manualRequired: result.manualRequired,
      coverage: `${result.coverageBefore}% → ${result.coverageAfter}%`,
    })
    return NextResponse.json({ ok: true, result })
  } catch (e) {
    console.error('[CRON] OEM recheck failed:', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
