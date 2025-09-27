-- Create user_blocks table and policies, and adjust messages policies for blocking and deletion
create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null,
  blocked_id uuid not null,
  created_at timestamptz not null default now(),
  constraint user_blocks_unique unique (blocker_id, blocked_id)
);

alter table public.user_blocks enable row level security;

-- Allow users to manage their own blocks
create policy if not exists "Users manage their own blocks"
  on public.user_blocks
  for all
  using (auth.uid() = blocker_id)
  with check (auth.uid() = blocker_id);

-- Restrictive policy to prevent sending messages when blocked
create policy if not exists "Messages not blocked"
  on public.messages
  for insert
  with check (
    not exists (
      select 1 from public.user_blocks b
      where (b.blocker_id = recipient_id and b.blocked_id = sender_id)
         or (b.blocker_id = sender_id and b.blocked_id = recipient_id)
    )
  );

-- Allow users to delete messages they sent or received
create policy if not exists "Users can delete their own messages"
  on public.messages
  for delete
  using (auth.uid() = sender_id or auth.uid() = recipient_id);
