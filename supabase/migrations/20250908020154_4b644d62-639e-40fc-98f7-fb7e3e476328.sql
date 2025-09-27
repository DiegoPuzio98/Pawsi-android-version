-- Fix the state constraint to allow the values used in the app
ALTER TABLE public.reported_posts DROP CONSTRAINT IF EXISTS reported_posts_state_check;
ALTER TABLE public.reported_posts
  ADD CONSTRAINT reported_posts_state_check
  CHECK (state IN ('seen','injured','other'));

-- Add latitude and longitude columns to reported_posts if they don't exist
ALTER TABLE public.reported_posts 
ADD COLUMN IF NOT EXISTS location_lat double precision,
ADD COLUMN IF NOT EXISTS location_lng double precision;