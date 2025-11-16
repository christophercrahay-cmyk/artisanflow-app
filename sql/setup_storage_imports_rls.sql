-- ============================================
-- CONFIGURATION RLS STORAGE - BUCKET IMPORTS
-- ============================================
-- À exécuter dans Supabase SQL Editor
-- Date : 15 Novembre 2025
-- ============================================
-- Ce script configure le bucket "imports" pour l'import de fichiers avec GPT
-- Les fichiers sont organisés par user_id pour l'isolation multi-tenant

-- 1. Créer le bucket 'imports' s'il n'existe pas
-- NOTE: allowed_mime_types = NULL permet tous les types MIME
-- Cela évite les erreurs avec les types MIME mal formatés (ex: "application/json, text/csv")
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imports',
  'imports',
  false, -- Pas public, on utilise RLS
  104857600, -- 100 MB max (pour les gros fichiers Excel/CSV)
  NULL -- NULL = autoriser tous les types MIME (évite les erreurs de format)
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 104857600,
  allowed_mime_types = NULL; -- Supprimer les restrictions MIME

-- 2. Supprimer les anciennes policies si elles existent (pour éviter les conflits)
DROP POLICY IF EXISTS "Users can upload their own import files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own import files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own import files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own import files" ON storage.objects;

-- 3. Policy INSERT : Upload de fichiers d'import
-- Les fichiers doivent être dans un dossier avec le user_id comme premier segment
-- Format attendu : {user_id}/{timestamp}_{filename}
CREATE POLICY "Users can upload their own import files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'imports' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Policy SELECT : Lecture de fichiers d'import
CREATE POLICY "Users can read their own import files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'imports'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Policy UPDATE : Modification de fichiers d'import (optionnel, rarement utilisé)
CREATE POLICY "Users can update their own import files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'imports'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'imports'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Policy DELETE : Suppression de fichiers d'import
CREATE POLICY "Users can delete their own import files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'imports'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Vérifier que les policies sont créées :
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%import%';

-- Vérifier que le bucket existe :
-- SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'imports';

