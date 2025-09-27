-- Update get_post_contact_info function to handle veterinarians
CREATE OR REPLACE FUNCTION public.get_post_contact_info(post_table text, post_id uuid)
 RETURNS TABLE(contact_email text, contact_phone text, contact_whatsapp text, store_contact text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  ELSIF post_table = 'veterinarians' THEN
    RETURN QUERY
    SELECT v.email as contact_email, v.phone as contact_phone, v.whatsapp as contact_whatsapp, v.website as store_contact
    FROM veterinarians v
    WHERE v.id = post_id AND v.status = 'active';
  END IF;
END;
$function$