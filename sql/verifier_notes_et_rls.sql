-- ============================================
-- VÉRIFIER LA TABLE NOTES ET RLS
-- ============================================

-- 1. Vérifier la structure de la table notes
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'notes'
ORDER BY ordinal_position;

-- 2. Vérifier si RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'notes';

-- 3. Vérifier les policies RLS sur notes
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'notes';

-- 4. Lister toutes les notes avec leurs user_id
SELECT 
  id,
  project_id,
  user_id,
  type,
  LEFT(transcription, 50) as transcription_preview,
  created_at
FROM notes
ORDER BY created_at DESC
LIMIT 20;

