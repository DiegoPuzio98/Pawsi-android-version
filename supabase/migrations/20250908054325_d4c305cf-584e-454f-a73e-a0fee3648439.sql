-- Update check constraint on reported_posts.species to allow specific Spanish values
ALTER TABLE public.reported_posts DROP CONSTRAINT IF EXISTS reported_posts_species_check;

-- Add new check constraint with proper Spanish species values
ALTER TABLE public.reported_posts ADD CONSTRAINT reported_posts_species_check 
CHECK (species IN ('perros', 'gatos', 'aves', 'roedores') OR species IS NULL);