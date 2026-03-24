-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE subscription_plan AS ENUM ('monthly', 'yearly');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'lapsed');
CREATE TYPE draw_type AS ENUM ('random', 'algorithmic');
CREATE TYPE draw_status AS ENUM ('pending', 'simulated', 'published');
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'paid', 'rejected');

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  selected_charity_id uuid,
  charity_contribution_percent integer NOT NULL DEFAULT 10 CHECK (charity_contribution_percent >= 10 AND charity_contribution_percent <= 100),
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Charities table
CREATE TABLE public.charities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  website text,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Charity events table
CREATE TABLE public.charity_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  charity_id uuid NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
  title text NOT NULL,
  event_date date NOT NULL,
  description text NOT NULL DEFAULT ''
);

-- Add FK from users to charities
ALTER TABLE public.users 
  ADD CONSTRAINT users_selected_charity_id_fkey 
  FOREIGN KEY (selected_charity_id) REFERENCES public.charities(id) ON DELETE SET NULL;

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL,
  status subscription_status NOT NULL DEFAULT 'inactive',
  provider_subscription_id text,
  provider_customer_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Scores table
CREATE TABLE public.scores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 1 AND score <= 45),
  played_on date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, played_on)
);

-- Draws table
CREATE TABLE public.draws (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_month date UNIQUE NOT NULL,
  drawn_numbers integer[] NOT NULL DEFAULT '{}',
  draw_type draw_type NOT NULL DEFAULT 'random',
  status draw_status NOT NULL DEFAULT 'pending',
  jackpot_carried_over boolean NOT NULL DEFAULT false,
  prize_pool_total numeric NOT NULL DEFAULT 0,
  pool_5match numeric NOT NULL DEFAULT 0,
  pool_4match numeric NOT NULL DEFAULT 0,
  pool_3match numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

-- Draw results table
CREATE TABLE public.draw_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id uuid NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  match_count integer NOT NULL CHECK (match_count >= 3 AND match_count <= 5),
  matched_numbers integer[] NOT NULL DEFAULT '{}',
  prize_amount numeric NOT NULL DEFAULT 0,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  proof_url text,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Jackpot rollover table
CREATE TABLE public.jackpot_rollover (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_draw_id uuid NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  to_draw_id uuid REFERENCES public.draws(id) ON DELETE SET NULL,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Charity contributions table
CREATE TABLE public.charity_contributions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  charity_id uuid NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  period date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_scores_user_id ON public.scores(user_id);
CREATE INDEX idx_scores_played_on ON public.scores(played_on);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_draw_results_draw_id ON public.draw_results(draw_id);
CREATE INDEX idx_draw_results_user_id ON public.draw_results(user_id);
CREATE INDEX idx_draw_results_payment_status ON public.draw_results(payment_status);
CREATE INDEX idx_charity_contributions_user_id ON public.charity_contributions(user_id);
CREATE INDEX idx_charity_contributions_charity_id ON public.charity_contributions(charity_id);

-- Trigger: enforce max 5 scores per user
CREATE OR REPLACE FUNCTION enforce_max_5_scores()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.scores
  WHERE id IN (
    SELECT id FROM public.scores
    WHERE user_id = NEW.user_id
    ORDER BY played_on ASC, created_at ASC
    OFFSET 5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_max_5_scores
AFTER INSERT ON public.scores
FOR EACH ROW EXECUTE FUNCTION enforce_max_5_scores();

-- Trigger: auto-update updated_at on users
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Handle new auth user (auto-create profile)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, selected_charity_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    (NEW.raw_user_meta_data->>'selected_charity_id')::uuid
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jackpot_rollover ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_contributions ENABLE ROW LEVEL SECURITY;

-- Users: own row only
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Subscriptions: own only
CREATE POLICY "Users can read own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Scores: own only
CREATE POLICY "Users can read own scores" ON public.scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON public.scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scores" ON public.scores FOR DELETE USING (auth.uid() = user_id);

-- Charities: public read
CREATE POLICY "Anyone can read active charities" ON public.charities FOR SELECT USING (is_active = true);

-- Charity events: public read
CREATE POLICY "Anyone can read charity events" ON public.charity_events FOR SELECT USING (true);

-- Draws: authenticated read
CREATE POLICY "Authenticated users can read draws" ON public.draws FOR SELECT TO authenticated USING (true);

-- Draw results: own only
CREATE POLICY "Users can read own draw results" ON public.draw_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own draw results (proof)" ON public.draw_results FOR UPDATE USING (auth.uid() = user_id);

-- Charity contributions: own only
CREATE POLICY "Users can read own charity contributions" ON public.charity_contributions FOR SELECT USING (auth.uid() = user_id);

-- Jackpot rollover: authenticated read
CREATE POLICY "Authenticated users can read jackpot rollover" ON public.jackpot_rollover FOR SELECT TO authenticated USING (true);
