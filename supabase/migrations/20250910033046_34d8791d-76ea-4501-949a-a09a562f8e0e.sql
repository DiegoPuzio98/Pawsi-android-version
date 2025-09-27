-- Allow viewing profiles of conversation partners to show names in chat (correct syntax)
CREATE POLICY "Participants can view chat partners" 
  ON public.profiles
  FOR SELECT
  USING (
    id = auth.uid()
    OR id IN (
      SELECT sender_id FROM public.messages WHERE recipient_id = auth.uid()
      UNION
      SELECT recipient_id FROM public.messages WHERE sender_id = auth.uid()
    )
  );