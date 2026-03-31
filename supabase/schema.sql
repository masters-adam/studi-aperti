-- Studi Aperti Database Schema
-- Run this in the Supabase SQL Editor

-- Tags table
create table public.tags (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  is_active boolean default true not null,
  created_at timestamptz default now() not null
);

-- Listings table
create table public.listings (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null default '',
  address text not null,
  lat double precision not null,
  lng double precision not null,
  contact_email text default '',
  contact_phone text default '',
  website text default '',
  availability jsonb default '{}'::jsonb,
  tags text[] default '{}',
  images text[] default '{}',
  edit_code text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'removed')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  removed_at timestamptz
);

-- Admins table
create table public.admins (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  invited_by uuid references public.admins(id),
  created_at timestamptz default now() not null
);

-- Auto-update updated_at on listings
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_listings_updated
  before update on public.listings
  for each row execute function public.handle_updated_at();

-- ===================
-- Row Level Security
-- ===================

alter table public.listings enable row level security;
alter table public.tags enable row level security;
alter table public.admins enable row level security;

-- Listings: anyone can read approved listings
create policy "Approved listings are public"
  on public.listings for select
  using (status = 'approved');

-- Listings: anyone can submit a new listing
create policy "Anyone can submit a listing"
  on public.listings for insert
  with check (status = 'pending');

-- Listings: admins can read all listings
create policy "Admins can read all listings"
  on public.listings for select
  using (auth.uid() in (select id from public.admins));

-- Listings: admins can update any listing
create policy "Admins can update listings"
  on public.listings for update
  using (auth.uid() in (select id from public.admins));

-- Listings: admins can delete listings
create policy "Admins can delete listings"
  on public.listings for delete
  using (auth.uid() in (select id from public.admins));

-- Tags: anyone can read active tags
create policy "Active tags are public"
  on public.tags for select
  using (is_active = true);

-- Tags: admins can do everything with tags
create policy "Admins have full access to tags"
  on public.tags for all
  using (auth.uid() in (select id from public.admins));

-- Admins: admins can read the admins table
create policy "Admins can read admins"
  on public.admins for select
  using (auth.uid() in (select id from public.admins));

-- Admins: admins can invite new admins
create policy "Admins can invite admins"
  on public.admins for insert
  with check (auth.uid() in (select id from public.admins));

-- Admins: admins can remove admins
create policy "Admins can remove admins"
  on public.admins for delete
  using (auth.uid() in (select id from public.admins));

-- ===================
-- Storage
-- ===================

insert into storage.buckets (id, name, public)
  values ('listing-images', 'listing-images', true);

create policy "Listing images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Anyone can upload listing images"
  on storage.objects for insert
  with check (bucket_id = 'listing-images');

create policy "Admins can delete listing images"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and auth.uid() in (select id from public.admins)
  );

-- ===================
-- Seed default tags
-- ===================

insert into public.tags (name) values
  ('Ceramics'),
  ('Painting'),
  ('Sculpture'),
  ('Textiles'),
  ('Photography'),
  ('Mixed Media'),
  ('Woodworking'),
  ('Printmaking'),
  ('Jewelry'),
  ('Glass');
