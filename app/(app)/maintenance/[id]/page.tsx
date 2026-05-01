'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { ArrowRight, ChevronDown, ChevronUp, CheckSquare, Square } from 'lucide-react'
import { format } from 'date-fns'
import ServiceLogModal from '@/components/ServiceLogModal'
import UpdateHoursModal from '@/components/UpdateHoursModal'

type Machine = {
  id: string; brand: string; model: string; serial_number: string | null
  hours_current: number; hours_last_service: number
  last_service_date: string | null; next_service_due_date: string | null
  next_service_due_hours: number | null; status: string; notes: string | null
}
type ServiceLog = {
  id: string; date: string; technician_name: string | null; hours_at_service: number | null
  service_type: string; notes: string | null
  parts_replaced: Array<{ part_number: string; part_name: string; quantity: number; reason: string }>
  checklist_completed: Array<{ task: string; done: boolean; note?: string }>
}
type Schedule = {
  id: string; interval_type: string
  tasks: Array<{ task_name: string; description: string; parts_needed: string; estimated_time_minutes: number; is_safety_critical: boolean }>
}

export default function MachinePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [machine, setMachine] = useState<Machine | null>(null)
  const [logs, setLogs] = useState<ServiceLog[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showService, setShowService] = useState(false)
  const [showHours, setShowHours] = useState(false)
  const [generating, setGenerating] = useState(false)

  async function fetch() {
    const [{ data: m }, { data: l }, { data: s }] = await Promise.all([
      supabase.from('machines').select('*').eq('id', id).single(),
      supabase.from('service_logs').select('*').eq('machine_id', id).order('date', { ascending: false }),
      supabase.from('maintenance_schedules').select('*').eq('machine_id', id),
    ])
    if (m) setMachine(m)
    setLogs(l || [])
    setSchedules(s || [])
  }

  async function generateSchedule() {
    setGenerating(true)
    try {
      const res = await window.fetch('/api/maintenance/generate-schedule', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ machineId: id, brand: machine?.brand, model: machine?.model }),
      })
      if (res.ok) await fetch()
    } finally { setGenerating(false) }
  }

  useEffect(() => { fetch() }, [id])

  if (!machine) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8" style={{ border: '2px solid #3B82F6', borderTopColor: 'transparent' }} />
    </div>
  )

  const hoursLeft = machine.next_service_due_hours ? machine.next_service_due_hours - machine.hours_current : null
  const statusColor = machine.status === 'תקין' ? '#15803D' : machine.status === 'דורש טיפול' ? '#B45309' : machine.status === 'בטיפול' ? '#1D4ED8' : '#475569'
  const statusBg = machine.status === 'תקין' ? 'rgba(22,163,74,.12)' : machine.status === 'דורש טיפול' ? 'rgba(217,119,6,.12)' : machine.status === 'בטיפול' ? 'rgba(59,130,246,.12)' : 'rgba(100,116,139,.1)'

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl flex-shrink-0" style={{ background: '#F1F5F9' }}>
          <ArrowRight size={20} style={{ color: '#1E293B' }} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate" style={{ color: '#1E293B' }}>{machine.brand} {machine.model}</h1>
          {machine.serial_number && <div className="text-sm truncate" style={{ color: '#64748B' }}>S/N: {machine.serial_number}</div>}
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ background: statusBg, color: statusColor, border: `1px solid ${statusColor}33` }}>
          {machine.status}
        </span>
      </div>

      {/* Hours */}
      <div className="card p-4 mb-3">
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold text-sm" style={{ color: '#1E293B' }}>שעות מנוע</span>
          <button onClick={() => setShowHours(true)} className="text-sm font-medium" style={{ color: '#3B82F6' }}>עדכן</button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-2xl font-bold" style={{ color: '#1E293B' }}>{machine.hours_current.toLocaleString()}</div>
            <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>נוכחי</div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: '#64748B' }}>{machine.hours_last_service.toLocaleString()}</div>
            <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>טיפול אחרון</div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: hoursLeft !== null && hoursLeft <= 0 ? '#DC2626' : hoursLeft !== null && hoursLeft <= 50 ? '#D97706' : '#16A34A' }}>
              {hoursLeft !== null ? (hoursLeft > 0 ? `+${hoursLeft}` : hoursLeft) : '—'}
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>עד טיפול</div>
          </div>
        </div>
        {machine.last_service_date && (
          <div className="mt-3 pt-2 text-xs" style={{ borderTop: '1px solid #E2E8F0', color: '#64748B' }}>
            טיפול אחרון: {format(new Date(machine.last_service_date), 'dd/MM/yyyy')}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-3">
        <button onClick={() => setShowService(true)}
          className="flex-1 py-3 rounded-xl font-semibold text-sm text-white"
          style={{ background: '#3B82F6' }}>
          + רשום טיפול
        </button>
        {schedules.length === 0 && (
          <button onClick={generateSchedule} disabled={generating}
            className="flex-1 py-3 rounded-xl font-semibold text-sm disabled:opacity-50"
            style={{ background: '#F1F5F9', color: '#374151' }}>
            {generating ? 'מייצר...' : 'צור תוכנית תחזוקה'}
          </button>
        )}
      </div>

      {/* Schedules */}
      {schedules.length > 0 && (
        <div className="mb-3">
          <h2 className="font-semibold text-sm mb-2" style={{ color: '#374151' }}>תוכנית תחזוקה</h2>
          <div className="space-y-2">
            {schedules.map(s => (
              <div key={s.id} className="card overflow-hidden">
                <button onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                  className="w-full flex items-center justify-between p-3 text-sm font-medium"
                  style={{ color: '#1E293B' }}>
                  <span>כל {s.interval_type}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#64748B' }}>{s.tasks.length} משימות</span>
                    {expanded === s.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                {expanded === s.id && (
                  <div style={{ borderTop: '1px solid #F1F5F9' }}>
                    {s.tasks.map((task, i) => (
                      <div key={i} className="p-3" style={{ borderBottom: i < s.tasks.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                        <div className="flex items-start gap-2">
                          {task.is_safety_critical && (
                            <span className="text-xs px-1.5 py-0.5 rounded font-medium mt-0.5 flex-shrink-0"
                              style={{ background: 'rgba(220,38,38,.1)', color: '#B91C1C' }}>בטיחות</span>
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-medium" style={{ color: '#1E293B' }}>{task.task_name}</div>
                            <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>{task.description}</div>
                            {task.parts_needed && <div className="text-xs mt-0.5" style={{ color: '#3B82F6' }}>חלקים: {task.parts_needed}</div>}
                            <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>~{task.estimated_time_minutes} דקות</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="font-semibold text-sm mb-2" style={{ color: '#374151' }}>היסטוריית טיפולים ({logs.length})</h2>
        <div className="space-y-2">
          {logs.length === 0 ? (
            <div className="card p-6 text-center text-sm" style={{ color: '#94A3B8' }}>אין טיפולים עדיין</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="card overflow-hidden">
                <button onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                  className="w-full flex items-center justify-between p-3">
                  <div className="text-right">
                    <div className="font-medium text-sm" style={{ color: '#1E293B' }}>{log.service_type}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                      {format(new Date(log.date), 'dd/MM/yyyy')}{log.technician_name && ` • ${log.technician_name}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.hours_at_service && <span className="text-xs" style={{ color: '#64748B' }}>{log.hours_at_service.toLocaleString()} ש׳</span>}
                    {expanded === log.id ? <ChevronUp size={16} style={{ color: '#64748B' }} /> : <ChevronDown size={16} style={{ color: '#64748B' }} />}
                  </div>
                </button>
                {expanded === log.id && (
                  <div className="p-3 text-sm" style={{ borderTop: '1px solid #F1F5F9' }}>
                    {log.notes && <p className="mb-2" style={{ color: '#475569' }}>{log.notes}</p>}
                    {log.parts_replaced?.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs font-semibold mb-1" style={{ color: '#64748B' }}>חלקים שהוחלפו:</div>
                        {log.parts_replaced.map((p, i) => (
                          <div key={i} className="text-xs" style={{ color: '#475569' }}>• {p.part_name} ({p.part_number}) ×{p.quantity}</div>
                        ))}
                      </div>
                    )}
                    {log.checklist_completed?.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold mb-1" style={{ color: '#64748B' }}>רשימת תיוג:</div>
                        {log.checklist_completed.map((item, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: '#475569' }}>
                            {item.done ? <CheckSquare size={12} style={{ color: '#16A34A' }} /> : <Square size={12} style={{ color: '#CBD5E1' }} />}
                            {item.task}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showService && (
        <ServiceLogModal machineId={id} machine={machine} schedules={schedules}
          onClose={() => setShowService(false)} onSaved={() => { setShowService(false); fetch() }} />
      )}
      {showHours && (
        <UpdateHoursModal machineId={id} currentHours={machine.hours_current}
          onClose={() => setShowHours(false)} onSaved={() => { setShowHours(false); fetch() }} />
      )}
    </div>
  )
}
