import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendDrawResultsEmail, sendWinnerNotificationEmail } from '@/lib/email/sender'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const serverClient = await createClient()
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data: adminCheck } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (!adminCheck?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Get draw
  const { data: draw } = await supabase.from('draws').select('*').eq('id', id).single()
  if (!draw) return NextResponse.json({ error: 'Draw not found' }, { status: 404 })
  if (draw.status === 'published') return NextResponse.json({ error: 'Draw already published' }, { status: 409 })

  // Publish it
  const { error } = await supabase
    .from('draws')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Handle jackpot rollover if no 5-match winners
  const { data: winners5 } = await supabase
    .from('draw_results')
    .select('id')
    .eq('draw_id', id)
    .eq('match_count', 5)

  if (!winners5 || winners5.length === 0) {
    await supabase.from('jackpot_rollover').insert({
      from_draw_id: id,
      to_draw_id: null,
      amount: draw.pool_5match,
    })
  }

  // Get all results with user info for email notifications
  const { data: allResults } = await supabase
    .from('draw_results')
    .select('*, users(email, full_name)')
    .eq('draw_id', id)

  // Get all active subscribers for draw results email
  const { data: activeSubs } = await supabase
    .from('subscriptions')
    .select('user_id, users(email, full_name)')
    .eq('status', 'active')

  const winnerIds = new Set((allResults || []).map((r) => r.user_id))
  const drawnMonth = new Date(draw.draw_month).toLocaleString('en-GB', { month: 'long', year: 'numeric' })

  // Email all subscribers about draw results
  for (const sub of activeSubs || []) {
    const userData = sub.users as any
    if (userData?.email) {
      const hasWon = winnerIds.has(sub.user_id)
      await sendDrawResultsEmail(userData.email, userData.full_name || 'Golfer', drawnMonth, draw.drawn_numbers, hasWon)
    }
  }

  // Send winner-specific emails
  for (const result of allResults || []) {
    const userData = result.users as any
    if (userData?.email) {
      await sendWinnerNotificationEmail(
        userData.email,
        userData.full_name || 'Golfer',
        result.match_count,
        Number(result.prize_amount)
      )
    }
  }

  return NextResponse.json({ message: 'Draw published successfully' })
}
