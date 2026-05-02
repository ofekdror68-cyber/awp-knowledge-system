'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, ThumbsUp, ThumbsDown, ExternalLink, Filter } from 'lucide-react'

interface CommunityItem {
  id: string
  source_url: string
  source_name: string
  brand: string | null
  model: string | null
  system_category: string
  fault_code: string | null
  symptom: string
  solution: string | null
  mechanic_advice: string[]
  confidence: number
  quality: number
  local_score: number
  scraped_at: string
}

const BRANDS = ['', 'JLG', 'Genie', 'Dingli', 'Manitou']
const SYSTEMS = ['', 'hydraulic', 'electrical', 'engine', 'drive', 'safety', 'control', 'other']
const SYSTEM_LABELS: Record<string, string> = {
  hydraulic: 'הידראוליקה', electrical: 'חשמל', engine: 'מנוע',
  drive: 'הנעה', safety: 'בטיחות', control: 'בקרה', other: 'אחר',
}
const BRAND_COLORS: Record<string, string> = {
  JLG: '#E63946', Genie: '#457B9D', Dingli: '#2D6A4F', Manitou: '#F4A261',
}

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{ color: i < value ? '#F59E0B' : '#E2E8F0' }}>★</span>
      ))}
    </span>
  )
}

export default function CommunityPage() {
  const [items, setItems] = useState<CommunityItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [brand, setBrand] = useState('')
  const [system, setSystem] = useState('')
  const [page, setPage] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({})
  const PAGE_SIZE = 15

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), page: String(page) })
    if (q) params.set('q', q)
    if (brand) params.set('brand', brand)
    if (system) params.set('system', system)
    try {
      const res = await fetch(`/api/community?${params}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
        setTotal(data.total || 0)
      }
    } finally {
      setLoading(false)
    }
  }, [q, brand, system, page])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const sendFeedback = async (id: string, helpful: boolean) => {
    setFeedback(prev => ({ ...prev, [id]: helpful ? 'up' : 'down' }))
    await fetch('/api/community/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, helpful }),
    })
  }

  return (
    <div className="p-4 max-w-2xl mx-auto" dir="rtl">
      <div className="mb-4">
        <h1 className="text-xl font-bold" style={{ color: '#1E293B' }}>ידע קהילתי</h1>
        <p className="text-sm" style={{ color: '#64748B' }}>{total} פתרונות ממכונאים בשטח</p>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute top-3 right-3" style={{ color: '#94A3B8' }} />
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setPage(0) }}
          placeholder="חפש תסמין, קוד שגיאה, פתרון..."
          className="w-full pr-9 pl-3 py-2.5 rounded-xl text-sm border"
          style={{ background: '#FFFFFF', borderColor: '#E2E8F0', outline: 'none', direction: 'rtl' }}
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm"
          style={{ background: showFilters ? '#EFF6FF' : '#F1F5F9', color: showFilters ? '#3B82F6' : '#475569' }}
        >
          <Filter size={14} />
          פילטרים
          {(brand || system) && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
        </button>
        {(brand || system || q) && (
          <button
            onClick={() => { setBrand(''); setSystem(''); setQ(''); setPage(0) }}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ background: '#FEF2F2', color: '#EF4444' }}
          >
            נקה הכל
          </button>
        )}
      </div>

      {showFilters && (
        <div className="rounded-xl p-3 mb-3 grid grid-cols-2 gap-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: '#475569' }}>מותג</label>
            <select
              value={brand}
              onChange={e => { setBrand(e.target.value); setPage(0) }}
              className="w-full px-2 py-1.5 rounded-lg text-sm border"
              style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}
            >
              {BRANDS.map(b => <option key={b} value={b}>{b || 'הכל'}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: '#475569' }}>מערכת</label>
            <select
              value={system}
              onChange={e => { setSystem(e.target.value); setPage(0) }}
              className="w-full px-2 py-1.5 rounded-lg text-sm border"
              style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}
            >
              {SYSTEMS.map(s => <option key={s} value={s}>{s ? (SYSTEM_LABELS[s] || s) : 'הכל'}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Items */}
      {loading ? (
        <div className="text-center py-10" style={{ color: '#64748B' }}>טוען...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-10" style={{ color: '#94A3B8' }}>
          <p>אין תוצאות</p>
          <p className="text-xs mt-1">הסוכן יסרוק פורומים בקרוב</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div
              key={item.id}
              className="rounded-xl p-4"
              style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex flex-wrap gap-1.5">
                  {item.brand && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: BRAND_COLORS[item.brand] || '#64748B' }}
                    >
                      {item.brand}
                    </span>
                  )}
                  {item.model && item.model !== 'general' && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#475569' }}>
                      {item.model}
                    </span>
                  )}
                  {item.fault_code && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: '#FEF3C7', color: '#92400E' }}>
                      קוד: {item.fault_code}
                    </span>
                  )}
                  {item.system_category && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                      {SYSTEM_LABELS[item.system_category] || item.system_category}
                    </span>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <StarRating value={item.quality} />
                </div>
              </div>

              {/* Symptom */}
              <p className="text-sm font-medium mb-1.5" style={{ color: '#1E293B' }}>
                {item.symptom}
              </p>

              {/* Solution */}
              {item.solution && (
                <div className="rounded-lg p-2.5 mb-2" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: '#166534' }}>פתרון:</p>
                  <p className="text-sm" style={{ color: '#15803D' }}>{item.solution}</p>
                </div>
              )}

              {/* Mechanic advice */}
              {item.mechanic_advice && item.mechanic_advice.length > 0 && (
                <ul className="text-xs mb-2 space-y-0.5" style={{ color: '#475569' }}>
                  {item.mechanic_advice.slice(0, 3).map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #F1F5F9' }}>
                <div className="flex items-center gap-1 text-xs" style={{ color: '#94A3B8' }}>
                  <span>{item.source_name}</span>
                  <a href={item.source_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={11} />
                  </a>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => sendFeedback(item.id, true)}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                    style={{
                      background: feedback[item.id] === 'up' ? '#DCFCE7' : '#F8FAFC',
                      color: feedback[item.id] === 'up' ? '#16A34A' : '#94A3B8',
                    }}
                  >
                    <ThumbsUp size={12} />
                    עזר
                  </button>
                  <button
                    onClick={() => sendFeedback(item.id, false)}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                    style={{
                      background: feedback[item.id] === 'down' ? '#FEF2F2' : '#F8FAFC',
                      color: feedback[item.id] === 'down' ? '#EF4444' : '#94A3B8',
                    }}
                  >
                    <ThumbsDown size={12} />
                    לא
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {total > PAGE_SIZE && (
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ background: '#F1F5F9', color: page === 0 ? '#CBD5E1' : '#475569' }}
              >
                הקודם
              </button>
              <span className="text-sm" style={{ color: '#64748B' }}>
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} מתוך {total}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={(page + 1) * PAGE_SIZE >= total}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ background: '#F1F5F9', color: (page + 1) * PAGE_SIZE >= total ? '#CBD5E1' : '#475569' }}
              >
                הבא
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
