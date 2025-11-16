-- Vérification de l'installation "signature de devis" (lecture seule)
-- A exécuter dans le SQL Editor Supabase (projet ArtisanFlow)
-- Aucun changement d'état, uniquement des SELECT.

-- 1) Table public.devis_signature_links
select
  to_regclass('public.devis_signature_links') as table_exists,
  (select c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='devis_signature_links') as rls_enabled;

-- 2) Colonnes attendues (table devis_signature_links)
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema='public' and table_name='devis_signature_links'
order by ordinal_position;

-- 3) Colonnes de suivi attendues sur la table devis
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema='public'
  and table_name='devis'
  and column_name in (
    'signature_status','signed_at','signed_by_name','signed_ip','signed_user_agent','signature_image_url','signature_pdf_url'
  )
order by column_name;

-- 4) Policies RLS sur devis_signature_links
select schemaname, tablename, policyname, permissive, roles, cmd
from pg_policies
where schemaname='public' and tablename='devis_signature_links'
order by policyname;

-- 5) Bucket storage "signatures"
select id, name, public
from storage.buckets
where id='signatures';

-- 6) Sanity check d'index
select indexname, indexdef
from pg_indexes
where schemaname='public' and tablename='devis_signature_links'
order by indexname;

-- Vérification de l'installation "signature de devis" (lecture seule)
-- A exécuter dans le SQL Editor Supabase (projet ArtisanFlow)
-- Aucun changement d'état, uniquement des SELECT.

-- 1) Table public.devis_signature_links
select
  to_regclass('public.devis_signature_links') as table_exists,
  (select c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='devis_signature_links') as rls_enabled;

-- 2) Colonnes attendues (table devis_signature_links)
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema='public' and table_name='devis_signature_links'
order by ordinal_position;

-- 3) Colonnes de suivi attendues sur la table devis
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema='public'
  and table_name='devis'
  and column_name in (
    'signature_status','signed_at','signed_by_name','signed_ip','signed_user_agent','signature_image_url','signature_pdf_url'
  )
order by column_name;

-- 4) Policies RLS sur devis_signature_links
select schemaname, tablename, policyname, permissive, roles, cmd
from pg_policies
where schemaname='public' and tablename='devis_signature_links'
order by policyname;

-- 5) Bucket storage "signatures"
select id, name, public
from storage.buckets
where id='signatures';

-- 6) Sanity check d'index
select indexname, indexdef
from pg_indexes
where schemaname='public' and tablename='devis_signature_links'
order by indexname;



