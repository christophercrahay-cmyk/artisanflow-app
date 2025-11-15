-- Script pour vérifier que la table notes a bien la colonne client_id
-- À exécuter dans Supabase SQL Editor

-- Vérifier les colonnes de la table notes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'notes' 
ORDER BY ordinal_position;

-- Vérifier les contraintes
SELECT 
  constraint_name, 
  constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
  AND table_name = 'notes'
ORDER BY constraint_name;

-- Vérifier les index
SELECT 
  indexname, 
  indexdef
FROM pg_indexes 
WHERE tablename = 'notes'
ORDER BY indexname;

-- Statistiques des notes
SELECT 
  COUNT(*) as total_notes,
  COUNT(client_id) as notes_avec_client_id,
  COUNT(*) - COUNT(client_id) as notes_sans_client_id
FROM notes;

-- Afficher quelques exemples de notes
SELECT 
  id, 
  project_id, 
  client_id, 
  type, 
  LEFT(transcription, 50) as transcription_preview
FROM notes 
ORDER BY created_at DESC 
LIMIT 5;

SELECT '✅ Vérification terminée!' as status;

