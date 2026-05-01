import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import { getAnthropicClient, MODEL } from '@/lib/anthropic'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServiceClient()
  const { title, brand, model, doc_type, filename, fileBase64, mimeType } = await req.json()

  const fileBuffer = Buffer.from(fileBase64, 'base64')
  const storagePath = `documents/${Date.now()}-${filename}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('awp-documents')
    .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: false })

  if (uploadError) console.error('Storage upload error:', uploadError)

  const { data: { publicUrl } } = supabase.storage.from('awp-documents').getPublicUrl(storagePath)

  const { data: doc, error: docError } = await supabase.from('documents').insert({
    machine_brand: brand || null,
    machine_model: model || null,
    doc_type: doc_type || 'other',
    title,
    file_url: uploadData ? publicUrl : null,
  }).select().single()

  if (docError) return NextResponse.json({ error: docError.message }, { status: 400 })

  // Text extraction for chunking
  if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
    try {
      const anthropic = getAnthropicClient()

      const content = mimeType.startsWith('image/')
        ? [
            { type: 'image' as const, source: { type: 'base64' as const, media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp', data: fileBase64 } },
            { type: 'text' as const, text: 'חלץ את כל הטקסט מהמסמך הזה. שמור על המבנה המקורי.' },
          ]
        : [
            { type: 'document' as const, source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: fileBase64 } },
            { type: 'text' as const, text: 'חלץ את כל הטקסט מהמסמך. שמור על מספרי עמודים, כותרות וטבלאות.' },
          ]

      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 4000,
        messages: [{ role: 'user', content }],
      })

      const extractedText = response.content[0].type === 'text' ? response.content[0].text : ''

      const words = extractedText.split(/\s+/)
      const chunks = []
      for (let i = 0; i < words.length; i += 300) {
        chunks.push(words.slice(i, i + 300).join(' '))
      }

      if (chunks.length > 0) {
        await supabase.from('document_chunks').insert(
          chunks.map((content, idx) => ({ document_id: doc.id, content, page_number: idx + 1 }))
        )
      }
    } catch (e) {
      console.error('Text extraction error:', e)
    }
  }

  // Trigger vision processing async (fire-and-forget for PDF)
  if (mimeType === 'application/pdf' && uploadData) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
    fetch(`${baseUrl}/api/documents/process-vision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: doc.id }),
    }).catch(e => console.error('Vision processing failed to start:', e))
  }

  return NextResponse.json({ ok: true, document: doc })
}
