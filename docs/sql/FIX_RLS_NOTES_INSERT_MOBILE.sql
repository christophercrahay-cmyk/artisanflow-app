-- ============================================
-- FIX RLS NOTES - Permettre INSERT par user connecté
-- ArtisanFlow - Mobile Uploads
-- ============================================

-- PROBLÈME:
-- L'utilisateur connecté ne peut pas insérer de notes car :
-- 1. Les policies RLS exigent user_id = auth.uid()
-- 2. Le code n'envoie PAS user_id lors de l'insertion
-- 3. Même si user_id est auto-rempli, il faut vérifier les permissions sur projet/client

-- SOLUTION:
-- Créer une policy INSERT qui permet l'insertion si :
-- - L'utilisateur est authentifié (auth.uid() IS NOT NULL)
-- - La note est liée à un projet/client qu'il possède
-- OU: user_id est explicitement défini à auth.uid()

-- ============================================
-- 1. SUPPRIMER ANCIENNES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users insert own notes" ON notes;
DROP POLICY IF EXISTS "Users insert own project_photos" ON project_photos;
DROP POLICY IF EXISTS "Users insert own client_photos" ON client_photos;

-- ============================================
-- 2. NOUVELLES POLICIES INSERT PERMISSIVES
-- ============================================

-- Notes: Permettre INSERT si user_id est défini OU si le projet appartient à l'utilisateur
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

-- Project Photos: Permettre INSERT si user_id est défini OU si le projet appartient à l'utilisateur
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

-- Client Photos: Permettre INSERT si user_id est défini OU si le client appartient à l'utilisateur
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

-- ============================================
-- 3. VÉRIFIER QUE LES AUTRES POLICIES SONT OK
-- ============================================

-- SELECT policies existantes (à vérifier)
-- DROP POLICY IF EXISTS "Users see own notes" ON notes;
-- CREATE POLICY "Users see own notes" ON notes
--   FOR SELECT USING (
--     user_id = auth.uid() 
--     OR EXISTS (
--       SELECT 1 FROM projects 
--       WHERE projects.id = notes.project_id 
--       AND projects.user_id = auth.uid()
--     )
--   );

-- UPDATE policies existantes (à vérifier)
-- DROP POLICY IF EXISTS "Users update own notes" ON notes;
-- CREATE POLICY "Users update own notes" ON notes
--   FOR UPDATE USING (
--     user_id = auth.uid() 
--     OR EXISTS (
--       SELECT 1 FROM projects 
--       WHERE projects.id = notes.project_id 
--       AND projects.user_id = auth.uid()
--     )
--   );

-- DELETE policies existantes (à vérifier)
-- DROP POLICY IF EXISTS "Users delete own notes" ON notes;
-- CREATE POLICY "Users delete own notes" ON notes
--   FOR DELETE USING (
--     user_id = auth.uid() 
--     OR EXISTS (
--       SELECT 1 FROM projects 
--       WHERE projects.id = notes.project_id 
--       AND projects.user_id = auth.uid()
--     )
--   );

-- ============================================
-- 4. VÉRIFIER STORAGE POLICIES
-- ============================================

-- Les buckets doivent avoir des policies qui permettent INSERT/SELECT
-- Voir STORAGE_POLICIES_ADMIN.sql pour référence

-- ============================================
-- NOTES IMPORTANTES:
-- ============================================

-- 1. Les policies utilisent EXISTS pour vérifier que le projet/client
--    appartient à l'utilisateur via user_id

-- 2. Si le code JS envoie user_id explicitement, ça fonctionne
--    Si le code JS n'envoie PAS user_id, la vérification se fait
--    via la relation projet/client -> user_id

-- 3. Pour plus de sécurité, modifier le code JS pour envoyer user_id:
--    const { data: { user } } = await supabase.auth.getUser();
--    const noteData = { ..., user_id: user.id };

-- ============================================
-- ✅ FIN SCRIPT FIX RLS NOTES INSERT
-- ============================================

