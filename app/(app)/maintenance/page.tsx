'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Plus, AlertTriangle, CheckCircle, Clock, WrenchIcon } from 'lucide-react'
import Link from 'next/link'
import { differenceInDays, format } from 'date-fns'
import AddMachineModal from '@/components/AddMachineModal'

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
}

function getStatusInfo(machine: Machine) {
  if (machine.status === 'מושבת') return { color: 'bg-slate-100 text-slate-600 border-slate-200', badge: 'מושבת', icon: null, urgency: 4 }

  const hoursUntilService = machine.next_service_due_hours
    ? machine.next_service_due_hours - machine.hours_current
    : null
  const daysUntilService = machine.next_service_due_date
    ? differenceInDays(new Date(machine.next_service_due_date), new Date())
    : null

  const isOverdue = (hoursUntilService !== null && hoursUntilService <= 0) ||
    (daysUntilService !== null && daysUntilService < 0)
  const isSoon = !isOverdue && (
    (hoursUntilService !== null && hoursUntilService <= 50) ||
    (daysUntilService !== null && daysUntilService <= 14)
  )

  if (machine.status === 'בטיפול') return { color: 'bg-blue-50 text-blue-700 border-blue-200', badge: 'בטיפול', urgency: 1 }
  if (isOverdue) return { color: 'bg-red-50 text-red-700 border-red-200', badge: 'דחוף!', urgency: 3 }
  if (isSoon) return { color: 'bg-amber-50 text-amber-700 border-amber-200', badge: 'בקרוב', urgency: 2 }
  return { color: 'bg-green-50 text-green-700 border-green-200', badge: 'תקין', urgency: 0 }
}

function StatusBadge({ info }: { info: ReturnType<typeof getStatusInfo> }) {
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${info.color}`}>
      {info.badge}
    </span>
  )
}

export default function MaintenancePage() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const supabase = getSupabaseClient()

  async function fetchMachines() {
    const { data } = await supabase.from('machines').select('*').order('brand')
    setMachines(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchMachines() }, [])

  const alerts = machines.filter(m => {
    const info = getStatusInfo(m)
    return info.urgency >= 2
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-900">תחזוקה</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={16} />
          מכונה
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-600" />
            <span className="text-sm font-semibold text-red-700">
              {alerts.length} מכונות דורשות תשומת לב
            </span>
          </div>
          {alerts.map(m => (
            <Link key={m.id} href={`/maintenance/${m.id}`} className="block text-sm text-red-600 hover:underline">
              {m.brand} {m.model} — {getStatusInfo(m).badge}
            </Link>
          ))}
        </div>
      )}

      {/* Machines table */}
      <div className="space-y-3">
        {machines.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <WrenchIcon size={40} className="mx-auto mb-3 opacity-30" />
            <p>אין מכונות עדיין</p>
            <button onClick={() => setShowAdd(true)} className="mt-2 text-blue-600 text-sm">הוסף מכונה ראשונה</button>
          </div>
        ) : (
          machines
            .sort((a, b) => getStatusInfo(b).urgency - getStatusInfo(a).urgency)
            .map(machine => {
              const info = getStatusInfo(machine)
              const hoursLeft = machine.next_service_due_hours
                ? machine.next_service_due_hours - machine.hours_current
                : null

              return (
                <Link
                  key={machine.id}
                  href={`/maintenance/${machine.id}`}
                  className={`block p-4 rounded-xl border ${info.color} transition-opacity active:opacity-70`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-base">{machine.brand} {machine.model}</div>
                      {machine.serial_number && (
                        <div className="text-xs opacity-60 mt-0.5">S/N: {machine.serial_number}</div>
                      )}
                    </div>
                    <StatusBadge info={info} />
                  </div>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>⏱ {machine.hours_current.toLocaleString()} ש׳</span>
                    {hoursLeft !== null && (
                      <span>
                        {hoursLeft > 0 ? `טיפול עוד ${hoursLeft} ש׳` : `איחור ${Math.abs(hoursLeft)} ש׳`}
                      </span>
                    )}
                    {machine.last_service_date && (
                      <span className="opacity-60">
                        טיפול אחרון: {format(new Date(machine.last_service_date), 'dd/MM/yy')}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })
        )}
      </div>

      {showAdd && (
        <AddMachineModal
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); fetchMachines() }}
        />
      )}
    </div>
  )
}
