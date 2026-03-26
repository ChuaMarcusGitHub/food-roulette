-- Allow anon to delete locations (MVP; tighten for production)
drop policy if exists "locations_delete" on locations;
create policy "locations_delete" on locations for delete using (true);
