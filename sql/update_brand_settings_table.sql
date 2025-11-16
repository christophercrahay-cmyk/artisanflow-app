-- ============================================
-- MISE À JOUR TABLE BRAND_SETTINGS
-- ============================================
-- Ajouter les colonnes manquantes pour les paramètres
-- ============================================

-- Ajouter company_city si elle n'existe pas (pour la météo)
ALTER TABLE brand_settings ADD COLUMN IF NOT EXISTS company_city TEXT;

-- Ajouter default_footer_text si elle n'existe pas (mentions légales)
ALTER TABLE brand_settings ADD COLUMN IF NOT EXISTS default_footer_text TEXT;

-- Vérifier que toutes les colonnes nécessaires existent
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'brand_settings'
ORDER BY ordinal_position;

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Les colonnes suivantes doivent exister :
-- - id (uuid)
-- - user_id (uuid)
-- - company_name (text)
-- - company_siret (text)
-- - company_address (text)
-- - company_city (text) ← pour la météo
-- - company_phone (text)
-- - company_email (text)
-- - tva_default (numeric)
-- - template_default (text)
-- - devis_prefix (text)
-- - facture_prefix (text)
-- - primary_color (text)
-- - logo_url (text)
-- - default_footer_text (text) ← pour les mentions légales
-- - created_at (timestamp)
-- - updated_at (timestamp)
-- ============================================

