-- ============================================================
-- Run this AFTER migration.sql in the Supabase SQL Editor
-- ============================================================

-- Create the photos storage bucket
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Public read on all objects in the photos bucket
create policy "public read photos bucket"
  on storage.objects for select
  using (bucket_id = 'photos');

-- Service role can insert/update/delete (admin uploads)
-- No policy needed — service role bypasses RLS
