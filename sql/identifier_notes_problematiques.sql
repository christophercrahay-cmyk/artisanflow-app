-- ============================================
-- IDENTIFIER LES NOTES PROBLÉMATIQUES
-- ============================================
-- Trouve les notes du projet "chez moi"
-- et vérifie leur user_id
-- ============================================

-- 1. Trouver le projet "chez moi"
SELECT 
  id as project_id,
  name as project_name,
  user_id,
  created_at
FROM projects
WHERE LOWER(name) LIKE '%chez moi%'
ORDER BY created_at DESC;

-- 2. Lister toutes les notes de ce projet
-- (Remplace <project_id> par l'ID trouvé ci-dessus)
SELECT 
  n.id as note_id,
  n.project_id,
  n.user_id as note_user_id,
  n.type,
  n.transcription,
  n.storage_path,
  n.created_at,
  p.name as project_name,
  p.user_id as project_user_id
FROM notes n
LEFT JOIN projects p ON p.id = n.project_id
WHERE p.name LIKE '%chez moi%'
ORDER BY n.created_at DESC;

-- 3. Vérifier si les user_id correspondent
SELECT 
  n.id as note_id,
  n.user_id as note_user_id,
  p.user_id as project_user_id,
  CASE 
    WHEN n.user_id = p.user_id THEN '✅ OK'
    WHEN n.user_id IS NULL THEN '❌ Note sans user_id'
    WHEN p.user_id IS NULL THEN '❌ Projet sans user_id'
    ELSE '⚠️ User_id différents'
  END as statut,
  LEFT(n.transcription, 50) as transcription_preview
FROM notes n
LEFT JOIN projects p ON p.id = n.project_id
WHERE p.name LIKE '%chez moi%'
ORDER BY n.created_at DESC;

