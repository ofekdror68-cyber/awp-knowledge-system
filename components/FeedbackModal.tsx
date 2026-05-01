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
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full rounded-t-2xl p-5 space-y-4" style={{ background: '#FFFFFF', border: '1px solid #334155' }}>
        <div className="flex justify-between items-center">
          <h2 className="font-bold" style={{ color: '#1E293B' }}>איך פתרת את התקלה?</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#CBD5E1', color: '#64748B' }}
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-sm" style={{ color: '#64748B' }}>המידע הזה עוזר למערכת ללמוד ולשפר את התשובות העתידיות.</p>

        <div className="flex gap-3">
          <button
            onClick={() => setWorked(true)}
            className="flex-1 py-2 rounded-xl text-sm font-medium"
            style={worked
              ? { background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#22C55E' }
              : { background: '#EEF2F7', border: '1px solid #334155', color: '#64748B' }}
          >
            ✓ הפתרון עבד
          </button>
          <button
            onClick={() => setWorked(false)}
            className="flex-1 py-2 rounded-xl text-sm font-medium"
            style={!worked
              ? { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#EF4444' }
              : { background: '#EEF2F7', border: '1px solid #334155', color: '#64748B' }}
          >
            ✗ לא עבד
          </button>
        </div>

        <textarea
          value={howSolved}
          onChange={e => setHowSolved(e.target.value)}
          placeholder="ספר מה בדיוק עשית כדי לפתור..."
          rows={4}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
          style={{ background: '#EEF2F7', color: '#1E293B', border: '1px solid #334155' }}
        />

        <button
          onClick={save}
          disabled={!howSolved.trim() || saving}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-50"
          style={{ background: '#3B82F6' }}
        >
          {saving ? 'שומר...' : 'שמור ותרום לידע'}
        </button>
      </div>
    </div>
  )
}
