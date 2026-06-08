-- ============================================================
-- WC Website — Supabase Migration
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

create table public.travelers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  avatar_url  text,
  lat         double precision not null default 38.7223,
  lng         double precision not null default -9.1393,
  current_city text not null default 'Lisbon',
  note        text,
  is_owner    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table public.destinations (
  id          uuid primary key default gen_random_uuid(),
  city        text not null,
  lat         double precision not null,
  lng         double precision not null,
  description text,
  date_range  text,
  match_info  jsonb,
  "order"     integer not null default 0
);

create table public.photos (
  id             uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations(id) on delete cascade,
  storage_path   text not null,
  caption        text,
  sort_order     integer not null default 0,
  uploaded_at    timestamptz not null default now()
);

create table public.site_config (
  id                   integer primary key default 1,
  spotify_playlist_url text not null default '',
  hero_message         text not null default 'Following Portugal 🇵🇹',
  route_color          text not null default '#00cc44',
  show_scores          boolean not null default true,
  constraint single_row check (id = 1)
);

-- Ensure only one site_config row ever exists
create unique index site_config_single on public.site_config (id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.travelers    enable row level security;
alter table public.destinations enable row level security;
alter table public.photos       enable row level security;
alter table public.site_config  enable row level security;

-- Public: read-only for all four tables
create policy "public read travelers"    on public.travelers    for select using (true);
create policy "public read destinations" on public.destinations for select using (true);
create policy "public read photos"       on public.photos       for select using (true);
create policy "public read site_config"  on public.site_config  for select using (true);

-- Admin writes go through the service role key (bypasses RLS automatically)
-- No additional policies needed — service role ignores RLS

-- ============================================================
-- SEED DATA
-- ============================================================

-- Site config (single row)
insert into public.site_config (id, hero_message, route_color, show_scores)
values (1, 'Following Portugal 🇵🇹', '#00cc44', true)
on conflict (id) do nothing;

-- Destinations (WC 2026 match cities for Portugal)
insert into public.destinations (city, lat, lng, description, date_range, "order") values
  ('New York',     40.7128, -74.0060, 'Opening group stage match at MetLife Stadium', 'Jun 13–18',  1),
  ('Los Angeles',  34.0522, -118.2437,'Second group stage match at SoFi Stadium',     'Jun 18–23',  2),
  ('Kansas City',  39.0997, -94.5786, 'Third group stage match at Arrowhead Stadium', 'Jun 23–28',  3),
  ('Miami',        25.7617, -80.1918, 'Round of 16 at Hard Rock Stadium',             'Jun 28–Jul 5', 4),
  ('Dallas',       32.7767, -96.7970, 'Quarter-final at AT&T Stadium',                'Jul 5–10',   5),
  ('Vancouver',    49.2827, -123.1207,'Semi-final at BC Place',                       'Jul 10–15',  6);

-- Travelers (dummy data — swap out with real people later)
insert into public.travelers (name, lat, lng, current_city, note, is_owner) values
  ('Mateo',    40.7128, -74.0060, 'New York',    'Living the dream 🇵🇹⚽', true),
  ('João',     40.7128, -74.0060, 'New York',    'Vamos Portugal!',        false),
  ('Miguel',   40.7128, -74.0060, 'New York',    'Road trip mode on 🚗',   false),
  ('Ana',      40.7128, -74.0060, 'New York',    'Here for the vibes ✨',   false);
