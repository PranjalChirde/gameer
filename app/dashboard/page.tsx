import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import DashboardSidebar from '@/components/layout/DashboardSidebar'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'
import { CreditCard, Target, Heart, Trophy, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('*, charities(name, image_url), subscriptions(*)').eq('id', user.id).single()
  if (!userData) redirect('/login')

  const subscription = userData.subscriptions?.[0]
  const { data: scores } = await supabase.from('scores').select('*').eq('user_id', user.id).order('played_on', { ascending: false })
  const { data: wins } = await supabase.from('draw_results').select('*, draw:draws(draw_month)').eq('user_id', user.id).order('created_at', { ascending: false })
  const { data: draws } = await supabase.from('draws').select('id, draw_month').order('draw_month', { ascending: false })
  const { data: contributions } = await supabase.from('charity_contributions').select('amount').eq('user_id', user.id)
  const totalContrib = (contributions || []).reduce((s, c) => s + Number(c.amount), 0)
  const totalWon = (wins || []).reduce((s, w) => s + Number(w.prize_amount), 0)
  const navUser = { email: user.email!, full_name: userData.full_name, is_admin: userData.is_admin }

  return (
    <>
      <Navbar user={navUser} />
      <div className="flex min-h-screen bg-[#FAFAF9] pt-16">
        <DashboardSidebar />
        <main className="flex-1 p-6 lg:p-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F1628]">Welcome back, {userData.full_name?.split(' ')[0] || 'Golfer'} 👋</h1>
            <p className="text-slate-500 mt-1">Here&apos;s your Gameer overview</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Subscription', value: subscription?.status === 'active' ? 'Active' : 'Inactive', icon: CreditCard, color: subscription?.status === 'active' ? 'text-green-500' : 'text-red-400', sub: subscription?.plan ? `${subscription.plan} plan` : 'No plan' },
              { label: 'Scores', value: `${scores?.length || 0}/5`, icon: Target, color: 'text-amber-500', sub: 'Scores this period' },
              { label: 'Charity Given', value: `£${(totalContrib / 100).toFixed(2)}`, icon: Heart, color: 'text-pink-500', sub: userData.charities?.name || 'No charity' },
              { label: 'Total Won', value: `£${(totalWon / 100).toFixed(2)}`, icon: Trophy, color: 'text-amber-400', sub: `${wins?.length || 0} wins lifetime` },
            ].map(({ label, value, icon: Icon, color, sub }) => (
              <div key={label} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-500 text-sm">{label}</span>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="text-2xl font-bold text-[#0F1628]">{value}</p>
                <p className="text-slate-400 text-xs mt-1">{sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h2 className="font-bold text-[#0F1628] text-lg mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-amber-500" /> Subscription</h2>
              {subscription?.status === 'active' ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Plan</span>
                    <span className="font-semibold text-[#0F1628] capitalize">{subscription.plan}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <span className="text-green-500 font-semibold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Active</span>
                  </div>
                  {subscription.current_period_end && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Renews</span>
                      <span className="font-semibold">{formatDate(subscription.current_period_end)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-slate-100">
                    <Link href="/dashboard/settings" className="text-sm text-amber-600 hover:text-amber-700 font-medium">Manage subscription →</Link>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-slate-500 text-sm mb-4">You don&apos;t have an active subscription</p>
                  <Link href="/pricing" className="bg-amber-500 hover:bg-amber-400 text-[#0F1628] font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">Subscribe Now</Link>
                </div>
              )}
            </div>

            {/* Recent Scores */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#0F1628] text-lg flex items-center gap-2"><Target className="w-5 h-5 text-amber-500" /> Recent Scores</h2>
                <Link href="/dashboard/scores" className="text-sm text-amber-600 hover:text-amber-700 font-medium">Manage →</Link>
              </div>
              {scores && scores.length > 0 ? (
                <div className="space-y-2">
                  {scores.slice(0, 5).map((score, i) => (
                    <div key={score.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <span className="text-slate-500 text-sm">{formatDate(score.played_on)}</span>
                      <span className="font-bold text-[#0F1628] text-lg">{score.score}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No scores yet. <Link href="/dashboard/scores" className="text-amber-600">Add your first score →</Link></p>
              )}
            </div>

            {/* Latest Win */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#0F1628] text-lg flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-400" /> Latest Result</h2>
                <Link href="/dashboard/wins" className="text-sm text-amber-600 hover:text-amber-700 font-medium">All wins →</Link>
              </div>
              {wins && wins.length > 0 ? (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[#0F1628] font-semibold">{wins[0].match_count}-Number Match</p>
                      <p className="text-slate-400 text-sm">{wins[0].draw?.draw_month ? new Date(wins[0].draw.draw_month).toLocaleString('en-GB', { month: 'long', year: 'numeric' }) : 'N/A'}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-[#0F1628] font-bold">£{(Number(wins[0].prize_amount) / 100).toFixed(2)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${wins[0].payment_status === 'paid' ? 'bg-green-100 text-green-700' : wins[0].payment_status === 'verified' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {wins[0].payment_status}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No wins yet — keep playing!</p>
              )}
            </div>

            {/* Next Draw */}
            <div className="bg-[#0F1628] rounded-2xl p-6">
              <h2 className="font-bold text-white text-lg mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-amber-400" /> Next Draw</h2>
              <p className="text-slate-400 text-sm mb-3">The monthly draw runs at the end of each month. Make sure your scores are entered!</p>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-amber-400 font-bold text-sm uppercase tracking-wide mb-1">Draw Participation</p>
                <p className="text-white text-sm">You need at least 1 score to participate. Enter scores on the Scores page.</p>
              </div>
              <Link href="/dashboard/scores" className="mt-4 inline-block bg-amber-500 hover:bg-amber-400 text-[#0F1628] font-semibold px-4 py-2.5 rounded-xl text-sm transition-all">
                Add Scores
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
