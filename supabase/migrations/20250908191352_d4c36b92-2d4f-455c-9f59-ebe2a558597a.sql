BEGIN;
-- Align adoption species with app-normalized values and allow NULL
ALTER TABLE public.adoption_posts DROP CONSTRAINT IF EXISTS adoption_posts_species_check;
ALTER TABLE public.adoption_posts
  ADD CONSTRAINT adoption_posts_species_check
  CHECK (species IS NULL OR species IN ('dog','cat','bird','rodent','fish'));

-- Remove overly restrictive condition check since UI allows free text (Nuevo/Usado, etc.)
ALTER TABLE public.classifieds DROP CONSTRAINT IF EXISTS classifieds_condition_check;
COMMIT;