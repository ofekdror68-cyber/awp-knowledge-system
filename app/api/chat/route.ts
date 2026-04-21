import { NextRequest, NextResponse } from 'next/server'
import { getAnthropicClient, MODEL } from '@/lib/anthropic'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

async function getEmbedding(text: string, client: Anthropic): Promise<number[]> {
  // Use Claude to create a text-based summary embedding via cohere-like approach
  // Actually use Anthropic embeddings - currently not directly available,
  // so we'll store text and do keyword search as fallback
  return []
}

async function searchContext(query: string, supabase: ReturnType<typeof getSupabaseServiceClient>) {
  const sources: string[] = []
  const contextParts: string[] = []

  // Search faults table by text similarity
  const { data: faults } = await supabase
    .from('faults')
    .select('*')
    .or(`symptoms.ilike.%${query.substring(0, 50)}%,fault_code.ilike.%${query.substring(0, 20)}%`)
    .order('times_used', { ascending: false })
    .limit(3)

  if (faults && faults.length > 0) {
    contextParts.push('## תקלות ידועות מהמאגר הפנימי:\n' + faults.map(f =>
      `**תקלה:** ${f.symptoms}\n**פתרון:** ${f.solution}${f.fault_code ? `\n**קוד:** ${f.fault_code}` : ''}${f.verified ? '\n✅ פתרון מאומת' : ''}`
    ).join('\n\n'))
    sources.push('מאגר תקלות פנימי')
    // Increment times_used
    await supabase.from('faults').update({ times_used: (faults[0].times_used || 0) + 1 }).eq('id', faults[0].id)
  }

  // Search feedback/learned solutions
  const { data: feedback } = await supabase
    .from('fault_feedback')
    .select('*')
    .ilike('how_was_solved', `%${query.substring(0, 40)}%`)
    .eq('worked', true)
    .limit(3)

  if (feedback && feedback.length > 0) {
    contextParts.push('## פתרונות שעבדו בשטח (מדיווחי טכנאים):\n' + feedback.map(f =>
      `"${f.how_was_solved}"`
    ).join('\n'))
    sources.push('ניסיון שטח')
  }

  // Search document chunks by keyword
  const { data: chunks } = await supabase
    .from('document_chunks')
    .select('content, document_id')
    .ilike('content', `%${query.substring(0, 50)}%`)
    .limit(3)

  if (chunks && chunks.length > 0) {
    contextParts.push('## מתוך מסמכים טכניים:\n' + chunks.map(c => c.content).join('\n---\n'))
    sources.push('מסמכים טכניים')
  }

  // Search web knowledge
  const { data: webKnowledge } = await supabase
    .from('web_knowledge')
    .select('content_summary, title')
    .ilike('content_summary', `%${query.substring(0, 50)}%`)
    .limit(3)

  if (webKnowledge && webKnowledge.length > 0) {
    contextParts.push('## מידע מהאינטרנט:\n' + webKnowledge.map(w => `**${w.title}:** ${w.content_summary}`).join('\n'))
    sources.push('ידע מהאינטרנט')
  }

  return { context: contextParts.join('\n\n'), sources }
}

export async function POST(req: NextRequest) {
  const { message, image, history } = await req.json()
  const supabase = getSupabaseServiceClient()
  const anthropic = getAnthropicClient()

  const { context, sources } = await searchContext(message || '', supabase)

  const systemPrompt = `אתה מומחה טכני לבמות הרמה (AWP - Aerial Work Platforms) עם ניסיון עשרות שנים.
המותגים שאתה מכיר: JLG, Manitou, Dingli, Genie.
אתה עונה בעברית, בצורה ברורה ומעשית לטכנאים בשטח.

${context ? `## מידע רלוונטי שנמצא:\n${context}\n\n` : ''}

## חוקים:
1. תמיד ענה בעברית
2. תן פתרון מעשי, שלב אחר שלב
3. ציין קודי שגיאה רלוונטיים אם יודע
4. אם אינך בטוח — אמור זאת בבירור
5. בסוף כל תשובה, ALWAYS שאל: "איך פתרת את התקלה בסוף? תספר לי כדי שאלמד 🔧"
6. אם רואה תמונה — נתח אותה לפרטיה`

  const messages: Anthropic.MessageParam[] = [
    ...(history || []).slice(-6).map((h: { role: string; content: string }) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
  ]

  const userContent: Anthropic.ContentBlockParam[] = []

  if (image) {
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
    text: message || 'נתח את התמונה הזו — מה החלק הזה? לאיזה מכונות הוא מתאים? מה מספר החלק?',
  })

  messages.push({ role: 'user', content: userContent })

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: systemPrompt,
    messages,
  })

  const answer = response.content[0].type === 'text' ? response.content[0].text : ''

  // Store as learned fault if it looks like a fault description
  if (message && message.length > 20) {
    await supabase.from('faults').upsert({
      symptoms: message.substring(0, 500),
      solution: answer.substring(0, 1000),
      source: 'internet',
      fault_code: null,
    }, { onConflict: 'symptoms', ignoreDuplicates: true })
  }

  return NextResponse.json({ answer, sources })
}
