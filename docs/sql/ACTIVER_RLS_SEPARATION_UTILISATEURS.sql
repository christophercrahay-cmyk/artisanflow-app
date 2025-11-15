-- ============================================
-- ACTIVER RLS POUR SÉPARATION UTILISATEURS
-- ArtisanFlow - Isolation complète
-- ============================================
-- IMPORTANT: À exécuter après avoir ajouté les colonnes user_id
-- Voir ADD_AUTH_RLS_FIXED.sql pour ajouter user_id

-- ============================================
-- 1. VÉRIFIER COLONNES user_id EXISTENT
-- ============================================

-- Si ces colonnes n'existent pas, exécuter ADD_AUTH_RLS_FIXED.sql d'abord
-- On vérifie juste qu'elles existent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'user_id'
  ) THEN
    RAISE EXCEPTION 'Colonne user_id manquante. Exécuter ADD_AUTH_RLS_FIXED.sql d''abord';
  END IF;
END $$;

-- ============================================
-- 2. ACTIVER RLS SUR TOUTES LES TABLES
-- ============================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CRÉER/SURCHARGER POLICIES RLS
-- ============================================

-- CLIENTS
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

-- PROJECTS
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

-- NOTES
DROP POLICY IF EXISTS "Users see own notes" ON notes;
CREATE POLICY "Users see own notes" ON notes
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert notes" ON notes;
CREATE POLICY "Users can insert notes" ON notes
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = notes.project_id 
        AND projects.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users update own notes" ON notes;
CREATE POLICY "Users update own notes" ON notes
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own notes" ON notes;
CREATE POLICY "Users delete own notes" ON notes
  FOR DELETE USING (user_id = auth.uid());

-- CLIENT_PHOTOS
DROP POLICY IF EXISTS "Users see own client_photos" ON client_photos;
CREATE POLICY "Users see own client_photos" ON client_photos
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert client_photos" ON client_photos;
CREATE POLICY "Users can insert client_photos" ON client_photos
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM clients 
        WHERE clients.id = client_photos.client_id 
        AND clients.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users update own client_photos" ON client_photos;
CREATE POLICY "Users update own client_photos" ON client_photos
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own client_photos" ON client_photos;
CREATE POLICY "Users delete own client_photos" ON client_photos
  FOR DELETE USING (user_id = auth.uid());

-- PROJECT_PHOTOS
DROP POLICY IF EXISTS "Users see own project_photos" ON project_photos;
CREATE POLICY "Users see own project_photos" ON project_photos
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert project_photos" ON project_photos;
CREATE POLICY "Users can insert project_photos" ON project_photos
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = project_photos.project_id 
        AND projects.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users update own project_photos" ON project_photos;
CREATE POLICY "Users update own project_photos" ON project_photos
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own project_photos" ON project_photos;
CREATE POLICY "Users delete own project_photos" ON project_photos
  FOR DELETE USING (user_id = auth.uid());

-- DEVIS
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

-- FACTURES
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

-- BRAND_SETTINGS
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

-- ============================================
-- ✅ FIN SCRIPT ACTIVATION RLS
-- ============================================

-- Message de confirmation
SELECT 
  '✅ RLS activé et policies créées' as status,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('clients', 'projects', 'notes', 'client_photos', 'project_photos', 'devis', 'factures', 'brand_settings')) as policies_count;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

-- 1. Les anciennes données sans user_id ne seront PAS visibles
-- 2. Seules les nouvelles données avec user_id seront accessibles
-- 3. Pour migrer les anciennes données, exécuter:
--    UPDATE clients SET user_id = 'UUID_ADMIN' WHERE user_id IS NULL;
--    (remplacer UUID_ADMIN par l'UUID du compte admin)
-- 4. Les policies INSERT pour notes/photos vérifient aussi la relation projet/client

