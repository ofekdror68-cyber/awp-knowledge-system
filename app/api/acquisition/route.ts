import { NextRequest, NextResponse } from 'next/server'
import { sbGet, SUPABASE_URL, SUPABASE_KEY } from '@/agents/shared'

export const maxDuration = 300

export async function GET() {
  const [pending, inProgress, completed, failed, manualRequired] = await Promise.all([
    sbGet('acquisition_queue', 'status=eq.pending&select=id,brand,model,category,category_name,created_at'),
    sbGet('acquisition_queue', 'status=eq.in_progress&select=id,brand,model,category,category_name,current_agent,updated_at'),
    sbGet('acquisition_queue', 'status=eq.completed&select=id,brand,model,category,category_name,saved_path,file_size_bytes,updated_at&order=updated_at.desc&limit=50'),
    sbGet('acquisition_queue', 'status=eq.failed&select=id,brand,model,category,category_name,retry_count,error_log&order=updated_at.desc&limit=50'),
    sbGet('acquisition_queue', 'status=eq.manual_required&select=id,brand,model,category,category_name,attempted_urls,error_log&order=updated_at.desc'),
  ])

  // Community knowledge count
  const ckRes = await fetch(`${SUPABASE_URL}/rest/v1/community_knowledge?select=id`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: 'count=exact', Range: '0-0' },
  })
  const ckCount = parseInt(ckRes.headers.get('content-range')?.split('/')[1] || '0')

  // Recent activity (last 30 events combined)
  const recent = [...(completed as object[]).slice(0, 15), ...(failed as object[]).slice(0, 15)]

  return NextResponse.json({
    stats: {
      pending: (pending as unknown[]).length,
      inProgress: (inProgress as unknown[]).length,
      completed: (completed as unknown[]).length,
      failed: (failed as unknown[]).length,
      manualRequired: (manualRequired as unknown[]).length,
      forumThreads: ckCount,
    },
    inProgress,
    manualRequired,
    recent,
    generatedAt: new Date().toISOString(),
  })
}

export async function POST(req: NextRequest) {
  const { action, batchSize, includeForums } = await req.json().catch(() => ({}))

  if (action === 'start') {
    // Trigger coordinator asynchronously
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    // Fire and forget — coordinator runs in background via cron route
    fetch(`${baseUrl}/api/cron/oem-recheck`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchSize: batchSize || 20, includeForums: includeForums ?? true }),
    }).catch(() => {})

    return NextResponse.json({ started: true, message: 'Acquisition cycle started in background' })
  }

  if (action === 'reset_failed') {
    // Reset failed items back to pending so they retry
    await fetch(`${SUPABASE_URL}/rest/v1/acquisition_queue?status=eq.failed`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ status: 'pending', current_agent: null }),
    })
    return NextResponse.json({ reset: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
