import { NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

export const maxDuration = 60

export const CATEGORIES = [
  { id: 1,  name: 'מדריך הפעלה',       en: 'Operator Manual',            priority: 5 },
  { id: 2,  name: 'מדריך שירות',        en: 'Service Manual',             priority: 10 },
  { id: 3,  name: 'קטלוג חלקים',        en: 'Parts Manual',               priority: 5 },
  { id: 4,  name: 'לוח תחזוקה',         en: 'Maintenance Schedule',       priority: 4 },
  { id: 5,  name: 'סכמת חשמל',          en: 'Electrical Schematic',       priority: 9 },
  { id: 6,  name: 'סכמת הידראוליקה',    en: 'Hydraulic Schematic',        priority: 8 },
  { id: 7,  name: 'תרשים חיווט',        en: 'Wiring Diagram',             priority: 6 },
  { id: 8,  name: 'קודי שגיאה',         en: 'Fault Code List',            priority: 7 },
  { id: 9,  name: 'עץ אבחון',           en: 'Troubleshooting Guide',      priority: 4 },
  { id: 10, name: 'נהלי בדיקה',         en: 'Diagnostic Procedures',      priority: 4 },
  { id: 11, name: 'מדריך מנוע',         en: 'Engine Manual',              priority: 3 },
  { id: 12, name: 'מפרט סוללות',        en: 'Battery Specs',              priority: 3 },
  { id: 13, name: 'מפרט הידראולי',      en: 'Hydraulic Component Specs',  priority: 3 },
  { id: 14, name: 'תיעוד בקר / ECU',    en: 'Control Module / ECU',       priority: 4 },
  { id: 15, name: 'תוויות בטיחות',      en: 'Safety Decals & Labels',     priority: 2 },
  { id: 16, name: 'בדיקה שנתית',        en: 'Annual Inspection Checklist',priority: 3 },
  { id: 17, name: 'תרשים עומסים',       en: 'Load Charts',                priority: 4 },
  { id: 18, name: 'עדכוני שירות',       en: 'Service Bulletins',          priority: 6 },
  { id: 19, name: 'הודעות החזרה',       en: 'Recall Notices',             priority: 8 },
  { id: 20, name: 'עדכוני תוכנה',       en: 'Software/Firmware Updates',  priority: 5 },
  { id: 21, name: 'מפרטי שמנים',        en: 'Hydraulic Oil & Lubricant Specs', priority: 4 },
  { id: 22, name: 'נוהלי כיול',         en: 'Calibration Procedures',     priority: 5 },
]

function classifyDoc(title: string, docType: string): number {
  const t = title.toLowerCase()
  if (t.includes('operator') || t.includes('operating manual') || t.includes('user manual')) return 1
  if (t.includes('service') && !t.includes('maintenance')) return 2
  if (t.includes('parts') || t.includes('part manual') || docType === 'parts_catalog') return 3
  if (t.includes('maintenance')) return 4
  if ((t.includes('electrical') || t.includes('electric')) && (t.includes('schematic') || t.includes('diagram'))) return 5
  if (t.includes('hydraulic') && (t.includes('schematic') || t.includes('circuit') || t.includes('diagram'))) return 6
  if (t.includes('wiring')) return 7
  if (t.includes('fault') || t.includes('error code') || docType === 'fault_codes') return 8
  if (t.includes('troubleshoot')) return 9
  if (t.includes('diagnostic')) return 10
  if (t.includes('engine') || t.includes('kubota') || t.includes('deutz') || t.includes('perkins') || t.includes('cummins')) return 11
  if (t.includes('battery') || t.includes('batteries')) return 12
  if (docType === 'schematic') return 13
  if (t.includes('control') || t.includes('ecu') || t.includes('module')) return 14
  if (t.includes('safety') || t.includes('decal') || t.includes('label')) return 15
  if (t.includes('annual') || t.includes('inspection') || t.includes('checklist')) return 16
  if (t.includes('load chart') || t.includes('load table') || t.includes('capacity')) return 17
  if (t.includes('service bulletin') || t.includes('technical bulletin') || t.includes('tsb')) return 18
  if (t.includes('recall') || t.includes('safety notice') || t.includes('field notice')) return 19
  if (t.includes('software update') || t.includes('firmware') || t.includes('flash') || t.includes('software release')) return 20
  if (t.includes('lubric') || t.includes('oil spec') || t.includes('fluid spec') || t.includes('grease spec')) return 21
  if (t.includes('calibrat') || t.includes('load sensor') || t.includes('tilt sensor') || t.includes('joystick cal')) return 22
  return 0
}

export type DocRow = {
  id: string
  machine_brand: string | null
  machine_model: string | null
  doc_type: string
  title: string
  file_url: string | null
  doc_category?: number | null
  doc_category_name?: string | null
}

export type ModelEntry = {
  brand: string
  model: string
  coverageCells: Record<number, { docId: string; title: string; url: string | null }[]>
  coverageCount: number
  coveragePct: number
  criticalityScore: number
  topMissing: { catId: number; catName: string; priority: number }[]
}

export type AuditData = {
  totalDocs: number
  totalModels: number
  overallCoverage: number
  brandSummary: Record<string, { total: number; models: number; coverage: number }>
  models: ModelEntry[]
  specsDocs: DocRow[]
  uncategorized: DocRow[]
  generatedAt: string
}

export async function GET(): Promise<NextResponse> {
  const sb = getSupabaseServiceClient()
  const { data: docs, error } = await sb
    .from('documents')
    .select('id,machine_brand,machine_model,doc_type,title,file_url,doc_category,doc_category_name')
    .order('machine_brand')
    .order('machine_model')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (docs || []) as DocRow[]

  // Separate specs/brand-level from model-level docs
  const specsDocs = rows.filter(d => d.machine_brand === 'Specs')
  const modelDocs = rows.filter(d => d.machine_brand !== 'Specs')
  const uncategorized: DocRow[] = []

  // Group by brand+model
  const modelMap: Record<string, DocRow[]> = {}
  for (const doc of modelDocs) {
    const key = `${doc.machine_brand}|${doc.machine_model}`
    if (!modelMap[key]) modelMap[key] = []
    modelMap[key].push(doc)
  }

  const models: ModelEntry[] = []

  for (const [key, mDocs] of Object.entries(modelMap)) {
    const [brand, model] = key.split('|')
    const coverageCells: Record<number, { docId: string; title: string; url: string | null }[]> = {}

    for (const doc of mDocs) {
      const cat = doc.doc_category ?? classifyDoc(doc.title, doc.doc_type)
      if (cat === 0) { uncategorized.push(doc); continue }
      if (!coverageCells[cat]) coverageCells[cat] = []
      coverageCells[cat].push({ docId: doc.id, title: doc.title, url: doc.file_url })
    }

    const coveredCats = new Set(Object.keys(coverageCells).map(Number))
    const coverageCount = coveredCats.size
    const coveragePct = Math.round((coverageCount / 22) * 100)

    const missingCats = CATEGORIES.filter(c => !coveredCats.has(c.id))
    const criticalityScore = missingCats.reduce((sum, c) => sum + c.priority, 0)
    const topMissing = missingCats
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5)
      .map(c => ({ catId: c.id, catName: c.name, priority: c.priority }))

    models.push({ brand, model, coverageCells, coverageCount, coveragePct, criticalityScore, topMissing })
  }

  // Sort by criticality descending (most critical first)
  models.sort((a, b) => b.criticalityScore - a.criticalityScore)

  // Brand summary
  const brandSummary: Record<string, { total: number; models: number; coverage: number }> = {}
  for (const m of models) {
    if (!brandSummary[m.brand]) brandSummary[m.brand] = { total: 0, models: 0, coverage: 0 }
    brandSummary[m.brand].total += m.coverageCount
    brandSummary[m.brand].models += 1
    brandSummary[m.brand].coverage += m.coveragePct
  }
  for (const b of Object.values(brandSummary)) {
    b.coverage = Math.round(b.coverage / b.models)
  }

  const totalModels = models.length
  const overallCoverage = totalModels > 0
    ? Math.round(models.reduce((s, m) => s + m.coveragePct, 0) / totalModels)
    : 0

  const data: AuditData = {
    totalDocs: rows.length,
    totalModels,
    overallCoverage,
    brandSummary,
    models,
    specsDocs,
    uncategorized,
    generatedAt: new Date().toISOString(),
  }

  return NextResponse.json(data)
}
