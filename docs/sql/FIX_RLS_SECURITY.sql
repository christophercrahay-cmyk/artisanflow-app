-- Script pour activer RLS et corriger les politiques de sécurité
-- À exécuter dans le SQL Editor de Supabase

-- ============================================
-- ACTIVATION RLS SUR TOUTES LES TABLES
-- ============================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLITIQUES PUBLIQUES POUR MVP
-- Permettre toutes les opérations pour l'instant
-- ============================================

-- Clients
DROP POLICY IF EXISTS "clients_read_all" ON public.clients;
CREATE POLICY "clients_read_all" ON public.clients FOR SELECT USING (true);

DROP POLICY IF EXISTS "clients_insert_all" ON public.clients;
CREATE POLICY "clients_insert_all" ON public.clients FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "clients_update_all" ON public.clients;
CREATE POLICY "clients_update_all" ON public.clients FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "clients_delete_all" ON public.clients;
CREATE POLICY "clients_delete_all" ON public.clients FOR DELETE USING (true);

-- Projects
DROP POLICY IF EXISTS "projects_read_all" ON public.projects;
CREATE POLICY "projects_read_all" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "projects_insert_all" ON public.projects;
CREATE POLICY "projects_insert_all" ON public.projects FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "projects_update_all" ON public.projects;
CREATE POLICY "projects_update_all" ON public.projects FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "projects_delete_all" ON public.projects;
CREATE POLICY "projects_delete_all" ON public.projects FOR DELETE USING (true);

-- Devis
DROP POLICY IF EXISTS "devis_read_all" ON public.devis;
CREATE POLICY "devis_read_all" ON public.devis FOR SELECT USING (true);

DROP POLICY IF EXISTS "devis_insert_all" ON public.devis;
CREATE POLICY "devis_insert_all" ON public.devis FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "devis_update_all" ON public.devis;
CREATE POLICY "devis_update_all" ON public.devis FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "devis_delete_all" ON public.devis;
CREATE POLICY "devis_delete_all" ON public.devis FOR DELETE USING (true);

-- Factures
DROP POLICY IF EXISTS "factures_read_all" ON public.factures;
CREATE POLICY "factures_read_all" ON public.factures FOR SELECT USING (true);

DROP POLICY IF EXISTS "factures_insert_all" ON public.factures;
CREATE POLICY "factures_insert_all" ON public.factures FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "factures_update_all" ON public.factures;
CREATE POLICY "factures_update_all" ON public.factures FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "factures_delete_all" ON public.factures;
CREATE POLICY "factures_delete_all" ON public.factures FOR DELETE USING (true);

-- Notes
DROP POLICY IF EXISTS "notes_read_all" ON public.notes;
CREATE POLICY "notes_read_all" ON public.notes FOR SELECT USING (true);

DROP POLICY IF EXISTS "notes_insert_all" ON public.notes;
CREATE POLICY "notes_insert_all" ON public.notes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "notes_update_all" ON public.notes;
CREATE POLICY "notes_update_all" ON public.notes FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "notes_delete_all" ON public.notes;
CREATE POLICY "notes_delete_all" ON public.notes FOR DELETE USING (true);

-- Project Photos
DROP POLICY IF EXISTS "project_photos_read_all" ON public.project_photos;
CREATE POLICY "project_photos_read_all" ON public.project_photos FOR SELECT USING (true);

DROP POLICY IF EXISTS "project_photos_insert_all" ON public.project_photos;
CREATE POLICY "project_photos_insert_all" ON public.project_photos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "project_photos_update_all" ON public.project_photos;
CREATE POLICY "project_photos_update_all" ON public.project_photos FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "project_photos_delete_all" ON public.project_photos;
CREATE POLICY "project_photos_delete_all" ON public.project_photos FOR DELETE USING (true);

-- Client Photos
DROP POLICY IF EXISTS "client_photos_read_all" ON public.client_photos;
CREATE POLICY "client_photos_read_all" ON public.client_photos FOR SELECT USING (true);

DROP POLICY IF EXISTS "client_photos_insert_all" ON public.client_photos;
CREATE POLICY "client_photos_insert_all" ON public.client_photos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "client_photos_update_all" ON public.client_photos;
CREATE POLICY "client_photos_update_all" ON public.client_photos FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "client_photos_delete_all" ON public.client_photos;
CREATE POLICY "client_photos_delete_all" ON public.client_photos FOR DELETE USING (true);

-- Brand Settings
DROP POLICY IF EXISTS "brand_settings_read_all" ON public.brand_settings;
CREATE POLICY "brand_settings_read_all" ON public.brand_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "brand_settings_insert_all" ON public.brand_settings;
CREATE POLICY "brand_settings_insert_all" ON public.brand_settings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "brand_settings_update_all" ON public.brand_settings;
CREATE POLICY "brand_settings_update_all" ON public.brand_settings FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "brand_settings_delete_all" ON public.brand_settings;
CREATE POLICY "brand_settings_delete_all" ON public.brand_settings FOR DELETE USING (true);

-- ============================================
-- MESSAGE DE CONFIRMATION
-- ============================================

SELECT '✅ RLS activé sur toutes les tables avec politiques publiques ouvertes' as status;

