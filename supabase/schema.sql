-- =========================================================
-- Meeting Room Booking — schema Supabase (Postgres)
-- A executer dans Supabase Dashboard > SQL Editor
-- =========================================================

-- Extension necessaire pour la contrainte anti-chevauchement
create extension if not exists btree_gist;

-- ---------------------------------------------------------
-- 1. Sites (pour supporter plusieurs sites/organisations plus tard)
-- ---------------------------------------------------------
create table if not exists sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

insert into sites (name) select 'Site principal'
where not exists (select 1 from sites);

-- ---------------------------------------------------------
-- 2. Profils utilisateurs (lie a auth.users)
-- ---------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Cree automatiquement un profil a l'inscription
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------------------------------------------------------
-- 3. Salles
-- ---------------------------------------------------------
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites (id) on delete cascade,
  name text not null,
  capacity int not null default 4,
  location text,
  equipment text[] not null default '{}',
  color text not null default '#0E7C7B',
  opening_time time not null default '08:00',
  closing_time time not null default '19:00',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 4. Reservations
-- ---------------------------------------------------------
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  constraint end_after_start check (end_time > start_time)
);

-- Regle metier essentielle : empeche deux reservations actives
-- de se chevaucher sur la meme salle, au niveau de la base de donnees.
alter table bookings
  drop constraint if exists no_overlapping_bookings;
alter table bookings
  add constraint no_overlapping_bookings
  exclude using gist (
    room_id with =,
    tstzrange(start_time, end_time) with &&
  ) where (status = 'confirmed');

create index if not exists idx_bookings_room_time on bookings (room_id, start_time, end_time);
create index if not exists idx_bookings_user on bookings (user_id);

-- ---------------------------------------------------------
-- 5. Row Level Security
-- ---------------------------------------------------------
alter table profiles enable row level security;
alter table rooms enable row level security;
alter table bookings enable row level security;
alter table sites enable row level security;

-- Sites : lecture pour tous les utilisateurs connectes
drop policy if exists "sites_select" on sites;
create policy "sites_select" on sites for select using (auth.role() = 'authenticated');

-- Profiles : chacun voit son profil ; tout le monde peut voir nom/role pour affichage (organisateur)
drop policy if exists "profiles_select" on profiles;
create policy "profiles_select" on profiles for select using (auth.role() = 'authenticated');

drop policy if exists "profiles_update_self" on profiles;
create policy "profiles_update_self" on profiles for update using (auth.uid() = id);

drop policy if exists "profiles_admin_all" on profiles;
create policy "profiles_admin_all" on profiles for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Rooms : lecture pour tous les connectes, ecriture reservee aux admins
drop policy if exists "rooms_select" on rooms;
create policy "rooms_select" on rooms for select using (auth.role() = 'authenticated');

drop policy if exists "rooms_admin_write" on rooms;
create policy "rooms_admin_write" on rooms for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Bookings : lecture pour tous les connectes (planning partage)
drop policy if exists "bookings_select" on bookings;
create policy "bookings_select" on bookings for select using (auth.role() = 'authenticated');

-- Creation : un utilisateur ne peut creer une reservation qu'en son nom
drop policy if exists "bookings_insert_self" on bookings;
create policy "bookings_insert_self" on bookings for insert with check (auth.uid() = user_id);

-- Modification / annulation : le proprietaire ou un admin
drop policy if exists "bookings_update_owner_or_admin" on bookings;
create policy "bookings_update_owner_or_admin" on bookings for update using (
  auth.uid() = user_id
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "bookings_delete_owner_or_admin" on bookings;
create policy "bookings_delete_owner_or_admin" on bookings for delete using (
  auth.uid() = user_id
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ---------------------------------------------------------
-- 6. Realtime : active les mises a jour en temps reel sur bookings
-- ---------------------------------------------------------
alter publication supabase_realtime add table bookings;

-- ---------------------------------------------------------
-- 7. Donnees de demonstration (optionnel)
-- ---------------------------------------------------------
insert into rooms (site_id, name, capacity, location, equipment, color)
select s.id, v.name, v.capacity, v.location, v.equipment, v.color
from sites s, (values
  ('Salle Atlas', 8, '1er etage', array['Ecran','Visioconference'], '#0E7C7B'),
  ('Salle Everest', 12, '2e etage', array['Ecran','Paperboard','Visioconference'], '#C24914'),
  ('Salle Kilimandjaro', 4, 'RDC', array['Paperboard'], '#D9A441')
) as v(name, capacity, location, equipment, color)
where not exists (select 1 from rooms);

-- Pour promouvoir un utilisateur en administrateur, executer :
-- update profiles set role = 'admin' where email = 'admin@exemple.com';
