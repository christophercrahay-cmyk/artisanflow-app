-- ========================================
-- MIGRATION COMPLÈTE : ACTIVATION RLS ET SÉCURISATION
-- ========================================
-- Date: 2025-11-04
-- Objectif: Sécuriser entièrement la base de données ArtisanFlow avec RLS
-- À exécuter dans Supabase SQL Editor
-- ========================================

-- ========================================
-- ÉTAPE 1 : VÉRIFIER ET AJOUTER COLONNES user_id
-- ========================================

-- Table clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table projects
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table client_photos
ALTER TABLE public.client_photos
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table project_photos
ALTER TABLE public.project_photos
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table notes
ALTER TABLE public.notes
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table devis
ALTER TABLE public.devis
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table factures
ALTER TABLE public.factures
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Table brand_settings (paramètres)
ALTER TABLE public.brand_settings
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ========================================
-- ÉTAPE 2 : CRÉER LES INDEX POUR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_client_photos_user_id ON public.client_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_project_photos_user_id ON public.project_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_devis_user_id ON public.devis(user_id);
CREATE INDEX IF NOT EXISTS idx_factures_user_id ON public.factures(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_settings_user_id ON public.brand_settings(user_id);

-- ========================================
-- ÉTAPE 3 : ACTIVER ROW LEVEL SECURITY
-- ========================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_settings ENABLE ROW LEVEL SECURITY;

-- ========================================
-- ÉTAPE 4 : POLICIES POUR CLIENTS
-- ========================================

-- Supprimer anciennes policies si elles existent
DROP POLICY IF EXISTS "Select only own clients" ON public.clients;
DROP POLICY IF EXISTS "Insert own clients" ON public.clients;
DROP POLICY IF EXISTS "Update own clients" ON public.clients;
DROP POLICY IF EXISTS "Delete own clients" ON public.clients;

-- Créer les policies
CREATE POLICY "Select only own clients"
  ON public.clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Insert own clients"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own clients"
  ON public.clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Delete own clients"
  ON public.clients FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- ÉTAPE 5 : POLICIES POUR PROJECTS
-- ========================================

DROP POLICY IF EXISTS "Select only own projects" ON public.projects;
DROP POLICY IF EXISTS "Insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Update own projects" ON public.projects;
DROP POLICY IF EXISTS "Delete own projects" ON public.projects;

CREATE POLICY "Select only own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- ÉTAPE 6 : POLICIES POUR CLIENT_PHOTOS
-- ========================================

DROP POLICY IF EXISTS "Select only own client_photos" ON public.client_photos;
DROP POLICY IF EXISTS "Insert own client_photos" ON public.client_photos;
DROP POLICY IF EXISTS "Update own client_photos" ON public.client_photos;
DROP POLICY IF EXISTS "Delete own client_photos" ON public.client_photos;

CREATE POLICY "Select only own client_photos"
  ON public.client_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Insert own client_photos"
  ON public.client_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own client_photos"
  ON public.client_photos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Delete own client_photos"
  ON public.client_photos FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- ÉTAPE 7 : POLICIES POUR PROJECT_PHOTOS
-- ========================================

DROP POLICY IF EXISTS "Select only own project_photos" ON public.project_photos;
DROP POLICY IF EXISTS "Insert own project_photos" ON public.project_photos;
DROP POLICY IF EXISTS "Update own project_photos" ON public.project_photos;
DROP POLICY IF EXISTS "Delete own project_photos" ON public.project_photos;

CREATE POLICY "Select only own project_photos"
  ON public.project_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Insert own project_photos"
  ON public.project_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own project_photos"
  ON public.project_photos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Delete own project_photos"
  ON public.project_photos FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- ÉTAPE 8 : POLICIES POUR NOTES
-- ========================================

DROP POLICY IF EXISTS "Select only own notes" ON public.notes;
DROP POLICY IF EXISTS "Insert own notes" ON public.notes;
DROP POLICY IF EXISTS "Update own notes" ON public.notes;
DROP POLICY IF EXISTS "Delete own notes" ON public.notes;

CREATE POLICY "Select only own notes"
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Insert own notes"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own notes"
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Delete own notes"
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- ÉTAPE 9 : POLICIES POUR DEVIS
-- ========================================

DROP POLICY IF EXISTS "Select only own devis" ON public.devis;
DROP POLICY IF EXISTS "Insert own devis" ON public.devis;
DROP POLICY IF EXISTS "Update own devis" ON public.devis;
DROP POLICY IF EXISTS "Delete own devis" ON public.devis;

CREATE POLICY "Select only own devis"
  ON public.devis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Insert own devis"
  ON public.devis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own devis"
  ON public.devis FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Delete own devis"
  ON public.devis FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- ÉTAPE 10 : POLICIES POUR FACTURES
-- ========================================

DROP POLICY IF EXISTS "Select only own factures" ON public.factures;
DROP POLICY IF EXISTS "Insert own factures" ON public.factures;
DROP POLICY IF EXISTS "Update own factures" ON public.factures;
DROP POLICY IF EXISTS "Delete own factures" ON public.factures;

CREATE POLICY "Select only own factures"
  ON public.factures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Insert own factures"
  ON public.factures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own factures"
  ON public.factures FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Delete own factures"
  ON public.factures FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- ÉTAPE 11 : POLICIES POUR BRAND_SETTINGS
-- ========================================

DROP POLICY IF EXISTS "Select only own brand_settings" ON public.brand_settings;
DROP POLICY IF EXISTS "Insert own brand_settings" ON public.brand_settings;
DROP POLICY IF EXISTS "Update own brand_settings" ON public.brand_settings;
DROP POLICY IF EXISTS "Delete own brand_settings" ON public.brand_settings;

CREATE POLICY "Select only own brand_settings"
  ON public.brand_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Insert own brand_settings"
  ON public.brand_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own brand_settings"
  ON public.brand_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Delete own brand_settings"
  ON public.brand_settings FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- ÉTAPE 12 : POLICIES STORAGE (Buckets)
-- ========================================

-- Project photos bucket
DROP POLICY IF EXISTS "Users upload own project-photos" ON storage.objects;
DROP POLICY IF EXISTS "Users view own project-photos" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own project-photos" ON storage.objects;

CREATE POLICY "Users upload own project-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users view own project-photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own project-photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Voices bucket
DROP POLICY IF EXISTS "Users upload own voices" ON storage.objects;
DROP POLICY IF EXISTS "Users view own voices" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own voices" ON storage.objects;

CREATE POLICY "Users upload own voices"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'voices' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users view own voices"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'voices' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own voices"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'voices' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Docs bucket (PDFs)
DROP POLICY IF EXISTS "Users upload own docs" ON storage.objects;
DROP POLICY IF EXISTS "Users view own docs" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own docs" ON storage.objects;

CREATE POLICY "Users upload own docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'docs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users view own docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'docs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own docs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'docs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ========================================
-- MESSAGE DE CONFIRMATION
-- ========================================

SELECT '🔒 RLS activé avec succès ! Toutes les tables sont sécurisées par utilisateur.' as status;

