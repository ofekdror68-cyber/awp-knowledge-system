import { NextResponse } from 'next/server'
import { CATEGORIES } from '../route'
import type { AuditData } from '../route'

export const maxDuration = 60

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })
}

export async function GET(req: Request): Promise<NextResponse> {
  const base = new URL(req.url).origin
  const res = await fetch(`${base}/api/audit`, { cache: 'no-store' })
  if (!res.ok) return NextResponse.json({ error: 'audit fetch failed' }, { status: 500 })
  const data: AuditData = await res.json()

  const priorityOrder = [...CATEGORIES].sort((a, b) => b.priority - a.priority)

  const lines: string[] = [
    `# דוח מצאי מסמכים — אופק גיזום`,
    ``,
    `**תאריך:** ${formatDate(data.generatedAt)}  `,
    `**סה"כ מסמכים:** ${data.totalDocs}  `,
    `**דגמים:** ${data.totalModels}  `,
    `**כיסוי כללי:** ${data.overallCoverage}%`,
    ``,
    `---`,
    ``,
    `## סיכום לפי מותג`,
    ``,
    `| מותג | דגמים | מסמכים | כיסוי |`,
    `|------|-------|--------|-------|`,
    ...Object.entries(data.brandSummary).map(
      ([brand, s]) => `| ${brand} | ${s.models} | ${s.total} | ${s.coverage}% |`
    ),
    ``,
    `---`,
    ``,
    `## מסמכים חסרים קריטיים (לפי עדיפות)`,
    ``,
    `סדר עדיפות: ${priorityOrder.slice(0, 6).map(c => c.name).join(' > ')} > שאר`,
    ``,
    ...data.models.map(m => {
      const missing = CATEGORIES
        .filter(c => !m.coverageCells[c.id])
        .sort((a, b) => b.priority - a.priority)
      if (missing.length === 0) return null
      return [
        `### ${m.brand} ${m.model} (כיסוי: ${m.coveragePct}%)`,
        ``,
        `**חסר:**`,
        ...missing.map(c => `- [ ] ${c.name} *(עדיפות: ${c.priority})*`),
        ``,
      ].join('\n')
    }).filter(Boolean),
    `---`,
    ``,
    `## כיסוי מלא לפי דגם`,
    ``,
    ...data.models.map(m => {
      const rows = CATEGORIES.map(c => {
        const has = !!m.coverageCells[c.id]
        return `| ${c.id} | ${c.name} | ${has ? '✓' : '✗'} |`
      })
      return [
        `### ${m.brand} ${m.model}`,
        ``,
        `| # | קטגוריה | סטטוס |`,
        `|---|---------|-------|`,
        ...rows,
        ``,
      ].join('\n')
    }),
    `---`,
    ``,
    `*נוצר אוטומטית על ידי מערכת ידע אופק גיזום*`,
  ]

  const md = lines.filter(l => l !== null).join('\n')

  return new NextResponse(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="audit-${new Date().toISOString().slice(0,10)}.md"`,
    },
  })
}
