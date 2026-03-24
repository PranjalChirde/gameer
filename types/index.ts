export type SubscriptionPlan = 'monthly' | 'yearly'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'lapsed'
export type DrawType = 'random' | 'algorithmic'
export type DrawStatus = 'pending' | 'simulated' | 'published'
export type PaymentStatus = 'pending' | 'verified' | 'paid' | 'rejected'

export interface User {
  id: string
  email: string
  full_name: string
  selected_charity_id: string | null
  charity_contribution_percent: number
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  provider_subscription_id: string | null
  provider_customer_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
}

export interface Score {
  id: string
  user_id: string
  score: number
  played_on: string
  created_at: string
}

export interface Charity {
  id: string
  name: string
  description: string
  image_url: string | null
  website: string | null
  is_featured: boolean
  is_active: boolean
  created_at: string
  slug?: string
}

export interface CharityEvent {
  id: string
  charity_id: string
  title: string
  event_date: string
  description: string
}

export interface Draw {
  id: string
  draw_month: string
  drawn_numbers: number[]
  draw_type: DrawType
  status: DrawStatus
  jackpot_carried_over: boolean
  prize_pool_total: number
  pool_5match: number
  pool_4match: number
  pool_3match: number
  created_at: string
  published_at: string | null
}

export interface DrawResult {
  id: string
  draw_id: string
  user_id: string
  match_count: number
  matched_numbers: number[]
  prize_amount: number
  payment_status: PaymentStatus
  proof_url: string | null
  admin_notes: string | null
  created_at: string
  // Joined fields
  user?: User
  draw?: Draw
}

export interface JackpotRollover {
  id: string
  from_draw_id: string
  to_draw_id: string | null
  amount: number
  created_at: string
}

export interface CharityContribution {
  id: string
  user_id: string
  charity_id: string
  subscription_id: string
  amount: number
  period: string
  created_at: string
}

export interface ApiError {
  error: string
  code?: string
  details?: unknown
}

export interface ApiSuccess<T = unknown> {
  data: T
  message?: string
}

export interface DrawSimulationResult {
  drawnNumbers: number[]
  winners: Array<{
    userId: string
    userEmail: string
    userName: string
    matchCount: number
    matchedNumbers: number[]
    prizeAmount: number
  }>
  prizePools: {
    total: number
    pool5match: number
    pool4match: number
    pool3match: number
  }
  totalParticipants: number
}
