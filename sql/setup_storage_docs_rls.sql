-- ============================================
-- CONFIGURATION RLS STORAGE - BUCKET DOCS
-- ============================================
-- À exécuter dans Supabase SQL Editor
-- Date : 15 Janvier 2025
-- ============================================

-- 1. Créer le bucket 'docs' s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'docs',
  'docs',
  false, -- Pas public, on utilise RLS
  52428800, -- 50 MB max
  ARRAY['application/pdf'] -- Seulement PDFs
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf'];

-- 2. Supprimer les anciennes policies si elles existent (pour éviter les conflits)
DROP POLICY IF EXISTS "Users can upload their own PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own PDFs" ON storage.objects;

-- 3. Policy INSERT : Upload de PDFs
CREATE POLICY "Users can upload their own PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Policy SELECT : Lecture de PDFs
CREATE POLICY "Users can read their own PDFs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'docs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Policy UPDATE : Modification de PDFs (optionnel)
CREATE POLICY "Users can update their own PDFs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'docs'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'docs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Policy DELETE : Suppression de PDFs
CREATE POLICY "Users can delete their own PDFs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'docs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Vérifier que les policies sont créées :
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

