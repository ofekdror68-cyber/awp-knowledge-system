#!/usr/bin/env node
'use strict'

const path = require('path')
const fs   = require('fs')

// ── Load ~/.amichai-env ────────────────────────────────────────────────────────
const ENV_FILE = path.join(process.env.HOME || '', '.amichai-env')
if (fs.existsSync(ENV_FILE)) {
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 0) continue
    const k = t.slice(0, i).trim(), v = t.slice(i + 1).trim()
    if (k && v) process.env[k] = v
  }
}

const BOT_TOKEN   = process.env.TELEGRAM_BOT_TOKEN       || ''
const ALLOWED_UID = process.env.TELEGRAM_ALLOWED_USER_ID || ''
const ANTH_KEY    = process.env.ANTHROPIC_API_KEY        || ''
const SUPA_URL    = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const SUPA_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''

if (!BOT_TOKEN || !ALLOWED_UID || !ANTH_KEY) {
  console.error('❌  חסרים credentials ב-~/.amichai-env')
  console.error('   חייב: TELEGRAM_BOT_TOKEN, TELEGRAM_ALLOWED_USER_ID, ANTHROPIC_API_KEY')
  process.exit(1)
}

// ── Telegram ───────────────────────────────────────────────────────────────────
const TG = `https://api.telegram.org/bot${BOT_TOKEN}`

async function tg(method, body = {}) {
  const r = await fetch(`${TG}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return r.json()
}

async function reply(chatId, text) {
  // חתוך להודעות של 4000 תווים כל אחת
  for (let i = 0; i < text.length; i += 4000) {
    await tg('sendMessage', { chat_id: chatId, text: text.slice(i, i + 4000) })
  }
}

async function typing(chatId) {
  await tg('sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => {})
}

// ── Supabase ───────────────────────────────────────────────────────────────────
const SH = SUPA_URL && SUPA_KEY
  ? { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` }
  : null

async function db(table, qs = '') {
  if (!SH) return []
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?${qs}`, { headers: SH })
    return r.ok ? r.json() : []
  } catch { return [] }
}

// ── הבאת קונטקסט חכמה מ-Supabase ──────────────────────────────────────────────
async function getContext(message) {
  const m = message.toLowerCase()
  const parts = []

  // צי מכונות — אם שואל על מצב, מכונות, ציוד, פרויקטים
  if (/מכונ|ציוד|צי|fleet|פרוי|מצב|units?|מה יש/.test(m)) {
    const fleet = await db('fleet_machines', 'select=brand,model,status,hours_current,location&order=brand&limit=30')
    if (fleet.length) {
      const lines = fleet.map(f =>
        `• ${f.brand} ${f.model}` +
        (f.status    ? ` — ${f.status}`          : '') +
        (f.hours_current ? `, ${f.hours_current} ש'` : '') +
        (f.location  ? ` (${f.location})`        : '')
      )
      parts.push(`צי (${fleet.length} יחידות):\n${lines.join('\n')}`)
    }
  }

  // לידים / לקוחות
  if (/ליד|לקוח|מכיר|sales|leads?|קשר/.test(m)) {
    const leads = await db('leads', 'select=name,phone,category,score&order=score.desc&limit=10')
    if (leads.length) {
      const lines = leads.map(l => `• ${l.name} — ${l.category}, ציון ${l.score}`)
      parts.push(`לידים מובילים:\n${lines.join('\n')}`)
    }
  }

  // תיקונים / תקלות
  if (/תיקון|תקל|fault|error|קוד|בעי/.test(m)) {
    const repairs = await db('repair_history', 'select=symptom,actual_fix,machine_model&worked=eq.true&order=created_at.desc&limit=5')
    if (repairs.length) {
      const lines = repairs.map(r => `• ${r.machine_model || '?'}: "${(r.symptom || '').slice(0, 60)}" → "${(r.actual_fix || '').slice(0, 80)}"`)
      parts.push(`תיקונים אחרונים:\n${lines.join('\n')}`)
    }
    const code = message.match(/\b\d{3,5}\b/)
    if (code) {
      const fi = await db('fault_intelligence', `fault_code=eq.${code[0]}&limit=1`)
      if (fi.length) parts.push(`קוד ${code[0]}: ${fi[0].fault_description || ''}\nסיבות: ${JSON.stringify(fi[0].possible_causes || '')}`)
    }
  }

  return parts.join('\n\n')
}

