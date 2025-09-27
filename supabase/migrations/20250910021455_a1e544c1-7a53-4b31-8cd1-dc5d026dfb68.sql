-- Create messages table for internal messaging system
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  post_id UUID,
  post_type TEXT,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view messages they sent or received"
ON public.messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received (mark as read)"
ON public.messages
FOR UPDATE
USING (auth.uid() = recipient_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get unread message count
CREATE OR REPLACE FUNCTION public.get_unread_message_count(user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM messages
    WHERE recipient_id = user_id AND read_at IS NULL
  );
END;
$function$;