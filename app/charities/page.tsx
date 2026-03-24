import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ExternalLink } from 'lucide-react'

export default async function CharitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let userData = null
  if (user) {
    const { data } = await supabase.from('users').select('full_name, is_admin').eq('id', user.id).single()
    userData = data ? { email: user.email!, ...data } : null
  }
  const { data: charities } = await supabase.from('charities').select('*, charity_events(*)').eq('is_active', true).order('name')

  return (
    <>
      <Navbar user={userData} />
      <div className="pt-24 pb-20 min-h-screen bg-[#FAFAF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-[#0F1628] mb-3">Charities We Support</h1>
            <p className="text-slate-500 text-lg">Every subscription contributes to one of these incredible causes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(charities || []).map((charity) => (
              <Link
                key={charity.id}
                href={`/charities/${charity.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 card-hover"
              >
                {charity.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-[#0F1628] font-bold text-xl mb-2">{charity.name}</h3>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-4">{charity.description}</p>
                  {charity.charity_events?.length > 0 && (
                    <div className="bg-amber-50 rounded-xl px-3 py-2">
                      <p className="text-amber-700 text-xs font-medium">
                        📅 {charity.charity_events.length} upcoming event{charity.charity_events.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
