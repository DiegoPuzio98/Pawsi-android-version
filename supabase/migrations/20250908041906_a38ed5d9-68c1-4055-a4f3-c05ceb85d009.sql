-- Fix security definer view issues by recreating views without security definer
DROP VIEW IF EXISTS public.adoption_posts_public CASCADE;
DROP VIEW IF EXISTS public.lost_posts_public CASCADE; 
DROP VIEW IF EXISTS public.reported_posts_public CASCADE;
DROP VIEW IF EXISTS public.classifieds_public CASCADE;

-- Recreate views as simple views (not security definer)
CREATE VIEW public.adoption_posts_public AS
SELECT 
  id, title, species, breed, age, description, location_text, 
  location_lat, location_lng, images, colors, created_at, status
FROM public.adoption_posts 
WHERE status = 'active';

CREATE VIEW public.lost_posts_public AS
SELECT 
  id, title, species, breed, description, location_text, 
  location_lat, location_lng, images, colors, created_at, status, lost_at
FROM public.lost_posts 
WHERE status = 'active';

CREATE VIEW public.reported_posts_public AS
SELECT 
  id, title, species, breed, description, location_text, 
  location_lat, location_lng, images, colors, created_at, status, 
  state, seen_at
FROM public.reported_posts 
WHERE status = 'active';

CREATE VIEW public.classifieds_public AS
SELECT 
  id, title, category, description, condition, price, images, 
  location_text, created_at, status
FROM public.classifieds 
WHERE status = 'active';

-- Grant appropriate permissions
GRANT SELECT ON public.adoption_posts_public TO anon, authenticated;
GRANT SELECT ON public.lost_posts_public TO anon, authenticated;
GRANT SELECT ON public.reported_posts_public TO anon, authenticated;
GRANT SELECT ON public.classifieds_public TO anon, authenticated;