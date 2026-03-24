import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/layout/DashboardSidebar'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: userData } = await supabase.from('users').select('*, subscriptions(*)').eq('id', user.id).single()
  const subscription = userData?.subscriptions?.[0]

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] pt-16">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-10">
        <SettingsClient user={{ ...userData, email: user.email }} subscription={subscription} />
      </main>
    </div>
  )
}
