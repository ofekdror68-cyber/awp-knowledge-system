import { NextRequest, NextResponse } from 'next/server'
import {
  recordMissedCall,
  sendImmediateAlert,
  markCallbackMade,
} from '@/lib/calls/missed-calls'

// Expected POST body shapes
// ────────────────────────────────────────────────────────────────────────────
// Inbound call ended:
//   { secret, call_id, event_type:"call_ended", caller_number, ivr_reached,
//     dtmf_pressed, reached_agent: null|"midan"|"shai"|"meir", timestamp }
//
// Outgoing call by agent:
//   { secret, call_id, event_type:"outgoing_call", caller_number,
//     agent:"midan"|"shai"|"meir", timestamp }
// ────────────────────────────────────────────────────────────────────────────

const IVR_EXT = '555256201'

function authorized(body: Record<string, unknown>): boolean {
  const secret = process.env.CALLS_WEBHOOK_SECRET
  if (!secret) return true                           // secret not configured → open (dev)
  return body.secret === secret
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }

  if (!authorized(body)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { event_type, call_id, caller_number, timestamp } = body as {
    event_type: string
    call_id: string
    caller_number: string
    timestamp: string
  }

  if (!call_id || !caller_number) {
    return NextResponse.json({ error: 'call_id and caller_number required' }, { status: 400 })
  }

  const calledAt = timestamp ? new Date(timestamp) : new Date()
  if (isNaN(calledAt.getTime())) {
    return NextResponse.json({ error: 'invalid timestamp' }, { status: 400 })
  }

  // ── inbound call ended ───────────────────────────────────────────────────
  if (event_type === 'call_ended') {
    const { ivr_reached, dtmf_pressed, reached_agent, called_number } = body as {
      ivr_reached: boolean
      dtmf_pressed: boolean
      reached_agent: string | null
      called_number?: string
    }

    // Only process calls that actually reached the IVR
    const hitIvr = ivr_reached || called_number === IVR_EXT
    if (!hitIvr) {
      return NextResponse.json({ ok: true, skipped: 'did not reach IVR' })
    }

    let missed_reason: 'no_dtmf' | 'no_agent' | null = null
    if (!dtmf_pressed) {
      missed_reason = 'no_dtmf'
    } else if (!reached_agent) {
      missed_reason = 'no_agent'
    }

    if (!missed_reason) {
      // Call was handled by an agent — no alert needed
      return NextResponse.json({ ok: true, skipped: 'handled by agent' })
    }

    const rec = {
      call_id,
      phone_number: caller_number,
      called_at: calledAt.toISOString(),
      missed_reason,
    }

    const inserted = await recordMissedCall(rec)

    if (inserted) {
      await sendImmediateAlert(rec)
    }

    return NextResponse.json({ ok: true, inserted, missed_reason })
  }

  // ── outgoing call by agent (callback) ────────────────────────────────────
  if (event_type === 'outgoing_call') {
    const { agent } = body as { agent: string }

    if (!agent) {
      return NextResponse.json({ error: 'agent field required for outgoing_call' }, { status: 400 })
    }

    const marked = await markCallbackMade(caller_number, agent.toLowerCase(), calledAt)
    return NextResponse.json({ ok: true, callback_recorded: marked })
  }

  return NextResponse.json({ error: `unknown event_type: ${event_type}` }, { status: 400 })
}
