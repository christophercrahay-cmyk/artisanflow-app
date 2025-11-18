-- Vérification de la migration des statuts de devis
-- À exécuter après migrate_devis_statuts.sql

-- ═══════════════════════════════════════════════════════════
-- 1. RÉSUMÉ DES STATUTS
-- ═══════════════════════════════════════════════════════════

SELECT 
  '📊 RÉSUMÉ DES STATUTS' as titre,
  statut,
  COUNT(*) as nombre_devis,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as pourcentage
FROM devis 
GROUP BY statut 
ORDER BY nombre_devis DESC;

-- ═══════════════════════════════════════════════════════════
-- 2. VÉRIFIER LA SYNCHRONISATION statut / signature_status
-- ═══════════════════════════════════════════════════════════

SELECT 
  '🔍 SYNCHRONISATION statut / signature_status' as titre,
  statut,
  signature_status,
  COUNT(*) as nombre
FROM devis
GROUP BY statut, signature_status
ORDER BY statut, signature_status;

-- ═══════════════════════════════════════════════════════════
-- 3. DÉTECTER LES INCOHÉRENCES
-- ═══════════════════════════════════════════════════════════

SELECT 
  '⚠️ INCOHÉRENCES DÉTECTÉES' as titre,
  id,
  numero,
  statut,
  signature_status,
  signed_at,
  created_at
FROM devis
WHERE 
  -- Incohérence 1: Statut "edition" mais signature_status rempli
  (statut = 'edition' AND signature_status IS NOT NULL)
  -- Incohérence 2: Statut "signe" mais pas de signature_status
  OR (statut = 'signe' AND signature_status IS NULL)
  -- Incohérence 3: Statut "signe" mais signature_status != 'signed'
  OR (statut = 'signe' AND signature_status != 'signed')
  -- Incohérence 4: Statut "envoye" mais pas de signature_status
  OR (statut = 'envoye' AND signature_status IS NULL)
ORDER BY created_at DESC
LIMIT 10;

-- ═══════════════════════════════════════════════════════════
-- 4. VÉRIFIER LES INDEX
-- ═══════════════════════════════════════════════════════════

SELECT 
  '📑 INDEX CRÉÉS' as titre,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'devis'
  AND indexname IN ('idx_devis_statut', 'idx_devis_user_statut')
ORDER BY indexname;

-- ═══════════════════════════════════════════════════════════
-- 5. VÉRIFIER LA COLONNE statut_updated_at
-- ═══════════════════════════════════════════════════════════

SELECT 
  '📅 COLONNE statut_updated_at' as titre,
  COUNT(*) as total_devis,
  COUNT(statut_updated_at) as avec_timestamp,
  COUNT(*) - COUNT(statut_updated_at) as sans_timestamp
FROM devis;

-- ═══════════════════════════════════════════════════════════
-- 6. EXEMPLES DE DEVIS PAR STATUT
-- ═══════════════════════════════════════════════════════════

SELECT 
  '📋 EXEMPLES DE DEVIS' as titre,
  statut,
  numero,
  signature_status,
  signed_at,
  statut_updated_at,
  created_at
FROM devis
ORDER BY statut, created_at DESC
LIMIT 20;

-- ═══════════════════════════════════════════════════════════
-- 7. VÉRIFIER LE TRIGGER
-- ═══════════════════════════════════════════════════════════

SELECT 
  '⚙️ TRIGGER CRÉÉ' as titre,
  tgname as trigger_name,
  tgenabled as enabled,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'trigger_update_devis_statut_timestamp';

