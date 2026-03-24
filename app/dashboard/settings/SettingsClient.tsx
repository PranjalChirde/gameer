'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Settings, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function SettingsClient({ user, subscription }: { user: any; subscription: any }) {
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const router = useRouter()

  const handleSaveProfile = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('users').update({ full_name: fullName }).eq('id', user.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCancelSubscription = async () => {
    setCancelling(true)
    try {
      const res = await fetch('/api/razorpay/cancel-subscription', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        alert('Subscription cancelled successfully.')
        window.location.reload() // Reload to reflect changes
      } else {
        alert(data.error || 'Unable to cancel. Contact support.')
      }
    } catch {
      alert('Unable to cancel. Contact support.')
    } finally {
      setCancelling(false)
      setShowCancel(false)
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-[#0F1628] mb-2 flex items-center gap-3"><Settings className="w-7 h-7 text-amber-500" /> Account Settings</h1>
      <p className="text-slate-500 mb-8">Manage your profile and subscription</p>

      {/* Profile */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
        <h2 className="font-semibold text-[#0F1628] mb-4">Profile</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-slate-600 text-sm mb-1">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F1628] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm" />
          </div>
          <div>
            <label className="block text-slate-600 text-sm mb-1">Email</label>
            <input type="email" value={user?.email || ''} disabled className="w-full border border-slate-100 bg-slate-50 rounded-xl px-4 py-2.5 text-slate-400 text-sm" />
          </div>
          <button onClick={handleSaveProfile} disabled={saving}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-[#0F1628] font-semibold px-6 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : null}
            {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
        <h2 className="font-semibold text-[#0F1628] mb-4">Subscription</h2>
        {subscription ? (
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Plan</span><span className="font-semibold capitalize">{subscription.plan}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Status</span>
              <span className={`font-semibold capitalize ${subscription.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>{subscription.status}</span>
            </div>
            {subscription.current_period_end && (
              <div className="flex justify-between text-sm"><span className="text-slate-500">Renews</span><span className="font-semibold">{formatDate(subscription.current_period_end)}</span></div>
            )}
            <div className="pt-3 border-t border-slate-100 flex gap-3">
              <button onClick={() => setShowCancel(true)} className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">Cancel Subscription</button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-slate-500 text-sm mb-4">No active subscription</p>
            <a href="/pricing" className="bg-amber-500 hover:bg-amber-400 text-[#0F1628] font-semibold px-4 py-2.5 rounded-xl text-sm transition-all inline-block">Subscribe Now</a>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h3 className="text-[#0F1628] font-bold text-xl">Cancel Subscription?</h3>
            </div>
            <p className="text-slate-500 text-sm mb-6">You&apos;ll lose access to monthly draws and your charity contributions will stop. Your access continues until the end of the billing period.</p>
            <div className="flex gap-3">
              <button onClick={handleCancelSubscription} disabled={cancelling}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                {cancelling ? 'Opening portal…' : 'Yes, Cancel'}
              </button>
              <button onClick={() => setShowCancel(false)} className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-2.5 rounded-xl text-sm transition-colors">Keep Subscription</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
