# Gameer — Golf Charity Subscription Platform

## Environment Variables

Copy this file to `.env.local` and fill in your values.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
RAZORPAY_MONTHLY_PLAN_ID=plan_...
RAZORPAY_YEARLY_PLAN_ID=plan_...

# Email — Resend
RESEND_API_KEY=re_...

# App URL (no trailing slash)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Quick Setup

### 1. Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → run [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql)
3. Run [`supabase/migrations/002_seed_data.sql`](./supabase/migrations/002_seed_data.sql) to seed charities
4. Go to **Storage** → create a bucket named `proofs` (public)
5. Go to **Authentication → Providers** → make sure **Email** is enabled
6. Copy your project URL and anon key from **Project Settings → API**

### 2. Razorpay & Payment Bypass (Dev Mode)
1. Since you don't have a Razorpay account ready, set the following variable in your `.env.local`:
   `NEXT_PUBLIC_ENABLE_PAYMENT_BYPASS=true`
2. This will enable a "Skip Payment" Dev Mode button on the Pricing page.
3. If you want to configure Razorpay later: Create a Test Mode account at [razorpay.com](https://razorpay.com), create subscription plans, copy the API Keys and Plan IDs, and configure webhooks for `subscription.charged` and `subscription.cancelled`.

### 3. Resend
1. Sign up at [resend.com](https://resend.com) and create an API key
2. Verify your sending domain (or use `@resend.dev` for testing)

### 4. Development
```bash
npm install
cp .env.local.example .env.local
# fill in your values
npm run dev
```

### 5. Create Admin User
After signup, run this in Supabase SQL Editor:
```sql
UPDATE public.users SET is_admin = true WHERE email = 'your@email.com';
```

## Test Credentials (after setup)
- **Subscriber**: Sign up via /signup with any email
- **Admin**: Set `is_admin = true` via SQL as above

## Stripe Test Cards
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Use any future expiry and any 3-digit CVC

## Deployment (Vercel)
1. Push this repo to GitHub
2. Import the repo in a **new Vercel account**
3. Set all environment variables from `.env.local`
4. Change `NEXT_PUBLIC_APP_URL` to your Vercel URL
5. Update your Stripe webhook endpoint to the Vercel URL
