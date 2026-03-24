'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Trophy, LogOut, User, LayoutDashboard, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  user?: { email: string; full_name?: string; is_admin?: boolean } | null
}

export default function Navbar({ user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Trophy className="w-4 h-4 text-navy" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Game<span className="text-amber-500">er</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/charities" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
              Charities
            </Link>
            <Link href="/how-it-works" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
              How It Works
            </Link>
            <Link href="/pricing" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
              Pricing
            </Link>
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {user.is_admin && (
                  <Link href="/admin" className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">
                    Admin
                  </Link>
                )}
                <Link href="/dashboard" className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-medium transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-amber-500 hover:bg-amber-400 text-navy font-semibold text-sm px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-navy-800 border-t border-white/10 px-4 py-4 space-y-3">
          <Link href="/charities" className="block text-slate-300 hover:text-white py-2">Charities</Link>
          <Link href="/how-it-works" className="block text-slate-300 hover:text-white py-2">How It Works</Link>
          <Link href="/pricing" className="block text-slate-300 hover:text-white py-2">Pricing</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="block text-slate-300 hover:text-white py-2">Dashboard</Link>
              {user.is_admin && <Link href="/admin" className="block text-amber-400 py-2">Admin Panel</Link>}
              <button onClick={handleLogout} className="block text-slate-400 hover:text-white py-2">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-slate-300 hover:text-white py-2">Sign In</Link>
              <Link href="/signup" className="block bg-amber-500 text-navy font-semibold py-2 px-4 rounded-lg text-center">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
