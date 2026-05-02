// Document classifier — uses Claude to determine category from content
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ClassificationResult {
  category: number
  categoryName: string
  brand: string | null
  model: string | null
  confidence: number
  language: string
}

export async function classifyDocument(text: string, filename?: string): Promise<ClassificationResult> {
  const prompt = `You are classifying an AWP (aerial work platform) technical document.

Document text (first 3000 chars):
${text.substring(0, 3000)}

${filename ? `Filename: ${filename}` : ''}

Classify this document:
1. category: one of these numbers:
   1=Operator Manual, 2=Service Manual, 3=Parts Manual, 4=Maintenance Schedule,
   5=Electrical Schematic, 6=Hydraulic Schematic, 7=Wiring Diagram, 8=Fault Code List,
   9=Troubleshooting Guide, 10=Diagnostic Procedures, 11=Engine Manual, 12=Battery Specs,
   13=Hydraulic Component Specs, 14=Control Module/ECU, 15=Safety Decals,
   16=Annual Inspection Checklist, 17=Load Charts, 18=Service Bulletins,
   19=Recall Notices, 20=Software/Firmware Updates, 21=Oil & Lubricant Specs,
   22=Calibration Procedures
2. brand: JLG | Genie | Dingli | Manitou | BT | Skyjack | null
3. model: specific model number string or null
4. confidence: 1-5 (5=very certain)
5. language: en | he | zh | de | fr | other

Return JSON only, no explanation:
{"category":N,"categoryName":"...","brand":"...","model":"...","confidence":N,"language":"..."}`

  const res = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  })
  const raw = res.content[0].type === 'text' ? res.content[0].text.trim() : '{}'
  try {
    const parsed = JSON.parse(raw.replace(/^```json\n?/, '').replace(/\n?```$/, ''))
    return parsed as ClassificationResult
  } catch {
    return { category: 0, categoryName: 'Unknown', brand: null, model: null, confidence: 1, language: 'en' }
  }
}

export async function classifyForum(threadText: string): Promise<ForumClassification> {
  const prompt = `This is a forum thread about AWP (aerial work platform / boom lift / scissor lift) equipment.

Thread content:
${threadText.substring(0, 4000)}

Extract structured data. Return JSON only:
{
  "brand": "JLG" | "Genie" | "Dingli" | "Manitou" | "Skyjack" | "BT" | "Other" | null,
  "model": "specific model like JLG 1932R" | "general" | null,
  "system": "hydraulic" | "electrical" | "engine" | "drive" | "safety" | "control" | "other",
  "fault_code": "fault code if mentioned, e.g. '63' or 'E63'" | null,
  "symptom": "1-2 sentence problem description",
  "solution": "what fixed it — look for accepted answers, 'this fixed it', thanks replies" | null,
  "mechanic_advice": ["array of useful tips from replies"],
  "confidence": 1-5,
  "quality": 1-5
}`

  const res = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })
  const raw = res.content[0].type === 'text' ? res.content[0].text.trim() : '{}'
  try {
    return JSON.parse(raw.replace(/^```json\n?/, '').replace(/\n?```$/, ''))
  } catch {
    return {
      brand: null, model: null, system: 'other', fault_code: null,
      symptom: threadText.substring(0, 200), solution: null,
      mechanic_advice: [], confidence: 1, quality: 1,
    }
  }
}

export interface ForumClassification {
  brand: string | null
  model: string | null
  system: string
  fault_code: string | null
  symptom: string
  solution: string | null
  mechanic_advice: string[]
  confidence: number
  quality: number
}
