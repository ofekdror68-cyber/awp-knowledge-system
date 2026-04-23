'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageCircle, Wrench, Package, FileText } from 'lucide-react'

const nav = [
  { href: '/maintenance', label: 'תחזוקה', icon: Wrench },
  { href: '/chat', label: 'צ\'אט', icon: MessageCircle },
  { href: '/parts', label: 'חלקים', icon: Package },
  { href: '/documents', label: 'מסמכים', icon: FileText },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0F172A' }}>
      {/* Header */}
      <header style={{ background: '#1E293B', borderBottom: '1px solid #334155' }} className="sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 py-3">
          <div style={{ background: '#3B82F6', borderRadius: 10 }} className="w-9 h-9 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">א</span>
          </div>
          <div>
            <div className="font-bold text-white text-base leading-tight">אופק גיזום</div>
            <div style={{ color: '#94A3B8' }} className="text-xs">מערכת ידע ותחזוקה</div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto pb-20">{children}</main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-50 safe-bottom" style={{ background: '#1E293B', borderTop: '1px solid #334155' }}>
        <div className="flex">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = path === href || (href !== '/' && path.startsWith(href))
            return (
              <Link key={href} href={href} className="flex-1 flex flex-col items-center gap-1 py-3"
                style={{ color: active ? '#3B82F6' : '#64748B' }}>
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
