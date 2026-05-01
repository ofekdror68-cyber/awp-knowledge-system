import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

export const maxDuration = 300

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PAGE_TYPE_VALUES = ['text', 'schematic_electrical', 'schematic_hydraulic', 'parts_diagram', 'mixed'] as const

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServiceClient()
  const { documentId } = await req.json()

  if (!documentId) return NextResponse.json({ error: 'documentId required' }, { status: 400 })

  // Fetch document record
  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (docErr || !doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  if (!doc.file_url) return NextResponse.json({ error: 'No file_url on document' }, { status: 400 })

  // Download PDF from storage
  const pdfRes = await fetch(doc.file_url)
  if (!pdfRes.ok) return NextResponse.json({ error: 'Failed to download PDF' }, { status: 502 })

  const pdfBuffer = await pdfRes.arrayBuffer()
  const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')

  // Use Claude vision to analyze the entire PDF
  let analysisText = ''
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: pdfBase64,
            },
          } as Anthropic.DocumentBlockParam,
          {
            type: 'text',
            text: `נתח את המסמך הזה ותחזיר JSON בלבד עם המבנה הבא. לכל עמוד שמכיל מידע ויזואלי חשוב (סכמות, תרשימים, טבלאות חלקים):

{
  "pages": [
    {
      "page_number": 1,
      "page_type": "text|schematic_electrical|schematic_hydraulic|parts_diagram|mixed",
      "extracted_text": "הטקסט העיקרי מהעמוד (עד 500 תווים)",
      "schematic_description": "תיאור מפורט של מה שנמצא בסכמה — רכיבים, חוטים, צבעים, מספרי חלקים, מה המעגל עושה. null אם לא סכמה."
    }
  ],
  "total_pages": 5,
  "document_summary": "תיאור קצר של מה המסמך — דגם, סוג, תוכן עיקרי"
}

חשוב: עמודי טקסט בלבד — page_type: "text", schematic_description: null.
סכמות חשמליות — page_type: "schematic_electrical".
סכמות הידראוליות — page_type: "schematic_hydraulic".
דיאגרמות חלקים — page_type: "parts_diagram".
תחזיר ONLY JSON, ללא markdown.`,
          },
        ],
      }],
    })

    analysisText = response.content[0].type === 'text' ? response.content[0].text : ''
  } catch (e) {
    console.error('Vision analysis error:', e)
    return NextResponse.json({ error: `Claude vision failed: ${e instanceof Error ? e.message : 'unknown'}` }, { status: 500 })
  }

  // Parse JSON response
  let analysis: {
    pages: Array<{
      page_number: number
      page_type: string
      extracted_text: string | null
      schematic_description: string | null
    }>
    total_pages: number
    document_summary: string
  }

  try {
    const cleaned = analysisText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()
    analysis = JSON.parse(cleaned)
  } catch {
    return NextResponse.json({ error: 'Failed to parse Claude response as JSON', raw: analysisText.substring(0, 500) }, { status: 500 })
  }

  // Delete existing document_pages for this doc
  await supabase.from('document_pages').delete().eq('document_id', documentId)

  // Insert new pages
  const pagesToInsert = analysis.pages.map(p => ({
    document_id: documentId,
    page_number: p.page_number,
    page_type: PAGE_TYPE_VALUES.includes(p.page_type as typeof PAGE_TYPE_VALUES[number])
      ? p.page_type
      : 'text',
    extracted_text: p.extracted_text,
    schematic_description: p.schematic_description,
  }))

  const { error: insertErr } = await supabase.from('document_pages').insert(pagesToInsert)
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  // Mark document as vision-analyzed
  await supabase.from('documents').update({
    vision_analyzed: true,
    page_count: analysis.total_pages,
  }).eq('id', documentId)

  const schematicCount = pagesToInsert.filter(p => p.page_type !== 'text').length

  return NextResponse.json({
    ok: true,
    pagesProcessed: pagesToInsert.length,
    schematicPages: schematicCount,
    summary: analysis.document_summary,
  })
}
