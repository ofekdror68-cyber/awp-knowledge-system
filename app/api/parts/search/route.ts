import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import { getAnthropicClient, MODEL } from '@/lib/anthropic'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const { query, image } = await req.json()
  const supabase = getSupabaseServiceClient()
  const anthropic = getAnthropicClient()

  let analysis = ''
  let searchTerms = query || ''

  if (image) {
    // Image provided — analyze visually
    const content: Anthropic.ContentBlockParam[] = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: image.mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
          data: image.base64,
        },
      },
      {
        type: 'text',
        text: `נתח את החלק בתמונה. ענה בעברית עם:
1. מה החלק הזה (שם טכני)
2. מספר חלק משוער אם ניתן לזהות
3. לאיזה מותגי במות הוא מתאים (JLG/Manitou/Dingli/Genie)
4. מה תפקידו
5. היכן הוא ממוקם במכונה

פרמט: JSON עם שדות: name, part_number, brands, function, location, search_terms`,
      },
    ]

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      messages: [{ role: 'user', content }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        analysis = `זוהה: **${parsed.name}** | מותגים: ${parsed.brands} | מיקום: ${parsed.location}\n${parsed.function}`
        searchTerms = [searchTerms, parsed.name, parsed.part_number, parsed.search_terms].filter(Boolean).join(' ')
      } else {
        analysis = text
      }
    } catch {
      analysis = text
    }
  } else if (query && query.trim().length > 2) {
    // Text-only — use AI to extract technical terms and identify the part
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `זהה חלק לבמת הרמה לפי תיאור: "${query}"
מותגים אפשריים: JLG, Manitou, Dingli, Genie.
ענה JSON בלבד: { "name": "", "part_number": "", "brands": "", "search_terms": "" }
אם לא ניתן לזהות בוודאות — תן מונחי חיפוש טכניים מתאימים ב-search_terms.`,
      }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.name) {
          analysis = `זוהה: **${parsed.name}**${parsed.brands ? ` | מותגים: ${parsed.brands}` : ''}`
        }
        searchTerms = [query, parsed.name, parsed.part_number, parsed.search_terms].filter(Boolean).join(' ')
      }
    } catch {
      // fallback to raw query
    }
  }

  // Search database
  const parts: unknown[] = []
  const terms = searchTerms.split(/\s+/).filter((t: string) => t.length > 2)

  for (const term of terms.slice(0, 3)) {
    const { data } = await supabase
      .from('parts')
      .select('*')
      .or(`part_number.ilike.%${term}%,description.ilike.%${term}%`)
      .limit(10)

    if (data) {
      for (const p of data) {
        if (!parts.find((existing: unknown) => (existing as { id: string }).id === p.id)) {
          parts.push(p)
        }
      }
    }
  }

  return NextResponse.json({ parts: parts.slice(0, 10), analysis })
}
