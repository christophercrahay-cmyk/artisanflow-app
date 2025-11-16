-- ========================================
-- FIX RLS STORAGE - Bucket "docs"
-- ========================================
-- Erreur: "new row violates row-level security policy"
-- Solution: Vérifier/créer les politiques RLS pour le bucket "docs"

-- 1. Vérifier que le bucket existe
SELECT id, name, public FROM storage.buckets WHERE id = 'docs';

-- 2. Si le bucket n'existe pas, le créer
INSERT INTO storage.buckets (id, name, public)
VALUES ('docs', 'docs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Supprimer les anciennes politiques (nettoyage)
DROP POLICY IF EXISTS "Public Access docs" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload docs" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete docs" ON storage.objects;

-- 4. Créer les politiques RLS pour le bucket "docs"
CREATE POLICY "Public Access docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'docs');

CREATE POLICY "Public Upload docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'docs');

CREATE POLICY "Public Delete docs"
ON storage.objects FOR DELETE
USING (bucket_id = 'docs');

-- 5. Message de confirmation
SELECT '✅ Bucket "docs" configuré avec RLS public' as status;

-- ========================================
-- VÉRIFICATIONS
-- ========================================
-- Exécuter ces requêtes pour vérifier :

-- Vérifier le bucket
SELECT * FROM storage.buckets WHERE id = 'docs';

-- Vérifier les politiques
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%docs%';

-- ========================================
-- NOTES IMPORTANTES
-- ========================================
-- - Le bucket "docs" doit être PUBLIC pour les uploads
-- - Les politiques RLS doivent autoriser INSERT pour tous
-- - En production, restreindre INSERT à authenticated users seulement

