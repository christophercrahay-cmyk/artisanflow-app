-- ============================================
-- FIX STORAGE IMPORTS - SUPPRIMER RESTRICTIONS MIME TYPES
-- ============================================
-- Ce script supprime les restrictions de types MIME du bucket "imports"
-- pour permettre l'upload de n'importe quel fichier d'import
-- Date : 15 Novembre 2025
-- ============================================

-- 1. Vérifier l'état actuel du bucket
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types 
FROM storage.buckets 
WHERE id = 'imports';

-- 2. Mettre à jour le bucket pour SUPPRIMER les restrictions de types MIME
-- En mettant allowed_mime_types à NULL, on autorise tous les types MIME
UPDATE storage.buckets
SET 
  allowed_mime_types = NULL,  -- NULL = autoriser tous les types MIME
  file_size_limit = 104857600  -- 100 MB max
WHERE id = 'imports';

-- 3. Si le bucket n'existe pas, le créer sans restrictions MIME
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imports',
  'imports',
  false, -- Pas public, on utilise RLS
  104857600, -- 100 MB max
  NULL -- NULL = autoriser tous les types MIME
)
ON CONFLICT (id) DO UPDATE SET
  allowed_mime_types = NULL,  -- Supprimer les restrictions
  file_size_limit = 104857600;

-- 4. Vérifier que la mise à jour a fonctionné
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  CASE 
    WHEN allowed_mime_types IS NULL THEN '✅ Tous les types MIME autorisés'
    ELSE '⚠️ Restrictions actives: ' || array_to_string(allowed_mime_types, ', ')
  END as status
FROM storage.buckets 
WHERE id = 'imports';

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Le bucket "imports" devrait maintenant avoir :
-- - allowed_mime_types = NULL (tous les types autorisés)
-- - file_size_limit = 104857600 (100 MB)
-- 
-- Cela permettra l'upload de fichiers CSV, Excel, PDF, JSON, etc.
-- sans erreur "mime type ... is not supported"

