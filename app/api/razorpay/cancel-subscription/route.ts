import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { razorpay } from '@/lib/razorpay/client'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('provider_subscription_id')
      .eq('user_id', user.id)
      .single()

    if (!sub?.provider_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }

    // Cancel razorpay subscription
    await razorpay.subscriptions.cancel(sub.provider_subscription_id, false) // false = cancel immediately (or true for at period end depending on your needs. Let's do false to match simple flow)

    // Optionally update DB immediately, but webhook will also handle it
    await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('provider_subscription_id', sub.provider_subscription_id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Cancellation Error:', error)
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}
