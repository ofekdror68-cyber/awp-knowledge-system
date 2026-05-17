#!/usr/bin/env node
/**
 * עמיחי — Telegram Bot Listener
 * Long-polling bot for AWP mechanic AI assistant (אופק גיזום)
 *
 * Reads credentials from ~/.amichai-env
 * Run:  node scripts/telegram-listener.js
 */

'use strict'

const path = require('path')
const fs   = require('fs')

// ── Load ~/.amichai-env ────────────────────────────────────────────────────────
const ENV_FILE = path.join(process.env.HOME || process.env.USERPROFILE || '', '.amichai-env')

if (fs.existsSync(ENV_FILE)) {
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (key && val) process.env[key] = val
  }
} else {
  console.error(`❌  הקובץ ${ENV_FILE} לא נמצא.`)
  console.error('    הרץ: node scripts/setup-amichai-mac.sh')
  console.error('    ואז מלא את הפרטים — ראה הוראות למטה.')
  printSetupInstructions()
  process.exit(1)
}

function printSetupInstructions() {
  console.error(`
  ┌──────────────────────────────────────────────────────────────┐
  │         הוראות הגדרת ~/.amichai-env (עברית)                  │
  ├──────────────────────────────────────────────────────────────┤
  │                                                              │
  │  1. פתח Terminal וכתוב:                                      │
  │       open -a TextEdit ~/.amichai-env                        │
  │     (אם הקובץ לא קיים: touch ~/.amichai-env קודם)           │
  │                                                              │
  │  2. הכנס את השורות האלו — החלף את הערכים האמיתיים:          │
  │                                                              │
  │     TELEGRAM_BOT_TOKEN=123456789:AAxxxxxxxxxxxxxxxxxxxxxxx   │
  │     TELEGRAM_ALLOWED_USER_ID=987654321                       │
  │     ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxx    │
  │     NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co         │
  │     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxx  │
  │                                                              │
  │  3. שמור ← Cmd+S                                             │
  │                                                              │
  │  4. הרץ שוב: node scripts/telegram-listener.js              │
  │                                                              │
  │  איך לקבל TELEGRAM_BOT_TOKEN:                               │
  │    → שלח /token ל-@BotFather ב-Telegram                     │
  │                                                              │
  │  איך לקבל TELEGRAM_ALLOWED_USER_ID:                         │
  │    → שלח /start ל-@userinfobot ב-Telegram                   │
  └──────────────────────────────────────────────────────────────┘
`)
}

// ── Env validation ─────────────────────────────────────────────────────────────
const BOT_TOKEN   = process.env.TELEGRAM_BOT_TOKEN        || ''
const ALLOWED_UID = process.env.TELEGRAM_ALLOWED_USER_ID  || ''
const ANTH_KEY    = process.env.ANTHROPIC_API_KEY         || ''
const SUPA_URL    = process.env.NEXT_PUBLIC_SUPABASE_URL  || process.env.SUPABASE_URL || ''
const SUPA_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''

const PLACEHOLDERS = [
  'your_token_here', 'your_user_id_here', 'your_anthropic_key_here',
  'your_supabase_url_here', 'your_supabase_key_here'
]
function isPlaceholder(v) { return !v || PLACEHOLDERS.some(p => v.includes(p)) }

const missing = []
if (isPlaceholder(BOT_TOKEN))   missing.push('TELEGRAM_BOT_TOKEN')
if (isPlaceholder(ALLOWED_UID)) missing.push('TELEGRAM_ALLOWED_USER_ID')
if (isPlaceholder(ANTH_KEY))    missing.push('ANTHROPIC_API_KEY')

if (missing.length) {
  console.error(`\n❌  חסרים ערכים אמיתיים ב-${ENV_FILE}:\n   ${missing.join('\n   ')}\n`)
  printSetupInstructions()
  process.exit(1)
}

