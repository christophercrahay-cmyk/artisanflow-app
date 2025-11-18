-- ============================================
-- AJOUT COLONNE CITY À PROJECT_PHOTOS
-- ============================================
-- Ajoute le champ city pour stocker la ville obtenue via reverse geocoding
-- ============================================

-- Ajouter city si elle n'existe pas
ALTER TABLE project_photos ADD COLUMN IF NOT EXISTS city TEXT;

-- Ajouter un index pour les recherches par ville (optionnel mais utile)
CREATE INDEX IF NOT EXISTS idx_project_photos_city ON project_photos(city);

-- Vérification
SELECT 
  '✅ Colonne city ajoutée avec succès !' as status,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'project_photos' 
  AND column_name = 'city';

-- ============================================










