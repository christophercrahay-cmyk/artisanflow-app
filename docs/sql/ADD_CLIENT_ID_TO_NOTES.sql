-- Script pour ajouter la colonne client_id à la table notes si elle n'existe pas
-- À exécuter dans le SQL Editor de Supabase pour les bases de données existantes

-- Ajouter la colonne client_id si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'notes' 
    AND column_name = 'client_id'
  ) THEN
    ALTER TABLE notes ADD COLUMN client_id UUID;
    
    RAISE NOTICE '✅ Colonne client_id ajoutée à la table notes';
    
    -- ATTENTION: Il faut remplir les notes existantes avec un client_id valide avant d'ajouter NOT NULL
    -- Pour l'instant, on laisse NULL possible pour éviter les erreurs
    
  ELSE
    RAISE NOTICE '⚠️ La colonne client_id existe déjà';
  END IF;
END $$;

-- Ajouter l'index si nécessaire
CREATE INDEX IF NOT EXISTS idx_notes_client_id ON notes(client_id);

SELECT '✅ Script terminé' as status;

