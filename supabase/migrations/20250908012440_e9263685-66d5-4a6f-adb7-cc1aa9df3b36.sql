-- Enable pgcrypto for bcrypt verification (safe if already enabled)
create extension if not exists pgcrypto;

-- Add owner_secret_hash to reported_posts to support resolve-by-secret
alter table public.reported_posts
  add column if not exists owner_secret_hash text;

-- Function to mark posts as resolved using an owner secret
create or replace function public.resolve_post(post_type text, post_id uuid, owner_secret text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text;
  v_ok boolean := false;
begin
  if post_type = 'lost' then
    select owner_secret_hash into v_hash from public.lost_posts where id = post_id;
    if v_hash is null then return false; end if;
    v_ok := crypt(owner_secret, v_hash) = v_hash;
    if v_ok then
      update public.lost_posts set status = 'resolved' where id = post_id;
      return true;
    end if;
  elsif post_type = 'reported' then
    select owner_secret_hash into v_hash from public.reported_posts where id = post_id;
    if v_hash is null then return false; end if;
    v_ok := crypt(owner_secret, v_hash) = v_hash;
    if v_ok then
      update public.reported_posts set status = 'resolved' where id = post_id;
      return true;
    end if;
  elsif post_type = 'adoption' then
    select owner_secret_hash into v_hash from public.adoption_posts where id = post_id;
    if v_hash is null then return false; end if;
    v_ok := crypt(owner_secret, v_hash) = v_hash;
    if v_ok then
      update public.adoption_posts set status = 'resolved', updated_at = now() where id = post_id;
      return true;
    end if;
  else
    return false;
  end if;
  return false;
end
$$;

-- Function to submit moderation reports
create or replace function public.submit_report(
  post_type text,
  post_id uuid,
  reason text,
  reason_code text,
  suspended_by text default null,
  payload jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into public.suspended_posts_log (original_post_id, post_type, reason, reason_code, suspended_by, data)
  values (post_id, post_type, reason, reason_code, suspended_by, payload)
  returning id into new_id;
  return new_id;
end
$$;

grant execute on function public.resolve_post(text, uuid, text) to anon;
grant execute on function public.submit_report(text, uuid, text, text, text, jsonb) to anon;