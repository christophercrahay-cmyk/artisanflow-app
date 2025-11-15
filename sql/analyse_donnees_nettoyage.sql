-- ============================================
-- ANALYSE DONNÉES - NETTOYAGE ARTISANFLOW
-- ============================================
-- Script NON DESTRUCTIF (lecture seule)
-- Identifie les anomalies, doublons, orphelins
-- ============================================

-- ============================================
-- 1. ANALYSE TABLE CLIENTS
-- ============================================

-- 1.1 Clients sans user_id (CRITIQUE)
SELECT 
  '🔥 Clients sans user_id' as anomalie,
  COUNT(*) as nombre
FROM clients
WHERE user_id IS NULL;

-- Détail des clients sans user_id
SELECT 
  id,
  name,
  email,
  phone,
  created_at
FROM clients
WHERE user_id IS NULL
ORDER BY created_at DESC;

-- 1.2 Doublons clients (même nom + même téléphone)
SELECT 
  '⚠️ Doublons clients (nom + téléphone)' as anomalie,
  name,
  phone,
  COUNT(*) as nombre_doublons,
  array_agg(id) as ids,
  array_agg(user_id) as user_ids
FROM clients
WHERE name IS NOT NULL AND phone IS NOT NULL
GROUP BY name, phone
HAVING COUNT(*) > 1
ORDER BY nombre_doublons DESC;

-- 1.3 Clients sans nom (incomplets)
SELECT 
  '⚠️ Clients sans nom' as anomalie,
  COUNT(*) as nombre
FROM clients
WHERE name IS NULL OR TRIM(name) = '';

-- Détail
SELECT 
  id,
  email,
  phone,
  user_id,
  created_at
FROM clients
WHERE name IS NULL OR TRIM(name) = ''
ORDER BY created_at DESC;

-- 1.4 Statistiques clients par user
SELECT 
  'ℹ️ Répartition clients par user' as info,
  user_id,
  COUNT(*) as nombre_clients
FROM clients
WHERE user_id IS NOT NULL
GROUP BY user_id
ORDER BY nombre_clients DESC;

-- ============================================
-- 2. ANALYSE TABLE PROJECTS
-- ============================================

-- 2.1 Projets sans user_id (CRITIQUE)
SELECT 
  '🔥 Projets sans user_id' as anomalie,
  COUNT(*) as nombre
FROM projects
WHERE user_id IS NULL;

-- Détail
SELECT 
  id,
  name,
  client_id,
  status,
  created_at
FROM projects
WHERE user_id IS NULL
ORDER BY created_at DESC;

-- 2.2 Projets orphelins (client_id invalide ou NULL)
SELECT 
  '🔥 Projets orphelins (client inexistant)' as anomalie,
  COUNT(*) as nombre
FROM projects p
LEFT JOIN clients c ON c.id = p.client_id
WHERE p.client_id IS NULL OR c.id IS NULL;

-- Détail
SELECT 
  p.id,
  p.name,
  p.client_id,
  p.user_id,
  p.status,
  p.created_at
FROM projects p
LEFT JOIN clients c ON c.id = p.client_id
WHERE p.client_id IS NULL OR c.id IS NULL
ORDER BY p.created_at DESC;

