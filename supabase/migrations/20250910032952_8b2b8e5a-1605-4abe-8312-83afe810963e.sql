-- Allow viewing profiles of conversation partners to show names in chat
create policy if not exists "Participants can view chat partners" 
  on public.profiles
  for select
  using (
    id = auth.uid()
    or id in (
      select sender_id from public.messages where recipient_id = auth.uid()
      union
      select recipient_id from public.messages where sender_id = auth.uid()
    )
  );