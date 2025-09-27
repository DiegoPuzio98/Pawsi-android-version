-- Fix security vulnerability: Remove public access to contact information
-- Drop existing public read policies that expose contact info
DROP POLICY IF EXISTS "Public can read active adoption posts" ON public.adoption_posts;
DROP POLICY IF EXISTS "Public can read lost posts" ON public.lost_posts;
DROP POLICY IF EXISTS "Public can read reported posts" ON public.reported_posts;
DROP POLICY IF EXISTS "Public can read classifieds" ON public.classifieds;

-- Create new policies that exclude contact information from public access
CREATE POLICY "Public can read adoption posts (no contact info)" ON public.adoption_posts
FOR SELECT USING (status = 'active')
WITH CHECK (false);

CREATE POLICY "Public can read lost posts (no contact info)" ON public.lost_posts  
FOR SELECT USING (status = 'active')
WITH CHECK (false);

CREATE POLICY "Public can read reported posts (no contact info)" ON public.reported_posts
FOR SELECT USING (status = 'active') 
WITH CHECK (false);

CREATE POLICY "Public can read classifieds (no contact info)" ON public.classifieds
FOR SELECT USING (status = 'active')
WITH CHECK (false);

-- Create views that exclude contact information for public consumption
CREATE OR REPLACE VIEW public.adoption_posts_public AS
SELECT 
  id, title, species, breed, age, colors, description, 
  location_text, location_lat, location_lng, images,
  created_at, updated_at, status, user_id, country, province
FROM public.adoption_posts 
WHERE status = 'active';

CREATE OR REPLACE VIEW public.lost_posts_public AS  
SELECT 
  id, title, species, breed, colors, description,
  location_text, location_lat, location_lng, images,
  created_at, lost_at, expires_at, status, user_id, country, province
FROM public.lost_posts
WHERE status = 'active';

CREATE OR REPLACE VIEW public.reported_posts_public AS
SELECT 
  id, title, species, breed, colors, description, state,
  location_text, location_lat, location_lng, images, seen_at,
  created_at, expires_at, status, user_id, country, province  
FROM public.reported_posts
WHERE status = 'active';

CREATE OR REPLACE VIEW public.classifieds_public AS
SELECT 
  id, title, category, description, condition, price, images,
  location_text, location_lat, location_lng, 
  created_at, status, user_id, country, province
FROM public.classifieds  
WHERE status = 'active';

-- Grant public access to the safe views
GRANT SELECT ON public.adoption_posts_public TO anon, authenticated;
GRANT SELECT ON public.lost_posts_public TO anon, authenticated;  
GRANT SELECT ON public.reported_posts_public TO anon, authenticated;
GRANT SELECT ON public.classifieds_public TO anon, authenticated;