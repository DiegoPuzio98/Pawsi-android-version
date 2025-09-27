-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('message', 'post_deleted', 'renewal_reminder', 'post_renewed', 'report_received')),
  message TEXT NOT NULL,
  meta JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create deletion_logs table for fallback tracking
CREATE TABLE IF NOT EXISTS public.deletion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  deleted_by TEXT,
  deleted_at TIMESTAMPTZ DEFAULT now(),
  processed BOOLEAN DEFAULT false
);

-- Enable RLS on new tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for deletion_logs (admin only for now)
DROP POLICY IF EXISTS "Admins can view deletion logs" ON public.deletion_logs;
CREATE POLICY "Admins can view deletion logs" ON public.deletion_logs
  FOR SELECT USING (false); -- Will be handled by service role

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_deletion_logs_processed ON public.deletion_logs(processed, deleted_at);

-- Update post_reports table to match the new structure needed
ALTER TABLE public.post_reports ADD COLUMN IF NOT EXISTS resolved_by UUID;
ALTER TABLE public.post_reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;