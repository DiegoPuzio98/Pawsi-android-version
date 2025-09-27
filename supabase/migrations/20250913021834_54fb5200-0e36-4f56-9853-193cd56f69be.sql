-- Create reported_posts table
CREATE TABLE public.reported_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'message', 'profile')),
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  message TEXT,
  reporter_id UUID,
  reported_user_id UUID,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'deleted')),
  resolved_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('message', 'post_deleted', 'renewal_reminder', 'post_renewed', 'report_received')),
  message TEXT NOT NULL,
  meta JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create deletion_logs table for fallback tracking
CREATE TABLE public.deletion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  deleted_by TEXT,
  deleted_at TIMESTAMPTZ DEFAULT now(),
  processed BOOLEAN DEFAULT false
);

-- Enable RLS on all tables
ALTER TABLE public.reported_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reported_posts
CREATE POLICY "Authenticated users can create reports" ON public.reported_posts
  FOR INSERT WITH CHECK (auth.uid() = reporter_id OR reporter_id IS NULL);

CREATE POLICY "Users can view their own reports" ON public.reported_posts
  FOR SELECT USING (auth.uid() = reporter_id OR reporter_id IS NULL);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for deletion_logs (admin only for now)
CREATE POLICY "Admins can view deletion logs" ON public.deletion_logs
  FOR SELECT USING (false); -- Will be handled by service role

-- Add indexes for performance
CREATE INDEX idx_reported_posts_status ON public.reported_posts(status);
CREATE INDEX idx_reported_posts_content ON public.reported_posts(content_type, content_id);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX idx_deletion_logs_processed ON public.deletion_logs(processed, deleted_at);