-- 2.3 Incohérence user_id (projet et client n'ont pas le même user_id)
SELECT 
  '⚠️ Incohérence user_id (projet ≠ client)' as anomalie,
  COUNT(*) as nombre
FROM projects p
JOIN clients c ON c.id = p.client_id
WHERE p.user_id IS NOT NULL 
  AND c.user_id IS NOT NULL
  AND p.user_id != c.user_id;

-- Détail
SELECT 
  p.id as project_id,
  p.name as project_name,
  p.user_id as project_user_id,
  c.id as client_id,
  c.name as client_name,
  c.user_id as client_user_id
FROM projects p
JOIN clients c ON c.id = p.client_id
WHERE p.user_id IS NOT NULL 
  AND c.user_id IS NOT NULL
  AND p.user_id != c.user_id
ORDER BY p.created_at DESC;

-- 2.4 Projets sans nom
SELECT 
  '⚠️ Projets sans nom' as anomalie,
  COUNT(*) as nombre
FROM projects
WHERE name IS NULL OR TRIM(name) = '';

-- 2.5 Statistiques projets par user
SELECT 
  'ℹ️ Répartition projets par user' as info,
  user_id,
  COUNT(*) as nombre_projets,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as actifs,
  COUNT(CASE WHEN archived = true THEN 1 END) as archives
FROM projects
WHERE user_id IS NOT NULL
GROUP BY user_id
ORDER BY nombre_projets DESC;

-- ============================================
-- 3. ANALYSE TABLE NOTES
-- ============================================

-- 3.1 Notes orphelines (project_id invalide)
SELECT 
  '🔥 Notes orphelines (projet inexistant)' as anomalie,
  COUNT(*) as nombre
FROM notes n
LEFT JOIN projects p ON p.id = n.project_id
WHERE n.project_id IS NULL OR p.id IS NULL;

-- Détail
SELECT 
  n.id,
  n.type,
  n.transcription,
  n.project_id,
  n.created_at
FROM notes n
LEFT JOIN projects p ON p.id = n.project_id
WHERE n.project_id IS NULL OR p.id IS NULL
ORDER BY n.created_at DESC
LIMIT 20;

-- 3.2 Notes sans transcription (vocales non transcrites)
SELECT 
  '⚠️ Notes vocales sans transcription' as anomalie,
  COUNT(*) as nombre
FROM notes
WHERE type = 'voice' 
  AND (transcription IS NULL OR TRIM(transcription) = '');

-- 3.3 Notes sans user_id (via project)
SELECT 
  '⚠️ Notes sans user (via project)' as anomalie,
  COUNT(*) as nombre
FROM notes n
LEFT JOIN projects p ON p.id = n.project_id
WHERE p.user_id IS NULL;

-- 3.4 Statistiques notes par user
SELECT 
  'ℹ️ Répartition notes par user' as info,
  p.user_id,
  COUNT(*) as nombre_notes,
  COUNT(CASE WHEN n.type = 'voice' THEN 1 END) as vocales,
  COUNT(CASE WHEN n.type = 'text' THEN 1 END) as texte
FROM notes n
JOIN projects p ON p.id = n.project_id
WHERE p.user_id IS NOT NULL
GROUP BY p.user_id
ORDER BY nombre_notes DESC;

-- ============================================
-- 4. ANALYSE TABLE PROJECT_PHOTOS
-- ============================================

-- 4.1 Photos orphelines (project_id invalide)
SELECT 
  '🔥 Photos orphelines (projet inexistant)' as anomalie,
  COUNT(*) as nombre
FROM project_photos ph
LEFT JOIN projects p ON p.id = ph.project_id
WHERE ph.project_id IS NULL OR p.id IS NULL;

-- Détail
SELECT 
  ph.id,
  ph.url,
  ph.project_id,
  ph.client_id,
  ph.created_at
FROM project_photos ph
LEFT JOIN projects p ON p.id = ph.project_id
WHERE ph.project_id IS NULL OR p.id IS NULL
ORDER BY ph.created_at DESC
LIMIT 20;

-- 4.2 Photos sans user_id (via project)
SELECT 
  '⚠️ Photos sans user (via project)' as anomalie,
  COUNT(*) as nombre
FROM project_photos ph
LEFT JOIN projects p ON p.id = ph.project_id
WHERE p.user_id IS NULL;

-- 4.3 Photos avec client_id incohérent
SELECT 
  '⚠️ Photos avec client_id incohérent' as anomalie,
  COUNT(*) as nombre
FROM project_photos ph
JOIN projects p ON p.id = ph.project_id
WHERE ph.client_id IS NOT NULL 
  AND ph.client_id != p.client_id;

-- Détail
SELECT 
  ph.id,
  ph.project_id,
  ph.client_id as photo_client_id,
  p.client_id as project_client_id,
  p.name as project_name
FROM project_photos ph
JOIN projects p ON p.id = ph.project_id
WHERE ph.client_id IS NOT NULL 
  AND ph.client_id != p.client_id
LIMIT 20;

-- ============================================
-- 5. ANALYSE TABLE CLIENT_PHOTOS
-- ============================================

-- 5.1 Photos orphelines (client_id invalide)
SELECT 
  '🔥 Photos client orphelines' as anomalie,
  COUNT(*) as nombre
FROM client_photos ph
LEFT JOIN clients c ON c.id = ph.client_id
WHERE ph.client_id IS NULL OR c.id IS NULL;

-- Détail
SELECT 
  ph.id,
  ph.url,
  ph.client_id,
  ph.created_at
FROM client_photos ph
LEFT JOIN clients c ON c.id = ph.client_id
WHERE ph.client_id IS NULL OR c.id IS NULL
ORDER BY ph.created_at DESC
LIMIT 20;

-- ============================================
-- 6. ANALYSE TABLE DEVIS
-- ============================================

-- 6.1 Devis orphelins (project_id invalide)
SELECT 
  '🔥 Devis orphelins (projet inexistant)' as anomalie,
  COUNT(*) as nombre
FROM devis d
LEFT JOIN projects p ON p.id = d.project_id
WHERE d.project_id IS NULL OR p.id IS NULL;

-- 6.2 Devis sans lignes (devis_lignes vide)
SELECT 
  '⚠️ Devis sans lignes' as anomalie,
  COUNT(*) as nombre
FROM devis d
LEFT JOIN devis_lignes dl ON dl.devis_id = d.id
WHERE dl.id IS NULL;

-- Détail
SELECT 
  d.id,
  d.numero,
  d.montant_ttc,
  d.statut,
  d.created_at
FROM devis d
LEFT JOIN devis_lignes dl ON dl.devis_id = d.id
WHERE dl.id IS NULL
ORDER BY d.created_at DESC
LIMIT 20;

-- ============================================
-- 7. ANALYSE TABLE FACTURES
-- ============================================

-- 7.1 Factures orphelines (project_id invalide)
SELECT 
  '🔥 Factures orphelines (projet inexistant)' as anomalie,
  COUNT(*) as nombre
FROM factures f
LEFT JOIN projects p ON p.id = f.project_id
WHERE f.project_id IS NULL OR p.id IS NULL;

-- ============================================
-- 8. RÉSUMÉ GLOBAL
-- ============================================

SELECT 
  '📊 RÉSUMÉ GLOBAL' as titre,
  (SELECT COUNT(*) FROM clients) as total_clients,
  (SELECT COUNT(*) FROM clients WHERE user_id IS NULL) as clients_sans_user,
  (SELECT COUNT(*) FROM projects) as total_projects,
  (SELECT COUNT(*) FROM projects WHERE user_id IS NULL) as projects_sans_user,
  (SELECT COUNT(*) FROM notes) as total_notes,
  (SELECT COUNT(*) FROM project_photos) as total_photos_projet,
  (SELECT COUNT(*) FROM client_photos) as total_photos_client,
  (SELECT COUNT(*) FROM devis) as total_devis,
  (SELECT COUNT(*) FROM factures) as total_factures;

-- ============================================
-- 9. VÉRIFICATION RLS
-- ============================================

SELECT 
  '🔒 Vérification RLS' as titre,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'clients', 'projects', 'notes', 
  'project_photos', 'client_photos',
  'devis', 'devis_lignes', 'factures'
)
ORDER BY tablename;

-- ============================================
-- FIN ANALYSE
-- ============================================
-- 
-- Ce script est NON DESTRUCTIF (lecture seule).
-- Exécuter dans Supabase SQL Editor.
-- Analyser les résultats avant toute action de nettoyage.
-- ============================================

