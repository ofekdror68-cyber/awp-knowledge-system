import { NextResponse } from 'next/server'
import { getProgressStats } from '@/lib/processing/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const stats = await getProgressStats()
  return NextResponse.json(stats)
}
