'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MessageCircle, FileText, Stethoscope, ClipboardList, Wrench, Brain, Cpu } from 'lucide-react'

const nav = [
  { href: '/chat', label: 'צ\'אט', icon: MessageCircle },
  { href: '/diagnose', label: 'אבחון', icon: Stethoscope },
  { href: '/maintenance', label: 'תחזוקה', icon: Wrench },
  { href: '/predictions', label: 'חיזוי AI', icon: Brain },
  { href: '/processing', label: 'עיבוד', icon: Cpu },
  { href: '/audit', label: 'מבדק', icon: ClipboardList },
]

function useDocStats() {
  const [stats, setStats] = useState<{ count: number; lastUpload: string | null } | null>(null)
  useEffect(() => {
    const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL
    const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!SUPA || !KEY) return
    fetch(`${SUPA}/rest/v1/documents?select=uploaded_at&order=uploaded_at.desc&limit=1`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
    })
      .then(r => r.json())
      .then(docs => {
        fetch(`${SUPA}/rest/v1/documents?select=id`, {
          headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: 'count=exact', Range: '0-0' },
        }).then(r => {
          const header = r.headers.get('content-range')
          const count = header ? parseInt(header.split('/')[1] || '0') : 0
          setStats({ count, lastUpload: docs[0]?.uploaded_at || null })
        })
      })
      .catch(() => {})
  }, [])
  return stats
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'לפני פחות משעה'
  if (h < 24) return `לפני ${h} שעות`
  const d = Math.floor(h / 24)
  return `לפני ${d} ימים`
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const docStats = useDocStats()

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F0F4F8' }}>
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #CBD5E1' }} className="sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 flex-shrink-0 rounded-xl overflow-hidden" style={{ background: '#fff' }}>
            <Image src="/logo.png" alt="אופק גיזום" width={40} height={40} className="object-contain w-full h-full" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-base leading-tight" style={{ color: '#1E293B' }}>אופק גיזום</div>
            <div style={{ color: '#64748B' }} className="text-xs">מערכת ידע ותחזוקה</div>
          </div>
          {docStats && (
            <div className="text-left">
              <div className="text-xs font-semibold" style={{ color: '#3B82F6' }}>{docStats.count} מסמכים</div>
              {docStats.lastUpload && (
                <div className="text-xs" style={{ color: '#94A3B8' }}>{timeAgo(docStats.lastUpload)}</div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto" style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}>
        {children}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-50" style={{ background: '#FFFFFF', borderTop: '1px solid #CBD5E1', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = path === href || (href !== '/' && path.startsWith(href))
            return (
              <Link key={href} href={href} className="flex-1 flex flex-col items-center gap-0.5 py-2.5"
                style={{ color: active ? '#3B82F6' : '#64748B' }}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
