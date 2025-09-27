-- Drop all existing constraints on species column
ALTER TABLE public.reported_posts DROP CONSTRAINT IF EXISTS reported_posts_species_check;

-- Update all existing data to use Spanish species names  
UPDATE public.reported_posts 
SET species = 'perros'
WHERE species = 'canes';

-- Add the new constraint
ALTER TABLE public.reported_posts ADD CONSTRAINT reported_posts_species_check 
CHECK (species IN ('perros', 'gatos', 'aves', 'roedores') OR species IS NULL);