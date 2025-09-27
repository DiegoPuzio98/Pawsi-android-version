-- Add colors array column to all post tables
ALTER TABLE public.adoption_posts ADD COLUMN colors text[] DEFAULT '{}';
ALTER TABLE public.lost_posts ADD COLUMN colors text[] DEFAULT '{}';
ALTER TABLE public.reported_posts ADD COLUMN colors text[] DEFAULT '{}';

-- Create user highlights table
CREATE TABLE public.user_highlights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  post_type text NOT NULL CHECK (post_type IN ('adoption', 'lost', 'reported')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id, post_type)
);

-- Enable RLS on user_highlights
ALTER TABLE public.user_highlights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_highlights
CREATE POLICY "Users can manage their own highlights" 
ON public.user_highlights 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create reports table for moderation
CREATE TABLE public.post_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_user_id uuid,
  post_id uuid NOT NULL,
  post_type text NOT NULL CHECK (post_type IN ('adoption', 'lost', 'reported', 'classified')),
  reason text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid
);

-- Enable RLS on post_reports
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for post_reports
CREATE POLICY "Authenticated users can create reports" 
ON public.post_reports 
FOR INSERT 
WITH CHECK (auth.uid() = reporter_user_id OR reporter_user_id IS NULL);

CREATE POLICY "Users can view their own reports" 
ON public.post_reports 
FOR SELECT 
USING (auth.uid() = reporter_user_id OR reporter_user_id IS NULL);

-- Update public views to include colors
DROP VIEW IF EXISTS public.adoption_posts_public;
CREATE VIEW public.adoption_posts_public AS
SELECT 
  id, title, species, breed, age, description, location_text, 
  location_lat, location_lng, images, colors, created_at, status
FROM public.adoption_posts 
WHERE status = 'active';

DROP VIEW IF EXISTS public.lost_posts_public;
CREATE VIEW public.lost_posts_public AS
SELECT 
  id, title, species, breed, description, location_text, 
  location_lat, location_lng, images, colors, created_at, status, lost_at
FROM public.lost_posts 
WHERE status = 'active';

DROP VIEW IF EXISTS public.reported_posts_public;
CREATE VIEW public.reported_posts_public AS
SELECT 
  id, title, species, breed, description, location_text, 
  location_lat, location_lng, images, colors, created_at, status, 
  state, seen_at
FROM public.reported_posts 
WHERE status = 'active';