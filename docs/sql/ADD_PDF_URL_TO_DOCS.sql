-- Script pour ajouter le champ pdf_url aux tables devis et factures
-- À exécuter dans le SQL Editor de Supabase

-- Ajouter pdf_url à devis si pas déjà présent
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'devis' 
    AND column_name = 'pdf_url'
  ) THEN
    ALTER TABLE devis ADD COLUMN pdf_url TEXT;
    RAISE NOTICE '✅ Colonne pdf_url ajoutée à devis';
  ELSE
    RAISE NOTICE '⚠️ La colonne pdf_url existe déjà dans devis';
  END IF;
END $$;

-- Ajouter pdf_url à factures si pas déjà présent
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'factures' 
    AND column_name = 'pdf_url'
  ) THEN
    ALTER TABLE factures ADD COLUMN pdf_url TEXT;
    RAISE NOTICE '✅ Colonne pdf_url ajoutée à factures';
  ELSE
    RAISE NOTICE '⚠️ La colonne pdf_url existe déjà dans factures';
  END IF;
END $$;

SELECT '✅ Script terminé' as status;

