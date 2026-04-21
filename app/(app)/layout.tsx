'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageCircle, Wrench, Package, FileText } from 'lucide-react'

const navItems = [
  { href: '/maintenance', label: 'תחזוקה', icon: Wrench },
  { href: '/chat', label: 'צ\'אט', icon: MessageCircle },
  { href: '/parts', label: 'חלקים', icon: Package },
  { href: '/documents', label: 'מסמכים', icon: FileText },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-1 overflow-auto pb-20">{children}</main>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 safe-bottom z-50">
        <div className="flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
