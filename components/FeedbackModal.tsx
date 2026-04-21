'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export default function FeedbackModal({
  onClose,
  onSaved,
  context,
}: {
  onClose: () => void
  onSaved: () => void
  context: string
}) {
  const [howSolved, setHowSolved] = useState('')
  const [worked, setWorked] = useState(true)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!howSolved.trim()) return
    setSaving(true)
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ how_was_solved: howSolved, worked, context }),
    })
    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white w-full rounded-t-2xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold">איך פתרת את התקלה?</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <p className="text-sm text-slate-500">המידע הזה עוזר למערכת ללמוד ולשפר את התשובות העתידיות.</p>

        <div className="flex gap-3">
          <button
            onClick={() => setWorked(true)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium border ${worked ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-slate-200 text-slate-500'}`}
          >
            ✓ הפתרון עבד
          </button>
          <button
            onClick={() => setWorked(false)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium border ${!worked ? 'bg-red-100 border-red-300 text-red-700' : 'bg-white border-slate-200 text-slate-500'}`}
          >
            ✗ לא עבד
          </button>
        </div>

        <textarea
          value={howSolved}
          onChange={e => setHowSolved(e.target.value)}
          placeholder="ספר מה בדיוק עשית כדי לפתור..."
          rows={4}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none resize-none"
        />

        <button
          onClick={save}
          disabled={!howSolved.trim() || saving}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
        >
          {saving ? 'שומר...' : 'שמור ותרום לידע'}
        </button>
      </div>
    </div>
  )
}