// ── Telegram helpers ───────────────────────────────────────────────────────────
const TG_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`

async function tg(method, params = {}) {
  const res = await fetch(`${TG_BASE}/${method}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(params),
  })
  return res.json()
}

async function sendMessage(chatId, text, extra = {}) {
  // Split if over Telegram's 4096 char limit
  const chunks = []
  for (let i = 0; i < text.length; i += 4000) chunks.push(text.slice(i, i + 4000))
  for (const chunk of chunks) {
    await tg('sendMessage', { chat_id: chatId, text: chunk, parse_mode: 'HTML', ...extra })
  }
}

async function sendTyping(chatId) {
  await tg('sendChatAction', { chat_id: chatId, action: 'typing' })
}

// ── Supabase helpers ───────────────────────────────────────────────────────────
const SUPA_H = SUPA_URL && SUPA_KEY
  ? { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' }
  : null

async function supaQ(path) {
  if (!SUPA_H) return []
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { headers: SUPA_H })
    return r.ok ? r.json() : []
  } catch { return [] }
}

// ── Knowledge context (mirrors app/api/chat/route.ts) ─────────────────────────
async function buildContext(message) {
  if (!SUPA_H) return ''
  const keyword = encodeURIComponent(message.slice(0, 30).trim())
  const parts   = []

  // Fault intelligence by code
  const codeMatch = message.match(/\b([0-9]{3,5})\b/)
  if (codeMatch) {
    const fi = await supaQ(`fault_intelligence?fault_code=eq.${codeMatch[1]}&limit=2`)
    if (fi.length) parts.push(`=== בנק תקלות ===\n${JSON.stringify(fi[0], null, 2)}`)
  }

  // Recent repairs
  const repairs = await supaQ(`repair_history?symptom=ilike.*${keyword}*&worked=eq.true&actual_fix=not.is.null&limit=3&order=created_at.desc`)
  if (repairs.length) parts.push(`=== תיקונים קודמים ===\n${repairs.map(r => `"${r.symptom.slice(0, 100)}" → "${(r.actual_fix || '').slice(0, 200)}"`).join('\n')}`)

  // Community knowledge
  const comm = await supaQ(`community_knowledge?quality=gte.3&limit=3`)
  if (comm.length) parts.push(`=== ידע קהילה ===\n${comm.map(c => `[${c.source_name || 'Forum'}] ${c.solution.slice(0, 400)}`).join('\n---\n')}`)

  return parts.join('\n\n')
}

// ── AI (Anthropic) ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `אתה עמיחי — מכונאי מומחה בבמות הרמה (AWP) עם 30 שנות ניסיון על JLG, Genie, JCPT, BT, Manitou, Dingli.
אתה עוזר לאופק גיזום לאבחן תקלות, למצוא מפרטים ולהדריך בתיקונים.

