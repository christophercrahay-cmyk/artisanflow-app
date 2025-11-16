-- ============================================
-- AJOUT AUTH SUPABASE + RLS (VERSION FIXÉE)
-- ArtisanFlow - Isolation par utilisateur
-- ============================================

-- IMPORTANT: Ce script est safe pour bases de données avec ou sans données existantes

-- 1. SUPPRIMER COLONNES user_id SI ELLES EXISTENT DÉJÀ
-- ============================================

ALTER TABLE IF EXISTS clients DROP COLUMN IF EXISTS user_id CASCADE;
ALTER TABLE IF EXISTS projects DROP COLUMN IF EXISTS user_id CASCADE;
ALTER TABLE IF EXISTS notes DROP COLUMN IF EXISTS user_id CASCADE;
ALTER TABLE IF EXISTS client_photos DROP COLUMN IF EXISTS user_id CASCADE;
ALTER TABLE IF EXISTS project_photos DROP COLUMN IF EXISTS user_id CASCADE;
ALTER TABLE IF EXISTS devis DROP COLUMN IF EXISTS user_id CASCADE;
ALTER TABLE IF EXISTS factures DROP COLUMN IF EXISTS user_id CASCADE;
ALTER TABLE IF EXISTS brand_settings DROP COLUMN IF EXISTS user_id CASCADE;


-- 2. CRÉER COLONNES user_id NULLABLES (PAS DE DEFAULT)
-- ============================================

ALTER TABLE IF EXISTS clients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS projects ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS notes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS client_photos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS project_photos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS devis ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS factures ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS brand_settings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;


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


-- 4. ACTIVER RLS SUR TOUTES LES TABLES
-- ============================================

ALTER TABLE IF EXISTS clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS client_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS brand_settings ENABLE ROW LEVEL SECURITY;


-- 5. CRÉATION POLITIQUES RLS
-- ============================================

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


-- 6. STORAGE BUCKET (À CRÉER MANUELLEMENT)
-- ============================================

-- NOTE: Le bucket storage doit être créé via l'interface Supabase
-- 1. Aller dans Supabase Dashboard → Storage → New bucket
-- 2. Nom: artisanflow
-- 3. Public: Yes
-- 4. Voir STORAGE_POLICIES_MANUAL.md pour les politiques


-- ✅ FIN SCRIPT AUTH + RLS (VERSION FIXÉE)
-- ============================================
-- IMPORTANT: Les colonnes user_id sont NULLABLES
-- Le code app ajoutera automatiquement user_id lors des INSERT
-- 
-- PROCHAINES ÉTAPES:
-- 1. Créer bucket "artisanflow" via interface Supabase
-- 2. Configurer politiques Storage (voir STORAGE_POLICIES_MANUAL.md)

