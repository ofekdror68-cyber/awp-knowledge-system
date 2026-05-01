'use client'

import { useState, useEffect, useMemo } from 'react'
import { Download, ChevronDown, ChevronRight, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import type { AuditData, ModelEntry } from '@/app/api/audit/route'

const CATEGORIES_STATIC = [
  { id: 1,  name: 'מדריך הפעלה',     priority: 5  },
  { id: 2,  name: 'מדריך שירות',      priority: 10 },
  { id: 3,  name: 'קטלוג חלקים',      priority: 5  },
  { id: 4,  name: 'לוח תחזוקה',       priority: 4  },
  { id: 5,  name: 'סכמת חשמל',        priority: 9  },
  { id: 6,  name: 'סכמת הידראוליקה',  priority: 8  },
  { id: 7,  name: 'תרשים חיווט',      priority: 6  },
  { id: 8,  name: 'קודי שגיאה',       priority: 7  },
  { id: 9,  name: 'עץ אבחון',         priority: 4  },
  { id: 10, name: 'נהלי בדיקה',       priority: 4  },
  { id: 11, name: 'מדריך מנוע',       priority: 3  },
  { id: 12, name: 'מפרט סוללות',      priority: 3  },
  { id: 13, name: 'מפרט הידראולי',    priority: 3  },
  { id: 14, name: 'תיעוד בקר / ECU',  priority: 4  },
  { id: 15, name: 'תוויות בטיחות',    priority: 2  },
  { id: 16, name: 'בדיקה שנתית',      priority: 3  },
  { id: 17, name: 'תרשים עומסים',     priority: 4  },
]

const BRAND_COLORS: Record<string, string> = {
  JLG:     '#EF4444',
  Genie:   '#3B82F6',
  Dingli:  '#F59E0B',
  Manitou: '#10B981',
}

function coverageColor(pct: number) {
  if (pct >= 70) return '#22C55E'
  if (pct >= 40) return '#F59E0B'
  return '#EF4444'
}

function CoverageBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full" style={{ background: '#E2E8F0' }}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: coverageColor(pct) }} />
      </div>
      <span className="text-xs font-bold w-9 text-left" style={{ color: coverageColor(pct) }}>{pct}%</span>
    </div>
  )
}

