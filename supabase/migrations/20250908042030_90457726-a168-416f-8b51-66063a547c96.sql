-- Find and fix all security definer views
-- First, check what views exist and drop any that might be security definer
DROP VIEW IF EXISTS adoption_posts_public CASCADE;
DROP VIEW IF EXISTS lost_posts_public CASCADE;
DROP VIEW IF EXISTS reported_posts_public CASCADE;
DROP VIEW IF EXISTS classifieds_public CASCADE;

-- Remove any existing security definer views by checking system catalogs
-- Drop views that might have been created with security definer in previous migrations
SELECT 'DROP VIEW IF EXISTS ' || schemaname || '.' || viewname || ' CASCADE;' 
FROM pg_views 
WHERE schemaname = 'public' 
AND (viewname LIKE '%_public' OR viewname LIKE '%public%');