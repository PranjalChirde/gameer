'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Target, Heart, Trophy, Settings, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/scores', label: 'My Scores', icon: Target },
  { href: '/dashboard/charity', label: 'Charity', icon: Heart },
  { href: '/dashboard/wins', label: 'Winnings', icon: Trophy },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-64 min-h-screen bg-[#0F1628] border-r border-white/10 p-4 hidden lg:block">
      <nav className="space-y-1 mt-8">
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
