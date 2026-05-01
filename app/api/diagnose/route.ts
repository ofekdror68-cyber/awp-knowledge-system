import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getModelDocs, getSchematicPages, getRepairHistory, getWebKnowledge } from '@/lib/doc-retrieval'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { action, model, system_category, symptom, clarifying_qa, session_id } = await req.json()

  if (action === 'questions') {
    // Generate clarifying questions
    const [docContext, repairContext] = await Promise.all([
      model ? getModelDocs(model) : Promise.resolve(''),
      getRepairHistory(model, symptom),
    ])

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: `אתה מכונאי במות הרמה בכיר. המטרה: לשאול שאלות ממוקדות שיעזרו לאבחן את התקלה.
חוקים:
- 3-5 שאלות בלבד
- כל שאלה חייבת לשנות את האבחון אם התשובה שונה
- שאלות סגורות (כן/לא) או עם אפשרויות ברורות — לא פתוחות
- עברית פשוטה, ללא מונחים טכניים מיותרים
- החזר JSON בלבד: {"questions": ["שאלה1", "שאלה2", ...]}`,
      messages: [{
        role: 'user',
        content: `דגם: ${model || 'לא ידוע'}
מערכת: ${system_category}
תסמין: ${symptom}
${repairContext ? `\nהיסטוריה: ${repairContext}` : ''}
${docContext ? `\nמסמכים: ${docContext.substring(0, 500)}` : ''}

צור שאלות מקדימות לאבחון.`,
      }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    try {
      const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()
      const parsed = JSON.parse(cleaned)
      return NextResponse.json({ questions: parsed.questions || [] })
    } catch {
      return NextResponse.json({ questions: [] })
    }
  }

  if (action === 'diagnose') {
    // Full diagnosis with ranked causes
    const [docContext, repairContext, webContext, schematicPages] = await Promise.all([
      model ? getModelDocs(model) : Promise.resolve(''),
      getRepairHistory(model, symptom),
      getWebKnowledge(symptom, model),
      getSchematicPages(model),
    ])

    const qaText = Array.isArray(clarifying_qa)
      ? clarifying_qa.map((qa: { q: string; a: string }) => `שאלה: ${qa.q}\nתשובה: ${qa.a}`).join('\n').substring(0, 600)
      : ''

    const contextBlocks = [
      docContext ? `## מסמכי ${model}:\n${docContext}` : '',
      repairContext,
      webContext,
      schematicPages.length ? `## סכמות זמינות:\n${schematicPages.map(p => `[${p.pageRef}]: ${p.description.substring(0, 200)}`).join('\n')}` : '',
    ].filter(Boolean).join('\n\n')

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: `אתה מכונאי במות הרמה בכיר עם 30 שנות ניסיון. אתה מסכם אבחון שלם.
החזר JSON בלבד עם המבנה הבא:
{
  "suspects": [
    {"rank": 1, "probability": 65, "cause": "תיאור קצר", "explanation": "הסבר טכני", "page_ref": "עמ' X במדריך Y או null"},
    {"rank": 2, "probability": 25, "cause": "תיאור קצר", "explanation": "הסבר טכני", "page_ref": null},
    {"rank": 3, "probability": 10, "cause": "תיאור קצר", "explanation": "הסבר טכני", "page_ref": null}
  ],
  "quick_test": "בדיקה אחת מהירה לפני שמפרקים — מה לבדוק ואיך",
  "decision_tree": "אם ראית X — זה כנראה Y. אם ראית Z — זה כנראה W.",
  "closing": "אחרי שתבדוק — תגיד לי מה ראית, נמשיך מכאן."
}`,
      messages: [{
        role: 'user',
        content: `דגם: ${model || 'לא ידוע'}
מערכת: ${system_category}
תסמין: ${symptom}

שאלות ותשובות:
${qaText || 'לא נענו שאלות'}

${contextBlocks ? `--- הקשר מהמערכת ---\n${contextBlocks}` : ''}

אבחן את התקלה.`,
      }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    let diagnosis
    try {
      const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()
      diagnosis = JSON.parse(cleaned)
    } catch {
      diagnosis = { suspects: [], quick_test: text, decision_tree: '', closing: 'נסה שוב' }
    }

    // Save to repair_history
    const supabase = getSupabaseServiceClient()
    const { data: repairRow } = await supabase.from('repair_history').insert({
      machine_model: model || null,
      system_category: system_category || 'אחר',
      symptom,
      clarifying_qa: clarifying_qa || [],
      diagnosis_given: JSON.stringify(diagnosis).substring(0, 2000),
    }).select('id').single()

    return NextResponse.json({ diagnosis, session_id: repairRow?.id || null })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

// Get models list
export async function GET() {
  const SK = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/documents?select=machine_model,machine_brand&machine_model=not.is.null&order=machine_model`,
    { headers: { apikey: SK, Authorization: `Bearer ${SK}` } }
  )
  if (!res.ok) return NextResponse.json({ models: [] })
  const docs: { machine_model: string; machine_brand: string | null }[] = await res.json()
  const unique = [...new Set(docs.map(d => d.machine_model).filter(Boolean))].sort()
  return NextResponse.json({ models: unique })
}
