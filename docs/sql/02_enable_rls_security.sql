-- ========================================
-- ACTIVATION RLS (ROW LEVEL SECURITY)
-- ========================================
-- Ce script sécurise les données par utilisateur
-- Chaque artisan ne voit QUE ses données

-- ========================================
-- ÉTAPE 1 : AJOUTER LA COLONNE user_id
-- ========================================

-- Ajouter user_id si elle n'existe pas
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE client_photos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE project_photos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE devis ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE factures ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE brand_settings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Créer des index pour performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_client_photos_user_id ON client_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_project_photos_user_id ON project_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_devis_user_id ON devis(user_id);
CREATE INDEX IF NOT EXISTS idx_factures_user_id ON factures(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_settings_user_id ON brand_settings(user_id);

-- ========================================
-- ÉTAPE 2 : ACTIVER RLS
-- ========================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;

-- ========================================
-- ÉTAPE 3 : POLICIES POUR CLIENTS
-- ========================================

-- Supprimer anciennes policies si elles existent
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

-- Créer les policies
CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- ÉTAPE 4 : POLICIES POUR PROJECTS
-- ========================================

DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- ÉTAPE 5 : POLICIES POUR CLIENT_PHOTOS
-- ========================================

DROP POLICY IF EXISTS "Users can view own client_photos" ON client_photos;
DROP POLICY IF EXISTS "Users can insert own client_photos" ON client_photos;
DROP POLICY IF EXISTS "Users can delete own client_photos" ON client_photos;

CREATE POLICY "Users can view own client_photos"
  ON client_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client_photos"
  ON client_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own client_photos"
  ON client_photos FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- ÉTAPE 6 : POLICIES POUR PROJECT_PHOTOS
-- ========================================

DROP POLICY IF EXISTS "Users can view own project_photos" ON project_photos;
DROP POLICY IF EXISTS "Users can insert own project_photos" ON project_photos;
DROP POLICY IF EXISTS "Users can delete own project_photos" ON project_photos;

CREATE POLICY "Users can view own project_photos"
  ON project_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project_photos"
  ON project_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own project_photos"
  ON project_photos FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- ÉTAPE 7 : POLICIES POUR NOTES
-- ========================================

DROP POLICY IF EXISTS "Users can view own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;

CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- ÉTAPE 8 : POLICIES POUR DEVIS
-- ========================================

DROP POLICY IF EXISTS "Users can view own devis" ON devis;
DROP POLICY IF EXISTS "Users can insert own devis" ON devis;
DROP POLICY IF EXISTS "Users can update own devis" ON devis;
DROP POLICY IF EXISTS "Users can delete own devis" ON devis;

CREATE POLICY "Users can view own devis"
  ON devis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devis"
  ON devis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devis"
  ON devis FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own devis"
  ON devis FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- ÉTAPE 9 : POLICIES POUR FACTURES
-- ========================================

DROP POLICY IF EXISTS "Users can view own factures" ON factures;
DROP POLICY IF EXISTS "Users can insert own factures" ON factures;
DROP POLICY IF EXISTS "Users can update own factures" ON factures;
DROP POLICY IF EXISTS "Users can delete own factures" ON factures;

CREATE POLICY "Users can view own factures"
  ON factures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own factures"
  ON factures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own factures"
  ON factures FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own factures"
  ON factures FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- ÉTAPE 10 : POLICIES POUR BRAND_SETTINGS
-- ========================================

DROP POLICY IF EXISTS "Users can view own brand_settings" ON brand_settings;
DROP POLICY IF EXISTS "Users can insert own brand_settings" ON brand_settings;
DROP POLICY IF EXISTS "Users can update own brand_settings" ON brand_settings;

CREATE POLICY "Users can view own brand_settings"
  ON brand_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brand_settings"
  ON brand_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand_settings"
  ON brand_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ========================================
-- ÉTAPE 11 : STORAGE POLICIES
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

-- Docs bucket
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

SELECT '🔒 RLS activé avec succès ! Vos données sont maintenant sécurisées par utilisateur.' as status;

