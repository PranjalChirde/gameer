'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Trophy, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    if (error) { setError(error.message); setLoading(false) }
    else setSent(true)
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[#0F1628]" />
            </div>
            <span className="text-white font-bold text-2xl">Game<span className="text-amber-500">er</span></span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Reset your password</h1>
          <p className="text-slate-400">We&apos;ll send you a reset link</p>
        </div>
        <div className="glass rounded-2xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Check your inbox</h3>
              <p className="text-slate-400 text-sm">We sent a password reset link to <strong className="text-white">{email}</strong></p>
              <Link href="/login" className="mt-6 inline-block text-amber-400 hover:text-amber-300 text-sm">Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Email address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="you@example.com" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-[#0F1628] font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
              <p className="text-center text-slate-400 text-sm">
                Remember it?{' '}<Link href="/login" className="text-amber-400 hover:text-amber-300">Sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
