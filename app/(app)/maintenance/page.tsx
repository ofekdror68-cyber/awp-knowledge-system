'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Plus, AlertTriangle, Wrench, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { format, differenceInDays } from 'date-fns'
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

function statusStyle(machine: Machine) {
  if (machine.status === 'מושבת') return { cls: 'badge-off', label: 'מושבת', urgency: 3 }
  const h = machine.next_service_due_hours ? machine.next_service_due_hours - machine.hours_current : null
  const d = machine.next_service_due_date ? differenceInDays(new Date(machine.next_service_due_date), new Date()) : null
  if ((h !== null && h <= 0) || (d !== null && d < 0)) return { cls: 'badge-bad', label: 'דחוף!', urgency: 3 }
  if ((h !== null && h <= 50) || (d !== null && d <= 14)) return { cls: 'badge-warn', label: 'בקרוב', urgency: 2 }
  if (machine.status === 'בטיפול') return { cls: 'badge-warn', label: 'בטיפול', urgency: 1 }
  return { cls: 'badge-ok', label: 'תקין', urgency: 0 }
}

export default function MaintenancePage() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  async function load() {
    const sb = getSupabaseClient()
    const { data } = await sb.from('machines').select('*').order('brand')
    setMachines(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const alerts = machines.filter(m => statusStyle(m).urgency >= 2)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8" style={{ border: '2px solid #3B82F6', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-white">ניהול מכונות</h1>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#3B82F6' }}>
          <Plus size={16} /> הוסף מכונה
        </button>
      </div>

      {/* Alerts banner */}
      {alerts.length > 0 && (
        <div className="mb-4 p-3 rounded-xl flex items-start gap-3"
          style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)' }}>
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-red-400">{alerts.length} מכונות דורשות טיפול</div>
            {alerts.map(m => (
              <Link key={m.id} href={`/maintenance/${m.id}`} className="text-xs text-red-300 block hover:underline">
                {m.brand} {m.model}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'סה״כ מכונות', val: machines.length, color: '#3B82F6' },
          { label: 'תקינות', val: machines.filter(m => statusStyle(m).urgency === 0).length, color: '#22C55E' },
          { label: 'דורשות טיפול', val: machines.filter(m => statusStyle(m).urgency >= 2).length, color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Machines */}
      {machines.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(59,130,246,.15)' }}>
            <Wrench size={32} style={{ color: '#3B82F6' }} />
          </div>
          <p className="text-white font-semibold mb-1">אין מכונות עדיין</p>
          <p style={{ color: '#64748B' }} className="text-sm mb-4">הוסף את המכונות הראשונות למערכת</p>
          <button onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#3B82F6' }}>+ הוסף מכונה</button>
        </div>
      ) : (
        <div className="space-y-3">
          {[...machines].sort((a, b) => statusStyle(b).urgency - statusStyle(a).urgency).map(m => {
            const st = statusStyle(m)
            const hoursLeft = m.next_service_due_hours ? m.next_service_due_hours - m.hours_current : null
            return (
              <Link key={m.id} href={`/maintenance/${m.id}`}
                className="card block p-4 active:opacity-70 transition-opacity" style={{ textDecoration: 'none' }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-white">{m.brand} {m.model}</div>
                    {m.serial_number && <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>S/N: {m.serial_number}</div>}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                </div>
                <div className="flex items-center gap-4 text-sm" style={{ color: '#94A3B8' }}>
                  <span className="flex items-center gap-1">
                    <Clock size={13} />
                    {m.hours_current.toLocaleString()} ש׳
                  </span>
                  {hoursLeft !== null && (
                    <span style={{ color: hoursLeft <= 0 ? '#EF4444' : hoursLeft <= 50 ? '#F59E0B' : '#22C55E' }}>
                      {hoursLeft > 0 ? `טיפול עוד ${hoursLeft} ש׳` : `איחור ${Math.abs(hoursLeft)} ש׳`}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {showAdd && <AddMachineModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load() }} />}
    </div>
  )
}
