import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import { getAnthropicClient, MODEL } from '@/lib/anthropic'

export const maxDuration = 120

const INTERVALS = ['50h', '100h', '250h', '500h', '1000h', 'annual']

export async function POST(req: NextRequest) {
  const { machineId, brand, model } = await req.json()
  const supabase = getSupabaseServiceClient()
  const anthropic = getAnthropicClient()

  const prompt = `אתה מומחה תחזוקה לבמות הרמה (AWP - Aerial Work Platforms).
צור תוכנית תחזוקה מפורטת עבור: ${brand} ${model}

צור רשימת משימות לכל מרווח תחזוקה: 50h, 100h, 250h, 500h, 1000h, annual

ענה ב-JSON בלבד, בפורמט הזה:
{
  "50h": [
    {
      "task_name": "שם המשימה בעברית",
      "description": "תיאור מפורט בעברית",
      "parts_needed": "רשימת חלקים נדרשים אם יש",
      "estimated_time_minutes": 30,
      "is_safety_critical": true/false
    }
  ],
  "100h": [...],
  "250h": [...],
  "500h": [...],
  "1000h": [...],
  "annual": [...]
}

כלול: בדיקות שמן, פילטרים, הידראוליקה, בטיחות, בלמים, צמיגים, מצבר, מיכל דלק, גידים הידראוליים, בוכנות, מפסקי בטיחות, נורות, מקשי חירום.
התאם לסוג המכונה: ${brand} ${model}.`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')

    const scheduleData = JSON.parse(jsonMatch[0])

    // Delete existing schedules for this machine
    await supabase.from('maintenance_schedules').delete().eq('machine_id', machineId)

    // Insert new schedules
    const inserts = INTERVALS.map(interval => ({
      machine_id: machineId,
      interval_type: interval,
      tasks: scheduleData[interval] || [],
    }))

    const { error } = await supabase.from('maintenance_schedules').insert(inserts)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Schedule generation error:', e)
    return NextResponse.json({ error: 'Failed to generate schedule' }, { status: 500 })
  }
}
