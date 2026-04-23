import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Map model mention in query → Supabase document lookup
async function findRelevantDocs(query: string, supabaseUrl: string, supabaseKey: string): Promise<string> {
  try {
    // Extract model name from query (e.g. "JCPT1412", "ES1930", "860SJ")
    const modelMatch = query.match(/\b([A-Z0-9]{4,}(?:[A-Z0-9])*)\b/g)
    if (!modelMatch) return ''

    const res = await fetch(`${supabaseUrl}/rest/v1/document_chunks?select=content,documents(title,machine_brand,machine_model)&limit=5`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) return ''
    const data = await res.json()
    if (!data || !data.length) return ''
    return data.map((c: { content: string }) => c.content).join('\n---\n').substring(0, 3000)
  } catch {
    return ''
  }
}

async function searchFaults(query: string, supabaseUrl: string, supabaseKey: string): Promise<string> {
  try {
    const keyword = query.substring(0, 40).replace(/'/g, "''")
    const res = await fetch(
      `${supabaseUrl}/rest/v1/faults?symptoms=ilike.*${encodeURIComponent(keyword.substring(0,20))}*&select=symptoms,solution,verified&limit=3`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    )
    if (!res.ok) return ''
    const data = await res.json()
    if (!data?.length) return ''
    return '## תקלות ידועות:\n' + data.map((f: { symptoms: string; solution: string; verified: boolean }) =>
      `תסמינים: ${f.symptoms}\nפתרון: ${f.solution}${f.verified ? ' ✅' : ''}`
    ).join('\n\n')
  } catch {
    return ''
  }
}

async function searchLearnedSolutions(query: string, supabaseUrl: string, supabaseKey: string): Promise<string> {
  try {
    const keyword = query.substring(0, 30)
    const res = await fetch(
      `${supabaseUrl}/rest/v1/fault_feedback?how_was_solved=ilike.*${encodeURIComponent(keyword.substring(0,15))}*&worked=eq.true&select=how_was_solved&limit=3`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    )
    if (!res.ok) return ''
    const data = await res.json()
    if (!data?.length) return ''
    return '## פתרונות שעבדו בשטח:\n' + data.map((f: { how_was_solved: string }) => `"${f.how_was_solved}"`).join('\n')
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, image, history } = await req.json()

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    // Gather context in parallel
    const [faults, learned] = await Promise.all([
      message ? searchFaults(message, SUPABASE_URL, SUPABASE_KEY) : '',
      message ? searchLearnedSolutions(message, SUPABASE_URL, SUPABASE_KEY) : '',
    ])

    const context = [faults, learned].filter(Boolean).join('\n\n')

    const system = `אתה מערכת האבחון של אופק גיזום והשכרת במות.
תפקידך לעזור לטכנאים לאבחן תקלות, לזהות חלקים, ולספק הוראות תחזוקה.
ענה תמיד בעברית, בצורה ברורה ומעשית.
מותגים: JLG, Manitou, Dingli, Genie.

${context ? `## מידע רלוונטי מהמאגר:\n${context}\n` : ''}

חוקים:
1. ענה בעברית בלבד
2. פתרון מעשי שלב אחר שלב
3. ציין קודי שגיאה אם ידוע לך
4. אם אינך בטוח — אמור זאת
5. בסוף כל תשובה שאל: "איך פתרת בסוף? ספר לי כדי שאלמד 🔧"`

    const messages: Anthropic.MessageParam[] = [
      ...(history || []).slice(-6).map((h: { role: 'user' | 'assistant'; content: string }) => ({
        role: h.role,
        content: h.content,
      })),
    ]

    const userContent: Anthropic.ContentBlockParam[] = []
    if (image?.base64 && image?.mimeType) {
      userContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: image.mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
          data: image.base64,
        },
      })
    }
    userContent.push({
      type: 'text',
      text: message || 'נתח את התמונה — מה החלק הזה? לאיזה מכונות מתאים?',
    })

    messages.push({ role: 'user', content: userContent })

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system,
      messages,
    })

    const answer = response.content[0].type === 'text' ? response.content[0].text : ''
    const sources = [faults && 'מאגר תקלות', learned && 'ניסיון שטח'].filter(Boolean)

    // Store as learned fault (fire-and-forget)
    if (message && message.length > 15 && answer) {
      fetch(`${SUPABASE_URL}/rest/v1/faults`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ symptoms: message.substring(0, 500), solution: answer.substring(0, 1000), source: 'learned' }),
      }).catch(() => {})
    }

    return NextResponse.json({ answer, sources })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { answer: `שגיאה: ${error instanceof Error ? error.message : 'בעיה לא ידועה'}` },
      { status: 500 }
    )
  }
}
