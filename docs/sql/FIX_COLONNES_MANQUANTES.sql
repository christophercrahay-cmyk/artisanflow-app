-- ============================================================
-- SCRIPT DE MIGRATION : Ajouter les colonnes manquantes
-- ============================================================
-- À exécuter si vous avez déjà des données et des erreurs
-- "Could not find the 'X' column" dans l'app
-- ============================================================

-- ========================================
-- FIX 1 : Colonne address dans clients
-- ========================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'address'
  ) THEN
    ALTER TABLE clients ADD COLUMN address TEXT;
    RAISE NOTICE '✅ Colonne address ajoutée à clients';
  ELSE
    RAISE NOTICE '⚠️ Colonne address existe déjà dans clients';
  END IF;
END $$;

-- ========================================
-- FIX 2 : Colonne client_id dans project_photos
-- ========================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'project_photos' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE project_photos ADD COLUMN client_id UUID;
    RAISE NOTICE '✅ Colonne client_id ajoutée à project_photos';
  ELSE
    RAISE NOTICE '⚠️ Colonne client_id existe déjà dans project_photos';
  END IF;
END $$;

-- Remplir les project_photos existants
UPDATE project_photos pp
SET client_id = p.client_id
FROM projects p
WHERE pp.project_id = p.id AND pp.client_id IS NULL;

-- Ajouter la FK si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_project_photos_client'
  ) THEN
    ALTER TABLE project_photos ADD CONSTRAINT fk_project_photos_client 
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Contrainte fk_project_photos_client ajoutée';
  ELSE
    RAISE NOTICE '⚠️ Contrainte fk_project_photos_client existe déjà';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_project_photos_client_id ON project_photos(client_id);

-- ========================================
-- FIX 3 : Colonne pdf_url dans devis
-- ========================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'devis' AND column_name = 'pdf_url'
  ) THEN
    ALTER TABLE devis ADD COLUMN pdf_url TEXT;
    RAISE NOTICE '✅ Colonne pdf_url ajoutée à devis';
  ELSE
    RAISE NOTICE '⚠️ Colonne pdf_url existe déjà dans devis';
  END IF;
END $$;

-- ========================================
-- FIX 4 : Colonne pdf_url dans factures
-- ========================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'factures' AND column_name = 'pdf_url'
  ) THEN
    ALTER TABLE factures ADD COLUMN pdf_url TEXT;
    RAISE NOTICE '✅ Colonne pdf_url ajoutée à factures';
  ELSE
    RAISE NOTICE '⚠️ Colonne pdf_url existe déjà dans factures';
  END IF;
END $$;

-- ========================================
-- FIX 5 : Table brand_settings
-- ========================================

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

-- Insérer une ligne par défaut si vide
INSERT INTO brand_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM brand_settings);

-- Désactiver RLS
ALTER TABLE brand_settings DISABLE ROW LEVEL SECURITY;

-- ========================================
-- MESSAGE FINAL
-- ========================================

SELECT '✅ Migration terminée! Toutes les colonnes manquantes ont été ajoutées.' as status;

