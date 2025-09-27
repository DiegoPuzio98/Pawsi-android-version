-- Add country and province fields to profiles table for location-based filtering
ALTER TABLE public.profiles 
ADD COLUMN country text,
ADD COLUMN province text;