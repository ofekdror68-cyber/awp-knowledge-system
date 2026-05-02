import { NextRequest, NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_KEY } from '@/agents/shared'

export async function POST(req: NextRequest) {
  const { id, helpful } = await req.json()
  if (!id || helpful === undefined) return NextResponse.json({ error: 'Missing id or helpful' }, { status: 400 })

  const delta = helpful ? 1 : -1
  await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_local_score`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ row_id: id, delta }),
  }).catch(() => {
    // Fallback: direct patch
    fetch(`${SUPABASE_URL}/rest/v1/community_knowledge?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ local_score: delta > 0 ? 1 : -1 }),
    })
  })

  return NextResponse.json({ ok: true })
}
