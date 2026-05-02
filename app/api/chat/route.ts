import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  extractModel, getModelDocs, chooseModel, getLearnedSolutions,
  getWebKnowledge, isSchematicQuestion, getSchematicPages, getRepairHistory,
  getCommunityKnowledge,
} from '@/lib/doc-retrieval'

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const EXPERT_SYSTEM = `אתה מכונאי במות הרמה בכיר עם 30 שנות ניסיון על JLG, Genie, JCPT, BT, Manitou ו-Dingli.
אתה חושב כמו מכונאי אמיתי — לא כמו ספר לימוד.

חוקים שאתה תמיד מקיים:
1. לעולם אל תיתן תשובה יחידה בטוחה כשיש מספר אפשרויות — תן 2-3 חשודים מדורגים עם אחוזי סבירות.
2. תמיד המלץ על הבדיקה הזולה והמהירה ביותר קודם: בדיקה ויזואלית → מתח סוללה → פיוזים → חיבורים → סולנואידים → חיישנים → לוח בקרה. אל תשלח טכנאי לפרק לפני שבדק מה לוקח 30 שניות.
3. שאל שאלות מקדימות אם תיאור התסמין מעורפל. מקסימום 3 שאלות, רק כאלו שמשנות את האבחון.
4. צטט את המדריך: "ראה עמ' X במדריך [דגם]" כשרלוונטי.
5. דבר בעברית פשוטה כמו ראש הצוות בסדנה — לא כמו ספר לימוד.
6. סיים כל אבחון ב: "אחרי שתבדוק — תגיד לי מה ראית, נמשיך מכאן."
7. כשמשתמש בידע קהילתי: ציין את המקור — "לפי דיון בפורום [שם], מכונאי פתר: [פתרון] (מקור: [url])"
8. עדיפות: מסמכים רשמיים לנהלים ומפרטים. ידע קהילתי לתקלות חוזרות ופתרונות שטח.

פורמט אבחון (כשיש מספר אפשרויות):
• חשד #1 (X% סבירות): [הסבר + בדיקה]
• חשד #2 (Y% סבירות): [הסבר + בדיקה]
• בדיקה מהירה לפני שמפרקים: [צעד אחד]
• אם ראית X — זה כנראה Y. אם ראית Z — זה כנראה W.`

export async function POST(req: NextRequest) {
  try {
    const { message, image, history } = await req.json()
    const hasImage = !!(image?.base64)
    const model = extractModel(message || '')
    const needsSchematic = isSchematicQuestion(message || '')

    // Parallel context retrieval
    // Extract fault code from message
    const faultCodeMatch = (message || '').match(/\b(?:fault|error|code|שגיאה|קוד)\s*[:#]?\s*(\d+)\b/i)
    const faultCode = faultCodeMatch ? faultCodeMatch[1] : null

    const [docContext, learnedContext, webContext, repairContext, schematicPages, communityContext] = await Promise.all([
      model ? getModelDocs(model) : Promise.resolve(''),
      message ? getLearnedSolutions(message) : Promise.resolve(''),
      message ? getWebKnowledge(message, model) : Promise.resolve(''),
      message ? getRepairHistory(model, message) : Promise.resolve(''),
      needsSchematic ? getSchematicPages(model) : Promise.resolve([]),
      message ? getCommunityKnowledge(message, model, faultCode) : Promise.resolve(''),
    ])

    const contextBlocks = [
      model && docContext ? `=== מסמכים רשמיים (${model}) ===\n${docContext}` : '',
      repairContext,
      learnedContext,
      webContext,
      communityContext ? `=== ידע קהילתי (מכונאים אמיתיים) ===\n${communityContext}` : '',
      schematicPages.length ? `## תיאורי סכמות רלוונטיות:\n${schematicPages.map(p => `[${p.pageRef}]: ${p.description}`).join('\n')}` : '',
    ].filter(Boolean).join('\n\n')

    const aiModel = chooseModel(message || '', hasImage)

    const systemWithContext = contextBlocks
      ? `${EXPERT_SYSTEM}\n\n--- הקשר מהמערכת ---\n${contextBlocks}\n--- סוף הקשר ---`
      : EXPERT_SYSTEM

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
      text: message || 'נתח את התמונה — מה החלק הזה? מה ייתכן שלא בסדר?',
    })
    messages.push({ role: 'user', content: userContent })

    const response = await anthropic.messages.create({
      model: aiModel,
      max_tokens: 1500,
      system: systemWithContext,
      messages,
    })

    const answer = response.content[0].type === 'text' ? response.content[0].text : ''
    const sources = [
      model && docContext ? `מסמכי ${model}` : '',
      repairContext ? 'היסטוריית תיקונים' : '',
      learnedContext ? 'ניסיון שטח' : '',
      webContext ? 'ידע אינטרנט' : '',
      communityContext ? 'ידע קהילתי' : '',
      schematicPages.length ? 'סכמות' : '',
    ].filter(Boolean)

    // Fire-and-forget: log to faults table
    if (message && message.length > 15 && answer) {
      const SK = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/faults`, {
        method: 'POST',
        headers: { apikey: SK, Authorization: `Bearer ${SK}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ symptoms: message.substring(0, 500), solution: answer.substring(0, 1000), source: 'learned', machine_model: model }),
      }).catch(() => {})
    }

    return NextResponse.json({ answer, sources, modelUsed: aiModel })
  } catch (error) {
    console.error('Chat error:', error)
    const msg = error instanceof Error ? error.message : 'שגיאה לא ידועה'
    return NextResponse.json({ answer: `שגיאה: ${msg}. בדוק חיבור לאינטרנט ונסה שוב.` }, { status: 500 })
  }
}
