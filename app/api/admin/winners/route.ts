import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const reviewSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'paid']),
  admin_notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const serverClient = await createClient()
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data: adminCheck } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (!adminCheck?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const status = url.searchParams.get('status')

  let query = supabase
    .from('draw_results')
    .select('*, users(email, full_name), draw:draws(draw_month, drawn_numbers)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('payment_status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  const serverClient = await createClient()
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data: adminCheck } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (!adminCheck?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { id, action, admin_notes } = parsed.data

  const statusMap = { approve: 'verified', reject: 'rejected', paid: 'paid' } as const
  const newStatus = statusMap[action]

  const { data, error } = await supabase
    .from('draw_results')
    .update({ payment_status: newStatus, admin_notes: admin_notes || null })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
