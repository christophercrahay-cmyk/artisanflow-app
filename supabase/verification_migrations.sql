-- Script de vérification : Colonnes ajoutées par les migrations
-- À exécuter dans Supabase SQL Editor pour vérifier que tout est OK

-- ======================================
-- 1. VÉRIFICATION project_photos
-- ======================================

SELECT '🔍 Vérification table project_photos' as etape;

-- Vérifier que toutes les colonnes existent
SELECT 
  column_name,
  data_type,
  CASE WHEN is_nullable = 'NO' THEN 'NOT NULL' ELSE 'NULLABLE' END as nullable_status
FROM information_schema.columns
WHERE table_name = 'project_photos'
ORDER BY ordinal_position;

-- Résultat attendu :
-- id          | uuid              | NOT NULL
-- project_id  | uuid              | NOT NULL
-- client_id   | uuid              | NULLABLE
-- user_id     | uuid              | NOT NULL  ✅
-- url         | text              | NOT NULL
-- taken_at    | timestamp...      | NOT NULL  ✅
-- latitude    | double precision  | NULLABLE  ✅
-- longitude   | double precision  | NULLABLE  ✅
-- created_at  | timestamp...      | NOT NULL

-- ======================================
-- 2. VÉRIFICATION notes
-- ======================================

SELECT '🔍 Vérification table notes' as etape;

-- Vérifier que toutes les colonnes existent
SELECT 
  column_name,
  data_type,
  CASE WHEN is_nullable = 'NO' THEN 'NOT NULL' ELSE 'NULLABLE' END as nullable_status
FROM information_schema.columns
WHERE table_name = 'notes'
ORDER BY ordinal_position;

-- Résultat attendu :
-- id            | uuid      | NOT NULL
-- project_id    | uuid      | NOT NULL
-- client_id     | uuid      | NULLABLE  ✅
-- user_id       | uuid      | NOT NULL  ✅
-- type          | text      | NOT NULL
-- storage_path  | text      | NULLABLE
-- transcription | text      | NULLABLE
-- duration_ms   | integer   | NULLABLE
-- created_at    | timestamp | NOT NULL

-- ======================================
-- 3. VÉRIFICATION INDEX
-- ======================================

SELECT '🔍 Vérification index' as etape;

-- Index sur project_photos
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'project_photos'
  AND indexname LIKE '%user_id%' 
   OR indexname LIKE '%taken_at%'
   OR indexname LIKE '%location%';

-- Résultat attendu (au moins 3 index) :
-- idx_project_photos_user_id   ✅
-- idx_project_photos_taken_at  ✅
-- idx_project_photos_location  ✅

-- Index sur notes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'notes'
  AND (indexname LIKE '%client_id%' OR indexname LIKE '%user_id%');

-- Résultat attendu (2 index) :
-- idx_notes_client_id  ✅
-- idx_notes_user_id    ✅

-- ======================================
-- 4. VÉRIFICATION CONTRAINTES FK
-- ======================================

SELECT '🔍 Vérification contraintes FK' as etape;

-- Contraintes sur project_photos
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  a.attname as column_name,
  confrelid::regclass as foreign_table
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE c.conrelid = 'project_photos'::regclass
  AND c.contype = 'f'
ORDER BY conname;

-- Résultat attendu :
-- fk_project                | f | project_id | projects
-- fk_project_photos_user    | f | user_id    | users     ✅

-- Contraintes sur notes
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  a.attname as column_name,
  confrelid::regclass as foreign_table
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE c.conrelid = 'notes'::regclass
  AND c.contype = 'f'
ORDER BY conname;

-- Résultat attendu :
-- fk_notes_project  | f | project_id | projects
-- fk_notes_user     | f | user_id    | users     ✅

-- ======================================
-- 5. VÉRIFICATION DONNÉES
-- ======================================

SELECT '🔍 Vérification données' as etape;

-- Compter photos avec/sans user_id
SELECT 
  COUNT(*) as total_photos,
  COUNT(user_id) as photos_avec_user_id,
  COUNT(taken_at) as photos_avec_taken_at,
  COUNT(latitude) as photos_avec_gps
FROM project_photos;

-- Résultat attendu :
-- total_photos = photos_avec_user_id = photos_avec_taken_at
-- photos_avec_gps peut être 0 (GPS optionnel)

-- Compter notes avec/sans user_id
SELECT 
  COUNT(*) as total_notes,
  COUNT(user_id) as notes_avec_user_id,
  COUNT(client_id) as notes_avec_client_id
FROM notes;

-- Résultat attendu :
-- total_notes = notes_avec_user_id
-- notes_avec_client_id peut être différent (optionnel)

-- ======================================
-- 6. RÉSULTAT FINAL
-- ======================================

SELECT '✅ Vérification terminée - Voir résultats ci-dessus' as status;

-- Si toutes les colonnes et index sont présents → ✅ MIGRATIONS RÉUSSIES
-- Si des colonnes manquent → ❌ Exécuter les migrations manquantes

