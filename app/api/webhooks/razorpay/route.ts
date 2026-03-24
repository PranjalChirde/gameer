import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPaymentConfirmationEmail, sendWelcomeEmail } from '@/lib/email/sender'
import { PLANS, razorpay } from '@/lib/razorpay/client'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('x-razorpay-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dummy_webhook_secret'
  const expectedSig = crypto.createHmac('sha256', secret).update(body).digest('hex')

  if (expectedSig !== sig) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
  const supabase = createAdminClient()

  switch (event.event) {
    case 'subscription.charged': {
      const sub = event.payload.subscription.entity
      const payment = event.payload.payment.entity
      const userId = sub.notes?.supabase_user_id
      const plan = sub.notes?.plan as 'monthly' | 'yearly'

      if (!userId || !plan) break

      // Upsert subscription
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan,
        status: 'active',
        provider_subscription_id: sub.id,
        provider_customer_id: payment.customer_id,
        current_period_start: new Date(sub.current_start * 1000).toISOString(),
        current_period_end: new Date(sub.current_end * 1000).toISOString(),
      }, { onConflict: 'user_id' })

      // Handle Charity Contribution
      const { data: user } = await supabase.from('users').select('*, subscriptions(id)').eq('id', userId).single()
      if (user?.selected_charity_id) {
        const planConfig = PLANS[plan]
        const charityAmount = Math.floor(planConfig.amount * (user.charity_contribution_percent / 100))
        const { data: dbSub } = await supabase.from('subscriptions').select('id').eq('user_id', userId).single()
        if (dbSub) {
          await supabase.from('charity_contributions').insert({
            user_id: userId,
            charity_id: user.selected_charity_id,
            subscription_id: dbSub.id,
            amount: charityAmount,
            period: new Date().toISOString().split('T')[0].slice(0, 7) + '-01',
          })
        }
      }

      // If it's the first charge (auth count is 1), send welcome. Else send renewal.
      if (sub.charge_at) { // Just charged
        if (sub.paid_count === 1 && user) {
          await sendWelcomeEmail(user.email, user.full_name || 'Golfer')
        } else if (sub.paid_count > 1 && user) {
          await sendPaymentConfirmationEmail(
            user.email,
            user.full_name || 'Golfer',
            plan === 'monthly' ? 'Monthly' : 'Yearly',
            `£${(PLANS[plan].amount / 100).toFixed(2)}`
          )
        }
      }
      break
    }

    case 'subscription.cancelled':
    case 'subscription.halted': {
      const sub = event.payload.subscription.entity
      await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('provider_subscription_id', sub.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
