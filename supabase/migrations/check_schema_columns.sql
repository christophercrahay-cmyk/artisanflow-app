-- ============================================
-- VÉRIFICATION DU SCHÉMA - Colonnes nécessaires
-- ============================================
-- Exécuter cette requête dans Supabase SQL Editor pour voir toutes les colonnes
-- et adapter ensuite la migration fix_public_chantier_complete.sql

-- 1. Colonnes de la table 'clients'
SELECT 
  'clients' AS table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'clients'
ORDER BY ordinal_position;

-- 2. Colonnes de la table 'projects'
SELECT 
  'projects' AS table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'projects'
ORDER BY ordinal_position;

-- 3. Colonnes de la table 'project_photos'
SELECT 
  'project_photos' AS table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'project_photos'
ORDER BY ordinal_position;

-- 4. Colonnes de la table 'devis'
SELECT 
  'devis' AS table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'devis'
ORDER BY ordinal_position;

-- 5. Colonnes de la table 'factures'
SELECT 
  'factures' AS table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'factures'
ORDER BY ordinal_position;

-- ============================================
-- RÉSUMÉ : Colonnes clés à vérifier
-- ============================================
SELECT 
  table_name,
  column_name,
  CASE 
    WHEN column_name IN ('phone', 'email') AND table_name = 'clients' THEN '⚠️ À vérifier pour client_phone/email'
    WHEN column_name IN ('statut', 'status', 'state') AND table_name IN ('devis', 'factures') THEN '⚠️ À vérifier pour status des documents'
    WHEN column_name IN ('address', 'address_line', 'adresse') AND table_name = 'projects' THEN '⚠️ À vérifier pour project_address_line'
    WHEN column_name IN ('city', 'ville') AND table_name = 'clients' THEN '⚠️ À vérifier pour project_city'
    ELSE '✅ OK'
  END AS note
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('clients', 'projects', 'project_photos', 'devis', 'factures')
  AND (
    -- Colonnes clients
    (table_name = 'clients' AND column_name IN ('id', 'name', 'phone', 'email', 'city', 'ville'))
    OR
    -- Colonnes projects
    (table_name = 'projects' AND column_name IN ('id', 'name', 'address', 'address_line', 'adresse', 'status', 'share_token', 'client_id'))
    OR
    -- Colonnes project_photos
    (table_name = 'project_photos' AND column_name IN ('id', 'project_id', 'url', 'public_url', 'created_at'))
    OR
    -- Colonnes devis
    (table_name = 'devis' AND column_name IN ('id', 'project_id', 'numero', 'montant_ttc', 'statut', 'status', 'state', 'pdf_url', 'date_creation', 'created_at'))
    OR
    -- Colonnes factures
    (table_name = 'factures' AND column_name IN ('id', 'project_id', 'numero', 'montant_ttc', 'statut', 'status', 'state', 'pdf_url', 'date_creation', 'created_at'))
  )
ORDER BY table_name, column_name;

