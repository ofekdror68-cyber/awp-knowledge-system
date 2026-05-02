'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, AlertTriangle, CheckCircle, Loader, DollarSign } from 'lucide-react'

interface LayerStat { layer: number; done: number; pct: number }
interface Stats {
  total: number
  layers: LayerStat[]
  totalCostCents: number
  quarantined: number
}

const LAYER_NAMES = [
  '', 'חילוץ טקסט', 'ניתוח ויזואלי', 'פירוק סמנטי',
  'חילוץ ישויות', 'מיפוי קשרים', 'מוח אבחון', 'אינדקס וקטורי',
]

const LAYER_DESC = [
  '',
  'מחלץ טקסט מכל PDF לפי עמוד',
  'Claude מנתח כל עמוד — זיהוי סכמות, חלקים, קודי תקלה',
  'פירוק לנתחי משמעות (לא לפי גודל)',
  'חילוץ ישויות: חלקים, קודי תקלה, נהלים, מפרטים',
  'מיפוי קשרים בין ישויות — בונה את הגרף',
  'מוח אבחון: לכל קוד תקלה — עץ סיבות, רצף בדיקות',
  'אינדקס וקטורי לחיפוש סמנטי (דורש OPENAI_API_KEY)',
]

function ProgressBar({ pct, color = '#3B82F6' }: { pct: number; color?: string }) {
  return (
    <div className="w-full h-3 rounded-full" style={{ background: '#E2E8F0' }}>
      <div
        className="h-3 rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: pct === 100 ? '#22C55E' : color }}
      />
    </div>
  )
}

