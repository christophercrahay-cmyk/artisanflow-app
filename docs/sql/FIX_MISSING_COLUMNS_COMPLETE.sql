-- ========================================
-- SCRIPT COMPLET POUR AJOUTER TOUTES LES COLONNES MANQUANTES
-- ========================================
-- À exécuter dans le SQL Editor de Supabase
-- Ce script est idempotent et peut être exécuté plusieurs fois sans risque

-- 1. Ajouter la colonne 'address' à la table 'clients' si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'address') THEN
    ALTER TABLE clients ADD COLUMN address TEXT;
    RAISE NOTICE '✅ Colonne clients.address ajoutée';
  ELSE
    RAISE NOTICE '⚠️ Colonne clients.address existe déjà';
  END IF;
END $$;

-- 2. Ajouter la colonne 'client_id' à la table 'project_photos' si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_photos' AND column_name = 'client_id') THEN
    ALTER TABLE project_photos ADD COLUMN client_id UUID;
    RAISE NOTICE '✅ Colonne project_photos.client_id ajoutée';
  ELSE
    RAISE NOTICE '⚠️ Colonne project_photos.client_id existe déjà';
  END IF;
END $$;

-- Remplir les client_id existants dans project_photos via la relation project → client
UPDATE project_photos pp
SET client_id = p.client_id
FROM projects p
WHERE pp.project_id = p.id
  AND pp.client_id IS NULL;

-- Ajouter la contrainte de clé étrangère pour project_photos.client_id si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_project_photos_client') THEN
    ALTER TABLE project_photos ADD CONSTRAINT fk_project_photos_client
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Contrainte fk_project_photos_client ajoutée';
  ELSE
    RAISE NOTICE '⚠️ Contrainte fk_project_photos_client existe déjà';
  END IF;
END $$;

-- Ajouter l'index pour project_photos.client_id
CREATE INDEX IF NOT EXISTS idx_project_photos_client_id ON project_photos(client_id);

-- 3. Ajouter la colonne 'pdf_url' à la table 'devis' si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devis' AND column_name = 'pdf_url') THEN
    ALTER TABLE devis ADD COLUMN pdf_url TEXT;
    RAISE NOTICE '✅ Colonne devis.pdf_url ajoutée';
  ELSE
    RAISE NOTICE '⚠️ Colonne devis.pdf_url existe déjà';
  END IF;
END $$;

-- 4. Ajouter la colonne 'pdf_url' à la table 'factures' si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'factures' AND column_name = 'pdf_url') THEN
    ALTER TABLE factures ADD COLUMN pdf_url TEXT;
    RAISE NOTICE '✅ Colonne factures.pdf_url ajoutée';
  ELSE
    RAISE NOTICE '⚠️ Colonne factures.pdf_url existe déjà';
  END IF;
END $$;

-- 5. Créer la table 'brand_settings' si elle n'existe pas
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

-- Insérer une ligne par défaut dans brand_settings si la table est vide
INSERT INTO brand_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM brand_settings);

-- Désactiver RLS pour brand_settings
ALTER TABLE brand_settings DISABLE ROW LEVEL SECURITY;

-- 6. Vérifier que les buckets Storage existent
-- Note: Les buckets doivent être créés manuellement dans l'interface Supabase Storage

-- Message final
SELECT '✅ Toutes les colonnes manquantes ont été vérifiées/ajoutées/configurées.' as status;

