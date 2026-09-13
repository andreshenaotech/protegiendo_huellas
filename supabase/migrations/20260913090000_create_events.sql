-- Eventos de la fundación con flyer, datos opcionales y enlaces a redes.
create table public.events (
  id bigint generated always as identity primary key,
  title text not null constraint events_title_not_blank check (length(btrim(title)) > 0),
  description text,
  event_date date not null,
  event_time time,
  location text,
  flyer_path text not null,
  flyer_width integer not null constraint events_flyer_width_positive check (flyer_width > 0),
  flyer_height integer not null constraint events_flyer_height_positive check (flyer_height > 0),
  instagram_url text constraint events_instagram_url_https check (instagram_url is null or instagram_url like 'https://%'),
  facebook_url text constraint events_facebook_url_https check (facebook_url is null or facebook_url like 'https://%'),
  tiktok_url text constraint events_tiktok_url_https check (tiktok_url is null or tiktok_url like 'https://%'),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_event_date_idx on public.events (event_date);
create index events_created_by_idx on public.events (created_by);
create index events_updated_by_idx on public.events (updated_by);

-- Reutiliza el trigger de auditoría de perros (mismas columnas).
create trigger events_set_audit_fields
before insert or update on public.events
for each row execute function private.set_dog_audit_fields();

alter table public.events enable row level security;

grant select on public.events to anon, authenticated;
grant insert, update, delete on public.events to authenticated;
grant usage, select on sequence public.events_id_seq to authenticated;

create policy "Events are publicly readable"
on public.events
for select
to anon, authenticated
using (true);

create policy "Admins can insert events"
on public.events
for insert
to authenticated
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins can update events"
on public.events
for update
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins can delete events"
on public.events
for delete
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-flyers', 'event-flyers', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins can read event flyer objects"
on storage.objects
for select
to authenticated
using (bucket_id = 'event-flyers' and exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins can upload event flyers"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'event-flyers' and exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins can update event flyers"
on storage.objects
for update
to authenticated
using (bucket_id = 'event-flyers' and exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (bucket_id = 'event-flyers' and exists (select 1 from public.admin_users where user_id = (select auth.uid())));

create policy "Admins can delete event flyers"
on storage.objects
for delete
to authenticated
using (bucket_id = 'event-flyers' and exists (select 1 from public.admin_users where user_id = (select auth.uid())));