function ModelCard({ model }: { model: ModelEntry }) {
  const [open, setOpen] = useState(false)
  const brandColor = BRAND_COLORS[model.brand] || '#64748B'

  return (
    <div className="rounded-xl overflow-hidden mb-2" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
      <button onClick={() => setOpen(o => !o)} className="w-full text-right p-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: brandColor + '22', color: brandColor }}>
              {model.brand}
            </span>
            <span className="font-semibold text-sm" style={{ color: '#1E293B' }}>{model.model}</span>
          </div>
          <CoverageBar pct={model.coveragePct} />
          {model.topMissing.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {model.topMissing.slice(0, 3).map(m => (
                <span key={m.catId} className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#FEF2F2', color: '#EF4444' }}>
                  ✗ {m.catName}
                </span>
              ))}
            </div>
          )}
        </div>
        {open ? <ChevronDown size={16} style={{ color: '#64748B' }} /> : <ChevronRight size={16} style={{ color: '#64748B' }} />}
      </button>

      {open && (
        <div className="border-t" style={{ borderColor: '#E2E8F0' }}>
          <div className="p-3 space-y-1">
            {CATEGORIES_STATIC.sort((a, b) => b.priority - a.priority).map(cat => {
              const docs = model.coverageCells[cat.id]
              const has = docs && docs.length > 0
              return (
                <div key={cat.id} className="flex items-center gap-2 text-sm py-1">
                  {has
                    ? <CheckCircle size={14} style={{ color: '#22C55E', flexShrink: 0 }} />
                    : <XCircle size={14} style={{ color: cat.priority >= 7 ? '#EF4444' : '#94A3B8', flexShrink: 0 }} />
                  }
                  <span style={{ color: has ? '#1E293B' : (cat.priority >= 7 ? '#EF4444' : '#94A3B8') }} className="flex-1">
                    {cat.name}
                  </span>
                  {has && docs[0].url && (
                    <a href={docs[0].url} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-1.5 py-0.5 rounded" style={{ color: '#3B82F6', background: '#EFF6FF' }}>
                      PDF
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AuditPage() {
  const [data, setData] = useState<AuditData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [brandFilter, setBrandFilter] = useState<string>('all')
  const [sortMode, setSortMode] = useState<'critical' | 'alpha' | 'coverage'>('critical')

  useEffect(() => {
    fetch('/api/audit')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const brands = useMemo(() => {
    if (!data) return []
    return Object.keys(data.brandSummary).sort()
  }, [data])

  const filteredModels = useMemo(() => {
    if (!data) return []
    let ms = data.models
    if (brandFilter !== 'all') ms = ms.filter(m => m.brand === brandFilter)
    if (sortMode === 'critical') return [...ms].sort((a, b) => b.criticalityScore - a.criticalityScore)
    if (sortMode === 'coverage') return [...ms].sort((a, b) => a.coveragePct - b.coveragePct)
    return [...ms].sort((a, b) => a.model.localeCompare(b.model))
  }, [data, brandFilter, sortMode])

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8" style={{ border: '2px solid #3B82F6', borderTopColor: 'transparent' }} />
    </div>
  )

  if (error || !data) return (
    <div className="p-4 text-center" style={{ color: '#EF4444' }}>שגיאה: {error}</div>
  )

  return (
    <div className="p-4 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1E293B' }}>מבדק מסמכים</h1>
          <p className="text-xs" style={{ color: '#64748B' }}>17 קטגוריות × {data.totalModels} דגמים</p>
        </div>
        <a href="/api/audit/report" download
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#1E293B' }}>
          <Download size={14} /> דוח
        </a>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-xl p-3 text-center" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div className="text-2xl font-bold" style={{ color: '#1E293B' }}>{data.totalModels}</div>
          <div className="text-xs" style={{ color: '#64748B' }}>דגמים</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div className="text-2xl font-bold" style={{ color: '#1E293B' }}>{data.totalDocs}</div>
          <div className="text-xs" style={{ color: '#64748B' }}>מסמכים</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div className="text-2xl font-bold" style={{ color: coverageColor(data.overallCoverage) }}>{data.overallCoverage}%</div>
          <div className="text-xs" style={{ color: '#64748B' }}>כיסוי כללי</div>
        </div>
      </div>

      {/* Brand summary */}
      <div className="rounded-xl p-3 mb-4" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <div className="text-xs font-bold mb-3" style={{ color: '#64748B' }}>לפי מותג</div>
        <div className="space-y-2">
          {Object.entries(data.brandSummary).sort().map(([brand, s]) => (
            <div key={brand}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="font-semibold" style={{ color: BRAND_COLORS[brand] || '#1E293B' }}>{brand}</span>
                <span style={{ color: '#64748B' }}>{s.models} דגמים • {s.total} מסמכים</span>
              </div>
              <CoverageBar pct={s.coverage} />
            </div>
          ))}
        </div>
      </div>

      {/* Alert: critical missing */}
      {data.models.some(m => !m.coverageCells[2]) && (
        <div className="flex items-start gap-2 rounded-xl p-3 mb-4" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <AlertTriangle size={16} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
          <div className="text-xs" style={{ color: '#B91C1C' }}>
            <strong>{data.models.filter(m => !m.coverageCells[2]).length} דגמים</strong> חסרי מדריך שירות (קריטי ביותר)
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        <button onClick={() => setBrandFilter('all')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0"
          style={{ background: brandFilter === 'all' ? '#1E293B' : '#E2E8F0', color: brandFilter === 'all' ? '#fff' : '#1E293B' }}>
          הכל
        </button>
        {brands.map(b => (
          <button key={b} onClick={() => setBrandFilter(b)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0"
            style={{ background: brandFilter === b ? (BRAND_COLORS[b] || '#1E293B') : '#E2E8F0', color: brandFilter === b ? '#fff' : '#1E293B' }}>
            {b}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-1 mb-3">
        {[
          { key: 'critical', label: 'חסרים קריטיים' },
          { key: 'coverage', label: 'כיסוי נמוך' },
          { key: 'alpha', label: 'א-ב' },
        ].map(s => (
          <button key={s.key} onClick={() => setSortMode(s.key as typeof sortMode)}
            className="px-2.5 py-1 rounded-lg text-xs"
            style={{ background: sortMode === s.key ? '#3B82F6' : '#E2E8F0', color: sortMode === s.key ? '#fff' : '#64748B' }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Model list */}
      <div>
        {filteredModels.map(m => (
          <ModelCard key={`${m.brand}|${m.model}`} model={m} />
        ))}
      </div>

      {/* Footer */}
      <div className="text-center text-xs py-6" style={{ color: '#94A3B8' }}>
        נוצר {new Date(data.generatedAt).toLocaleDateString('he-IL')}
      </div>
    </div>
  )
}
