import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const H = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json' }

async function q<T>(path: string): Promise<T[]> {
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/${path}`, { headers: H })
    return r.ok ? r.json() : []
  } catch { return [] }
}

interface Intent {
  intent: 'diagnose_fault' | 'lookup_spec' | 'find_procedure' | 'identify_part' | 'general_question'
  brand: string | null
  model: string | null
  fault_code: string | null
  system: string | null
  symptoms: string[]
  needs_visual: boolean
}

async function classifyIntent(message: string, history: Array<{ role: string; content: string }>): Promise<Intent> {
  const recent = history.slice(-3).map(h => `${h.role}: ${h.content.substring(0, 100)}`).join('\n')
  try {
    const resp = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Classify this AWP technician question. Return JSON only:
{"intent":"diagnose_fault"|"lookup_spec"|"find_procedure"|"identify_part"|"general_question","brand":"<JLG|Genie|Dingli|Manitou|null>","model":"<model or null>","fault_code":"<code or null>","system":"hydraulic"|"electrical"|"drive"|"battery"|"engine"|"control"|"safety"|null,"symptoms":["<phrases>"],"needs_visual":true|false}
Context: ${recent}
Question: ${message}`,
      }],
    })
    const text = resp.content[0].type === 'text' ? resp.content[0].text : '{}'
    const m = text.match(/\{[\s\S]*\}/)
    return m ? JSON.parse(m[0]) : defaultIntent()
  } catch { return defaultIntent() }
}

function defaultIntent(): Intent {
  return { intent: 'general_question', brand: null, model: null, fault_code: null, system: null, symptoms: [], needs_visual: false }
}