חוקים:
1. תן 2-4 חשודים מדורגים עם הסתברויות — אף פעם לא תשובה אחת.
2. המלץ על הבדיקה הזולה והמהירה קודם.
3. שאל שאלה מבהירה אחת אם זה משנה את האבחנה.
4. עברית של מנהל מוסך, לא ספר לימוד.
5. סיים ב: "אחרי שתבדוק — תגיד לי מה ראית, נמשיך מכאן."`

// Per-user conversation history (in-memory)
const histories = new Map()

function getHistory(uid) {
  if (!histories.has(uid)) histories.set(uid, [])
  return histories.get(uid)
}

async function askAmichai(uid, userMessage) {
  const history = getHistory(uid)
  history.push({ role: 'user', content: userMessage })
  if (history.length > 20) history.splice(0, 2)  // keep last 10 pairs

  const context = await buildContext(userMessage)
  const system  = context ? `${SYSTEM_PROMPT}\n\n--- הקשר מהמאגר ---\n${context}\n--- סוף הקשר ---` : SYSTEM_PROMPT

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method:  'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         ANTH_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system,
      messages:   history.slice(-10),
    }),
  })

  const data   = await res.json()
  const answer = data.content?.[0]?.text || 'שגיאה בקבלת תשובה מ-AI'
  history.push({ role: 'assistant', content: answer })
  return answer
}

// ── Command handlers ───────────────────────────────────────────────────────────
async function handleCommand(cmd, uid, chatId) {
  switch (cmd) {
    case '/start':
      await sendMessage(chatId, '✅ <b>עמיחי מחובר ועובד!</b>\n\nשלח לי שאלה על תקלה, מפרט, או הליך תיקון בבמות הרמה.\n\n<i>דוגמאות:</i>\n• "JLG 450AJ לא עולה — קוד 4069"\n• "מה לחץ הידראולי תקני ב-Genie S-60?"\n• "תהליך בדיקת סוללות Dingli"')
      break
    case '/help':
      await sendMessage(chatId, `<b>עמיחי — עוזר טכני AWP</b>\n\n/start — הודעת פתיחה\n/reset — אפס שיחה\n/help  — עזרה זו\n\nשלח שאלה חופשית — אאבחן לפי המידע במאגר.`)
      break
    case '/reset':
      getHistory(uid).length = 0
      await sendMessage(chatId, '🔄 שיחה אופסה — שאלה חדשה?')
      break
    default:
      await sendMessage(chatId, `❓ פקודה לא מוכרת: <code>${cmd}</code>\nשלח /help לרשימת הפקודות.`)
  }
}

// ── Main polling loop ──────────────────────────────────────────────────────────
async function main() {
  // Validate token via getMe
  const me = await tg('getMe')
  if (!me.ok) {
    console.error(`❌  הטוקן לא תקין: ${me.description}`)
    console.error('    בדוק את TELEGRAM_BOT_TOKEN ב-~/.amichai-env')
    process.exit(1)
  }
  console.log(`✅  עמיחי מחובר: @${me.result.username} (id: ${me.result.id})`)
  console.log(`👤  מורשה: user_id ${ALLOWED_UID}`)
  console.log('🔄  מאזין להודעות נכנסות...')

  let offset = 0

  while (true) {
    try {
      const upd = await tg('getUpdates', { offset, timeout: 30, limit: 10, allowed_updates: ['message'] })

      if (!upd.ok) {
        if (upd.error_code === 409) {
          console.error('⚠️  קונפליקט: webhook קיים. מנסה לנקות...')
          await tg('deleteWebhook', { drop_pending_updates: false })
          await new Promise(r => setTimeout(r, 3000))
          continue
        }
        console.error(`⚠️  getUpdates נכשל: ${upd.description}`)
        await new Promise(r => setTimeout(r, 5000))
        continue
      }

      for (const update of upd.result) {
        offset = update.update_id + 1

        const msg = update.message
        if (!msg?.text) continue

        const uid    = String(msg.from.id)
        const chatId = msg.chat.id
        const text   = msg.text.trim()

        if (uid !== String(ALLOWED_UID)) {
          console.log(`⛔  הודעה מ-${uid} (${msg.from.username || 'unknown'}) — לא מורשה`)
          continue
        }

        const ts = new Date().toLocaleTimeString('he-IL')
        console.log(`📩  [${ts}] ${text.slice(0, 100)}`)

        if (text.startsWith('/')) {
          await handleCommand(text.split(' ')[0], uid, chatId)
          continue
        }

        await sendTyping(chatId)
        try {
          const answer = await askAmichai(uid, text)
          await sendMessage(chatId, answer)
        } catch (err) {
          console.error('❌  שגיאת AI:', err.message)
          await sendMessage(chatId, '❌ שגיאה זמנית בחיבור ל-AI. נסה שוב עוד רגע.')
        }
      }
    } catch (err) {
      console.error(`❌  שגיאת polling: ${err.message}`)
      await new Promise(r => setTimeout(r, 5000))
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
