import Razorpay from 'razorpay'

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
})

export const PLANS = {
  monthly: {
    amount: 1000, // £10.00
    prizePoolContribution: 200, // £2.00
    plan_id: process.env.RAZORPAY_MONTHLY_PLAN_ID || '',
  },
  yearly: {
    amount: 10000, // £100.00
    prizePoolContribution: 2000, // £20.00
    plan_id: process.env.RAZORPAY_YEARLY_PLAN_ID || '',
  },
} as const
