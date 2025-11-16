-- ============================================
-- STORAGE POLICIES (ADMIN ONLY)
-- ArtisanFlow - Bucket artisanflow
-- ============================================
-- 
-- ⚠️ ATTENTION: Nécessite permissions admin/service_role
-- Utiliser seulement si tu as accès admin ou via service_role key
-- Sinon, utiliser l'interface Supabase (voir STORAGE_POLICIES_MANUAL.md)
--

-- Créer bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('artisanflow', 'artisanflow', true)
ON CONFLICT (id) DO NOTHING;

-- Activer RLS sur storage.objects
ALTER TABLE IF EXISTS storage.objects ENABLE ROW LEVEL SECURITY;

-- Supprimer anciennes politiques si existent
DROP POLICY IF EXISTS "Users can read own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Politique SELECT (Read)
CREATE POLICY "Users can read own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'artisanflow' AND
    (storage.foldername(name))[1] = 'user' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Politique INSERT (Upload)
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artisanflow' AND
    (storage.foldername(name))[1] = 'user' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Politique UPDATE
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'artisanflow' AND
    (storage.foldername(name))[1] = 'user' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Politique DELETE
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'artisanflow' AND
    (storage.foldername(name))[1] = 'user' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- ✅ FIN SCRIPT STORAGE POLICIES
-- ============================================
-- Convention chemins: user/{auth.uid()}/projects/{projectId}/...

