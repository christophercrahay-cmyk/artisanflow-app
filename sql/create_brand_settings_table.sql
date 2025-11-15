-- ============================================
-- TABLE BRAND_SETTINGS (PARAMÈTRES ENTREPRISE)
-- ============================================
-- Stocke les paramètres de l'entreprise pour
-- les devis, factures, et l'application
-- ============================================

CREATE TABLE IF NOT EXISTS public.brand_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations entreprise
  company_name TEXT DEFAULT 'Mon Entreprise',
  company_siret TEXT,
  company_address TEXT,
  company_city TEXT, -- Ville pour la météo
  company_phone TEXT,
  company_email TEXT,
  
  -- Paramètres documents
  logo_url TEXT,
  tva_default NUMERIC DEFAULT 20,
  template_default TEXT DEFAULT 'classique', -- minimal, classique, bandeBleue
  default_footer_text TEXT, -- Mentions légales personnalisées
  
  -- Numérotation
  devis_prefix TEXT DEFAULT 'DE',
  facture_prefix TEXT DEFAULT 'FA',
  
  -- Couleurs
  primary_color TEXT DEFAULT '#1D4ED8',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche par user_id
CREATE INDEX IF NOT EXISTS idx_brand_settings_user_id ON public.brand_settings(user_id);

-- Désactiver RLS pour le MVP (à activer en production)
ALTER TABLE public.brand_settings DISABLE ROW LEVEL SECURITY;

-- Vérification
SELECT 
  '✅ Table brand_settings créée avec succès !' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'brand_settings') as table_exists;

-- ============================================
-- ALIAS company_settings → brand_settings
-- ============================================
-- Pour compatibilité avec le code existant qui utilise company_settings
-- Créer une vue qui pointe vers brand_settings
-- ============================================

CREATE OR REPLACE VIEW public.company_settings AS
SELECT 
  id,
  user_id,
  company_name,
  company_siret AS siret,
  company_address AS address,
  company_city AS city,
  company_phone AS phone,
  company_email AS email,
  logo_url,
  tva_default,
  template_default,
  default_footer_text,
  created_at,
  updated_at
FROM public.brand_settings;

-- ============================================
-- EXEMPLE D'UTILISATION
-- ============================================
-- 
-- INSERT INTO brand_settings (user_id, company_name, company_siret, company_address, company_city, company_phone, company_email)
-- VALUES (
--   '<user_id>',
--   'Mon Entreprise',
--   '123 456 789 00012',
--   '123 Rue de Test, 75001 Paris',
--   'Paris',
--   '01 23 45 67 89',
--   'contact@monentreprise.fr'
-- );
-- 
-- ============================================

