-- Clean up orphaned posts without user_id
DELETE FROM reported_posts WHERE user_id IS NULL;