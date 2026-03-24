import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { Users, Dices, Heart, Trophy, BarChart3, TrendingUp } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: userData } = await supabase.from('users').select('full_name, is_admin').eq('id', user.id).single()
  if (!userData?.is_admin) redirect('/dashboard')

  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { data: pendingWinners },
    { data: recentDraw },
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('draw_results').select('id', { count: 'exact', head: true }).eq('payment_status', 'pending'),
    supabase.from('draws').select('draw_month, status, prize_pool_total').order('draw_month', { ascending: false }).limit(1),
  ])

  const navUser = { email: user.email!, full_name: userData.full_name, is_admin: true }

  return (
    <>
      <Navbar user={navUser} />
      <div className="flex min-h-screen bg-[#FAFAF9] pt-16">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F1628]">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Platform overview and quick actions</p>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: totalUsers || 0, icon: Users, color: 'text-blue-500', href: '/admin/users' },
              { label: 'Active Subscribers', value: activeSubscribers || 0, icon: TrendingUp, color: 'text-green-500', href: '/admin/users' },
              { label: 'Pending Verifications', value: (pendingWinners as any)?.length ?? 0, icon: Trophy, color: 'text-amber-500', href: '/admin/winners' },
              { label: 'Last Prize Pool', value: recentDraw?.[0] ? `£${(Number(recentDraw[0].prize_pool_total) / 100).toFixed(0)}` : '£0', icon: BarChart3, color: 'text-purple-500', href: '/admin/reports' },
            ].map(({ label, value, icon: Icon, color, href }) => (
              <Link key={label} href={href} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-500 text-xs">{label}</span>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="text-2xl font-bold text-[#0F1628]">{value}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: '/admin/draws', icon: Dices, label: 'Manage Draws', desc: 'Create and publish monthly prize draws' },
              { href: '/admin/winners', icon: Trophy, label: 'Review Winners', desc: 'Approve winner verifications and payouts' },
              { href: '/admin/charities', icon: Heart, label: 'Manage Charities', desc: 'Add, edit, and feature charities' },
              { href: '/admin/users', icon: Users, label: 'User Management', desc: 'View and manage platform members' },
              { href: '/admin/reports', icon: BarChart3, label: 'Reports', desc: 'Revenue, contributions, and draw analytics' },
            ].map(({ href, icon: Icon, label, desc }) => (
              <Link key={href} href={href} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm card-hover flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-[#0F1628] mb-1">{label}</p>
                  <p className="text-slate-400 text-sm">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </>
  )
}
