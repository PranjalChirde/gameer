import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/layout/DashboardSidebar'
import CharitySettingsClient from './CharitySettingsClient'

export default async function CharityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('*, charities(*)').eq('id', user.id).single()
  const { data: charities } = await supabase.from('charities').select('*').eq('is_active', true).order('name')
  const { data: contributions } = await supabase.from('charity_contributions').select('amount').eq('user_id', user.id)
  const totalContrib = (contributions || []).reduce((s, c) => s + Number(c.amount), 0)

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] pt-16">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-10">
        <CharitySettingsClient
          userData={userData}
          charities={charities || []}
          totalContrib={totalContrib}
        />
      </main>
    </div>
  )
}
