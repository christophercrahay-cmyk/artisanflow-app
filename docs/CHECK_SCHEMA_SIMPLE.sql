-- ============================================
-- VÉRIFICATION RAPIDE DU SCHÉMA
-- ============================================
-- Copier-coller cette requête dans Supabase SQL Editor
-- pour voir toutes les colonnes nécessaires

-- Voir toutes les colonnes des tables concernées
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('clients', 'projects', 'project_photos', 'devis', 'factures')
ORDER BY table_name, ordinal_position;

-- ============================================
-- VÉRIFICATION SPÉCIFIQUE DES COLONNES CLÉS
-- ============================================

-- 1. Table clients : phone et email existent-ils ?
SELECT 
  'clients' AS table_name,
  column_name,
  'EXISTE' AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'clients'
  AND column_name IN ('phone', 'email', 'city', 'ville');

-- 2. Table projects : quelle colonne pour l'adresse ?
SELECT 
  'projects' AS table_name,
  column_name,
  'EXISTE' AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'projects'
  AND column_name IN ('address', 'address_line', 'adresse', 'postal_code', 'city');

-- 3. Table devis : quelle colonne pour le statut ?
SELECT 
  'devis' AS table_name,
  column_name,
  'EXISTE' AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'devis'
  AND column_name IN ('statut', 'status', 'state');

-- 4. Table factures : quelle colonne pour le statut ?
SELECT 
  'factures' AS table_name,
  column_name,
  'EXISTE' AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'factures'
  AND column_name IN ('statut', 'status', 'state');

