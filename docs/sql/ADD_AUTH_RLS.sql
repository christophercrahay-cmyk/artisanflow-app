-- ============================================
-- AJOUT AUTH SUPABASE + RLS
-- ArtisanFlow - Isolation par utilisateur
-- ============================================

-- 1. ACTIVER RLS SUR TOUTES LES TABLES MÉTIER
-- ============================================

-- Note: RLS est déjà désactivé dans INIT_SUPABASE.sql
-- On le réactive ici et on ajoute les politiques par user_id

-- Clients
ALTER TABLE IF EXISTS clients ENABLE ROW LEVEL SECURITY;

-- Projects (chantiers)
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;

-- Notes
ALTER TABLE IF EXISTS notes ENABLE ROW LEVEL SECURITY;

-- Client Photos
ALTER TABLE IF EXISTS client_photos ENABLE ROW LEVEL SECURITY;

-- Project Photos
ALTER TABLE IF EXISTS project_photos ENABLE ROW LEVEL SECURITY;

-- Devis
ALTER TABLE IF EXISTS devis ENABLE ROW LEVEL SECURITY;

-- Factures
ALTER TABLE IF EXISTS factures ENABLE ROW LEVEL SECURITY;

-- Brand Settings (profil entreprise)
ALTER TABLE IF EXISTS brand_settings ENABLE ROW LEVEL SECURITY;


-- 2. AJOUT COLONNE user_id À TOUTES LES TABLES
-- ============================================

-- Clients
ALTER TABLE IF EXISTS clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- Projects
ALTER TABLE IF EXISTS projects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- Notes
ALTER TABLE IF EXISTS notes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- Client Photos
ALTER TABLE IF EXISTS client_photos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- Project Photos
ALTER TABLE IF EXISTS project_photos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- Devis
ALTER TABLE IF EXISTS devis ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- Factures
ALTER TABLE IF EXISTS factures ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- Brand Settings
ALTER TABLE IF EXISTS brand_settings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;


