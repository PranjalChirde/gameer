'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Dices, Heart, Trophy, BarChart3, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/draws', label: 'Draws', icon: Dices },
  { href: '/admin/charities', label: 'Charities', icon: Heart },
  { href: '/admin/winners', label: 'Winners', icon: Trophy },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-64 min-h-screen bg-[#0F1628] border-r border-white/10 p-4 hidden lg:block">
      <div className="mt-4 mb-8 px-3">
        <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Admin Panel</span>
      </div>
      <nav className="space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-amber-500 text-[#0F1628]'
                  : 'text-slate-400 hover:text-white hover:bg-white/8'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
