-- ============================================
-- AJOUTER INFOS ENTREPRISE AUX DEVIS/FACTURES
-- ============================================
-- Ajoute les colonnes d'informations entreprise
-- aux tables devis et factures pour permettre
-- la personnalisation par document
-- ============================================

-- Ajouter les colonnes à la table devis
ALTER TABLE public.devis
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_siret TEXT,
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS company_city TEXT,
ADD COLUMN IF NOT EXISTS company_phone TEXT,
ADD COLUMN IF NOT EXISTS company_email TEXT;

-- Ajouter les colonnes à la table factures
ALTER TABLE public.factures
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_siret TEXT,
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS company_city TEXT,
ADD COLUMN IF NOT EXISTS company_phone TEXT,
ADD COLUMN IF NOT EXISTS company_email TEXT;

-- Commentaires pour documentation
COMMENT ON COLUMN public.devis.company_name IS 'Nom de l''entreprise (pré-rempli depuis brand_settings, modifiable par devis)';
COMMENT ON COLUMN public.devis.company_siret IS 'SIRET de l''entreprise (pré-rempli depuis brand_settings, modifiable par devis)';
COMMENT ON COLUMN public.devis.company_address IS 'Adresse de l''entreprise (pré-remplie depuis brand_settings, modifiable par devis)';
COMMENT ON COLUMN public.devis.company_city IS 'Ville de l''entreprise (pré-remplie depuis brand_settings, modifiable par devis)';
COMMENT ON COLUMN public.devis.company_phone IS 'Téléphone de l''entreprise (pré-rempli depuis brand_settings, modifiable par devis)';
COMMENT ON COLUMN public.devis.company_email IS 'Email de l''entreprise (pré-rempli depuis brand_settings, modifiable par devis)';

COMMENT ON COLUMN public.factures.company_name IS 'Nom de l''entreprise (pré-rempli depuis brand_settings, modifiable par facture)';
COMMENT ON COLUMN public.factures.company_siret IS 'SIRET de l''entreprise (pré-rempli depuis brand_settings, modifiable par facture)';
COMMENT ON COLUMN public.factures.company_address IS 'Adresse de l''entreprise (pré-remplie depuis brand_settings, modifiable par facture)';
COMMENT ON COLUMN public.factures.company_city IS 'Ville de l''entreprise (pré-remplie depuis brand_settings, modifiable par facture)';
COMMENT ON COLUMN public.factures.company_phone IS 'Téléphone de l''entreprise (pré-rempli depuis brand_settings, modifiable par facture)';
COMMENT ON COLUMN public.factures.company_email IS 'Email de l''entreprise (pré-rempli depuis brand_settings, modifiable par facture)';

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que les colonnes ont été ajoutées
SELECT 
  'devis' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'devis'
  AND column_name IN ('company_name', 'company_siret', 'company_address', 'company_city', 'company_phone', 'company_email')
ORDER BY column_name;

SELECT 
  'factures' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'factures'
  AND column_name IN ('company_name', 'company_siret', 'company_address', 'company_city', 'company_phone', 'company_email')
ORDER BY column_name;