// ── Claude AI ──────────────────────────────────────────────────────────────────
const SYSTEM = `אתה עמיחי, העוזר האישי של אופק — בעל חברת עבודות בגובה (AWP) בישראל.
יש לך גישה לנתוני הצי, הלידים, והתיקונים שלו.

כללים:
- תשובות קצרות. 3-5 שורות מקסימום. כמו וואטסאפ, לא מאמר.
- ענה ישירות על מה שנשאל. אל תסביר תהליכים.
- אם יש נתונים מהמאגר — השתמש בהם. אם אין — אמור.
- עברית יומיומית. לא פורמלי.
- לעולם אל תגיד: "שלח פקודה", "bot", "API", "listener", "פרוטוקול".
- אתה עמיחי. שותף עסקי. ישיר. חכם.`

const history = new Map() // uid → messages[]

function getHistory(uid) {
  if (!history.has(uid)) history.set(uid, [])
  return history.get(uid)
}

async function ask(uid, userMsg, context) {
  const hist = getHistory(uid)
  hist.push({ role: 'user', content: userMsg })
  if (hist.length > 24) hist.splice(0, 2)

  const system = context ? `${SYSTEM}\n\n--- נתונים ---\n${context}\n---` : SYSTEM

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTH_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system,
      messages: hist.slice(-12),
    }),
  })

  const data = await r.json()
  if (!r.ok) throw new Error(data.error?.message || 'AI error')

  const answer = data.content?.[0]?.text || '(אין תשובה)'
  hist.push({ role: 'assistant', content: answer })
  return answer
}

// ── Polling loop ───────────────────────────────────────────────────────────────
async function main() {
  const me = await tg('getMe')
  if (!me.ok) {
    console.error(`❌  טוקן לא תקין: ${me.description}`)
    process.exit(1)
  }
  console.log(`✅  עמיחי רץ: @${me.result.username}`)
  console.log(`👤  מורשה: ${ALLOWED_UID}`)

  // נקה webhook אם קיים
  await tg('deleteWebhook', { drop_pending_updates: false }).catch(() => {})

  let offset = 0

  for (;;) {
    let upd
    try {
      upd = await tg('getUpdates', { offset, timeout: 30, limit: 10, allowed_updates: ['message'] })
    } catch (e) {
      console.error('poll error:', e.message)
      await sleep(5000)
      continue
    }

    if (!upd.ok) {
      console.error('getUpdates failed:', upd.description)
      await sleep(5000)
      continue
    }

    for (const u of upd.result) {
      offset = u.update_id + 1
      const msg = u.message
      if (!msg?.text) continue

      const uid    = String(msg.from.id)
      const chatId = msg.chat.id
      const text   = msg.text.trim()

      if (uid !== String(ALLOWED_UID)) continue // שקט — לא מורשה

      console.log(`[${new Date().toLocaleTimeString('he-IL')}] ${text.slice(0, 80)}`)

      // /reset בלבד — הפוקדה היחידה
      if (text === '/reset' || text === '/start') {
        getHistory(uid).length = 0
        await reply(chatId, text === '/start'
          ? 'היי אופק 👋 עמיחי כאן. מה קורה?'
          : '🔄 מתחיל שיחה חדשה.')
        continue
      }

      await typing(chatId)

      try {
        const context = await getContext(text)
        const answer  = await ask(uid, text, context)
        await reply(chatId, answer)
      } catch (e) {
        console.error('error:', e.message)
        await reply(chatId, 'יש תקלה זמנית, נסה שוב.')
      }
    }
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

main().catch(e => { console.error('Fatal:', e); process.exit(1) })
