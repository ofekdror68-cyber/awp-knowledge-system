'use client'

import { useState } from 'react'
import { X, Plus, Trash2, CheckSquare, Square } from 'lucide-react'

type Schedule = {
  id: string
  interval_type: string
  tasks: Array<{ task_name: string; description: string; parts_needed: string; estimated_time_minutes: number; is_safety_critical: boolean }>
}

type ChecklistItem = { task: string; done: boolean; note: string }
type PartItem = { part_number: string; part_name: string; quantity: number; reason: string }

export default function ServiceLogModal({
  machineId,
  machine,
  schedules,
  onClose,
  onSaved,
}: {
  machineId: string
  machine: { brand: string; model: string; hours_current: number }
  schedules: Schedule[]
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    technician_name: '',
    hours_at_service: machine.hours_current.toString(),
    service_type: 'תקופתי',
    notes: '',
  })
  const [selectedInterval, setSelectedInterval] = useState<string>('')
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [parts, setParts] = useState<PartItem[]>([])
  const [saving, setSaving] = useState(false)

  function loadChecklist(intervalType: string) {
    setSelectedInterval(intervalType)
    const schedule = schedules.find(s => s.interval_type === intervalType)
    if (schedule) {
      setChecklist(schedule.tasks.map(t => ({ task: t.task_name, done: false, note: '' })))
    }
  }

  function toggleTask(i: number) {
    setChecklist(prev => prev.map((item, idx) => idx === i ? { ...item, done: !item.done } : item))
  }

  function addPart() {
    setParts(prev => [...prev, { part_number: '', part_name: '', quantity: 1, reason: '' }])
  }

  function updatePart(i: number, field: keyof PartItem, value: string | number) {
    setParts(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  function removePart(i: number) {
    setParts(prev => prev.filter((_, idx) => idx !== i))
  }

  async function save() {
    setSaving(true)
    try {
      const hoursAtService = parseInt(form.hours_at_service) || machine.hours_current
      const nextServiceHours = hoursAtService + 250

      await fetch('/api/service-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machine_id: machineId,
          date: form.date,
          technician_name: form.technician_name || null,
          hours_at_service: hoursAtService,
          service_type: form.service_type,
          checklist_completed: checklist,
          parts_replaced: parts.filter(p => p.part_name),
          notes: form.notes || null,
          next_service_hours: nextServiceHours,
          next_service_date: null,
        }),
      })
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  const SERVICE_TYPES = ['תקופתי', 'תיקון', 'החלפת חלק', 'בדיקה']

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white w-full rounded-t-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold">רישום טיפול — {machine.brand} {machine.model}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">תאריך</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">שעות במטר</label>
              <input
                type="number"
                value={form.hours_at_service}
                onChange={e => setForm(f => ({ ...f, hours_at_service: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">טכנאי</label>
              <input
                value={form.technician_name}
                onChange={e => setForm(f => ({ ...f, technician_name: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">סוג טיפול</label>
              <select
                value={form.service_type}
                onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none"
              >
                {SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Interval selector */}
          {schedules.length > 0 && (
            <div>
              <label className="text-xs text-slate-500 mb-1 block">טיפול תקופתי לפי מרווח</label>
              <div className="flex gap-2 flex-wrap">
                {schedules.map(s => (
                  <button
                    key={s.id}
                    onClick={() => loadChecklist(s.interval_type)}
                    className={`px-3 py-1.5 rounded-lg text-sm border ${selectedInterval === s.interval_type ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}
                  >
                    {s.interval_type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Checklist */}
          {checklist.length > 0 && (
            <div>
              <label className="text-xs text-slate-500 mb-2 block">
                רשימת תיוג ({checklist.filter(c => c.done).length}/{checklist.length})
              </label>
              <div className="space-y-2">
                {checklist.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => toggleTask(i)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-right transition-colors ${
                      item.done ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'
                    }`}
                  >
                    {item.done
                      ? <CheckSquare size={18} className="text-green-600 flex-shrink-0" />
                      : <Square size={18} className="text-slate-300 flex-shrink-0" />
                    }
                    <span className={`text-sm ${item.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.task}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Parts replaced */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-slate-500">חלקים שהוחלפו</label>
              <button onClick={addPart} className="text-xs text-blue-600 font-medium flex items-center gap-1">
                <Plus size={14} /> הוסף חלק
              </button>
            </div>
            {parts.map((part, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3 mb-2 space-y-2">
                <div className="flex gap-2">
                  <input
                    placeholder="מ/ח"
                    value={part.part_number}
                    onChange={e => updatePart(i, 'part_number', e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none"
                  />
                  <input
                    type="number"
                    min="1"
                    value={part.quantity}
                    onChange={e => updatePart(i, 'quantity', parseInt(e.target.value))}
                    className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none"
                  />
                  <button onClick={() => removePart(i)} className="text-red-500 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  placeholder="שם החלק"
                  value={part.part_name}
                  onChange={e => updatePart(i, 'part_name', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none"
                />
                <input
                  placeholder="סיבת החלפה"
                  value={part.reason}
                  onChange={e => updatePart(i, 'reason', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-slate-500 mb-1 block">הערות</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={save}
            disabled={saving}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50"
          >
            {saving ? 'שומר...' : 'שמור טיפול'}
          </button>
        </div>
      </div>
    </div>
  )
}
