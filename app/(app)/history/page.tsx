'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { he } from 'date-fns/locale'

type Repair = {
  id: string
  machine_model: string | null
  system_category: string | null
  symptom: string
  diagnosis_given: string | null
  actual_fix: string | null
  worked: boolean | null
  created_at: string
  resolved_at: string | null
}

export default function HistoryPage() {
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/repair-history?limit=100')
    const data = await res.json()
    setRepairs(data.repairs || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const stats = {
    total: repairs.length,
    worked: repairs.filter(r => r.worked === true).length,
    failed: repairs.filter(r => r.worked === false).length,
    pending: repairs.filter(r => r.worked === null).length,
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-7 w-7" style={{ border: '2px solid #3B82F6', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-4">היסטוריית תיקונים</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="rounded-xl p-3 text-center" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
          <div className="text-xs text-slate-400">סה"כ</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <div className="text-2xl font-bold text-green-600">{stats.worked}</div>
          <div className="text-xs text-slate-400">נפתרו</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
          <div className="text-xs text-slate-400">לא עבד</div>
        </div>
      </div>

      {repairs.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Clock size={40} className="mx-auto mb-3 opacity-30" />
          <p>אין היסטוריה עדיין</p>
          <p className="text-xs mt-1">אבחונים מ-/diagnose יופיעו כאן</p>
        </div>
      ) : (
        <div className="space-y-2">
          {repairs.map(r => (
            <div key={r.id} className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
              <button className="w-full text-right p-4 flex items-center gap-3"
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                <div className="flex-shrink-0">
                  {r.worked === true ? <CheckCircle size={20} color="#22C55E" /> :
                   r.worked === false ? <XCircle size={20} color="#EF4444" /> :
                   <Clock size={20} color="#94A3B8" />}
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <div className="text-sm font-medium text-slate-800 truncate">{r.symptom}</div>
                  <div className="text-xs text-slate-400">
                    {[r.machine_model, r.system_category].filter(Boolean).join(' • ')} •{' '}
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: he })}
                  </div>
                </div>
                {expanded === r.id ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
              </button>

              {expanded === r.id && (
                <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: '#F1F5F9' }}>
                  {r.actual_fix && (
                    <div className="rounded-lg p-3" style={{ background: '#F0FDF4' }}>
                      <p className="text-xs font-semibold text-green-700 mb-1">מה עבד:</p>
                      <p className="text-sm text-green-800">{r.actual_fix}</p>
                    </div>
                  )}
                  {r.diagnosis_given && (
                    <details className="text-xs text-slate-400">
                      <summary className="cursor-pointer mb-1">אבחון מקורי</summary>
                      <pre className="overflow-auto text-slate-500 whitespace-pre-wrap">
                        {(() => {
                          try {
                            const d = JSON.parse(r.diagnosis_given)
                            return d.suspects?.map((s: { cause: string; probability: number }) => `${s.cause} (${s.probability}%)`).join('\n') || r.diagnosis_given
                          } catch { return r.diagnosis_given }
                        })()}
                      </pre>
                    </details>
                  )}
                  <p className="text-xs text-slate-300">
                    {format(new Date(r.created_at), 'dd/MM/yyyy HH:mm')}
                    {r.resolved_at && ` — נסגר ${format(new Date(r.resolved_at), 'dd/MM/yyyy HH:mm')}`}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