-- 3. CRÉATION INDEX SUR user_id
-- ============================================

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_client_photos_user_id ON client_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_project_photos_user_id ON project_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_devis_user_id ON devis(user_id);
CREATE INDEX IF NOT EXISTS idx_factures_user_id ON factures(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_settings_user_id ON brand_settings(user_id);


-- 4. CRÉATION POLITIQUES RLS (SELECT/INSERT/UPDATE/DELETE)
-- ============================================

-- Fonction helper pour vérifier user_id
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE SQL STABLE;

-- Clients
DROP POLICY IF EXISTS "Users see own clients" ON clients;
CREATE POLICY "Users see own clients" ON clients
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own clients" ON clients;
CREATE POLICY "Users insert own clients" ON clients
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own clients" ON clients;
CREATE POLICY "Users update own clients" ON clients
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own clients" ON clients;
CREATE POLICY "Users delete own clients" ON clients
  FOR DELETE USING (user_id = auth.uid());

-- Projects
DROP POLICY IF EXISTS "Users see own projects" ON projects;
CREATE POLICY "Users see own projects" ON projects
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own projects" ON projects;
CREATE POLICY "Users insert own projects" ON projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own projects" ON projects;
CREATE POLICY "Users update own projects" ON projects
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own projects" ON projects;
CREATE POLICY "Users delete own projects" ON projects
  FOR DELETE USING (user_id = auth.uid());

-- Notes
DROP POLICY IF EXISTS "Users see own notes" ON notes;
CREATE POLICY "Users see own notes" ON notes
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own notes" ON notes;
CREATE POLICY "Users insert own notes" ON notes
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own notes" ON notes;
CREATE POLICY "Users update own notes" ON notes
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own notes" ON notes;
CREATE POLICY "Users delete own notes" ON notes
  FOR DELETE USING (user_id = auth.uid());

-- Client Photos
DROP POLICY IF EXISTS "Users see own client_photos" ON client_photos;
CREATE POLICY "Users see own client_photos" ON client_photos
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own client_photos" ON client_photos;
CREATE POLICY "Users insert own client_photos" ON client_photos
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own client_photos" ON client_photos;
CREATE POLICY "Users update own client_photos" ON client_photos
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own client_photos" ON client_photos;
CREATE POLICY "Users delete own client_photos" ON client_photos
  FOR DELETE USING (user_id = auth.uid());

-- Project Photos
DROP POLICY IF EXISTS "Users see own project_photos" ON project_photos;
CREATE POLICY "Users see own project_photos" ON project_photos
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own project_photos" ON project_photos;
CREATE POLICY "Users insert own project_photos" ON project_photos
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own project_photos" ON project_photos;
CREATE POLICY "Users update own project_photos" ON project_photos
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own project_photos" ON project_photos;
CREATE POLICY "Users delete own project_photos" ON project_photos
  FOR DELETE USING (user_id = auth.uid());

-- Devis
DROP POLICY IF EXISTS "Users see own devis" ON devis;
CREATE POLICY "Users see own devis" ON devis
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own devis" ON devis;
CREATE POLICY "Users insert own devis" ON devis
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own devis" ON devis;
CREATE POLICY "Users update own devis" ON devis
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own devis" ON devis;
CREATE POLICY "Users delete own devis" ON devis
  FOR DELETE USING (user_id = auth.uid());

-- Factures
DROP POLICY IF EXISTS "Users see own factures" ON factures;
CREATE POLICY "Users see own factures" ON factures
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own factures" ON factures;
CREATE POLICY "Users insert own factures" ON factures
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own factures" ON factures;
CREATE POLICY "Users update own factures" ON factures
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own factures" ON factures;
CREATE POLICY "Users delete own factures" ON factures
  FOR DELETE USING (user_id = auth.uid());

-- Brand Settings
DROP POLICY IF EXISTS "Users see own brand_settings" ON brand_settings;
CREATE POLICY "Users see own brand_settings" ON brand_settings
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own brand_settings" ON brand_settings;
CREATE POLICY "Users insert own brand_settings" ON brand_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own brand_settings" ON brand_settings;
CREATE POLICY "Users update own brand_settings" ON brand_settings
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own brand_settings" ON brand_settings;
CREATE POLICY "Users delete own brand_settings" ON brand_settings
  FOR DELETE USING (user_id = auth.uid());


-- 5. MISE À JOUR DES DONNÉES EXISTANTES (Migration)
-- ============================================

-- IMPORTANT: Les données existantes avec DEFAULT '00000000-0000-0000-0000-000000000000'
-- seront supprimées au premier nettoyage ou devront être migrées manuellement
-- lors de la première connexion utilisateur

-- Pour migrer vers un user_id réel, exécuter manuellement:
-- UPDATE clients SET user_id = 'REAL_USER_ID_HERE' WHERE user_id = '00000000-0000-0000-0000-000000000000';


-- 6. STORAGE BUCKET POLICIES
-- ============================================

-- Créer le bucket artisanflow s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('artisanflow', 'artisanflow', true)
ON CONFLICT (id) DO NOTHING;

-- Politiques Storage pour artisanflow bucket
DROP POLICY IF EXISTS "Users can read own files" ON storage.objects;
CREATE POLICY "Users can read own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'artisanflow' AND
    (storage.foldername(name))[1] = 'user' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artisanflow' AND
    (storage.foldername(name))[1] = 'user' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'artisanflow' AND
    (storage.foldername(name))[1] = 'user' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'artisanflow' AND
    (storage.foldername(name))[1] = 'user' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );


-- 7. REMOVE DEFAULT VALUES APRÈS MIGRATION
-- ============================================
-- NE FAIS PAS CETTE ÉTAPE si tu as des données existantes
-- ATTENDS de migrer manuellement toutes les données

-- ALTER TABLE clients ALTER COLUMN user_id DROP DEFAULT;
-- ALTER TABLE projects ALTER COLUMN user_id DROP DEFAULT;
-- ALTER TABLE notes ALTER COLUMN user_id DROP DEFAULT;
-- ALTER TABLE client_photos ALTER COLUMN user_id DROP DEFAULT;
-- ALTER TABLE project_photos ALTER COLUMN user_id DROP DEFAULT;
-- ALTER TABLE devis ALTER COLUMN user_id DROP DEFAULT;
-- ALTER TABLE factures ALTER COLUMN user_id DROP DEFAULT;
-- ALTER TABLE brand_settings ALTER COLUMN user_id DROP DEFAULT;


-- ✅ FIN SCRIPT AUTH + RLS
-- ============================================
-- IMPORTANT: À appliquer dans Supabase SQL Editor
-- Vérifier que RLS est maintenant activé et que les politiques sont créées

