import { NextRequest, NextResponse } from 'next/server'
import { runLayer } from '@/lib/processing/pipeline'
import { getProgressStats } from '@/lib/processing/db'

export const maxDuration = 290

export async function POST(req: NextRequest) {
  try {
    const { layer, batchSize = 3 } = await req.json()
    if (!layer || layer < 1 || layer > 7) {
      return NextResponse.json({ error: 'Invalid layer (1-7)' }, { status: 400 })
    }

    // Safety: pause if cost > $200
    const stats = await getProgressStats()
    if (stats.totalCostCents > 20000) {
      return NextResponse.json({
        error: 'Cost limit reached ($200). Review in /processing before continuing.',
        costDollars: stats.totalCostCents / 100,
      }, { status: 429 })
    }

    const result = await runLayer(layer, batchSize)
    const updatedStats = await getProgressStats()

    return NextResponse.json({ ...result, stats: updatedStats })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
