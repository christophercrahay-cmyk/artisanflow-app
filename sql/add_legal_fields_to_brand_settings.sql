-- ============================================
-- AJOUT CHAMPS LÉGAUX À BRAND_SETTINGS
-- Pour conformité devis/factures PDF
-- ============================================

-- 1. Numéro TVA intracommunautaire
ALTER TABLE brand_settings 
ADD COLUMN IF NOT EXISTS company_tva_number TEXT;

-- 2. Assurance RCP (Responsabilité Civile Professionnelle)
ALTER TABLE brand_settings 
ADD COLUMN IF NOT EXISTS insurance_rcp_provider TEXT;

ALTER TABLE brand_settings 
ADD COLUMN IF NOT EXISTS insurance_rcp_policy TEXT;

-- 3. Assurance décennale (pour artisans BTP)
ALTER TABLE brand_settings 
ADD COLUMN IF NOT EXISTS insurance_decennale_provider TEXT;

ALTER TABLE brand_settings 
ADD COLUMN IF NOT EXISTS insurance_decennale_policy TEXT;

-- 4. Qualification professionnelle (RGE, Qualibat, etc.)
ALTER TABLE brand_settings 
ADD COLUMN IF NOT EXISTS professional_qualification TEXT;

-- 5. Capital social (si société)
ALTER TABLE brand_settings 
ADD COLUMN IF NOT EXISTS capital_social TEXT;

-- 6. Forme juridique (SARL, EURL, Auto-entrepreneur, etc.)
ALTER TABLE brand_settings 
ADD COLUMN IF NOT EXISTS legal_form TEXT 
CHECK (legal_form IN ('auto_entrepreneur', 'eurl', 'sarl', 'sas', 'sasu', 'sci', 'other'));

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT 
  '✅ Champs légaux ajoutés avec succès !' AS status,
  COUNT(*) AS nombre_colonnes_brand_settings
FROM information_schema.columns 
WHERE table_name = 'brand_settings';

-- Afficher toutes les colonnes de brand_settings
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'brand_settings'
ORDER BY ordinal_position;

-- ============================================

