import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, Calendar, ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function CharityProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  let userData = null
  if (user) {
    const { data } = await supabase.from('users').select('full_name, is_admin').eq('id', user.id).single()
    userData = data ? { email: user.email!, ...data } : null
  }

  const { data: charity } = await supabase
    .from('charities')
    .select('*, charity_events(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!charity) notFound()

  // Total contributions
  const { data: contribData } = await supabase
    .from('charity_contributions')
    .select('amount')
    .eq('charity_id', charity.id)
  const totalContrib = (contribData || []).reduce((s, r) => s + Number(r.amount), 0)

  return (
    <>
      <Navbar user={userData} />
      <div className="pt-24 pb-20 min-h-screen bg-[#FAFAF9]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/charities" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0F1628] text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to charities
          </Link>

          {charity.image_url && (
            <div className="rounded-2xl overflow-hidden h-72 mb-8">
              <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <h1 className="text-4xl font-bold text-[#0F1628]">{charity.name}</h1>
            {charity.website && (
              <a href={charity.website} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors">
                Visit Website <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          <p className="text-slate-600 text-lg leading-relaxed mb-8">{charity.description}</p>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 mb-8">
            <p className="text-slate-500 text-sm mb-1">Total contributed by Gameer members</p>
            <p className="text-3xl font-black text-[#0F1628]">
              £{(totalContrib / 100).toFixed(2)}
            </p>
          </div>

          {charity.charity_events?.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-[#0F1628] mb-6">Upcoming Events</h2>
              <div className="space-y-4">
                {charity.charity_events
                  .sort((a: any, b: any) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
                  .map((ev: any) => (
                    <div key={ev.id} className="bg-white rounded-2xl p-6 border border-slate-100 flex gap-4">
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#0F1628] mb-1">{ev.title}</p>
                        <p className="text-amber-600 text-sm mb-2">{formatDate(ev.event_date)}</p>
                        <p className="text-slate-500 text-sm">{ev.description}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
