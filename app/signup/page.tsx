'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trophy, Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { Charity } from '@/types'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [charities, setCharities] = useState<Charity[]>([])
  const [form, setForm] = useState({ fullName: '', email: '', password: '', charityId: '' })
  const [showPass, setShowPass] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  useEffect(() => {
    fetch('/api/charities').then(r => r.json()).then(d => setCharities(d.data || []))
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) { setStep(2); return }
    if (!form.charityId) { setError('Please select a charity'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    
    const { data, error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { 
        data: { 
          full_name: form.fullName,
          selected_charity_id: form.charityId 
        } 
      },
    })
    
    if (signupError) { 
      setError(signupError.message)
      setLoading(false)
      return 
    }
    
    if (data.user) {
      if (data.session) {
        router.push('/dashboard?welcome=true')
        router.refresh()
      } else {
        setNeedsConfirmation(true)
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[#0F1628]" />
            </div>
            <span className="text-white font-bold text-2xl">Game<span className="text-amber-500">er</span></span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-slate-400">Join thousands of golfers giving back</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-amber-500 text-[#0F1628]' : 'bg-white/10 text-slate-400'}`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              <span className={`text-sm ${step >= s ? 'text-white' : 'text-slate-500'}`}>
                {s === 1 ? 'Your Details' : 'Choose Charity'}
              </span>
              {s < 2 && <div className={`w-12 h-px ${step > s ? 'bg-amber-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>
          )}

          {needsConfirmation ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-white text-xl font-bold mb-2">Check your email</h2>
              <p className="text-slate-400 mb-8">We've sent a confirmation link to <span className="text-white font-medium">{form.email}</span>. Once confirmed, you can sign in.</p>
              <Link href="/login" className="bg-amber-500 hover:bg-amber-400 text-[#0F1628] font-bold py-3 px-8 rounded-xl transition-all inline-block">
                Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              {step === 1 && (
                <>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text" required value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Email address</label>
                    <input
                      type="email" required value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'} required minLength={8} value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                        placeholder="Min. 8 characters"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-[#0F1628] font-bold py-3 rounded-xl transition-all duration-200">
                    Continue →
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Choose your charity</h3>
                    <p className="text-slate-400 text-sm mb-4">A portion of your subscription will go here every month.</p>
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {charities.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setForm({ ...form, charityId: c.id })}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${form.charityId === c.id
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                        >
                          <div className="flex items-center gap-3">
                            {c.image_url && <img src={c.image_url} alt={c.name} className="w-10 h-10 rounded-lg object-cover" />}
                            <div>
                              <p className="text-white text-sm font-semibold">{c.name}</p>
                              <p className="text-slate-400 text-xs line-clamp-1">{c.description}</p>
                            </div>
                            {form.charityId === c.id && <Check className="w-4 h-4 text-amber-400 ml-auto shrink-0" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit" disabled={loading || !form.charityId}
                    className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-[#0F1628] font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? 'Creating account…' : 'Create Account'}
                  </button>
                  <button type="button" onClick={() => setStep(1)} className="w-full text-slate-400 hover:text-white text-sm py-2 transition-colors">
                    ← Back
                  </button>
                </>
              )}
            </form>
          )}

          {step === 1 && !needsConfirmation && (
            <p className="text-center text-slate-400 text-sm mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