export default function ProcessingPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [running, setRunning] = useState(false)
  const [currentLayer, setCurrentLayer] = useState(1)
  const [log, setLog] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const stopRef = useRef(false)
  const logRef = useRef<HTMLDivElement>(null)

  const addLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString('he-IL')
    setLog(p => [...p.slice(-200), `[${time}] ${msg}`])
    setTimeout(() => logRef.current?.scrollTo(0, logRef.current.scrollHeight), 50)
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch('/api/processing/status')
      if (r.ok) setStats(await r.json())
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  async function runAll() {
    stopRef.current = false
    setRunning(true)
    setError(null)
    addLog('מתחיל עיבוד מלא — 7 שכבות')

    for (let layer = 1; layer <= 7; layer++) {
      if (stopRef.current) { addLog('עצור על ידי משתמש'); break }
      setCurrentLayer(layer)
      addLog(`▶ שכבה ${layer}: ${LAYER_NAMES[layer]}`)

      let hasMore = true
      while (hasMore && !stopRef.current) {
        try {
          const r = await fetch('/api/processing/run-layer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ layer, batchSize: layer <= 2 ? 3 : 5 }),
          })
          const data: {
            error?: string; costDollars?: number; processed?: number; errors?: number
            results?: Array<{ docId: string; success: boolean; error?: string }>
            stats?: Stats
          } = await r.json()

          if (r.status === 429) {
            setError(data.error || 'גבול עלות')
            addLog(`⚠ עצור: ${data.error} ($${data.costDollars?.toFixed(2)})`)
            setRunning(false)
            return
          }

          if (!r.ok) throw new Error(data.error || 'שגיאת שרת')

          const processed = data.processed || 0
          const errors = data.errors || 0
          if (data.stats) setStats(data.stats)

          if (errors > 0) addLog(`  ✗ ${errors} שגיאות`)
          if (processed > 0) addLog(`  ✓ עובד ${processed} מסמכים`)
          if (data.results) {
            for (const r2 of data.results) {
              if (!r2.success && r2.error) addLog(`  ! ${r2.docId.substring(0, 8)}… — ${r2.error}`)
            }
          }

          hasMore = processed > 0
          if (!hasMore) addLog(`  ✓ שכבה ${layer} הושלמה`)
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          addLog(`  ✗ שגיאה: ${msg}`)
          hasMore = false
        }
      }
    }

    if (!stopRef.current) addLog('✅ עיבוד מלא הושלם!')
    setRunning(false)
    fetchStats()
  }

  async function runSingleLayer(layer: number) {
    setRunning(true)
    setCurrentLayer(layer)
    addLog(`▶ מריץ שכבה ${layer} בלבד`)

    let hasMore = true
    while (hasMore && !stopRef.current) {
      try {
        const r = await fetch('/api/processing/run-layer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ layer, batchSize: 3 }),
        })
        const data: {
          error?: string; processed?: number; errors?: number; stats?: Stats
        } = await r.json()
        if (!r.ok) throw new Error(data.error || 'שגיאה')
        if (data.stats) setStats(data.stats)
        hasMore = (data.processed || 0) > 0
        if (hasMore) addLog(`  ✓ ${data.processed} מסמכים`)
      } catch (err) {
        addLog(`  ✗ ${err instanceof Error ? err.message : String(err)}`)
        hasMore = false
      }
    }

    addLog(`  ✓ שכבה ${layer} הושלמה`)
    setRunning(false)
    fetchStats()
  }

  const totalCostDollars = (stats?.totalCostCents || 0) / 100

  return (
    <div dir="rtl" className="p-4 max-w-2xl mx-auto">

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1E293B' }}>מנוע עיבוד ידע</h1>
          <p className="text-xs" style={{ color: '#64748B' }}>7 שכבות • {stats?.total || 0} מסמכים</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: totalCostDollars > 150 ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${totalCostDollars > 150 ? '#FECACA' : '#BBF7D0'}` }}>
          <DollarSign size={14} style={{ color: totalCostDollars > 150 ? '#EF4444' : '#16A34A' }} />
          <span className="text-sm font-bold" style={{ color: totalCostDollars > 150 ? '#EF4444' : '#16A34A' }}>${totalCostDollars.toFixed(2)}</span>
          <span className="text-xs" style={{ color: '#64748B' }}>/ $200</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <AlertTriangle size={16} style={{ color: '#EF4444' }} />
          <span className="text-sm" style={{ color: '#B91C1C' }}>{error}</span>
        </div>
      )}

      {/* Layer progress */}
      <div className="rounded-xl p-4 mb-4" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold" style={{ color: '#1E293B' }}>התקדמות לפי שכבה</span>
          {stats && <span className="text-xs" style={{ color: '#64748B' }}>{stats.quarantined} מסמכים בהסגר</span>}
        </div>
        <div className="space-y-3">
          {(stats?.layers || Array.from({ length: 7 }, (_, i) => ({ layer: i + 1, done: 0, pct: 0 }))).map(l => (
            <div key={l.layer}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {l.pct === 100
                    ? <CheckCircle size={14} style={{ color: '#22C55E' }} />
                    : running && currentLayer === l.layer
                      ? <Loader size={14} className="animate-spin" style={{ color: '#3B82F6' }} />
                      : <div className="w-3.5 h-3.5 rounded-full" style={{ background: '#E2E8F0' }} />
                  }
                  <span className="text-xs font-semibold" style={{ color: '#1E293B' }}>
                    {l.layer}. {LAYER_NAMES[l.layer]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: '#64748B' }}>{l.done}/{stats?.total || 183}</span>
                  <button
                    onClick={() => !running && runSingleLayer(l.layer)}
                    disabled={running}
                    className="text-xs px-2 py-0.5 rounded disabled:opacity-40"
                    style={{ background: '#EFF6FF', color: '#3B82F6' }}
                  >
                    ▶
                  </button>
                </div>
              </div>
              <ProgressBar pct={l.pct} />
              <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{LAYER_DESC[l.layer]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-4">
        {!running ? (
          <button
            onClick={runAll}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white"
            style={{ background: '#1E293B' }}
          >
            <Play size={16} />
            הפעל עיבוד מלא (כל 7 שכבות)
          </button>
        ) : (
          <button
            onClick={() => { stopRef.current = true; setRunning(false) }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold"
            style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' }}
          >
            <Pause size={16} />
            עצור
          </button>
        )}
        <button
          onClick={fetchStats}
          disabled={running}
          className="px-4 py-3 rounded-xl text-sm disabled:opacity-40"
          style={{ background: '#F1F5F9', color: '#64748B' }}
        >
          רענן
        </button>
      </div>

      {/* Log */}
      <div
        ref={logRef}
        className="rounded-xl p-3 font-mono text-xs overflow-y-auto"
        style={{ background: '#0F172A', color: '#94A3B8', maxHeight: 280, direction: 'ltr' }}
      >
        {log.length === 0 && <span style={{ color: '#475569' }}>// לחץ "הפעל עיבוד מלא" כדי להתחיל</span>}
        {log.map((line, i) => (
          <div key={i} style={{
            color: line.includes('✓') ? '#22C55E' : line.includes('✗') || line.includes('!') ? '#EF4444' : line.includes('▶') ? '#60A5FA' : '#94A3B8'
          }}>
            {line}
          </div>
        ))}
      </div>

      <div className="text-center text-xs py-4" style={{ color: '#94A3B8' }}>
        שכבות 1-3 ≈ $40-50 • שכבות 4-6 ≈ $50-70 • שכבה 7 דורש OPENAI_API_KEY
      </div>
    </div>
  )
}
