import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PLANS } from '@/lib/razorpay/client'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (process.env.NEXT_PUBLIC_ENABLE_PAYMENT_BYPASS !== 'true') {
      return NextResponse.json({ error: 'Bypass disabled' }, { status: 403 })
    }

    const { plan } = await req.json()
    if (!plan || !(plan in PLANS)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const adminDb = createAdminClient()
    const mockSubId = `sub_mock_${Math.random().toString(36).substring(2, 11)}`

    // Create or update subscription
    await adminDb.from('subscriptions').upsert({
      user_id: user.id,
      plan: plan,
      status: 'active',
      provider_subscription_id: mockSubId,
      provider_customer_id: `cust_mock_${user.id.substring(0, 8)}`,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: 'user_id' })

    // Create Charity Contribution
    const { data: userData } = await adminDb.from('users').select('*, subscriptions(id)').eq('id', user.id).single()
    if (userData?.selected_charity_id) {
      const planConfig = PLANS[plan as keyof typeof PLANS]
      const charityAmount = Math.floor(planConfig.amount * (userData.charity_contribution_percent / 100))
      const { data: dbSub } = await adminDb.from('subscriptions').select('id').eq('user_id', user.id).single()
      
      if (dbSub) {
        await adminDb.from('charity_contributions').insert({
          user_id: user.id,
          charity_id: userData.selected_charity_id,
          subscription_id: dbSub.id,
          amount: charityAmount,
          period: new Date().toISOString().split('T')[0].slice(0, 7) + '-01',
        })
      }
    }

    return NextResponse.json({ success: true, subscriptionId: mockSubId })
  } catch (error: any) {
    console.error('Bypass error:', error)
    return NextResponse.json({ error: 'Failed to bypass payment' }, { status: 500 })
  }
}
