-- ============================================
-- VÉRIFICATION DES VILLES DANS PROJECT_PHOTOS
-- ============================================
-- Script pour vérifier si les photos ont bien une ville stockée
-- ============================================

-- Voir les photos avec leurs coordonnées et ville
SELECT 
  id,
  project_id,
  latitude,
  longitude,
  city,
  created_at,
  CASE 
    WHEN city IS NOT NULL THEN '✅ Ville trouvée'
    WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN '⚠️ Coordonnées sans ville'
    ELSE '❌ Pas de géoloc'
  END as status
FROM project_photos
ORDER BY created_at DESC
LIMIT 20;

-- Statistiques
SELECT 
  COUNT(*) as total_photos,
  COUNT(city) as photos_avec_ville,
  COUNT(latitude) as photos_avec_coordonnees,
  COUNT(*) - COUNT(city) as photos_sans_ville
FROM project_photos;

-- ============================================










