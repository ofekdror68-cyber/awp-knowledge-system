import { getSupabaseServiceClient } from '@/lib/supabase/server'
import { sendTelegramMessage } from '@/lib/telegram/client'

// ── timezone helpers ────────────────────────────────────────────────────────

interface JerusalemParts {
  year: number; month: number; day: number
  hour: number; minute: number
}

function toJerusalem(utc: Date): JerusalemParts {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
  const parts = Object.fromEntries(f.formatToParts(utc).map(p => [p.type, p.value]))
  return {
    year:   parseInt(parts.year),
    month:  parseInt(parts.month),
    day:    parseInt(parts.day),
    hour:   parseInt(parts.hour) % 24,  // handle "24:xx" edge
    minute: parseInt(parts.minute),
  }
}

/**
 * Returns the UTC timestamp of the 13:20 Jerusalem that started the current
 * daily window. The window starts at 13:20 and runs until next day 13:20.
 */
export function getWindowStartUtc(now?: Date): Date {
  const utcNow = now ?? new Date()
  const jNow = toJerusalem(utcNow)
  const jMins = jNow.hour * 60 + jNow.minute
  const cutoff = 13 * 60 + 20 // 13:20

  // Determine the calendar date (in Jerusalem) on which this window's 13:20 falls
  let wYear = jNow.year, wMonth = jNow.month, wDay = jNow.day
  if (jMins < cutoff) {
    // Before 13:20 today → window started yesterday
    const d = new Date(Date.UTC(wYear, wMonth - 1, wDay - 1))
    wYear = d.getUTCFullYear(); wMonth = d.getUTCMonth() + 1; wDay = d.getUTCDate()
  }

  // Find the UTC instant that equals 13:20 Jerusalem on wYear-wMonth-wDay.
  // Try UTC+3 (DST) and UTC+2 (standard) and pick the one that round-trips.
  for (const offsetH of [3, 2]) {
    const candidate = new Date(Date.UTC(wYear, wMonth - 1, wDay, 13 - offsetH, 20, 0, 0))
    const jCheck = toJerusalem(candidate)
    if (jCheck.hour === 13 && jCheck.minute === 20 &&
        jCheck.day === wDay && jCheck.month === wMonth) {
      return candidate
    }
  }
  // Fallback: assume UTC+2
  return new Date(Date.UTC(wYear, wMonth - 1, wDay, 11, 20, 0, 0))
}

function formatJerusalemTime(utc: Date): string {
  const j = toJerusalem(utc)
  return `${String(j.hour).padStart(2, '0')}:${String(j.minute).padStart(2, '0')}`
}

function formatJerusalemDate(utc: Date): string {
  const j = toJerusalem(utc)
  return `${String(j.day).padStart(2, '0')}/${String(j.month).padStart(2, '0')}/${j.year}`
}

// ── agent display ────────────────────────────────────────────────────────────

const AGENT_HE: Record<string, string> = { midan: 'מידן', shai: 'שי', meir: 'מאיר' }

// ── core operations ─────────────────────────────────────────────────────────

export interface MissedCallRecord {
  call_id: string
  phone_number: string
  called_at: string
  missed_reason: 'no_dtmf' | 'no_agent'
}

/** Persist a new missed call. Returns true if inserted, false if duplicate. */
export async function recordMissedCall(rec: MissedCallRecord): Promise<boolean> {
  const supabase = getSupabaseServiceClient()
  const windowStart = getWindowStartUtc(new Date(rec.called_at))

  const { error } = await supabase.from('missed_calls').insert({
    call_id:     rec.call_id,
    phone_number: rec.phone_number,
    called_at:   rec.called_at,
    missed_reason: rec.missed_reason,
    window_start: windowStart.toISOString(),
    status: 'open',
    notified_immediately: false,
  })

  if (error) {
    if (error.code === '23505') return false  // duplicate call_id
    throw error
  }
  return true
}

/** Send an immediate Telegram alert for a single missed call. */
export async function sendImmediateAlert(rec: MissedCallRecord): Promise<void> {
  const supabase = getSupabaseServiceClient()
  const calledAt = new Date(rec.called_at)
  const timeStr  = formatJerusalemTime(calledAt)
  const reasonHe = rec.missed_reason === 'no_dtmf'
    ? 'הגיע ל-IVR ללא לחיצת DTMF'
    : 'DTMF הוקש אך לא הגיע לסוכן'

  const text = [
    '📞 <b>שיחה שלא נענתה</b>',
    `📱 מספר: ${rec.phone_number}`,
    `⏰ שעה: ${timeStr}`,
    `❌ סיבה: ${reasonHe}`,
  ].join('\n')

  await sendTelegramMessage(text)

  // Mark as notified
  await supabase.from('missed_calls')
    .update({ notified_immediately: true })
    .eq('call_id', rec.call_id)
}

