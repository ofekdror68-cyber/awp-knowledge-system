import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { extractModel, getModelDocs, chooseModel, getLearnedSolutions, getWebKnowledge } from '@/lib/doc-retrieval'

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { message, image, history } = await req.json()
    const hasImage = !!(image?.base64)

    // 1. Smart context retrieval — parallel, fast
    const model = extractModel(message || '')
    const [docContext, learnedContext, webContext] = await Promise.all([
      model ? getModelDocs(model) : Promise.resolve(''),
      message ? getLearnedSolutions(message) : Promise.resolve(''),
      message ? getWebKnowledge(message, model) : Promise.resolve(''),
    ])

    const contextBlocks = [
      model && docContext ? `## מתוך מסמכי ${model}:\n${docContext}` : '',
      learnedContext,
      webContext,
    ].filter(Boolean).join('\n\n')

    // 2. Choose model — Haiku for simple Q, Sonnet for complex/images
    const aiModel = chooseModel(message || '', hasImage)

    const system = `אתה מערכת אבחון טכנית של אופק גיזום והשכרת במות.
הטכנאי שפונה אליך מוסמך ומנוסה — אם הוא שואל, הוא כבר נתקע.

הנח שכבר בוצעו: בדיקת מתח סוללה, קריאת קודי שגיאה בתצוגה, בדיקת חיבורים ופיוזים, בדיקת נוזלים (הידראוליקה/שמן/קירור).
מותגים: JLG, Manitou, Dingli, Genie.

${contextBlocks ? `${contextBlocks}\n` : ''}כללים:
1. עברית בלבד
2. קצר וישיר — 3-5 שורות מקסימום
3. הצעד הבא הכי סביר קודם
4. קוד שגיאה ספציפי — ציין משמעות ופתרון ישיר
5. אל תרחיב אלא אם שואלים במפורש
6. אם לא בטוח — אמור זאת בשורה אחת`

    const messages: Anthropic.MessageParam[] = [
      ...(history || []).slice(-6).map((h: { role: 'user' | 'assistant'; content: string }) => ({
        role: h.role,
        content: h.content,
      })),
    ]

    const userContent: Anthropic.ContentBlockParam[] = []
    if (hasImage) {
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
      model: aiModel,
      max_tokens: 1024,
      system,
      messages,
    })

    const answer = response.content[0].type === 'text' ? response.content[0].text : ''
    const sources = [
      model && docContext ? `מסמכי ${model}` : '',
      learnedContext ? 'ניסיון שטח' : '',
      webContext ? 'ידע אינטרנט' : '',
    ].filter(Boolean)

    // Store learned (fire-and-forget)
    if (message && message.length > 15 && answer) {
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      fetch(`${SUPABASE_URL}/rest/v1/faults`, {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ symptoms: message.substring(0, 500), solution: answer.substring(0, 1000), source: 'learned', machine_model: model }),
      }).catch(() => {})
    }

    return NextResponse.json({ answer, sources, modelUsed: aiModel })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ answer: 'שגיאה פנימית — נסה שוב' }, { status: 500 })
  }
}
