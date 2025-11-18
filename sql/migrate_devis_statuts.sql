-- Migration: Simplification et synchronisation des statuts de devis
-- Date: 2025-11-16
-- Objectif: Unifier les statuts et corriger les incohérences

-- ═══════════════════════════════════════════════════════════
-- ÉTAPE 1: AJOUTER LES NOUVEAUX STATUTS
-- ═══════════════════════════════════════════════════════════

-- Supprimer l'ancienne contrainte de statut
ALTER TABLE devis 
  DROP CONSTRAINT IF EXISTS devis_statut_check;

-- Ajouter la nouvelle contrainte avec les statuts simplifiés
ALTER TABLE devis 
  ADD CONSTRAINT devis_statut_check 
  CHECK (statut IN ('edition', 'pret', 'envoye', 'signe', 'refuse', 'brouillon', 'accepte'));
-- Note: On garde 'brouillon' et 'accepte' temporairement pour la migration

-- ═══════════════════════════════════════════════════════════
-- ÉTAPE 2: MIGRER LES DONNÉES EXISTANTES
-- ═══════════════════════════════════════════════════════════

-- 1) Migrer les devis signés (priorité haute)
UPDATE devis 
SET statut = 'signe' 
WHERE signature_status = 'signed' 
  AND statut != 'signe';

-- 2) Migrer les devis avec lien de signature envoyé
UPDATE devis 
SET statut = 'envoye' 
WHERE signature_status = 'pending' 
  AND statut NOT IN ('signe', 'envoye');

-- 3) Migrer les anciens "brouillon" vers "edition"
UPDATE devis 
SET statut = 'edition' 
WHERE statut = 'brouillon' 
  AND signature_status IS NULL;

-- 4) Migrer les anciens "accepte" vers "signe" (si pas déjà fait)
UPDATE devis 
SET statut = 'signe' 
WHERE statut = 'accepte' 
  AND statut != 'signe';

-- ═══════════════════════════════════════════════════════════
-- ÉTAPE 3: VÉRIFICATION DE LA MIGRATION
-- ═══════════════════════════════════════════════════════════

-- Afficher un résumé de la migration
DO $$
DECLARE
  count_edition INTEGER;
  count_pret INTEGER;
  count_envoye INTEGER;
  count_signe INTEGER;
  count_refuse INTEGER;
  count_brouillon INTEGER;
  count_accepte INTEGER;
  count_total INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_edition FROM devis WHERE statut = 'edition';
  SELECT COUNT(*) INTO count_pret FROM devis WHERE statut = 'pret';
  SELECT COUNT(*) INTO count_envoye FROM devis WHERE statut = 'envoye';
  SELECT COUNT(*) INTO count_signe FROM devis WHERE statut = 'signe';
  SELECT COUNT(*) INTO count_refuse FROM devis WHERE statut = 'refuse';
  SELECT COUNT(*) INTO count_brouillon FROM devis WHERE statut = 'brouillon';
  SELECT COUNT(*) INTO count_accepte FROM devis WHERE statut = 'accepte';
  SELECT COUNT(*) INTO count_total FROM devis;
  
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'RÉSUMÉ DE LA MIGRATION DES STATUTS';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'Total de devis: %', count_total;
  RAISE NOTICE '  - edition: %', count_edition;
  RAISE NOTICE '  - pret: %', count_pret;
  RAISE NOTICE '  - envoye: %', count_envoye;
  RAISE NOTICE '  - signe: %', count_signe;
  RAISE NOTICE '  - refuse: %', count_refuse;
  RAISE NOTICE '  - brouillon (ancien): %', count_brouillon;
  RAISE NOTICE '  - accepte (ancien): %', count_accepte;
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  
  IF count_brouillon > 0 OR count_accepte > 0 THEN
    RAISE WARNING 'Il reste % devis avec anciens statuts à migrer manuellement', count_brouillon + count_accepte;
  ELSE
    RAISE NOTICE '✅ Tous les devis ont été migrés avec succès';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════
-- ÉTAPE 4: CRÉER UN INDEX POUR AMÉLIORER LES PERFORMANCES
-- ═══════════════════════════════════════════════════════════

-- Index sur statut pour accélérer les filtres dans DocumentsScreen
CREATE INDEX IF NOT EXISTS idx_devis_statut ON devis(statut);

-- Index composite pour les requêtes fréquentes (user_id + statut)
CREATE INDEX IF NOT EXISTS idx_devis_user_statut ON devis(user_id, statut) 
WHERE user_id IS NOT NULL;

-- ═══════════════════════════════════════════════════════════
-- ÉTAPE 5: AJOUTER UNE COLONNE DE TRACKING (OPTIONNEL)
-- ═══════════════════════════════════════════════════════════

-- Ajouter une colonne pour tracker les changements de statut
ALTER TABLE devis 
  ADD COLUMN IF NOT EXISTS statut_updated_at TIMESTAMPTZ;

-- Mettre à jour avec la date actuelle pour les devis existants
UPDATE devis 
SET statut_updated_at = COALESCE(signed_at, created_at) 
WHERE statut_updated_at IS NULL;

-- ═══════════════════════════════════════════════════════════
-- ÉTAPE 6: CRÉER UN TRIGGER POUR AUTO-UPDATE (OPTIONNEL)
-- ═══════════════════════════════════════════════════════════

-- Fonction trigger pour mettre à jour statut_updated_at automatiquement
CREATE OR REPLACE FUNCTION update_devis_statut_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.statut IS DISTINCT FROM OLD.statut THEN
    NEW.statut_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_update_devis_statut_timestamp ON devis;
CREATE TRIGGER trigger_update_devis_statut_timestamp
  BEFORE UPDATE ON devis
  FOR EACH ROW
  EXECUTE FUNCTION update_devis_statut_timestamp();

-- ═══════════════════════════════════════════════════════════
-- ÉTAPE 7: VÉRIFICATION FINALE
-- ═══════════════════════════════════════════════════════════

-- Afficher les devis avec incohérences (si il y en a)
SELECT 
  id,
  numero,
  statut,
  signature_status,
  signed_at,
  created_at
FROM devis
WHERE 
  (statut = 'edition' AND signature_status IS NOT NULL)
  OR (statut = 'signe' AND signature_status != 'signed')
  OR (statut = 'envoye' AND signature_status IS NULL)
ORDER BY created_at DESC
LIMIT 10;

-- ═══════════════════════════════════════════════════════════
-- NOTES IMPORTANTES
-- ═══════════════════════════════════════════════════════════
-- 
-- 1. Cette migration est NON-DESTRUCTIVE (ne supprime aucune donnée)
-- 2. Les anciens statuts 'brouillon' et 'accepte' sont conservés temporairement
-- 3. Pour supprimer complètement les anciens statuts, exécuter après validation:
--    
--    ALTER TABLE devis 
--      DROP CONSTRAINT devis_statut_check;
--    
--    ALTER TABLE devis 
--      ADD CONSTRAINT devis_statut_check 
--      CHECK (statut IN ('edition', 'pret', 'envoye', 'signe', 'refuse'));
--
-- 4. La colonne signature_status peut être supprimée après validation complète:
--    
--    ALTER TABLE devis DROP COLUMN signature_status;
--
-- ═══════════════════════════════════════════════════════════

COMMIT;