/**
 * Mark the most recent open missed call from phone_number as called back.
 * Called when the phone system reports an outgoing call to a known caller.
 */
export async function markCallbackMade(
  phoneNumber: string,
  agentName: string,
  callbackAt: Date,
): Promise<boolean> {
  const supabase = getSupabaseServiceClient()

  // Find the oldest open missed call for this number
  const { data, error } = await supabase
    .from('missed_calls')
    .select('id')
    .eq('phone_number', phoneNumber)
    .eq('status', 'open')
    .order('called_at', { ascending: true })
    .limit(1)
    .single()

  if (error || !data) return false

  const agentKey = agentName.toLowerCase()
  const validAgent = ['midan', 'shai', 'meir'].includes(agentKey) ? agentKey : null

  await supabase.from('missed_calls')
    .update({
      status:      'closed',
      callback_at: callbackAt.toISOString(),
      callback_by: validAgent,
    })
    .eq('id', data.id)

  return true
}

// ── summary builders ────────────────────────────────────────────────────────

interface WindowStats {
  total: number
  open: Array<{ phone_number: string; called_at: string }>
  closedByAgent: Record<string, number>
}

async function fetchWindowStats(windowStart: Date, windowEnd?: Date): Promise<WindowStats> {
  const supabase = getSupabaseServiceClient()

  let q = supabase
    .from('missed_calls')
    .select('phone_number, called_at, status, callback_by')
    .gte('window_start', windowStart.toISOString())

  if (windowEnd) {
    q = q.lt('window_start', windowEnd.toISOString())
  }

  const { data } = await q
  const rows = data ?? []

  const closedByAgent: Record<string, number> = { midan: 0, shai: 0, meir: 0 }
  const open: Array<{ phone_number: string; called_at: string }> = []

  for (const r of rows) {
    if (r.status === 'open') {
      open.push({ phone_number: r.phone_number, called_at: r.called_at })
    } else if (r.callback_by && closedByAgent[r.callback_by] !== undefined) {
      closedByAgent[r.callback_by]++
    }
  }

  return { total: rows.length, open, closedByAgent }
}

function agentLine(counts: Record<string, number>): string {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const detail = Object.entries(counts)
    .map(([k, v]) => `${AGENT_HE[k] ?? k}: ${v}`)
    .join(', ')
  return `✅ חזרו: ${total} (${detail})`
}

async function isDuplicateRun(key: string): Promise<boolean> {
  const supabase = getSupabaseServiceClient()
  const { data } = await supabase.from('cron_runs').select('run_key').eq('run_key', key).maybeSingle()
  return !!data
}

async function markRunDone(key: string): Promise<void> {
  const supabase = getSupabaseServiceClient()
  await supabase.from('cron_runs').upsert({ run_key: key, ran_at: new Date().toISOString() })
}

// ── public summary entry points ─────────────────────────────────────────────

/** Hourly summary — runs at every full Jerusalem hour. */
export async function sendHourlySummary(now?: Date): Promise<{ sent: boolean; reason?: string }> {
  const utcNow = now ?? new Date()
  const j = toJerusalem(utcNow)
  const runKey = `calls_hourly_${j.year}-${String(j.month).padStart(2,'0')}-${String(j.day).padStart(2,'0')}_${String(j.hour).padStart(2,'0')}`

  if (await isDuplicateRun(runKey)) return { sent: false, reason: 'duplicate' }

  const windowStart = getWindowStartUtc(utcNow)
  const stats = await fetchWindowStats(windowStart)

  const hourStr = `${String(j.hour).padStart(2,'0')}:00`
  const lines = [
    `📊 <b>סיכום שיחות ${hourStr}</b>`,
    '━━━━━━━━━━━━━━━━━━',
    `📵 לא נענו סה"כ: ${stats.total}`,
    agentLine(stats.closedByAgent),
    `🔴 פתוחים: ${stats.open.length}`,
  ]

  if (stats.open.length > 0) {
    lines.push('')
    lines.push('מספרים פתוחים:')
    for (const c of stats.open) {
      const t = formatJerusalemTime(new Date(c.called_at))
      lines.push(`• ${c.phone_number} (מ-${t})`)
    }
  }

  await sendTelegramMessage(lines.join('\n'))
  await markRunDone(runKey)
  return { sent: true }
}

