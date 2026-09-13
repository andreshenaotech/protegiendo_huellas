-- Fecha de adopción. NULL significa que el perro sigue buscando hogar.
alter table public.dogs add column adopted_at timestamptz;

create index dogs_adopted_at_idx on public.dogs (adopted_at);
