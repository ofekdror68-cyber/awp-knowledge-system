'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { ArrowRight, Plus, CheckSquare, Square, ChevronDown, ChevronUp, Camera } from 'lucide-react'
import { format } from 'date-fns'
import ServiceLogModal from '@/components/ServiceLogModal'
import UpdateHoursModal from '@/components/UpdateHoursModal'

type Machine = {
  id: string
  brand: string
  model: string
  serial_number: string | null
  hours_current: number
  hours_last_service: number
  last_service_date: string | null
  next_service_due_date: string | null
  next_service_due_hours: number | null
  status: string
  notes: string | null
}

type ServiceLog = {
  id: string
  date: string
  technician_name: string | null
  hours_at_service: number | null
  service_type: string
  notes: string | null
  parts_replaced: Array<{ part_number: string; part_name: string; quantity: number; reason: string }>
  checklist_completed: Array<{ task: string; done: boolean; note?: string }>
}

type Schedule = {
  id: string
  interval_type: string
  tasks: Array<{ task_name: string; description: string; parts_needed: string; estimated_time_minutes: number; is_safety_critical: boolean }>
}

export default function MachinePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = getSupabaseClient()

  const [machine, setMachine] = useState<Machine | null>(null)
  const [logs, setLogs] = useState<ServiceLog[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [showUpdateHours, setShowUpdateHours] = useState(false)
  const [generatingSchedule, setGeneratingSchedule] = useState(false)

  async function fetchData() {
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
    setGeneratingSchedule(true)
    try {
      const res = await fetch('/api/maintenance/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ machineId: id, brand: machine?.brand, model: machine?.model }),
      })
      if (res.ok) await fetchData()
    } finally {
      setGeneratingSchedule(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  if (!machine) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" /></div>
  }

  const hoursUntilService = machine.next_service_due_hours
    ? machine.next_service_due_hours - machine.hours_current
    : null

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="p-1 rounded-lg hover:bg-slate-100">
          <ArrowRight size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{machine.brand} {machine.model}</h1>
          {machine.serial_number && <div className="text-sm text-slate-500">S/N: {machine.serial_number}</div>}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
          machine.status === 'תקין' ? 'bg-green-50 text-green-700 border-green-200' :
          machine.status === 'דורש טיפול' ? 'bg-amber-50 text-amber-700 border-amber-200' :
          machine.status === 'בטיפול' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          'bg-slate-100 text-slate-500 border-slate-200'
        }`}>{machine.status}</span>
      </div>

      {/* Hours card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold text-slate-700">שעות מנוע</span>
          <button
            onClick={() => setShowUpdateHours(true)}
            className="text-sm text-blue-600 font-medium"
          >
            עדכן שעות
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-900">{machine.hours_current.toLocaleString()}</div>
            <div className="text-xs text-slate-500">נוכחי</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-600">{machine.hours_last_service.toLocaleString()}</div>
            <div className="text-xs text-slate-500">טיפול אחרון</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${hoursUntilService !== null && hoursUntilService <= 0 ? 'text-red-600' : hoursUntilService !== null && hoursUntilService <= 50 ? 'text-amber-600' : 'text-green-600'}`}>
              {hoursUntilService !== null ? (hoursUntilService > 0 ? `+${hoursUntilService}` : hoursUntilService) : '—'}
            </div>
            <div className="text-xs text-slate-500">עד טיפול</div>
          </div>
        </div>
        {machine.last_service_date && (
          <div className="mt-3 text-sm text-slate-500 border-t pt-2">
            טיפול אחרון: {format(new Date(machine.last_service_date), 'dd/MM/yyyy')}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowServiceModal(true)}
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm"
        >
          + רשום טיפול
        </button>
        {schedules.length === 0 && (
          <button
            onClick={generateSchedule}
            disabled={generatingSchedule}
            className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold text-sm disabled:opacity-50"
          >
            {generatingSchedule ? 'מייצר...' : 'צור תוכנית תחזוקה'}
          </button>
        )}
      </div>

      {/* Maintenance schedules */}
      {schedules.length > 0 && (
        <div className="mb-4">
          <h2 className="font-semibold text-slate-700 mb-2">תוכנית תחזוקה</h2>
          <div className="space-y-2">
            {schedules.map(s => (
              <div key={s.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setExpandedLog(expandedLog === s.id ? null : s.id)}
                  className="w-full flex items-center justify-between p-3 text-sm font-medium"
                >
                  <span>כל {s.interval_type}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{s.tasks.length} משימות</span>
                    {expandedLog === s.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                {expandedLog === s.id && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {s.tasks.map((task, i) => (
                      <div key={i} className="p-3">
                        <div className="flex items-start gap-2">
                          {task.is_safety_critical && (
                            <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium mt-0.5">בטיחות</span>
                          )}
                          <div>
                            <div className="text-sm font-medium">{task.task_name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{task.description}</div>
                            {task.parts_needed && <div className="text-xs text-blue-600 mt-0.5">חלקים: {task.parts_needed}</div>}
                            <div className="text-xs text-slate-400 mt-0.5">~{task.estimated_time_minutes} דקות</div>
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

      {/* Service history */}
      <div>
        <h2 className="font-semibold text-slate-700 mb-2">היסטוריית טיפולים ({logs.length})</h2>
        <div className="space-y-2">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm bg-white rounded-xl border border-slate-100">אין טיפולים עדיין</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  className="w-full flex items-center justify-between p-3"
                >
                  <div className="text-right">
                    <div className="font-medium text-sm">{log.service_type}</div>
                    <div className="text-xs text-slate-500">{format(new Date(log.date), 'dd/MM/yyyy')} {log.technician_name && `• ${log.technician_name}`}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.hours_at_service && <span className="text-xs text-slate-500">{log.hours_at_service.toLocaleString()} ש׳</span>}
                    {expandedLog === log.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                {expandedLog === log.id && (
                  <div className="border-t border-slate-100 p-3 text-sm">
                    {log.notes && <p className="text-slate-600 mb-2">{log.notes}</p>}
                    {log.parts_replaced && log.parts_replaced.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs font-semibold text-slate-500 mb-1">חלקים שהוחלפו:</div>
                        {log.parts_replaced.map((p, i) => (
                          <div key={i} className="text-xs text-slate-600">• {p.part_name} ({p.part_number}) ×{p.quantity}</div>
                        ))}
                      </div>
                    )}
                    {log.checklist_completed && log.checklist_completed.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-slate-500 mb-1">רשימת תיוג:</div>
                        {log.checklist_completed.map((item, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                            {item.done ? <CheckSquare size={12} className="text-green-600" /> : <Square size={12} className="text-slate-300" />}
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

      {showServiceModal && (
        <ServiceLogModal
          machineId={id}
          machine={machine}
          schedules={schedules}
          onClose={() => setShowServiceModal(false)}
          onSaved={() => { setShowServiceModal(false); fetchData() }}
        />
      )}

      {showUpdateHours && (
        <UpdateHoursModal
          machineId={id}
          currentHours={machine.hours_current}
          onClose={() => setShowUpdateHours(false)}
          onSaved={() => { setShowUpdateHours(false); fetchData() }}
        />
      )}
    </div>
  )
}
