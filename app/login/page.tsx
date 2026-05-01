'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    setLoading(false)
    if (res.ok) {
      router.push('/maintenance')
      router.refresh()
    } else {
      setError('שם משתמש או סיסמה שגויים')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#F0F4F8' }}>
      <div className="w-full max-w-sm">
        {/* Logo + title */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-16 h-16 rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Image src="/logo.png" alt="אופק גיזום" width={64} height={64} className="object-contain w-full h-full" />
          </div>
          <div className="text-center">
            <div className="font-bold text-xl" style={{ color: '#1E293B' }}>אופק גיזום</div>
            <div className="text-sm" style={{ color: '#64748B' }}>מערכת ידע ותחזוקה</div>
          </div>
        </div>

        {/* Card */}
        <form onSubmit={submit} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>שם משתמש</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="הדס / מידן"
              required
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#1E293B' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              required
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#1E293B' }}
            />
          </div>

          {error && (
            <div className="text-sm text-center font-medium" style={{ color: '#DC2626' }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50"
            style={{ background: '#3B82F6' }}
          >
            {loading ? 'כניסה...' : 'כניסה'}
          </button>
        </form>
      </div>
    </div>
  )
}