/** Daily summary at 13:20 — shows previous window, then resets. */
export async function sendDailySummary(now?: Date): Promise<{ sent: boolean; reason?: string }> {
  const utcNow = now ?? new Date()
  const j = toJerusalem(utcNow)
  const runKey = `calls_daily_${j.year}-${String(j.month).padStart(2,'0')}-${String(j.day).padStart(2,'0')}`

  if (await isDuplicateRun(runKey)) return { sent: false, reason: 'duplicate' }

  // At 13:20, the window transitions — show the window that JUST closed.
  // "Just closed" = the window that started at 13:20 yesterday.
  const closedWindowStart = (() => {
    // Go back 1 day's worth from now to land in yesterday's window
    const yesterday = new Date(utcNow.getTime() - 24 * 60 * 60 * 1000)
    return getWindowStartUtc(yesterday)
  })()
  const currentWindowStart = getWindowStartUtc(utcNow)

  const stats = await fetchWindowStats(closedWindowStart, currentWindowStart)

  const dateStr = formatJerusalemDate(utcNow)
  const fromDate = formatJerusalemDate(closedWindowStart)
  const totalClosed = Object.values(stats.closedByAgent).reduce((a, b) => a + b, 0)

  const lines = [
    `📋 <b>סיכום יומי — ${dateStr}</b>`,
    '━━━━━━━━━━━━━━━━━━━━━━━━━',
    `חלון: ${fromDate} 13:20 → ${dateStr} 13:20`,
    '',
    `📵 סה"כ לא נענו: ${stats.total}`,
    `✅ חזרו: ${totalClosed}`,
    `  • מידן: ${stats.closedByAgent.midan}`,
    `  • שי: ${stats.closedByAgent.shai}`,
    `  • מאיר: ${stats.closedByAgent.meir}`,
    `🔴 עדיין פתוחים: ${stats.open.length}`,
  ]

  if (stats.open.length > 0) {
    lines.push('')
    lines.push('מספרים פתוחים:')
    for (const c of stats.open) {
      const d = formatJerusalemDate(new Date(c.called_at))
      const t = formatJerusalemTime(new Date(c.called_at))
      lines.push(`• ${c.phone_number} (מ-${d} ${t})`)
    }
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━')
  lines.push('♻️ מאפס חלון יומי — חלון חדש מתחיל')

  await sendTelegramMessage(lines.join('\n'))
  await markRunDone(runKey)
  return { sent: true }
}

/** Morning summary at 07:00 — shows night window (13:20 yesterday → 07:00 now). */
export async function sendMorningSummary(now?: Date): Promise<{ sent: boolean; reason?: string }> {
  const utcNow = now ?? new Date()
  const j = toJerusalem(utcNow)
  const runKey = `calls_morning_${j.year}-${String(j.month).padStart(2,'0')}-${String(j.day).padStart(2,'0')}`

  if (await isDuplicateRun(runKey)) return { sent: false, reason: 'duplicate' }

  const windowStart = getWindowStartUtc(utcNow)  // still yesterday's 13:20 (it's 07:00)
  const stats = await fetchWindowStats(windowStart)

  const dateStr = formatJerusalemDate(utcNow)
  const fromDate = formatJerusalemDate(windowStart)
  const totalClosed = Object.values(stats.closedByAgent).reduce((a, b) => a + b, 0)

  const lines = [
    `🌅 <b>סיכום לילה — ${dateStr} 07:00</b>`,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    `חלון: ${fromDate} 13:20 → ${dateStr} 07:00`,
    '',
    `📵 שיחות לא נענו בלילה: ${stats.total}`,
    `✅ חזרו: ${totalClosed}`,
    `🔴 ממתינים לחזרה: ${stats.open.length}`,
  ]

  if (stats.open.length > 0) {
    lines.push('')
    lines.push('מספרים ממתינים:')
    for (const c of stats.open) {
      const d = formatJerusalemDate(new Date(c.called_at))
      const t = formatJerusalemTime(new Date(c.called_at))
      lines.push(`• ${c.phone_number} (מ-${d} ${t})`)
    }
  }

  await sendTelegramMessage(lines.join('\n'))
  await markRunDone(runKey)
  return { sent: true }
}
