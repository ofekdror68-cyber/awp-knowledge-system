'use client'

import { useState, useEffect, useCallback } from 'react'
import { Brain, AlertTriangle, CheckCircle, Clock, TrendingDown, X, ChevronDown, ChevronUp, Wrench, RefreshCw } from 'lucide-react'
import type { Prediction, FleetMachine } from '@/lib/predictive/types'
import { labelFor } from '@/lib/predictive/types'

// ─── Probability bar ─────────────────────────────────────────────────────────
function ProbBar({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const color = value >= 70 ? '#DC2626' : value >= 50 ? '#D97706' : '#16A34A'
  const h = size === 'sm' ? 4 : 6
  return (
    <div className="flex items-center gap-2">
      <div style={{ height: h, borderRadius: 99, background: '#E2E8F0', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.4s' }} />
      </div>
      <span style={{ color, fontWeight: 700, fontSize: size === 'sm' ? 11 : 13, minWidth: 32 }}>{value}%</span>
    </div>
  )
}

// ─── Prediction card ─────────────────────────────────────────────────────────
function PredictionCard({
  pred,
  onAck,
  onPrevent,
  onDismiss,
}: {
  pred: Prediction & { fleet_machines?: FleetMachine }
  onAck: (id: string) => void
  onPrevent: (id: string) => void
  onDismiss: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const m = pred.fleet_machines
  const urgency = pred.probability >= 70 ? 'red' : pred.probability >= 50 ? 'yellow' : 'green'
  const colors = {
    red: { bg: 'rgba(220,38,38,.08)', border: 'rgba(220,38,38,.3)', text: '#B91C1C', dot: '#DC2626' },
    yellow: { bg: 'rgba(217,119,6,.08)', border: 'rgba(217,119,6,.3)', text: '#B45309', dot: '#D97706' },
    green: { bg: 'rgba(22,163,74,.08)', border: 'rgba(22,163,74,.3)', text: '#15803D', dot: '#16A34A' },
  }
  const c = colors[urgency]

  const daysLabel =
    pred.predicted_window_days_min === pred.predicted_window_days_max
      ? `תוך ${pred.predicted_window_days_max} ימים`
      : `תוך ${pred.predicted_window_days_min}–${pred.predicted_window_days_max} ימים`

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: `1px solid ${c.border}` }}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: c.dot }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-sm" style={{ color: '#1E293B' }}>
                {m ? `${m.brand} ${m.model}` : 'מכונה'}
              </span>
              {m?.mavaatz && m.mavaatz !== '-' && (
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#64748B' }}>
                  מע"צ {m.mavaatz}
                </span>
              )}
              {pred.status !== 'active' && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: '#E0F2FE', color: '#0369A1' }}>
                  {pred.status === 'acknowledged' ? 'אושר' : pred.status === 'prevented' ? 'טופל' : pred.status}
                </span>
              )}
            </div>

            <div className="font-semibold text-base mb-2" style={{ color: c.text }}>
              {labelFor(pred.predicted_failure_type)}
              {pred.predicted_component && (
                <span className="font-normal text-sm" style={{ color: '#64748B' }}> · "{pred.predicted_component}"</span>
              )}
            </div>

            <ProbBar value={pred.probability} />

            <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: '#64748B' }}>
              <span className="flex items-center gap-1">
                <Clock size={11} />{daysLabel}
              </span>
              {m?.location && <span>📍 {m.location}</span>}
              <span>ביטחון {pred.confidence}%</span>
            </div>

            {pred.recommended_action && (
              <div className="mt-2 text-sm rounded-xl px-3 py-2" style={{ background: '#F8FAFC', color: '#334155' }}>
                <span className="font-medium">מומלץ: </span>{pred.recommended_action}
              </div>
            )}

            {(pred.recommended_action_cost_estimate || pred.cost_if_ignored_estimate) && (
              <div className="flex gap-3 mt-2 text-xs">
                {pred.recommended_action_cost_estimate && (
                  <span style={{ color: '#16A34A' }}>✓ עלות מנע: {pred.recommended_action_cost_estimate}</span>
                )}
                {pred.cost_if_ignored_estimate && (
                  <span style={{ color: '#DC2626' }}>✗ עלות כשל: {pred.cost_if_ignored_estimate}</span>
                )}
              </div>
            )}
          </div>

          <button onClick={() => setExpanded(!expanded)} className="flex-shrink-0 p-1" style={{ color: '#94A3B8' }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded: reasoning + evidence */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: '#F1F5F9' }}>
          <div className="pt-3">
            <div className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>הנמקה</div>
            <p className="text-sm" style={{ color: '#475569' }}>{pred.reasoning}</p>
          </div>

          {pred.evidence && Object.keys(pred.evidence).length > 0 && (
            <div>
              <div className="text-xs font-semibold mb-1" style={{ color: '#94A3B8' }}>ראיות</div>
              <div className="space-y-1">
                {pred.evidence.current_hours_vs_typical && (
                  <div className="text-xs" style={{ color: '#64748B' }}>⏱ {pred.evidence.current_hours_vs_typical}</div>
                )}
                {pred.evidence.fleet_pattern_match && (
                  <div className="text-xs" style={{ color: '#64748B' }}>📊 {pred.evidence.fleet_pattern_match}</div>
                )}
                {pred.evidence.precursor_signals_found && pred.evidence.precursor_signals_found.length > 0 && (
                  <div className="text-xs" style={{ color: '#64748B' }}>
                    ⚠️ סימני אזהרה: {pred.evidence.precursor_signals_found.join(', ')}
                  </div>
                )}
                {pred.evidence.similar_recent_failures && pred.evidence.similar_recent_failures.length > 0 && (
                  <div className="text-xs" style={{ color: '#64748B' }}>
                    🔁 תקלות דומות אחרונות: {pred.evidence.similar_recent_failures.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {pred.status === 'active' && (
            <div className="flex gap-2 pt-1">
              <button onClick={() => onPrevent(pred.id)}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
                style={{ background: '#16A34A' }}>
                ✓ טיפלתי
              </button>
              <button onClick={() => onAck(pred.id)}
                className="flex-1 py-2 rounded-xl text-xs font-bold"
                style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                👁 ראיתי
              </button>
              <button onClick={() => onDismiss(pred.id)}
                className="px-3 py-2 rounded-xl text-xs"
                style={{ background: '#F1F5F9', color: '#94A3B8' }}>
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Fleet heatmap ───────────────────────────────────────────────────────────
function FleetGrid({
  fleet,
  predictions,
  selectedMachine,
  onSelect,
}: {
  fleet: FleetMachine[]
  predictions: Prediction[]
  selectedMachine: string | null
  onSelect: (id: string | null) => void
}) {
  const machineRisk: Record<string, number> = {}
  for (const p of predictions) {
    if (!machineRisk[p.machine_id] || p.probability > machineRisk[p.machine_id]) {
      machineRisk[p.machine_id] = p.probability
    }
  }

  function dotColor(id: string) {
    const risk = machineRisk[id] || 0
    if (risk >= 70) return '#DC2626'
    if (risk >= 50) return '#D97706'
    if (risk > 0) return '#F59E0B'
    return '#16A34A'
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
      <div className="font-semibold text-sm mb-3" style={{ color: '#1E293B' }}>מפת מצי</div>
      <div className="flex flex-wrap gap-1.5">
        {fleet.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(selectedMachine === m.id ? null : m.id)}
            title={`${m.brand} ${m.model} מע"צ-${m.mavaatz}`}
            className="w-8 h-8 rounded-lg text-[9px] font-bold text-white flex items-center justify-center transition-all"
            style={{
              background: m.status === 'in_repair' ? '#94A3B8' : dotColor(m.id),
              outline: selectedMachine === m.id ? '2px solid #1E293B' : 'none',
              outlineOffset: 1,
            }}>
            {m.mavaatz !== '-' ? m.mavaatz : m.serial_number?.slice(-3)}
          </button>
        ))}
      </div>
      <div className="flex gap-4 mt-3 text-xs" style={{ color: '#64748B' }}>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600 inline-block" /> דחוף</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> לב</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600 inline-block" /> תקין</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> בתיקון</span>
      </div>
    </div>
  )
}

// ─── Hours update modal ──────────────────────────────────────────────────────
function HoursModal({ fleet, onClose }: { fleet: FleetMachine[]; onClose: () => void }) {
  const [machineId, setMachineId] = useState('')
  const [hours, setHours] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function submit() {
    if (!machineId || !hours) return
    setLoading(true)
    await fetch(`/api/fleet-machines/${machineId}/hours`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hours: parseInt(hours), source: 'manual_entry', recorded_by: 'אופק' }),
    })
    setLoading(false)
    setDone(true)
    setTimeout(onClose, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full rounded-t-2xl p-5 space-y-4" style={{ background: '#FFFFFF' }}>
        <div className="flex justify-between items-center">
          <div className="font-bold text-lg" style={{ color: '#1E293B' }}>עדכון שעות מכונה</div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#E2E8F0' }}>
            <X size={16} />
          </button>
        </div>

        {done ? (
          <div className="py-6 text-center text-green-600 font-bold">✓ עודכן בהצלחה</div>
        ) : (
          <>
            <select value={machineId} onChange={(e) => setMachineId(e.target.value)}
              className="w-full px-3 py-3 rounded-xl text-sm outline-none"
              style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#1E293B' }}>
              <option value="">בחר מכונה...</option>
              {fleet.filter((m) => m.status !== 'retired').map((m) => (
                <option key={m.id} value={m.id}>
                  {m.mavaatz !== '-' ? `מע"צ-${m.mavaatz} · ` : ''}{m.brand} {m.model} ({m.serial_number})
                </option>
              ))}
            </select>

            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="שעות נוכחיות (למשל: 1247)"
              className="w-full px-3 py-3 rounded-xl text-sm outline-none"
              style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#1E293B' }}
            />

            <button onClick={submit} disabled={!machineId || !hours || loading}
              className="w-full py-3 rounded-xl font-bold text-white"
              style={{ background: machineId && hours ? '#3B82F6' : '#CBD5E1' }}>
              {loading ? 'שומר...' : 'שמור שעות'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Feedback log ────────────────────────────────────────────────────────────
function FeedbackLog({ items }: { items: Prediction[] }) {
  if (!items.length) return null
  return (
    <div className="rounded-2xl p-4 space-y-2" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
      <div className="font-semibold text-sm mb-3" style={{ color: '#1E293B' }}>יומן דיוק תחזיות</div>
      {items.map((p) => {
        const m = p.fleet_machines
        const icon = p.outcome === 'correct' ? '✓' : p.outcome === 'prevented' ? '🛡' : '✗'
        const color = p.outcome === 'correct' ? '#16A34A' : p.outcome === 'prevented' ? '#3B82F6' : '#DC2626'
        return (
          <div key={p.id} className="flex items-start gap-2 text-xs" style={{ color: '#64748B' }}>
            <span style={{ color, fontWeight: 700, flexShrink: 0 }}>{icon}</span>
            <span>
              {m ? `${m.brand} ${m.model}` : 'מכונה'} — {labelFor(p.predicted_failure_type)}
              {p.outcome_notes && <span className="opacity-70"> ({p.outcome_notes})</span>}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Seed / run buttons ───────────────────────────────────────────────────────
function SetupPanel({ onDone }: { onDone: () => void }) {
  const [seeding, setSeeding] = useState(false)
  const [learning, setLearning] = useState(false)
  const [predicting, setPredicting] = useState(false)
  const [log, setLog] = useState<string[]>([])

  function addLog(msg: string) { setLog((l) => [...l, msg]) }

  async function runSetup() {
    setSeeding(true)
    addLog('🔄 מייד מכונות לצי...')
    const r1 = await fetch('/api/fleet-machines/seed').then((r) => r.json())
    addLog(`✓ ${r1.seeded || 0} מכונות נרשמו`)
    setSeeding(false)

    setLearning(true)
    addLog('🧠 לומד דפוסי כשל מההיסטוריה...')
    const r2 = await fetch('/api/cron/pattern-learner').then((r) => r.json())
    addLog(`✓ ${r2.patterns_updated || 0} דפוסים נלמדו`)
    setLearning(false)

    setPredicting(true)
    addLog('🔮 מחשב תחזיות ראשוניות...')
    const r3 = await fetch('/api/cron/predictor').then((r) => r.json())
    addLog(`✓ ${r3.predictions_created || 0} תחזיות נוצרו`)
    setPredicting(false)

    addLog('✅ מוכן!')
    setTimeout(onDone, 1000)
  }

  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
      <div className="font-bold text-base" style={{ color: '#1D4ED8' }}>⚡ הפעלה ראשונה</div>
      <p className="text-sm" style={{ color: '#1E40AF' }}>הרץ את הסקריפט הבא כדי לאתחל את מנוע החיזוי:</p>
      <ol className="text-sm space-y-1" style={{ color: '#1E40AF' }}>
        <li>1. רשום 76 מכונות לצי</li>
        <li>2. למד דפוסי כשל מהיסטוריית תיקונים</li>
        <li>3. הפק תחזיות ראשוניות</li>
      </ol>
      {log.length > 0 && (
        <div className="rounded-xl p-3 space-y-1" style={{ background: 'rgba(255,255,255,0.7)' }}>
          {log.map((l, i) => <div key={i} className="text-xs font-mono" style={{ color: '#1E293B' }}>{l}</div>)}
        </div>
      )}
      <button onClick={runSetup} disabled={seeding || learning || predicting}
        className="w-full py-3 rounded-xl font-bold text-white"
        style={{ background: seeding || learning || predicting ? '#93C5FD' : '#2563EB' }}>
        {seeding ? 'רושם מכונות...' : learning ? 'לומד דפוסים...' : predicting ? 'מחשב תחזיות...' : '🚀 הפעל מנוע חיזוי'}
      </button>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<(Prediction & { fleet_machines?: FleetMachine })[]>([])
  const [allPredictions, setAllPredictions] = useState<(Prediction & { fleet_machines?: FleetMachine })[]>([])
  const [fleet, setFleet] = useState<FleetMachine[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'resolved'>('all')
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null)
  const [showHours, setShowHours] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [meta, setMeta] = useState<{ accuracy: number | null; active: number }>({ accuracy: null, active: 0 })

  const load = useCallback(async () => {
    setLoading(true)
    const [activeRes, allRes, fleetRes] = await Promise.all([
      fetch('/api/predictions?status=active&limit=100').then((r) => r.json()).catch(() => ({ predictions: [], meta: {} })),
      fetch('/api/predictions?status=all&limit=30').then((r) => r.json()).catch(() => ({ predictions: [] })),
      fetch('/api/fleet-machines').then((r) => r.json()).catch(() => []),
    ])
    setPredictions(activeRes.predictions || [])
    setAllPredictions(allRes.predictions || [])
    setFleet(Array.isArray(fleetRes) ? fleetRes : [])
    setMeta({ accuracy: activeRes.meta?.accuracy ?? null, active: activeRes.meta?.active ?? 0 })
    setShowSetup(!activeRes.predictions?.length && !(Array.isArray(fleetRes) && fleetRes.length))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function ack(id: string) {
    await fetch(`/api/predictions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'acknowledge' }) })
    setPredictions((ps) => ps.map((p) => p.id === id ? { ...p, status: 'acknowledged' } : p))
  }

  async function prevent(id: string) {
    await fetch(`/api/predictions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'prevent' }) })
    setPredictions((ps) => ps.filter((p) => p.id !== id))
  }

  async function dismiss(id: string) {
    await fetch(`/api/predictions/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'dismiss' }) })
    setPredictions((ps) => ps.filter((p) => p.id !== id))
  }

  // Filter & machine selection
  const visible = predictions
    .filter((p) => {
      if (selectedMachine && p.machine_id !== selectedMachine) return false
      if (filter === 'high') return p.probability >= 70
      if (filter === 'medium') return p.probability >= 50 && p.probability < 70
      if (filter === 'resolved') return p.status !== 'active'
      return true
    })
    .sort((a, b) => b.probability - a.probability)

  const feedbackItems = allPredictions.filter((p) => p.outcome)

  // Savings estimate: sum cost_if_ignored for prevented predictions (rough)
  const preventedCount = allPredictions.filter((p) => p.outcome === 'prevented').length
  const savingsEstimate = preventedCount * 4500 // rough ₪4500 avg saved per prevented failure

  const counts = {
    high: predictions.filter((p) => p.probability >= 70).length,
    medium: predictions.filter((p) => p.probability >= 50 && p.probability < 70).length,
    active: predictions.filter((p) => p.status === 'active').length,
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: '#1E293B' }}>
          <Brain size={22} style={{ color: '#7C3AED' }} />
          תחזיות AI
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setShowHours(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
            <Wrench size={13} className="inline mr-1" />שעות
          </button>
          <button onClick={load} className="p-1.5 rounded-xl" style={{ background: '#F1F5F9', color: '#64748B' }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl p-3 text-center" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div className="text-2xl font-bold" style={{ color: counts.high > 0 ? '#DC2626' : '#1E293B' }}>{counts.active}</div>
          <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>תחזיות פעילות</div>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div className="text-2xl font-bold" style={{ color: meta.accuracy !== null ? (meta.accuracy >= 70 ? '#16A34A' : '#D97706') : '#94A3B8' }}>
            {meta.accuracy !== null ? `${meta.accuracy}%` : '—'}
          </div>
          <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>דיוק חיזוי</div>
        </div>
        <div className="rounded-2xl p-3 text-center" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div className="text-2xl font-bold" style={{ color: '#16A34A' }}>
            {savingsEstimate > 0 ? `₪${(savingsEstimate / 1000).toFixed(0)}K` : '—'}
          </div>
          <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>חסכון משוער</div>
        </div>
      </div>

      {/* Setup panel (first-time) */}
      {showSetup && !loading && (
        <SetupPanel onDone={load} />
      )}

      {/* Fleet heatmap */}
      {fleet.length > 0 && (
        <FleetGrid
          fleet={fleet}
          predictions={predictions}
          selectedMachine={selectedMachine}
          onSelect={setSelectedMachine}
        />
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: '#E2E8F0' }}>
        {[
          { key: 'all', label: 'הכל' },
          { key: 'high', label: `🔴 דחוף (${counts.high})` },
          { key: 'medium', label: `🟡 לב (${counts.medium})` },
          { key: 'resolved', label: 'הסתיים' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key as typeof filter)}
            className="flex-1 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: filter === key ? '#FFFFFF' : 'transparent',
              color: filter === key ? '#1E293B' : '#64748B',
              boxShadow: filter === key ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
            }}>
            {label}
          </button>
        ))}
      </div>

      {selectedMachine && (
        <div className="flex items-center gap-2 text-sm" style={{ color: '#64748B' }}>
          <span>מסנן לפי מכונה</span>
          <button onClick={() => setSelectedMachine(null)} className="text-xs underline">הצג הכל</button>
        </div>
      )}

      {/* Prediction cards */}
      {loading ? (
        <div className="text-center py-10" style={{ color: '#94A3B8' }}>טוען תחזיות...</div>
      ) : visible.length === 0 ? (
        <div className="text-center py-10 space-y-2">
          <CheckCircle size={36} className="mx-auto" style={{ color: '#16A34A' }} />
          <div className="font-semibold" style={{ color: '#1E293B' }}>אין תחזיות בקטגוריה זו</div>
          <div className="text-sm" style={{ color: '#64748B' }}>כל המכונות במצב תקין</div>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((pred) => (
            <PredictionCard
              key={pred.id}
              pred={pred}
              onAck={ack}
              onPrevent={prevent}
              onDismiss={dismiss}
            />
          ))}
        </div>
      )}

      {/* Feedback log */}
      {feedbackItems.length > 0 && (
        <FeedbackLog items={feedbackItems.slice(0, 8)} />
      )}

      {/* Modals */}
      {showHours && (
        <HoursModal fleet={fleet} onClose={() => { setShowHours(false); load() }} />
      )}
    </div>
  )
}
