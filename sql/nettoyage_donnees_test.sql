-- ============================================
-- NETTOYAGE DONNÉES TEST - ARTISANFLOW
-- ============================================
-- Suppression des données de test identifiées
-- ⚠️ DESTRUCTIF - Vérifier avant d'exécuter
-- ============================================

-- ============================================
-- 1. SUPPRIMER LE CLIENT DE TEST SANS USER_ID
-- ============================================

-- Client: "Xjsnzk" (test) sans user_id
DELETE FROM clients
WHERE id = 'b82394e3-031b-41b9-87d7-d2d87b520c55';

-- Vérification
SELECT 
  '✅ Client de test supprimé' as resultat,
  (SELECT COUNT(*) FROM clients WHERE user_id IS NULL) as clients_sans_user_id_restants;

-- ============================================
-- 2. SUPPRIMER LE DEVIS DE TEST SANS LIGNES
-- ============================================

-- Devis: "DEV-2025-5761" (projet QA test) sans lignes
DELETE FROM devis
WHERE id = '35dd934a-7032-4b6d-8d71-9261d27c63d4';

-- Vérification
SELECT 
  '✅ Devis de test supprimé' as resultat,
  (SELECT COUNT(*) FROM devis d LEFT JOIN devis_lignes dl ON dl.devis_id = d.id WHERE dl.id IS NULL) as devis_sans_lignes_restants;

-- ============================================
-- 3. VÉRIFICATION FINALE
-- ============================================

SELECT 
  '📊 RÉSUMÉ APRÈS NETTOYAGE' as titre,
  (SELECT COUNT(*) FROM clients) as total_clients,
  (SELECT COUNT(*) FROM clients WHERE user_id IS NULL) as clients_sans_user_id,
  (SELECT COUNT(*) FROM projects) as total_projects,
  (SELECT COUNT(*) FROM projects WHERE user_id IS NULL) as projects_sans_user_id,
  (SELECT COUNT(*) FROM notes) as total_notes,
  (SELECT COUNT(*) FROM notes n LEFT JOIN projects p ON p.id = n.project_id WHERE n.project_id IS NULL OR p.id IS NULL) as notes_orphelines,
  (SELECT COUNT(*) FROM project_photos) as total_photos_projet,
  (SELECT COUNT(*) FROM project_photos ph LEFT JOIN projects p ON p.id = ph.project_id WHERE ph.project_id IS NULL OR p.id IS NULL) as photos_orphelines,
  (SELECT COUNT(*) FROM devis) as total_devis,
  (SELECT COUNT(*) FROM devis d LEFT JOIN devis_lignes dl ON dl.devis_id = d.id WHERE dl.id IS NULL) as devis_sans_lignes,
  (SELECT COUNT(*) FROM factures) as total_factures;

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- 
-- ✅ clients_sans_user_id: 0
-- ✅ devis_sans_lignes: 0
-- ✅ Toutes les autres anomalies: 0
-- 
-- Total clients: 7 (au lieu de 8)
-- Total devis: 2 (au lieu de 3)
-- 
-- ============================================

