import { NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_KEY } from '@/agents/shared'

export const maxDuration = 60

// Recomputes doc_category for any uncategorized documents
export async function GET() {
  try {
    // Fetch documents without a category
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/documents?doc_category=is.null&select=id,title,doc_type&limit=100`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
    const docs: { id: string; title: string; doc_type: string }[] = await res.json()

    let classified = 0
    for (const doc of docs) {
      const cat = classifyByTitle(doc.title, doc.doc_type)
      if (cat > 0) {
        await fetch(`${SUPABASE_URL}/rest/v1/documents?id=eq.${doc.id}`, {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ doc_category: cat, doc_category_name: CATEGORY_NAMES[cat] }),
        })
        classified++
      }
    }

    console.log(`[CRON] Audit refresh: classified ${classified}/${docs.length} uncategorized docs`)
    return NextResponse.json({ ok: true, processed: docs.length, classified })
  } catch (e) {
    console.error('[CRON] Audit refresh failed:', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}

const CATEGORY_NAMES: Record<number, string> = {
  1: 'מדריך הפעלה', 2: 'מדריך שירות', 3: 'קטלוג חלקים', 4: 'לוח תחזוקה',
  5: 'סכמת חשמל', 6: 'סכמת הידראוליקה', 7: 'תרשים חיווט', 8: 'קודי שגיאה',
  9: 'עץ אבחון', 10: 'נהלי בדיקה', 11: 'מדריך מנוע', 12: 'מפרט סוללות',
  13: 'מפרט הידראולי', 14: 'תיעוד בקר / ECU', 15: 'תוויות בטיחות',
  16: 'בדיקה שנתית', 17: 'תרשים עומסים', 18: 'עדכוני שירות', 19: 'הודעות החזרה',
  20: 'עדכוני תוכנה', 21: 'מפרטי שמנים', 22: 'נוהלי כיול',
}

function classifyByTitle(title: string, docType: string): number {
  const t = title.toLowerCase()
  if (t.includes('operator') || t.includes('user manual')) return 1
  if (t.includes('service') && !t.includes('maintenance')) return 2
  if (t.includes('parts') || docType === 'parts_catalog') return 3
  if (t.includes('maintenance')) return 4
  if (t.includes('electrical') && (t.includes('schematic') || t.includes('diagram'))) return 5
  if (t.includes('hydraulic') && (t.includes('schematic') || t.includes('circuit'))) return 6
  if (t.includes('wiring')) return 7
  if (t.includes('fault') || t.includes('error code') || docType === 'fault_codes') return 8
  if (t.includes('troubleshoot')) return 9
  if (t.includes('diagnostic')) return 10
  if (t.includes('engine') || t.includes('kubota') || t.includes('deutz')) return 11
  if (t.includes('battery')) return 12
  if (docType === 'schematic') return 13
  if (t.includes('control') || t.includes('ecu')) return 14
  if (t.includes('safety') || t.includes('decal')) return 15
  if (t.includes('annual') || t.includes('inspection')) return 16
  if (t.includes('load chart') || t.includes('capacity')) return 17
  if (t.includes('service bulletin') || t.includes('tsb')) return 18
  if (t.includes('recall')) return 19
  if (t.includes('firmware') || t.includes('software update')) return 20
  if (t.includes('lubric') || t.includes('oil spec')) return 21
  if (t.includes('calibrat')) return 22
  return 0
}
