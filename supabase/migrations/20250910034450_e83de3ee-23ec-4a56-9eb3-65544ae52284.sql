-- Create user_blocks table for blocking users
create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null,
  blocked_id uuid not null,
  created_at timestamptz not null default now(),
  constraint user_blocks_unique unique (blocker_id, blocked_id)
);

alter table public.user_blocks enable row level security;

drop policy if exists "Users can view their blocks" on public.user_blocks;
create policy "Users can view their blocks"
on public.user_blocks
for select
using (auth.uid() = blocker_id);

drop policy if exists "Users can create blocks" on public.user_blocks;
create policy "Users can create blocks"
on public.user_blocks
for insert
with check (auth.uid() = blocker_id);

drop policy if exists "Users can delete their blocks" on public.user_blocks;
create policy "Users can delete their blocks"
on public.user_blocks
for delete
using (auth.uid() = blocker_id);

-- Allow participants to delete their messages (to enable deleting conversations)
drop policy if exists "Participants can delete messages" on public.messages;
create policy "Participants can delete messages"
on public.messages
for delete
using ((auth.uid() = sender_id) or (auth.uid() = recipient_id));