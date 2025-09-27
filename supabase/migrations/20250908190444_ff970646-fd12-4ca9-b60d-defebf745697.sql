-- Fix constraint errors for adoption_posts, classifieds, and reported_posts
BEGIN;

-- 1) adoption_posts: replace problematic check with a clear species allowlist
ALTER TABLE public.adoption_posts
  DROP CONSTRAINT IF EXISTS adoption_posts_adoption_check;

-- ensure only supported species are accepted (or NULL)
ALTER TABLE public.adoption_posts
  ADD CONSTRAINT adoption_posts_species_check
  CHECK (species IN ('dog','cat','bird','rodent') OR species IS NULL);

-- 2) classifieds: align category values with the UI options
ALTER TABLE public.classifieds
  DROP CONSTRAINT IF EXISTS classifieds_category_check;

ALTER TABLE public.classifieds
  ADD CONSTRAINT classifieds_category_check
  CHECK (category IN ('food','toys','accessories','medicine','services','other'));

-- 3) reported_posts: allow marking as resolved from the UI
ALTER TABLE public.reported_posts
  DROP CONSTRAINT IF EXISTS reported_posts_status_check;

ALTER TABLE public.reported_posts
  ADD CONSTRAINT reported_posts_status_check
  CHECK (status IN ('active','resolved','inactive'));

COMMIT;