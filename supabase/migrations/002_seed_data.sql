-- Seed: 5 sample charities
INSERT INTO public.charities (id, name, slug, description, image_url, website, is_featured, is_active) VALUES
(
  uuid_generate_v4(),
  'Golf for Good Foundation',
  'golf-for-good-foundation',
  'Supporting underprivileged youth to discover golf and develop life skills through sport.',
  'https://images.unsplash.com/photo-1535131749006-b7f58c14cc23?w=800&q=80',
  'https://golfforgood.org',
  true,
  true
),
(
  uuid_generate_v4(),
  'Swings Against Cancer',
  'swings-against-cancer',
  'Funding cancer research and patient support through the power of the golfing community.',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
  'https://swingsagainstcancer.org',
  false,
  true
),
(
  uuid_generate_v4(),
  'Junior Golf Trust',
  'junior-golf-trust',
  'Making golf accessible for juniors from all backgrounds, providing equipment, coaching and competition opportunities.',
  'https://images.unsplash.com/photo-1599416756568-48daf6c18b0a?w=800&q=80',
  'https://juniorgolftrust.org',
  false,
  true
),
(
  uuid_generate_v4(),
  'Greens for Mental Health',
  'greens-for-mental-health',
  'Using the outdoors and golf as a therapeutic tool for mental health recovery and wellbeing.',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://greens4mentalhealth.org',
  false,
  true
),
(
  uuid_generate_v4(),
  'Par Excellence — Veterans',
  'par-excellence-veterans',
  'Helping armed forces veterans rehabilitate through golf, camaraderie and structured sport.',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
  'https://parexcellencevets.org',
  false,
  true
);

-- Sample charity events
INSERT INTO public.charity_events (charity_id, title, event_date, description)
SELECT
  id,
  'Annual Charity Golf Day 2026',
  '2026-07-15',
  'Join us for our annual flagship charity golf day. All proceeds go directly to our beneficiaries.'
FROM public.charities WHERE slug = 'golf-for-good-foundation';

INSERT INTO public.charity_events (charity_id, title, event_date, description)
SELECT
  id,
  'Summer Scramble Tournament',
  '2026-08-20',
  'A fun scramble format tournament open to golfers of all abilities. Great prizes and a great cause.'
FROM public.charities WHERE slug = 'swings-against-cancer';
