import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { razorpay, PLANS } from '@/lib/razorpay/client'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan } = await req.json()
    if (!plan || !(plan in PLANS)) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    // Usually subscriptions are created directly in Razorpay
    const subscription = await razorpay.subscriptions.create({
      plan_id: PLANS[plan as keyof typeof PLANS].plan_id,
      customer_notify: 1,
      total_count: plan === 'monthly' ? 120 : 10, // Max 10 years
      notes: {
        supabase_user_id: user.id,
        plan: plan,
      }
    })

    return NextResponse.json({ subscriptionId: subscription.id })
  } catch (error: any) {
    console.error('Razorpay Error:', error)
    return NextResponse.json({ error: error.message || 'Error creating subscription' }, { status: 500 })
  }
}
