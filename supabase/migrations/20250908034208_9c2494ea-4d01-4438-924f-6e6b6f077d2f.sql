-- Fix security issues by creating restricted public views

-- Create public views that exclude sensitive data
CREATE VIEW public.adoption_posts_public AS
SELECT 
  id,
  title,
  description,
  species,
  breed,
  age,
  images,
  location_text,
  location_lat,
  location_lng,
  created_at,
  status
FROM adoption_posts 
WHERE status = 'active';

CREATE VIEW public.lost_posts_public AS
SELECT 
  id,
  title,
  description,
  species,
  breed,
  images,
  location_text,
  location_lat,
  location_lng,
  created_at,
  lost_at,
  status
FROM lost_posts 
WHERE status = 'active';

CREATE VIEW public.reported_posts_public AS
SELECT 
  id,
  title,
  description,
  species,
  breed,
  images,
  location_text,
  location_lat,
  location_lng,
  created_at,
  seen_at,
  state,
  status
FROM reported_posts 
WHERE status = 'active';

CREATE VIEW public.classifieds_public AS
SELECT 
  id,
  title,
  description,
  category,
  condition,
  price,
  images,
  location_text,
  location_lat,
  location_lng,
  created_at,
  status
FROM classifieds 
WHERE status = 'active';

-- Revoke public access from the original tables
REVOKE SELECT ON adoption_posts FROM anon;
REVOKE SELECT ON lost_posts FROM anon;
REVOKE SELECT ON reported_posts FROM anon;
REVOKE SELECT ON classifieds FROM anon;
REVOKE SELECT ON suspended_posts_log FROM anon;

-- Grant access to the public views
GRANT SELECT ON adoption_posts_public TO anon;
GRANT SELECT ON lost_posts_public TO anon;
GRANT SELECT ON reported_posts_public TO anon;
GRANT SELECT ON classifieds_public TO anon;

-- Create function to get contact info for specific post (authenticated users only)
CREATE OR REPLACE FUNCTION get_post_contact_info(
  post_table text,
  post_id uuid
) RETURNS TABLE(
  contact_email text,
  contact_phone text,
  contact_whatsapp text,
  store_contact text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow access to authenticated users
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF post_table = 'adoption_posts' THEN
    RETURN QUERY
    SELECT a.contact_email, a.contact_phone, a.contact_whatsapp, NULL::text as store_contact
    FROM adoption_posts a
    WHERE a.id = post_id AND a.status = 'active';
  ELSIF post_table = 'lost_posts' THEN
    RETURN QUERY
    SELECT l.contact_email, l.contact_phone, l.contact_whatsapp, NULL::text as store_contact
    FROM lost_posts l
    WHERE l.id = post_id AND l.status = 'active';
  ELSIF post_table = 'reported_posts' THEN
    RETURN QUERY
    SELECT r.contact_email, r.contact_phone, r.contact_whatsapp, NULL::text as store_contact
    FROM reported_posts r
    WHERE r.id = post_id AND r.status = 'active';
  ELSIF post_table = 'classifieds' THEN
    RETURN QUERY
    SELECT c.contact_email, NULL::text as contact_phone, c.contact_whatsapp, c.store_contact
    FROM classifieds c
    WHERE c.id = post_id AND c.status = 'active';
  END IF;
END;
$$;