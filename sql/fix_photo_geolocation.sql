-- ============================================
-- NETTOYAGE GÉOLOCALISATION PHOTOS INVALIDES
-- ============================================
-- Ce script nettoie les coordonnées GPS invalides dans project_photos
-- ============================================

-- 1. Mettre à NULL les coordonnées 0,0 (invalides)
UPDATE project_photos 
SET latitude = NULL, longitude = NULL 
WHERE (latitude = 0 AND longitude = 0);

-- 2. Mettre à NULL les coordonnées hors limites (latitude/longitude invalides)
UPDATE project_photos 
SET latitude = NULL, longitude = NULL 
WHERE latitude < -90 OR latitude > 90 
   OR longitude < -180 OR longitude > 180;

-- 3. Mettre à NULL si une seule coordonnée est NULL (incohérence)
UPDATE project_photos 
SET latitude = NULL, longitude = NULL 
WHERE (latitude IS NULL AND longitude IS NOT NULL)
   OR (latitude IS NOT NULL AND longitude IS NULL);

-- 4. Vérification : Afficher les photos avec géolocalisation valide
SELECT 
  id,
  project_id,
  latitude,
  longitude,
  created_at,
  CASE 
    WHEN latitude IS NOT NULL AND longitude IS NOT NULL 
         AND latitude != 0 AND longitude != 0
         AND latitude >= -90 AND latitude <= 90
         AND longitude >= -180 AND longitude <= 180
    THEN '✅ Valide'
    ELSE '❌ Invalide'
  END as status_geoloc
FROM project_photos
ORDER BY created_at DESC
LIMIT 20;

-- 5. Statistiques
SELECT 
  COUNT(*) as total_photos,
  COUNT(latitude) as photos_avec_geoloc,
  COUNT(*) - COUNT(latitude) as photos_sans_geoloc
FROM project_photos;

-- ============================================

