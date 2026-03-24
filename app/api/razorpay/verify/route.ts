import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { PLANS } from '@/lib/razorpay/client'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, plan } = await req.json()

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_payment_id + '|' + razorpay_subscription_id)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Signature is valid. Create/update the subscription in our DB
    // Webhooks will also trigger, but this provides immediate UI feedback
    await supabase.from('subscriptions').upsert({
      user_id: user.id,
      plan: plan,
      status: 'active',
      provider_subscription_id: razorpay_subscription_id,
      provider_customer_id: 'pending', // Will be updated by webhook
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: 'user_id' })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
