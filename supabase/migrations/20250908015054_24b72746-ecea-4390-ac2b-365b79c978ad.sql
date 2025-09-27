-- Create public storage bucket for images
insert into storage.buckets (id, name, public)
values ('posts', 'posts', true)
on conflict (id) do nothing;

-- Allow public read access to files in 'posts' bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view files in posts'
  ) THEN
    CREATE POLICY "Public can view files in posts"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'posts');
  END IF;
END$$;

-- Allow public upload access to 'posts' bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can upload files to posts'
  ) THEN
    CREATE POLICY "Public can upload files to posts"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'posts');
  END IF;
END$$;

-- Relax/align species constraint on lost_posts to accept app values
ALTER TABLE public.lost_posts DROP CONSTRAINT IF EXISTS lost_posts_species_check;
ALTER TABLE public.lost_posts
  ADD CONSTRAINT lost_posts_species_check
  CHECK (species IS NULL OR species IN ('dogs','cats','birds','rodents','fish'));
