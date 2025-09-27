-- Update the handle_new_user trigger function to include location data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, country, province)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'province'
  );
  return new;
END;
$$;