async function buildDiagnosticContext(intent: Intent): Promise<string> {
  const parts: string[] = []
  const mf = intent.model ? `&machine_model=eq.${encodeURIComponent(intent.model)}` : ''
  const bf = intent.brand ? `&machine_brand=eq.${encodeURIComponent(intent.brand)}` : ''
  const mf2 = intent.model ? `&model=eq.${encodeURIComponent(intent.model)}` : ''
  const bf2 = intent.brand ? `&brand=eq.${encodeURIComponent(intent.brand)}` : ''

  if (intent.fault_code) {
    const fi = await q<{ fault_code: string; fault_description: string; possible_causes: unknown; diagnostic_sequence: unknown; tribal_knowledge?: string; common_misdiagnosis?: string; safety_warnings?: string[] }>(
      `fault_intelligence?fault_code=eq.${encodeURIComponent(intent.fault_code)}${mf2}&limit=2`
    )
    if (fi.length) parts.push(`=== FAULT INTELLIGENCE ===\n${JSON.stringify(fi[0], null, 2)}`)
  }

  if (!intent.fault_code && intent.symptoms.length) {
    const sf = await q<{ fault_code: string; fault_description: string; possible_causes: unknown }>(
      `fault_intelligence?symptoms=cs.{"${encodeURIComponent(intent.symptoms[0].substring(0, 30))}"}${bf2}&limit=3`
    )
    if (sf.length) parts.push(`=== FAULT INTELLIGENCE (by symptom) ===\n${sf.map(f => JSON.stringify(f)).join('\n')}`)
  }

  if (intent.model || intent.brand) {
    const docIds = await q<{ id: string }>(`documents?select=id${mf}${bf}&limit=10`)
    if (docIds.length) {
      const ids = docIds.map(d => d.id).join(',')
      const fcf = intent.fault_code ? `&content=ilike.*${encodeURIComponent(intent.fault_code)}*` : ''
      const chunks = await q<{ content: string; chunk_type: string; title?: string }>(
        `doc_chunks?document_id=in.(${ids})${fcf}&importance_score=gte.6&limit=6&order=importance_score.desc`
      )
      if (chunks.length) parts.push(`=== RELEVANT CHUNKS FROM MANUALS ===\n${chunks.map(c => `[${c.chunk_type}${c.title ? ': ' + c.title : ''}]\n${c.content.substring(0, 600)}`).join('\n---\n')}`)
    }
  }

  const rmf = intent.model ? `machine_model=eq.${encodeURIComponent(intent.model)}&` : ''
  const rff = intent.fault_code ? `symptom=ilike.*${encodeURIComponent(intent.fault_code)}*&` : ''
  const repairs = await q<{ symptom: string; actual_fix: string; machine_model?: string }>(
    `repair_history?${rmf}${rff}worked=eq.true&actual_fix=not.is.null&limit=3&order=created_at.desc`
  )
  if (repairs.length) parts.push(`=== PAST REPAIRS AT THIS SHOP ===\n${repairs.map(r => `"${r.symptom.substring(0, 100)}" → "${(r.actual_fix || '').substring(0, 200)}"${r.machine_model ? ` (${r.machine_model})` : ''}`).join('\n')}`)

  const cff = intent.fault_code ? `fault_code=eq.${encodeURIComponent(intent.fault_code)}&` : ''
  const comm = await q<{ solution: string; source_name?: string }>(
    `community_knowledge?${cff}${intent.model ? `model=eq.${encodeURIComponent(intent.model)}&` : ''}quality=gte.3&limit=3`
  )
  if (comm.length) parts.push(`=== COMMUNITY KNOWLEDGE ===\n${comm.map(c => `[${c.source_name || 'Forum'}] ${c.solution.substring(0, 400)}`).join('\n---\n')}`)

  if (intent.needs_visual && (intent.model || intent.brand)) {
    const docIds2 = await q<{ id: string }>(`documents?select=id${mf}${bf}&limit=5`)
    if (docIds2.length) {
      const ids2 = docIds2.map(d => d.id).join(',')
      const sch = await q<{ visual_description: string; page_number: number; page_type: string }>(
        `doc_pages?document_id=in.(${ids2})&page_type=like.schematic_*&visual_description=not.is.null&limit=4`
      )
      if (sch.length) parts.push(`=== SCHEMATIC DESCRIPTIONS ===\n${sch.map(s => `[עמ' ${s.page_number} — ${s.page_type}]: ${s.visual_description}`).join('\n')}`)
    }
  }

  return parts.join('\n\n')
}

async function buildSpecContext(intent: Intent): Promise<string> {
  const mf2 = intent.model ? `&model=eq.${encodeURIComponent(intent.model)}` : ''
  const bf2 = intent.brand ? `&brand=eq.${encodeURIComponent(intent.brand)}` : ''
  const specs = await q<{ name: string; description?: string; attributes?: unknown }>(
    `kb_entities?entity_type=eq.spec${mf2}${bf2}&limit=10`
  )
  if (specs.length) return `=== SPECIFICATIONS ===\n${specs.map(s => `${s.name}: ${s.description || JSON.stringify(s.attributes)}`).join('\n')}`
  return buildGeneralContext(intent, 'spec מפרט')
}

async function buildProcedureContext(intent: Intent): Promise<string> {
  const mf = intent.model ? `&machine_model=eq.${encodeURIComponent(intent.model)}` : ''
  const bf = intent.brand ? `&machine_brand=eq.${encodeURIComponent(intent.brand)}` : ''
  const docIds = await q<{ id: string }>(`documents?select=id${mf}${bf}&limit=10`)
  if (!docIds.length) return ''
  const ids = docIds.map(d => d.id).join(',')
  const chunks = await q<{ content: string; title?: string }>(
    `doc_chunks?document_id=in.(${ids})&chunk_type=in.(procedure,warning)&limit=6&order=importance_score.desc`
  )
  if (!chunks.length) return ''
  return `=== PROCEDURES & WARNINGS ===\n${chunks.map(c => `${c.title ? '**' + c.title + '**\n' : ''}${c.content.substring(0, 800)}`).join('\n---\n')}`
}

async function buildGeneralContext(intent: Intent, message: string): Promise<string> {
  const keyword = encodeURIComponent(message.substring(0, 30).trim())
  const mf = intent.model ? `&machine_model=eq.${encodeURIComponent(intent.model)}` : ''
  const bf = intent.brand ? `&machine_brand=eq.${encodeURIComponent(intent.brand)}` : ''
  const docIds = await q<{ id: string }>(`documents?select=id${mf}${bf}&limit=15`)
  if (!docIds.length) return ''
  const ids = docIds.map(d => d.id).join(',')
  const chunks = await q<{ content: string; chunk_type: string; title?: string }>(
    `doc_chunks?document_id=in.(${ids})&content=ilike.*${keyword}*&limit=5&order=importance_score.desc`
  )
  if (!chunks.length) return ''
  return `=== RELEVANT CHUNKS ===\n${chunks.map(c => `[${c.chunk_type}${c.title ? ': ' + c.title : ''}]\n${c.content.substring(0, 600)}`).join('\n---\n')}`
}

async function legacyFallback(message: string, model: string | null, brand: string | null): Promise<string> {
  try {
    const mf = model ? `&machine_model=eq.${encodeURIComponent(model)}` : ''
    const bf = brand ? `&machine_brand=eq.${encodeURIComponent(brand)}` : ''
    const docs = await q<{ id: string; title: string }>(`documents?select=id,title${mf}${bf}&limit=8`)
    if (!docs.length) return ''
    const ids = docs.map(d => d.id).join(',')
    const chunks = await q<{ content: string }>(`document_chunks?document_id=in.(${ids})&limit=5`)
    if (!chunks.length) return ''
    return `=== מסמכים: ${docs.map(d => d.title).join(', ')} ===\n${chunks.map(c => c.content.substring(0, 600)).join('\n---\n')}`
  } catch { return '' }
}

const MASTER_MECHANIC = `אתה מכונאי במות הרמה בכיר עם 30 שנות ניסיון על JLG, Genie, JCPT, BT, Manitou, Dingli.
יש לך גישה למאגר ידע מובנה: מסמכי שירות רשמיים, סכמות, היסטוריית תיקונים מהמוסך הזה, ידע מפורומים, ובנק תקלות מאובחן מראש.

חוקים:
1. תן 2-4 חשודים מדורגים עם הסתברויות — אף פעם לא תשובה אחת.
2. המלץ על הבדיקה הזולה והמהירה קודם.
3. שאל שאלה מבהירה אחת אם זה משנה את האבחנה.
4. צטט מקור: "ראה עמ' X במדריך" / "לפי הפורום" / "ראיתי מקרה דומה אצלך".
5. התייחס לסכמות אם יש מידע עליהן.
6. עברית של מנהל מוסך, לא ספר לימוד.
7. סיים ב: "אחרי שתבדוק — תגיד לי מה ראית, נמשיך מכאן."

מבנה אבחון:
🔧 מה זה כנראה
• חשד #1 — X%
• חשד #2 — Y%
🧪 בדיקה ראשונה (הזולה)
📍 מקורות
❓ שאלה (אם רלוונטי)`

export async function POST(req: NextRequest) {
  try {
    const { message, image, history } = await req.json()
    const hasImage = !!(image?.base64)

    const intent = await classifyIntent(message || '', history || [])

    let context = ''
    if (intent.intent === 'diagnose_fault') context = await buildDiagnosticContext(intent)
    else if (intent.intent === 'lookup_spec') context = await buildSpecContext(intent)
    else if (intent.intent === 'find_procedure') context = await buildProcedureContext(intent)
    else context = await buildGeneralContext(intent, message || '')

    if (!context) context = await legacyFallback(message || '', intent.model, intent.brand)

    const systemPrompt = context
      ? `${MASTER_MECHANIC}\n\n--- הקשר מהמערכת ---\n${context}\n--- סוף הקשר ---`
      : MASTER_MECHANIC

    const msgs: Anthropic.MessageParam[] = [
      ...(history || []).slice(-6).map((h: { role: 'user' | 'assistant'; content: string }) => ({ role: h.role, content: h.content })),
    ]

    const userContent: Anthropic.ContentBlockParam[] = []
    if (hasImage) {
      userContent.push({ type: 'image', source: { type: 'base64', media_type: image.mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif', data: image.base64 } })
    }
    userContent.push({ type: 'text', text: message || 'נתח את התמונה — מה החלק הזה? מה ייתכן שלא בסדר?' })
    msgs.push({ role: 'user', content: userContent })

    const aiModel = hasImage || intent.intent === 'diagnose_fault' ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001'
    const response = await anthropic.messages.create({ model: aiModel, max_tokens: 1500, system: systemPrompt, messages: msgs })
    const answer = response.content[0].type === 'text' ? response.content[0].text : ''

    const sources = [
      context.includes('FAULT INTELLIGENCE') ? 'בנק תקלות' : '',
      context.includes('MANUALS') || context.includes('CHUNKS') ? 'מדריך שירות' : '',
      context.includes('PAST REPAIRS') ? 'תיקונים קודמים' : '',
      context.includes('COMMUNITY') ? 'פורומים' : '',
      context.includes('SCHEMATIC') ? 'סכמות' : '',
    ].filter(Boolean)

    if (message?.length > 15 && answer) {
      fetch(`${SUPA_URL}/rest/v1/faults`, {
        method: 'POST',
        headers: { ...H, Prefer: 'return=minimal' },
        body: JSON.stringify({ symptoms: message.substring(0, 500), solution: answer.substring(0, 1000), source: 'learned', machine_model: intent.model, machine_brand: intent.brand }),
      }).catch(() => {})
    }

    return NextResponse.json({ answer, sources, modelUsed: aiModel, intent: intent.intent })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'שגיאה לא ידועה'
    return NextResponse.json({ answer: `שגיאה: ${msg}. בדוק חיבור לאינטרנט ונסה שוב.` }, { status: 500 })
  }
}
