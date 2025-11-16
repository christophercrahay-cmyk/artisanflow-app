-- ============================================
-- AJOUT COLONNE FIRST_NAME À BRAND_SETTINGS
-- ============================================
-- Ajoute le champ prénom pour la personnalisation de l'accueil
-- ============================================

-- Ajouter first_name si elle n'existe pas
ALTER TABLE brand_settings ADD COLUMN IF NOT EXISTS first_name TEXT;

-- Vérification
SELECT 
  '✅ Colonne first_name ajoutée avec succès !' as status,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'brand_settings' 
  AND column_name = 'first_name';

-- ============================================

