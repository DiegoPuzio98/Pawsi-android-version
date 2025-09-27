-- Fix mobile publish error by removing overly restrictive species CHECK constraint
-- This makes reported_posts fully compatible with current app species values
ALTER TABLE public.reported_posts DROP CONSTRAINT IF EXISTS reported_posts_species_check;

-- (Optional safety) If a similar constraint exists on lost_posts, drop it too
ALTER TABLE public.lost_posts DROP CONSTRAINT IF EXISTS lost_posts_species_check;