import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Trophy, Heart, Target, ArrowRight, Star, Users, TrendingUp, Shield } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userData = null
  if (user) {
    const { data } = await supabase.from('users').select('full_name, is_admin').eq('id', user.id).single()
    userData = data ? { email: user.email!, ...data } : null
  }

  const { data: featuredCharity } = await supabase
    .from('charities')
    .select('*')
    .eq('is_featured', true)
    .eq('is_active', true)
    .single()

  const { data: latestDraw } = await supabase
    .from('draws')
    .select('prize_pool_total, draw_month')
    .eq('status', 'published')
    .order('draw_month', { ascending: false })
    .limit(1)
    .single()

  const { count: activeSubscribers } = await supabase
    .from('subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')

  return (
    <>
      <Navbar user={userData} />

      {/* Hero */}
      <section className="hero-gradient min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-[url('/hero.png')] bg-cover bg-center mix-blend-overlay opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative z-10 w-full">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5 mb-8">
              <Heart className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 text-xs font-medium tracking-wide">Golf meets philanthropy</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Play Golf.{' '}
              <span className="gradient-text">Win Prizes.</span>
              <br />
              Fund Change.
            </h1>

            <p className="text-slate-300 text-xl leading-relaxed max-w-2xl mb-10">
              Every month your Stableford scores enter you in a draw with real cash prizes — and a portion of every subscription goes straight to the charity you choose.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-[#0F1628] font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] group"
              >
                Start Giving Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200"
              >
                How It Works
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-14">
              {[
                { label: 'Active Members', value: `${activeSubscribers || 0}+` },
                { label: 'Last Prize Pool', value: latestDraw ? `£${(Number(latestDraw.prize_pool_total) / 100).toFixed(0)}` : '£0' },
                { label: 'Charities Supported', value: '5+' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating card decoration */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:block">
          <div className="glass rounded-2xl p-6 w-72 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Monthly Draw</p>
                <p className="text-slate-400 text-xs">Last day of each month</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: '5 Match', pct: '40%', color: 'bg-amber-500' },
                { label: '4 Match', pct: '35%', color: 'bg-amber-400/70' },
                { label: '3 Match', pct: '25%', color: 'bg-amber-300/50' },
              ].map((tier) => (
                <div key={tier.label} className="flex items-center gap-3 text-xs text-slate-300">
                  <span className="w-16">{tier.label}</span>
                  <div className="flex-1 bg-white/10 rounded-full h-1.5">
                    <div className={`${tier.color} h-1.5 rounded-full`} style={{ width: tier.pct }} />
                  </div>
                  <span className="text-slate-400">{tier.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0F1628]">Three simple steps</h2>
            <p className="text-slate-500 mt-4 text-lg">From signup to changing lives in minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: '01',
                icon: Shield,
                title: 'Subscribe & Choose',
                desc: 'Pick a monthly or yearly plan, then choose which charity your contribution goes to.',
              },
              {
                step: '02',
                icon: Target,
                title: 'Enter Your Scores',
                desc: 'Log up to 5 Stableford scores (1–45) throughout the month. The more you play, the better your entry.',
              },
              {
                step: '03',
                icon: Trophy,
                title: 'Win & Give Back',
                desc: 'Monthly draw matches your scores against 5 drawn numbers. Win cash prizes while your charity receives its share.',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative card-hover bg-[#FAFAF9] rounded-2xl p-8 border border-slate-100">
                <div className="text-7xl font-black text-slate-100 absolute top-4 right-6">{step}</div>
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-[#0F1628] mb-3">{title}</h3>
                <p className="text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Charity */}
      {featuredCharity && (
        <section className="py-24 bg-[#0F1628]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-2">Featured Charity</p>
              <h2 className="text-4xl font-bold text-white">This month&apos;s spotlight</h2>
            </div>
            <div className="max-w-3xl mx-auto glass rounded-2xl overflow-hidden">
              {featuredCharity.image_url && (
                <img
                  src={featuredCharity.image_url}
                  alt={featuredCharity.name}
                  className="w-full h-56 object-cover"
                />
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-3">{featuredCharity.name}</h3>
                <p className="text-slate-300 mb-6">{featuredCharity.description}</p>
                <div className="flex gap-4">
                  <Link
                    href={`/charities/${featuredCharity.slug}`}
                    className="bg-amber-500 hover:bg-amber-400 text-[#0F1628] font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 text-sm"
                  >
                    Learn More
                  </Link>
                  <Link
                    href="/charities"
                    className="border border-white/20 text-white hover:bg-white/10 font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 text-sm"
                  >
                    All Charities
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Social Proof */}
      <section className="py-20 bg-[#F4F4F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, label: 'Golfers supporting charity', value: `${activeSubscribers || 247}+` },
              { icon: Heart, label: 'Charities benefiting', value: '5' },
              { icon: TrendingUp, label: 'Monthly prize pool (avg)', value: '£420+' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center bg-white rounded-2xl p-8 shadow-sm">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-amber-600" />
                </div>
                <p className="text-4xl font-black text-[#0F1628] mb-2">{value}</p>
                <p className="text-slate-500 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to play for a purpose?</h2>
          <p className="text-slate-300 text-lg mb-8">Join thousands of golfers who are using their game to fund charities they care about.</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-[#0F1628] font-bold px-10 py-4 rounded-xl text-lg transition-all duration-200 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]"
          >
            Get Started — It&apos;s Free to Join
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-slate-400 text-sm mt-4">Cancel anytime. No golf club required.</p>
        </div>
      </section>

      <Footer />
    </>
  )
}
