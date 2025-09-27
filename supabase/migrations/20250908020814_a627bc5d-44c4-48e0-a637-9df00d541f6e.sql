-- Create profiles table for user data
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add user_id columns to existing tables to link posts to users
ALTER TABLE public.adoption_posts ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.lost_posts ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);  
ALTER TABLE public.reported_posts ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.classifieds ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Add location columns to adoption_posts and classifieds if they don't exist
ALTER TABLE public.adoption_posts 
ADD COLUMN IF NOT EXISTS location_lat double precision,
ADD COLUMN IF NOT EXISTS location_lng double precision;

ALTER TABLE public.classifieds
ADD COLUMN IF NOT EXISTS location_lat double precision,
ADD COLUMN IF NOT EXISTS location_lng double precision;

-- Add policies for user-owned posts (users can manage their own posts)
-- Adoption posts policies
CREATE POLICY "Users can view their own adoption posts" 
ON public.adoption_posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own adoption posts" 
ON public.adoption_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own adoption posts" 
ON public.adoption_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Lost posts policies  
CREATE POLICY "Users can view their own lost posts" 
ON public.lost_posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own lost posts" 
ON public.lost_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lost posts" 
ON public.lost_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Reported posts policies
CREATE POLICY "Users can view their own reported posts" 
ON public.reported_posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reported posts" 
ON public.reported_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reported posts" 
ON public.reported_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Classifieds policies
CREATE POLICY "Users can view their own classifieds" 
ON public.classifieds 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own classifieds" 
ON public.classifieds 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own classifieds" 
ON public.classifieds 
FOR DELETE 
USING (auth.uid() = user_id);

-- Update existing insert policies to require authentication and set user_id
DROP POLICY IF EXISTS "Public can insert adoption posts" ON public.adoption_posts;
CREATE POLICY "Authenticated users can insert adoption posts" 
ON public.adoption_posts 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can insert lost posts" ON public.lost_posts;
CREATE POLICY "Authenticated users can insert lost posts" 
ON public.lost_posts 
FOR INSERT 
TO authenticated  
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can insert reported posts" ON public.reported_posts;
CREATE POLICY "Authenticated users can insert reported posts" 
ON public.reported_posts 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can insert classifieds" ON public.classifieds;
CREATE POLICY "Authenticated users can insert classifieds" 
ON public.classifieds 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);