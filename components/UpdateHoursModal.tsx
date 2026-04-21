'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export default function UpdateHoursModal({
  machineId,
  currentHours,
  onClose,
  onSaved,
}: {
  machineId: string
  currentHours: number
  onClose: () => void
  onSaved: () => void
}) {
  const [hours, setHours] = useState(currentHours.toString())
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await fetch('/api/machines', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: machineId, hours_current: parseInt(hours) }),
    })
    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white w-full rounded-t-2xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold">עדכון שעות מנוע</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div>
          <label className="text-sm text-slate-500 mb-1 block">שעות נוכחיות</label>
          <input
            type="number"
            value={hours}
            onChange={e => setHours(e.target.value)}
            className="w-full text-2xl font-bold px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50"
        >
          {saving ? 'שומר...' : 'שמור'}
        </button>
      </div>
    </div>
  )
}
