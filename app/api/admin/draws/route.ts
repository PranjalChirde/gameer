import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import {
  generateRandomDraw,
  generateAlgorithmicDraw,
  matchScores,
  calculatePrizePools,
  distributePrize,
} from '@/lib/draw/engine'
import { PLANS } from '@/lib/razorpay/client'
import { sendDrawResultsEmail, sendWinnerNotificationEmail } from '@/lib/email/sender'
import { z } from 'zod'

const createDrawSchema = z.object({
  draw_month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  draw_type: z.enum(['random', 'algorithmic']),
  weighting: z.enum(['most_frequent', 'least_frequent']).optional(),
})

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .order('draw_month', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const serverClient = await createClient()
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data: adminCheck } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (!adminCheck?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = createDrawSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { draw_month, draw_type, weighting } = parsed.data

  // Get all active subscribers
  const { data: activeSubs } = await supabase
    .from('subscriptions')
    .select('user_id, plan')
    .eq('status', 'active')

  if (!activeSubs || activeSubs.length === 0) {
    return NextResponse.json({ error: 'No active subscribers found' }, { status: 400 })
  }

  // Get pending rollover
  const { data: rollover } = await supabase
    .from('jackpot_rollover')
    .select('amount')
    .is('to_draw_id', null)
    .single()

  const rolloverAmount = rollover ? Number(rollover.amount) : 0

  // Calculate prize pools — use average contribution
  const totalContribution = activeSubs.reduce((sum, s) => {
    const plan = s.plan as 'monthly' | 'yearly'
    return sum + (PLANS[plan]?.prizePoolContribution ?? 200)
  }, 0)
  const pools = calculatePrizePools(activeSubs.length, Math.floor(totalContribution / activeSubs.length), rolloverAmount)

  // Get all subscriber scores for algorithmic draw
  const userIds = activeSubs.map((s) => s.user_id)
  const { data: allScores } = await supabase
    .from('scores')
    .select('score')
    .in('user_id', userIds)

  const scoreValues = (allScores || []).map((s) => s.score)

  // Generate drawn numbers
  const drawnNumbers =
    draw_type === 'random'
      ? generateRandomDraw()
      : generateAlgorithmicDraw(scoreValues, weighting || 'most_frequent')

  // Match each subscriber
  const winners5: { userId: string; matched: number[] }[] = []
  const winners4: { userId: string; matched: number[] }[] = []
  const winners3: { userId: string; matched: number[] }[] = []

  for (const sub of activeSubs) {
    const { data: userScores } = await supabase
      .from('scores')
      .select('score')
      .eq('user_id', sub.user_id)

    const scores = (userScores || []).map((s) => s.score)
    if (scores.length === 0) continue

    const { matchCount, matchedNumbers } = matchScores(scores, drawnNumbers)
    if (matchCount === 5) winners5.push({ userId: sub.user_id, matched: matchedNumbers })
    else if (matchCount === 4) winners4.push({ userId: sub.user_id, matched: matchedNumbers })
    else if (matchCount === 3) winners3.push({ userId: sub.user_id, matched: matchedNumbers })
  }

  const prize5 = distributePrize(pools.pool5match, winners5.length)
  const prize4 = distributePrize(pools.pool4match, winners4.length)
  const prize3 = distributePrize(pools.pool3match, winners3.length)

  // Create draw record
  const { data: draw, error: drawError } = await supabase
    .from('draws')
    .insert({
      draw_month,
      drawn_numbers: drawnNumbers,
      draw_type,
      status: 'simulated',
      jackpot_carried_over: rolloverAmount > 0,
      prize_pool_total: pools.total,
      pool_5match: pools.pool5match,
      pool_4match: pools.pool4match,
      pool_3match: pools.pool3match,
    })
    .select()
    .single()

  if (drawError) return NextResponse.json({ error: drawError.message }, { status: 500 })

  // Insert draw results
  const allWinnersInsert = [
    ...winners5.map((w) => ({ draw_id: draw.id, user_id: w.userId, match_count: 5, matched_numbers: w.matched, prize_amount: prize5 })),
    ...winners4.map((w) => ({ draw_id: draw.id, user_id: w.userId, match_count: 4, matched_numbers: w.matched, prize_amount: prize4 })),
    ...winners3.map((w) => ({ draw_id: draw.id, user_id: w.userId, match_count: 3, matched_numbers: w.matched, prize_amount: prize3 })),
  ]

  if (allWinnersInsert.length > 0) {
    await supabase.from('draw_results').insert(allWinnersInsert)
  }

  return NextResponse.json({
    data: {
      draw,
      drawnNumbers,
      pools,
      winners: {
        fiveMatch: winners5.length,
        fourMatch: winners4.length,
        threeMatch: winners3.length,
      },
      prizes: { prize5, prize4, prize3 },
      totalParticipants: activeSubs.length,
    },
  }, { status: 201 })
}
