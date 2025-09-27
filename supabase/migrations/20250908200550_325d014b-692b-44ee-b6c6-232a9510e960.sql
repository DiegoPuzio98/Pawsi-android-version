-- Add country and province columns for consistent location filtering
ALTER TABLE public.lost_posts
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS province text;
CREATE INDEX IF NOT EXISTS idx_lost_posts_country_province ON public.lost_posts (country, province);

ALTER TABLE public.reported_posts
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS province text;
CREATE INDEX IF NOT EXISTS idx_reported_posts_country_province ON public.reported_posts (country, province);

ALTER TABLE public.adoption_posts
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS province text;
CREATE INDEX IF NOT EXISTS idx_adoption_posts_country_province ON public.adoption_posts (country, province);

ALTER TABLE public.classifieds
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS province text;
CREATE INDEX IF NOT EXISTS idx_classifieds_country_province ON public.classifieds (country, province);

ALTER TABLE public.veterinarians
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS province text;
CREATE INDEX IF NOT EXISTS idx_veterinarians_country_province ON public.veterinarians (country, province);