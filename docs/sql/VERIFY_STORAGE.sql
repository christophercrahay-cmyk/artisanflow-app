-- ============================================
-- VÉRIFICATION STORAGE POLICIES
-- ArtisanFlow
-- ============================================

-- 1. Bucket existe ?
SELECT * FROM storage.buckets WHERE id = 'artisanflow';

-- 2. Politiques créées ? (devrait avoir 4 politiques)
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

-- 3. RLS activé sur storage.objects ?
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- ✅ Résultat attendu:
-- 1. 1 ligne avec id = 'artisanflow', public = true
-- 2. 4 lignes de politiques
-- 3. 1 ligne avec rowsecurity = true

