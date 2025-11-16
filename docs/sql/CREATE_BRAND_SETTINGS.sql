-- Script pour créer la table brand_settings (paramètres artisan)
-- À exécuter dans le SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS brand_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1D4ED8',
  secondary_color TEXT DEFAULT '#3B82F6',
  company_name TEXT DEFAULT 'Mon Entreprise',
  company_siret TEXT,
  company_address TEXT,
  company_phone TEXT,
  company_email TEXT,
  tva_default DECIMAL(5, 2) DEFAULT 20.00,
  template_default TEXT DEFAULT 'classique',
  devis_prefix TEXT DEFAULT 'DEV',
  facture_prefix TEXT DEFAULT 'FA',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer une ligne par défaut
INSERT INTO brand_settings (id)
VALUES (gen_random_uuid())
ON CONFLICT (id) DO NOTHING;

-- Désactiver RLS
ALTER TABLE brand_settings DISABLE ROW LEVEL SECURITY;

SELECT '✅ Table brand_settings créée!' as status;

