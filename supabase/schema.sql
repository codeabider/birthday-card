-- Birthday Card — database schema
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- cards: one row per birthday card. `slug` is the public URL segment.
-- ---------------------------------------------------------------------------
create table if not exists public.cards (
	id uuid primary key default gen_random_uuid(),
	slug text not null unique,
	name text not null,

	-- Gate countdown. Store as timestamptz; the gate shows the local countdown.
	birthday_at timestamptz not null,

	-- Storage path (not a public URL) of the reel cutout photo, e.g.
	-- 'cards/<id>/reel.png'. Resolved to a public URL at runtime.
	photo_path text,

	-- Ordered list of solar-system bodies. Each entry is
	--   { id, name, text }
	-- Visual properties (orbit radius, speed, size, colour) are assigned by
	-- index at render time, so add/remove/reorder is safe.
	planets jsonb not null default '[]'::jsonb,

	-- Ordered list of gifts. Each entry is
	--   { id, emoji, hint, title, vibe, body, accent, kind, interactiveLabel }
	gifts jsonb not null default '[]'::jsonb,

	-- Everything else: planner stages, closing lines, wishes, gate copy, etc.
	-- Shape is defined by src/lib/config/defaults.js
	settings jsonb not null default '{}'::jsonb,

	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists cards_slug_idx on public.cards (slug);

-- Keep updated_at honest.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

drop trigger if exists cards_touch_updated_at on public.cards;
create trigger cards_touch_updated_at
	before update on public.cards
	for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Reads are public: anyone holding a card URL must be able to render it.
-- Writes require a signed-in owner. There is only ever one owner account
-- (yours), so "authenticated" is the whole admin gate.
-- ---------------------------------------------------------------------------
alter table public.cards enable row level security;

drop policy if exists "cards are public to read" on public.cards;
create policy "cards are public to read"
	on public.cards for select
	using (true);

drop policy if exists "owner can insert cards" on public.cards;
create policy "owner can insert cards"
	on public.cards for insert
	to authenticated
	with check (true);

drop policy if exists "owner can update cards" on public.cards;
create policy "owner can update cards"
	on public.cards for update
	to authenticated
	using (true)
	with check (true);

drop policy if exists "owner can delete cards" on public.cards;
create policy "owner can delete cards"
	on public.cards for delete
	to authenticated
	using (true);

-- ---------------------------------------------------------------------------
-- Storage bucket for the reel cutout photo.
--
-- Public read so the card pages can load the image with a plain <img>.
-- Write requires a signed-in owner.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('card-photos', 'card-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "card photos are public to read" on storage.objects;
create policy "card photos are public to read"
	on storage.objects for select
	using (bucket_id = 'card-photos');

drop policy if exists "owner can upload card photos" on storage.objects;
create policy "owner can upload card photos"
	on storage.objects for insert
	to authenticated
	with check (bucket_id = 'card-photos');

drop policy if exists "owner can update card photos" on storage.objects;
create policy "owner can update card photos"
	on storage.objects for update
	to authenticated
	using (bucket_id = 'card-photos');

drop policy if exists "owner can delete card photos" on storage.objects;
create policy "owner can delete card photos"
	on storage.objects for delete
	to authenticated
	using (bucket_id = 'card-photos');
