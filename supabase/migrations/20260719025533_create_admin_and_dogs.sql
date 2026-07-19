create schema if not exists private;
revoke all on schema private from public;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'admin'
    constraint admin_users_role_check check (role in ('superadmin', 'admin')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index admin_users_created_by_idx on public.admin_users (created_by);

create table public.dogs (
  id bigint generated always as identity primary key,
  name text not null constraint dogs_name_not_blank check (length(btrim(name)) > 0),
  description text,
  age text not null constraint dogs_age_not_blank check (length(btrim(age)) > 0),
  size text not null constraint dogs_size_not_blank check (length(btrim(size)) > 0),
  status text not null constraint dogs_status_not_blank check (length(btrim(status)) > 0),
  image_path text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index dogs_created_by_idx on public.dogs (created_by);
create index dogs_updated_by_idx on public.dogs (updated_by);
create index dogs_name_idx on public.dogs (name);

create or replace function private.set_dog_audit_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();

  if tg_op = 'INSERT' then
    new.created_by := coalesce((select auth.uid()), new.created_by);
    new.updated_by := coalesce((select auth.uid()), new.updated_by);
  else
    new.created_by := old.created_by;
    new.created_at := old.created_at;
    new.updated_by := coalesce((select auth.uid()), old.updated_by);
  end if;

  return new;
end;
$$;

revoke all on function private.set_dog_audit_fields() from public;

create trigger dogs_set_audit_fields
before insert or update on public.dogs
for each row execute function private.set_dog_audit_fields();

alter table public.admin_users enable row level security;
alter table public.dogs enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.dogs to anon, authenticated;
grant insert, update, delete on public.dogs to authenticated;
grant select on public.admin_users to authenticated;
grant usage, select on sequence public.dogs_id_seq to authenticated;

create policy "Dogs are publicly readable"
on public.dogs
for select
to anon, authenticated
using (true);

create policy "Admins can insert dogs"
on public.dogs
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  )
);

create policy "Admins can update dogs"
on public.dogs
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  )
);

create policy "Admins can delete dogs"
on public.dogs
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  )
);

create policy "Admins can read their own role"
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dog-images',
  'dog-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins can read dog image objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'dog-images'
  and exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  )
);

create policy "Admins can upload dog images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'dog-images'
  and exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  )
);

create policy "Admins can update dog images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'dog-images'
  and exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'dog-images'
  and exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  )
);

create policy "Admins can delete dog images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'dog-images'
  and exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  )
);

insert into public.dogs (name, description, age, size, status, image_path)
values
  ('Ámbar', null, '3 años', 'Mediana', 'Esterilizada', null),
  ('Muñeco', null, '4 años', 'Mediano-pequeño', 'Castrado', null),
  ('Bambi', null, '2 años', 'Mediana', 'Esterilizada', null),
  ('Flaca', null, '3 años', 'Mediana', 'Esterilizada', null),
  ('Guadalupe', null, '1 año', 'Mediana', 'Esterilizada', null),
  ('Bichota', null, '1.5 años', 'Mediana-grande', 'Esterilizada', null),
  ('Libertador', null, '3 años', 'Grande', 'Castrado', null),
  ('Lila', null, '2 años', 'Grande', 'Esterilizada', null),
  ('Lucy', null, '2 años', 'Mediana', 'Esterilizada', null),
  ('Sacha', null, '5 años', 'Mediana', 'Esterilizada', null),
  ('Lupa', null, '1 año', 'Grande', 'Esterilizada', null),
  ('Mía', null, '2 años', 'Grande', 'Esterilizada', null),
  ('Miel', null, '4 años', 'Mediana', 'Esterilizada', null),
  ('Mulan', null, '2 años', 'Grande', 'Castrado', null),
  ('Negrita', null, '1.5 años', 'Mediana', 'Esterilizada', null),
  ('Nieve', null, '2.5 años', 'Pequeña', 'Esterilizada', null),
  ('Pinina', null, '2 años', 'Mediana', 'Esterilizada', null),
  ('Piny', null, '4 años', 'Mediana', 'Esterilizada', null),
  ('Ruper', null, '3 años', 'Grande', 'Castrado', null),
  ('Susy', null, '2 años', 'Mediana', 'Esterilizada', null),
  ('Yayita', null, '1.5 años', 'Grande', 'Esterilizada', null),
  ('Tigre', null, '1 año', 'Mediana', 'Esterilizada', null),
  ('Victoria', null, '3 años', 'Mediana', 'Esterilizada', null),
  ('Pepita', null, '3 años', 'Pequeña', 'Esterilizada', null),
  ('Sion', null, '1.5 años', 'Mediano', 'Castrado', null),
  ('Melona', null, '1 año', 'Mediana', 'Esterilizada', null),
  ('Tomasa', null, '1.5 años', 'Mediana', 'Esterilizada', null),
  ('Sira', null, '2 años', 'Grande', 'Esterilizada', null),
  ('Zuny', null, '1 año', 'Grande', 'Castrado', null),
  ('Ash', null, '3 años', 'Mediano', 'Castrado', null),
  ('Ozzy', null, '2 años', 'Mediano', 'Castrado', null),
  ('Galleta', null, '1 año', 'Pequeña', 'Esterilizada', null),
  ('Kira', null, '2 años', 'Mediana', 'Esterilizada', null),
  ('Dulcinea', null, '3 años', 'Mediana', 'Esterilizada', null),
  ('Barbitas', null, '5 años', 'Mediana', 'Esterilizada', null),
  ('Salomé', null, '3 años', 'Grande', 'Esterilizada', null),
  ('Manchas', null, '2 años', 'Mediana', 'Esterilizada', null),
  ('Muñeca', null, '2 años', 'Grande', 'Esterilizada', null),
  ('Luna', null, '5 años', 'Pequeña', 'Esterilizada', null),
  ('Frida', null, '1.5 años', 'Mediana', 'Esterilizada', null),
  ('Lupita', null, '4 años', 'Mediana', 'Esterilizada', null),
  ('Milú', null, '3 años', 'Grande · Husky Siberiano', 'Esterilizada', null),
  ('Alaska', null, '3 años', 'Mediana', 'Esterilizada', null),
  ('Fogata', null, '2 años', 'Mediana', 'Esterilizada', null),
  ('Fortuna', null, '10 meses', 'Mediana', 'Esterilizada', null),
  ('Cerecita', null, '8 meses', 'Mediana', 'Esterilizada', null),
  ('Bonita', null, '2 años', 'Mediana', 'Esterilizada', null),
  ('Motoso', null, '1.5 años', 'Mediano-pequeño · French Poodle', 'Castrado', null),
  ('Tigre', null, '4 años', 'Mediano', 'Castrado', null),
  ('Isis', null, '9 meses', 'Mediana', 'Esterilizada', null),
  ('Candela', null, '2 años', 'Grande', 'Esterilizada', null);
