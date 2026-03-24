import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import { BarChart3, TrendingUp, Users, Heart, Trophy } from 'lucide-react'

export default async function AdminReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: adminCheck } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (!adminCheck?.is_admin) redirect('/dashboard')

  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { data: allContribs },
    { data: draws },
    { data: winners },
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('charity_contributions').select('amount, charities(name)'),
    supabase.from('draws').select('*').order('draw_month', { ascending: false }).limit(6),
    supabase.from('draw_results').select('match_count, prize_amount, payment_status'),
  ])

  const totalContrib = (allContribs || []).reduce((s, c) => s + Number(c.amount), 0)
  const totalPrizesAwarded = (winners || []).filter(w => w.payment_status === 'paid').reduce((s, w) => s + Number(w.prize_amount), 0)

  // Group contributions by charity
  const contribByCharity: Record<string, number> = {}
  for (const c of allContribs || []) {
    const name = (c.charities as any)?.name || 'Unknown'
    contribByCharity[name] = (contribByCharity[name] || 0) + Number(c.amount)
  }

  // Match distribution
  const matchDist = { 3: 0, 4: 0, 5: 0 }
  for (const w of winners || []) {
    if (w.match_count in matchDist) matchDist[w.match_count as 3 | 4 | 5]++
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] pt-16">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-10">
        <h1 className="text-3xl font-bold text-[#0F1628] mb-2 flex items-center gap-3"><BarChart3 className="w-7 h-7 text-purple-500" /> Reports & Analytics</h1>
        <p className="text-slate-500 mb-8">Platform-wide stats and insights</p>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: totalUsers || 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
            { label: 'Active Subscribers', value: activeSubscribers || 0, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
            { label: 'Total Charity Given', value: `£${(totalContrib / 100).toFixed(2)}`, icon: Heart, color: 'bg-pink-50 text-pink-600' },
            { label: 'Total Prizes Paid', value: `£${(totalPrizesAwarded / 100).toFixed(2)}`, icon: Trophy, color: 'bg-amber-50 text-amber-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
              <p className="text-2xl font-black text-[#0F1628]">{value}</p>
              <p className="text-slate-400 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Charity Contributions Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-bold text-[#0F1628] mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-pink-500" /> Contributions by Charity</h2>
            <div className="space-y-3">
              {Object.entries(contribByCharity).sort((a, b) => b[1] - a[1]).map(([name, amount]) => {
                const pct = totalContrib > 0 ? Math.round((amount / totalContrib) * 100) : 0
                return (
                  <div key={name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#0F1628] font-medium truncate">{name}</span>
                      <span className="text-slate-500 shrink-0 ml-2">£{(amount / 100).toFixed(2)}</span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              {Object.keys(contribByCharity).length === 0 && <p className="text-slate-400 text-sm">No contributions yet</p>}
            </div>
          </div>

          {/* Match Distribution */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-bold text-[#0F1628] mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> Winner Match Distribution</h2>
            <div className="space-y-4">
              {Object.entries(matchDist).reverse().map(([match, count]) => (
                <div key={match}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#0F1628] font-medium">{match}-Number Match</span>
                    <span className="text-slate-500">{count} winner{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: count > 0 ? `${Math.min(100, count * 20)}%` : '0%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Draw History Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <h2 className="font-bold text-[#0F1628]">Recent Draws</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Month', 'Type', 'Numbers', 'Pool (5)', 'Pool (4)', 'Pool (3)', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-slate-600 font-semibold text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(draws || []).map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{new Date(d.draw_month).toLocaleString('en-GB', { month: 'short', year: 'numeric' })}</td>
                    <td className="px-4 py-3 capitalize text-slate-500">{d.draw_type}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">[{d.drawn_numbers?.join(', ')}]</td>
                    <td className="px-4 py-3 text-green-600 font-medium">£{(Number(d.pool_5match) / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-blue-600 font-medium">£{(Number(d.pool_4match) / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-purple-600 font-medium">£{(Number(d.pool_3match) / 100).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.status === 'published' ? 'bg-green-100 text-green-700' : d.status === 'simulated' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!draws?.length && <tr><td colSpan={7} className="text-center py-8 text-slate-400">No draws yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
