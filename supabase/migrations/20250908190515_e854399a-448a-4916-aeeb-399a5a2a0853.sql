BEGIN;
-- Remove legacy/incorrect check on adoption if present
ALTER TABLE public.adoption_posts DROP CONSTRAINT IF EXISTS adoption_posts_adoption_check;

-- Recreate classifieds category check to match UI
ALTER TABLE public.classifieds DROP CONSTRAINT IF EXISTS classifieds_category_check;
ALTER TABLE public.classifieds
  ADD CONSTRAINT classifieds_category_check
  CHECK (category IN ('food','toys','accessories','medicine','services','other'));

-- Recreate reported_posts status check to allow resolved
ALTER TABLE public.reported_posts DROP CONSTRAINT IF EXISTS reported_posts_status_check;
ALTER TABLE public.reported_posts
  ADD CONSTRAINT reported_posts_status_check
  CHECK (status IN ('active','resolved','inactive'));
COMMIT;