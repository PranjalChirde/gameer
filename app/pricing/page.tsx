import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import PricingCards from './PricingCards'

export const dynamic = 'force-dynamic'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let userData = null
  if (user) {
    const { data } = await supabase.from('users').select('full_name, is_admin').eq('id', user.id).single()
    userData = data ? { email: user.email!, ...data } : null
  }

  return (
    <>
      <Navbar user={userData} />
      <div className="pt-24 pb-20 min-h-screen bg-[#0F1628]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-4">Simple, transparent pricing</h1>
            <p className="text-slate-400 text-xl">No hidden fees. Cancel anytime. Every penny goes further.</p>
          </div>

          <PricingCards user={userData} />

          <p className="text-center text-slate-500 text-sm mt-10">
            Prices include charity contribution (min. 10%). Payments processed securely by Razorpay.
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}
