-- =========================================================
-- SAKHO ÉLECTRONIC – base de données des produits (Supabase)
-- À coller UNE fois dans Supabase : SQL Editor → New query → Run.
-- Le script peut être relancé sans danger.
-- =========================================================

-- 1. Administrateurs autorisés à modifier les produits ---------------
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;  -- aucune règle : illisible depuis le site

insert into public.admins (email) values ('admin@sakho-electronic.sn')
on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- 2. Produits ---------------------------------------------------------
create table if not exists public.products (
  id          text primary key default gen_random_uuid()::text,
  name        text not null check (char_length(name) between 1 and 80),
  description text not null default '' check (char_length(description) <= 300),
  price       integer check (price is null or price >= 0),
  category    text not null check (category in
                ('smartphones', 'ordinateurs', 'accessoires', 'audio', 'montres', 'chargeurs')),
  image_url   text not null default '' check (char_length(image_url) <= 500),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.products enable row level security;

-- Droits d'accès explicites (les règles RLS ci-dessous filtrent ensuite)
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
revoke all on public.admins from anon, authenticated;

drop policy if exists "Lecture publique des produits" on public.products;
create policy "Lecture publique des produits" on public.products
  for select to anon, authenticated using (true);

drop policy if exists "Admin ajoute des produits" on public.products;
create policy "Admin ajoute des produits" on public.products
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admin modifie des produits" on public.products;
create policy "Admin modifie des produits" on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin supprime des produits" on public.products;
create policy "Admin supprime des produits" on public.products
  for delete to authenticated using (public.is_admin());

-- Temps réel : chaque changement est envoyé à tous les visiteurs connectés
do $$
begin
  alter publication supabase_realtime add table public.products;
exception when duplicate_object then null;
end $$;

-- 3. Produits de départ (ceux du site actuel) --------------------------
insert into public.products (id, name, description, price, category, image_url, sort_order) values
  ('iphone', 'iPhone', 'Les derniers modèles Apple, neufs et garantis.', null, 'smartphones', 'assets/img/p-iphone.jpg', 1),
  ('samsung-galaxy', 'Samsung Galaxy', 'Gamme Galaxy S, A et Z pour tous les budgets.', null, 'smartphones', 'assets/img/p-samsung.jpg', 2),
  ('xiaomi', 'Xiaomi', 'Redmi et Xiaomi : performance au meilleur prix.', null, 'smartphones', 'assets/img/p-xiaomi.jpg', 3),
  ('infinix', 'Infinix', 'Grands écrans et grosse autonomie.', null, 'smartphones', 'assets/img/cat-smartphones.jpg', 4),
  ('tecno', 'Tecno', 'Smartphones fiables, photo et batterie au top.', null, 'smartphones', 'assets/img/p-samsung.jpg', 5),
  ('ordinateurs-portables', 'Ordinateurs portables', 'HP, Lenovo, Asus, MacBook… pour le travail et les études.', null, 'ordinateurs', 'assets/img/p-laptop.jpg', 6),
  ('airpods', 'AirPods', 'Écouteurs sans fil Apple avec boîtier de charge.', null, 'audio', 'assets/img/p-airpods.jpg', 7),
  ('ecouteurs-bluetooth', 'Écouteurs Bluetooth', 'Casques et écouteurs sans fil, son de qualité.', null, 'audio', 'assets/img/cat-audio.jpg', 8),
  ('montres-connectees', 'Montres connectées', 'Suivi santé, sport et notifications au poignet.', null, 'montres', 'assets/img/p-montre.jpg', 9),
  ('chargeurs', 'Chargeurs', 'Chargeurs rapides USB-C et adaptateurs secteur.', null, 'chargeurs', 'assets/img/p-chargeur.jpg', 10),
  ('coques', 'Coques', 'Coques de protection pour tous les modèles.', null, 'accessoires', 'assets/img/p-coque.jpg', 11),
  ('cables-usb', 'Câbles USB', 'Câbles USB-C, Lightning et micro-USB résistants.', null, 'chargeurs', 'assets/img/cat-cables.jpg', 12)
on conflict (id) do nothing;

-- 4. Stockage des photos de produits ------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('products', 'products', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "Admin envoie des photos" on storage.objects;
create policy "Admin envoie des photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "Admin modifie des photos" on storage.objects;
create policy "Admin modifie des photos" on storage.objects
  for update to authenticated using (bucket_id = 'products' and public.is_admin());

drop policy if exists "Admin supprime des photos" on storage.objects;
create policy "Admin supprime des photos" on storage.objects
  for delete to authenticated using (bucket_id = 'products' and public.is_admin());
