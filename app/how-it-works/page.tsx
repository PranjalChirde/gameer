import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Shield, Target, Trophy, ArrowRight, Heart, Dices, DollarSign } from 'lucide-react'

export default async function HowItWorksPage() {
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
      <div className="min-h-screen bg-white pt-24">
        {/* Hero */}
        <div className="hero-gradient py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-white mb-4">How Gameer Works</h1>
            <p className="text-slate-300 text-xl">A transparent platform where golf scores drive prize draws and charitable giving.</p>
          </div>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="space-y-16">
            {[
              {
                step: '01', icon: Shield, title: 'Subscribe to a Plan',
                content: [
                  'Choose Monthly (£9.99) or Yearly (£99) — both include full access.',
                  'Your subscription is split automatically: a portion goes to your chosen charity (min. 10%) and a portion funds the monthly prize pool (£2/month or £20/year).',
                  'Payments are processed securely via Stripe. Cancel any time.',
                ],
              },
              {
                step: '02', icon: Target, title: 'Enter Your Golf Scores',
                content: [
                  'Log up to 5 Stableford scores (valid range: 1–45) via your dashboard.',
                  'Scores represent points scored on each hole following Stableford rules. They must be dated and unique per day.',
                  'When you enter a 6th score, the oldest is automatically removed — only your latest 5 count.',
                  'Scores are visible on your dashboard and used directly in the monthly draw.',
                ],
              },
              {
                step: '03', icon: Dices, title: 'The Monthly Draw',
                content: [
                  'At the end of each month, 5 unique numbers (1–45) are drawn.',
                  'The draw can be fully random or algorithmically weighted (admin-controlled).',
                  'Your 5 stored scores are compared against the 5 drawn numbers.',
                  '5 matches = 5-Number Match · 4 matches = 4-Number Match · 3 matches = 3-Number Match.',
                  'You only win in your highest tier. Results are published instantly with email notifications.',
                ],
              },
              {
                step: '04', icon: DollarSign, title: 'Prize Pool Breakdown',
                content: [
                  '5-Number Match pool: 40% of total prize pool',
                  '4-Number Match pool: 35% of total prize pool',
                  '3-Number Match pool: 25% of total prize pool',
                  'If no 5-match winner: the 40% jackpot rolls over to next month\'s pool.',
                  '4-match and 3-match pools do NOT roll over — they reset each month.',
                  'If multiple winners in the same tier, the prize is split equally.',
                ],
              },
              {
                step: '05', icon: Trophy, title: 'Verify & Claim Your Prize',
                content: [
                  'Winners receive an email notification immediately after the draw is published.',
                  'Log in to your dashboard > Winnings to see your pending prize.',
                  'Upload a screenshot of your score history from your golf scoring platform (e.g. HowDidiDo, Golf GameBook).',
                  'Our team reviews and verifies your proof. Once approved, your payout is processed.',
                ],
              },
              {
                step: '06', icon: Heart, title: 'Your Charity Contribution',
                content: [
                  'Every month, your chosen charity receives a percentage of your subscription.',
                  'The default is 10% — you can increase this up to 100% in your settings.',
                  'You can change your charity at any time from the dashboard.',
                  'Total contributions are displayed on each charity\'s profile page.',
                ],
              },
            ].map(({ step, icon: Icon, title, content }) => (
              <div key={step} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-1 flex md:justify-end">
                  <span className="text-4xl font-black text-slate-100">{step}</span>
                </div>
                <div className="md:col-span-11">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#0F1628]">{title}</h2>
                  </div>
                  <ul className="space-y-2">
                    {content.map((item, i) => (
                      <li key={i} className="text-slate-500 flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prize pool table */}
        <div className="bg-[#0F1628] py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-10">Prize Pool at a Glance</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-amber-400 font-semibold">Match Tier</th>
                    <th className="text-left py-3 px-4 text-amber-400 font-semibold">Pool %</th>
                    <th className="text-left py-3 px-4 text-amber-400 font-semibold">Rolls Over?</th>
                    <th className="text-left py-3 px-4 text-amber-400 font-semibold">Example (£500 pool)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['5 Numbers', '40%', 'Yes (jackpot)', '£200'],
                    ['4 Numbers', '35%', 'No', '£175'],
                    ['3 Numbers', '25%', 'No', '£125'],
                  ].map(([tier, pct, rollover, example]) => (
                    <tr key={tier} className="border-b border-white/5">
                      <td className="py-3 px-4 font-medium text-white">{tier}</td>
                      <td className="py-3 px-4">{pct}</td>
                      <td className="py-3 px-4">{rollover}</td>
                      <td className="py-3 px-4 text-amber-400 font-medium">{example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-20 px-4 text-center bg-white">
          <h2 className="text-4xl font-bold text-[#0F1628] mb-4">Ready to start playing with purpose?</h2>
          <p className="text-slate-500 mb-8 text-lg">Join Gameer today and turn your golf game into meaningful impact.</p>
          <Link href="/signup"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-[#0F1628] font-bold px-10 py-4 rounded-xl text-lg transition-all duration-200 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
      <Footer />
    </>
  )
}
