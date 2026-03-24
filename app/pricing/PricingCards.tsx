'use client'

import { useState, useEffect } from 'react'
import { Check, ArrowRight, Star, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    Razorpay: any;
  }
}

const features = [
  'Monthly prize draws with cash prizes',
  'Up to 5 Stableford scores per month',
  'Support your chosen charity',
  'Change charity anytime',
  'Full draw history & results',
  'Proof-based winner verification',
]

const yearlyFeatures = [...features, 'Priority support', 'Bonus jackpot multiplier (coming soon)']

export default function PricingCards({ user }: { user: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null)

  useEffect(() => {
    // Load Razorpay checkout script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!user) {
      router.push('/signup')
      return
    }

    setLoading(plan)
    try {
      // 1. Create subscription order
      const res = await fetch('/api/razorpay/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })
      const data = await res.json()

      if (data.error || !data.subscriptionId) {
        alert(data.error || 'Failed to initialize payment')
        setLoading(null)
        return
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy',
        subscription_id: data.subscriptionId,
        name: 'Gameer Golf',
        description: `${plan === 'monthly' ? 'Monthly' : 'Yearly'} Charity Golf Subscription`,
        handler: async function (response: any) {
          // 3. Verify signature on success
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
              plan
            })
          })
          
          if (verifyRes.ok) {
            router.push('/dashboard')
          } else {
            alert('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: user.full_name || '',
          email: user.email || '',
        },
        theme: {
          color: '#F59E0B'
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        alert(response.error.description || 'Payment Failed')
      })
      rzp.open()
      
    } catch (err) {
      console.error(err)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const handleBypass = async (plan: 'monthly' | 'yearly') => {
    if (!user) {
      router.push('/signup')
      return
    }

    setLoading(plan)
    try {
      const res = await fetch('/api/dev/bypass-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })
      const data = await res.json()
      if (data.success) {
        router.push('/dashboard')
      } else {
        alert(data.error || 'Bypass failed')
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred during bypass.')
    } finally {
      setLoading(null)
    }
  }

  const isDevBypass = process.env.NEXT_PUBLIC_ENABLE_PAYMENT_BYPASS === 'true'

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
      {/* Monthly */}
      <div className="glass rounded-2xl p-8 flex flex-col card-hover">
        <h2 className="text-white font-bold text-xl mb-1">Monthly</h2>
        <p className="text-slate-400 text-sm mb-6">Perfect for getting started</p>
        <div className="mb-6">
          <span className="text-5xl font-black text-white">£9.99</span>
          <span className="text-slate-400 ml-2">/ month</span>
        </div>
        <ul className="space-y-3 mb-8 flex-1">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-slate-300 text-sm">
              <Check className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleSubscribe('monthly')}
            disabled={loading !== null}
            className="w-full border border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-[#0F1628] disabled:opacity-50 font-semibold py-3 rounded-xl flex justify-center items-center transition-all duration-200"
          >
            {loading === 'monthly' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Monthly'}
          </button>
          
          {isDevBypass && (
            <button
              onClick={() => handleBypass('monthly')}
              disabled={loading !== null}
              className="w-full bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 font-semibold py-2 rounded-xl flex justify-center items-center text-sm transition-all duration-200"
            >
              [Dev Mode] Skip Payment
            </button>
          )}
        </div>
      </div>

      {/* Yearly */}
      <div className="relative rounded-2xl p-8 flex flex-col card-hover bg-gradient-to-b from-amber-500/20 to-amber-600/5 border border-amber-500/40">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-amber-500 text-[#0F1628] text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" /> BEST VALUE
          </span>
        </div>
        <h2 className="text-white font-bold text-xl mb-1">Yearly</h2>
        <p className="text-slate-400 text-sm mb-6">Save 17% vs monthly</p>
        <div className="mb-1">
          <span className="text-5xl font-black text-white">£99</span>
          <span className="text-slate-400 ml-2">/ year</span>
        </div>
        <p className="text-amber-400 text-sm mb-6">That&apos;s £8.25/month</p>
        <ul className="space-y-3 mb-8 flex-1">
          {yearlyFeatures.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-slate-300 text-sm">
              <Check className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleSubscribe('yearly')}
            disabled={loading !== null}
            className="w-full bg-amber-500 hover:bg-amber-400 text-[#0F1628] disabled:opacity-50 font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all duration-200"
          >
            {loading === 'yearly' ? <Loader2 className="w-5 h-5 animate-spin" /> : <><>Get Yearly <ArrowRight className="w-4 h-4" /></></>}
          </button>

          {isDevBypass && (
            <button
              onClick={() => handleBypass('yearly')}
              disabled={loading !== null}
              className="w-full bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-50 font-bold py-2 rounded-xl flex justify-center items-center gap-2 text-sm transition-all duration-200"
            >
              [Dev Mode] Skip Payment
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
