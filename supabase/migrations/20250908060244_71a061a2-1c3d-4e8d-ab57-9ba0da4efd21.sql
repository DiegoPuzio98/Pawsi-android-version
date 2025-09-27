-- Make News public by removing restrictive SELECT policies that blocked anonymous users
DROP POLICY IF EXISTS "Users can view their own lost posts" ON public.lost_posts;
DROP POLICY IF EXISTS "Users can view their own reported posts" ON public.reported_posts;

-- Fix mobile publish error: drop restrictive state CHECK constraint on reported_posts
ALTER TABLE public.reported_posts DROP CONSTRAINT IF EXISTS reported_posts_state_check;