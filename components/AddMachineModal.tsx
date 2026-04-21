'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

const BRANDS = ['JLG', 'Manitou', 'Dingli', 'Genie', 'אחר']
const STATUSES = ['תקין', 'דורש טיפול', 'בטיפול', 'מושבת']

export default function AddMachineModal({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    brand: 'JLG',
    model: '',
    serial_number: '',
    year: '',
    hours_current: '',
    status: 'תקין',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!form.model) return
    setSaving(true)
    try {
      await fetch('/api/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: form.brand,
          model: form.model,
          serial_number: form.serial_number || null,
          year: form.year ? parseInt(form.year) : null,
          hours_current: form.hours_current ? parseInt(form.hours_current) : 0,
          status: form.status,
          notes: form.notes || null,
        }),
      })
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white w-full rounded-t-2xl p-5 space-y-3 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg">הוספת מכונה</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">מותג *</label>
            <select
              value={form.brand}
              onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {BRANDS.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">דגם *</label>
            <input
              value={form.model}
              onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
              placeholder="לדוגמה: 450AJ"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">מספר סריאלי</label>
            <input
              value={form.serial_number}
              onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">שנה</label>
            <input
              type="number"
              value={form.year}
              onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
              placeholder="2019"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">שעות נוכחיות</label>
            <input
              type="number"
              value={form.hours_current}
              onChange={e => setForm(f => ({ ...f, hours_current: e.target.value }))}
              placeholder="0"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">סטטוס</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none"
            >
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-500 mb-1 block">הערות</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none resize-none"
          />
        </div>

        <button
          onClick={save}
          disabled={!form.model || saving}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
        >
          {saving ? 'שומר...' : 'הוסף מכונה'}
        </button>
      </div>
    </div>
  )
}
