
-- Enable UUID generation
create extension if not exists pgcrypto;

-- InkSpace uses its own JWT authentication, not Supabase Auth.
-- Run this file in the same project configured by SUPABASE_URL.

-- 1. Application users table
create table if not exists public.users (
  id uuid primary key,
  name text not null default '',
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- Convert an older Supabase-Auth version of this table for the application
-- authentication flow. Existing rows without passwords cannot be used to log in.
alter table public.users drop constraint if exists users_id_fkey;
alter table public.users add column if not exists password_hash text;
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 2. Blogs table
create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  cover text not null default '',
  excerpt text not null,
  content text not null,
  status text not null default 'published'
    check (status in ('draft', 'published')),
  author text not null,
  author_email text not null,
  author_id uuid not null
    references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Indexes
create index if not exists blogs_author_id_idx
on public.blogs(author_id);

create index if not exists blogs_status_idx
on public.blogs(status);

-- 4. Enable RLS
alter table public.users enable row level security;
alter table public.blogs enable row level security;

-- 5. Users policies
drop policy if exists "Users can view own profile"
on public.users;

create policy "Users can view own profile"
on public.users
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update own profile"
on public.users;

create policy "Users can update own profile"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- 6. Blog policies
drop policy if exists "Anyone can view published blogs"
on public.blogs;

create policy "Anyone can view published blogs"
on public.blogs
for select
to anon, authenticated
using (
  status = 'published'
  or auth.uid() = author_id
);

drop policy if exists "Authenticated users can create blogs"
on public.blogs;

create policy "Authenticated users can create blogs"
on public.blogs
for insert
to authenticated
with check (
  auth.uid() = author_id
);

drop policy if exists "Authors can update own blogs"
on public.blogs;

create policy "Authors can update own blogs"
on public.blogs
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "Authors can delete own blogs"
on public.blogs;

create policy "Authors can delete own blogs"
on public.blogs
for delete
to authenticated
using (auth.uid() = author_id);

-- The backend uses a service-role key and enforces authorization with its JWT.
-- Supabase Auth profile triggers are intentionally not used.
