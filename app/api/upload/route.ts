import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import { getAnthropicClient, MODEL } from '@/lib/anthropic'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServiceClient()
  const { title, brand, model, doc_type, filename, fileBase64, mimeType } = await req.json()

  // Upload file to Supabase Storage
  const fileBuffer = Buffer.from(fileBase64, 'base64')
  const storagePath = `documents/${Date.now()}-${filename}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('awp-documents')
    .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: false })

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    // Continue without storage (store metadata only)
  }

  const { data: { publicUrl } } = supabase.storage.from('awp-documents').getPublicUrl(storagePath)

  // Insert document record
  const { data: doc, error: docError } = await supabase.from('documents').insert({
    machine_brand: brand || null,
    machine_model: model || null,
    doc_type: doc_type || 'other',
    title,
    file_url: uploadData ? publicUrl : null,
  }).select().single()

  if (docError) return NextResponse.json({ error: docError.message }, { status: 400 })

  // Extract text and chunk it (for PDFs, use Claude vision)
  if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
    try {
      const anthropic = getAnthropicClient()

      const content = mimeType.startsWith('image/')
        ? [
            {
              type: 'image' as const,
              source: {
                type: 'base64' as const,
                media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
                data: fileBase64,
              },
            },
            { type: 'text' as const, text: 'חלץ את כל הטקסט מהמסמך הזה. שמור על המבנה המקורי.' },
          ]
        : [{ type: 'text' as const, text: 'מסמך PDF הועלה — אנא רשום תיאור כללי של תוכן צפוי.' }]

      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 2000,
        messages: [{ role: 'user', content }],
      })

      const extractedText = response.content[0].type === 'text' ? response.content[0].text : ''

      // Chunk text into 500-word segments
      const words = extractedText.split(/\s+/)
      const chunkSize = 300
      const chunks = []

      for (let i = 0; i < words.length; i += chunkSize) {
        chunks.push(words.slice(i, i + chunkSize).join(' '))
      }

      // Store chunks (without embeddings for now — keyword search will work)
      if (chunks.length > 0) {
        await supabase.from('document_chunks').insert(
          chunks.map((content, idx) => ({
            document_id: doc.id,
            content,
            page_number: idx + 1,
          }))
        )
      }
    } catch (e) {
      console.error('Text extraction error:', e)
    }
  }

  return NextResponse.json({ ok: true, document: doc })
}
