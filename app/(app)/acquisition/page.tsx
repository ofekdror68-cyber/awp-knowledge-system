'use client'

import { useEffect, useState, useCallback } from 'react'
import { Download, RefreshCw, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react'

interface AcquisitionStats {
  pending: number
  inProgress: number
  completed: number
  failed: number
  manualRequired: number
  forumThreads: number
}

interface QueueItem {
  id: string
  brand: string
  model: string
  category: number
  category_name: string
  current_agent?: string
  retry_count?: number
  error_log?: string
  attempted_urls?: string[]
  saved_path?: string
  file_size_bytes?: number
  updated_at?: string
}

interface AcquisitionData {
  stats: AcquisitionStats
  inProgress: QueueItem[]
  manualRequired: QueueItem[]
  recent: QueueItem[]
  generatedAt: string
}

const BRAND_COLORS: Record<string, string> = {
  JLG: '#E63946',
  Genie: '#457B9D',
  Dingli: '#2D6A4F',
  Manitou: '#F4A261',
}

export default function AcquisitionPage() {
  const [data, setData] = useState<AcquisitionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'manual'>('overview')

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/acquisition')
      if (res.ok) setData(await res.json())
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [fetchData])

  const startAcquisition = async () => {
    setStarting(true)
    try {
      await fetch('/api/acquisition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', batchSize: 20, includeForums: true }),
      })
      setTimeout(fetchData, 3000)
    } finally {
      setStarting(false)
    }
  }

  const resetFailed = async () => {
    await fetch('/api/acquisition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset_failed' }),
    })
    fetchData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw size={32} className="animate-spin mx-auto mb-3" style={{ color: '#3B82F6' }} />
          <p style={{ color: '#64748B' }}>טוען...</p>
        </div>
      </div>
    )
  }

  const stats = data?.stats
  const total = (stats?.pending || 0) + (stats?.inProgress || 0) + (stats?.completed || 0) + (stats?.failed || 0) + (stats?.manualRequired || 0)
  const completedPct = total > 0 ? Math.round(((stats?.completed || 0) / total) * 100) : 0

  return (
    <div className="p-4 max-w-2xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1E293B' }}>רכישת מסמכים</h1>
          <p className="text-sm" style={{ color: '#64748B' }}>מנוע האיסוף האוטומטי</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-lg"
          style={{ background: '#F1F5F9' }}
        >
          <RefreshCw size={18} style={{ color: '#64748B' }} />
        </button>
      </div>

      {/* Start Button */}
      <button
        onClick={startAcquisition}
        disabled={starting}
        className="w-full py-3 rounded-xl font-semibold text-white mb-4 flex items-center justify-center gap-2"
        style={{ background: starting ? '#94A3B8' : '#3B82F6' }}
      >
        <Download size={20} />
        {starting ? 'מאתחל מחזור איסוף...' : 'התחל מחזור איסוף חדש'}
      </button>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'ממתינים', value: stats?.pending || 0, color: '#F59E0B', icon: Clock },
          { label: 'הושלמו', value: stats?.completed || 0, color: '#10B981', icon: CheckCircle },
          { label: 'ידני', value: stats?.manualRequired || 0, color: '#EF4444', icon: AlertTriangle },
          { label: 'נכשלו', value: stats?.failed || 0, color: '#6B7280', icon: AlertTriangle },
          { label: 'פורומים', value: stats?.forumThreads || 0, color: '#8B5CF6', icon: Users },
          { label: '% הושלם', value: `${completedPct}%`, color: '#3B82F6', icon: Download },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-xl p-3 text-center" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Icon size={16} style={{ color, margin: '0 auto 4px' }} />
            <div className="text-lg font-bold" style={{ color }}>{value}</div>
            <div className="text-xs" style={{ color: '#94A3B8' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {total > 0 && (
        <div className="mb-4 rounded-xl p-4" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div className="flex justify-between text-sm mb-2" style={{ color: '#475569' }}>
            <span>התקדמות כוללת</span>
            <span>{stats?.completed || 0} / {total}</span>
          </div>
          <div className="rounded-full h-3 overflow-hidden" style={{ background: '#E2E8F0' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${completedPct}%`, background: 'linear-gradient(90deg, #3B82F6, #10B981)' }}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'overview', label: 'פעילות אחרונה' },
          { key: 'manual', label: `נדרש ידני (${stats?.manualRequired || 0})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as 'overview' | 'manual')}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: activeTab === key ? '#3B82F6' : '#F1F5F9',
              color: activeTab === key ? '#FFFFFF' : '#475569',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-2">
          {(data?.inProgress || []).length > 0 && (
            <div className="rounded-xl p-3" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: '#1D4ED8' }}>מעובד כעת</p>
              {(data?.inProgress || []).map(item => (
                <div key={item.id} className="text-sm py-1" style={{ color: '#1D4ED8' }}>
                  <RefreshCw size={12} className="inline animate-spin ml-1" />
                  {item.brand} {item.model} — {item.category_name} ({item.current_agent})
                </div>
              ))}
            </div>
          )}

          {(data?.recent || []).slice(0, 20).map(item => (
            <div key={item.id} className="rounded-xl p-3 flex items-start gap-3" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <div
                className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                style={{ background: item.saved_path ? '#10B981' : '#EF4444' }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: '#1E293B' }}>
                  {item.brand} {item.model}
                </div>
                <div className="text-xs" style={{ color: '#64748B' }}>{item.category_name}</div>
                {item.saved_path && (
                  <div className="text-xs mt-0.5" style={{ color: '#10B981' }}>
                    ✓ {item.file_size_bytes ? `${Math.round(item.file_size_bytes / 1024)}KB` : 'נשמר'}
                  </div>
                )}
                {item.error_log && (
                  <div className="text-xs mt-0.5 truncate" style={{ color: '#EF4444' }}>{item.error_log.substring(0, 80)}</div>
                )}
              </div>
            </div>
          ))}

          {(data?.stats.failed || 0) > 0 && (
            <button
              onClick={resetFailed}
              className="w-full py-2 rounded-lg text-sm"
              style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }}
            >
              נסה שוב {stats?.failed} פריטים שנכשלו
            </button>
          )}
        </div>
      )}

      {/* Manual Required Tab */}
      {activeTab === 'manual' && (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: '#64748B' }}>
            פריטים שכל 4 הסוכנים לא הצליחו למצוא. דורשים פנייה ידנית ליבואן.
          </p>
          {(data?.manualRequired || []).map(item => (
            <div key={item.id} className="rounded-xl p-4" style={{ background: '#FFFFFF', border: '1px solid #FCA5A5' }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white ml-2"
                    style={{ background: BRAND_COLORS[item.brand] || '#64748B' }}
                  >
                    {item.brand}
                  </span>
                  <span className="font-semibold text-sm" style={{ color: '#1E293B' }}>{item.model}</span>
                </div>
                <span className="text-xs" style={{ color: '#94A3B8' }}>קטגוריה {item.category}</span>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: '#374151' }}>{item.category_name}</p>
              {item.error_log && (
                <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{item.error_log.substring(0, 150)}</p>
              )}
              <div className="mt-2 text-xs" style={{ color: '#6B7280' }}>
                {item.attempted_urls?.length || 0} URLs נוסו
              </div>
            </div>
          ))}
          {(data?.manualRequired || []).length === 0 && (
            <div className="text-center py-8" style={{ color: '#64748B' }}>
              <CheckCircle size={32} className="mx-auto mb-2" style={{ color: '#10B981' }} />
              <p>אין פריטים שדורשים טיפול ידני</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
