-- First update existing species values to Spanish equivalents
UPDATE public.reported_posts 
SET species = CASE 
  WHEN species IN ('dog', 'dogs', 'canes') THEN 'perros'
  WHEN species IN ('cat', 'cats', 'felinos') THEN 'gatos'  
  WHEN species IN ('bird', 'birds', 'ave', 'aves', 'pajaros', 'pajaro') THEN 'aves'
  WHEN species IN ('rodent', 'rodents', 'roedor', 'roedores') THEN 'roedores'
  ELSE NULL
END
WHERE species IS NOT NULL;

-- Now add the constraint
ALTER TABLE public.reported_posts ADD CONSTRAINT reported_posts_species_check 
CHECK (species IN ('perros', 'gatos', 'aves', 'roedores') OR species IS NULL);