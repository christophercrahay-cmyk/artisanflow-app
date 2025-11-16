-- Script pour migrer les notes existantes et ajouter client_id
-- À exécuter dans le SQL Editor de Supabase

-- Étape 1: Ajouter la colonne client_id si elle n'existe pas
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
    RAISE NOTICE '✅ Colonne client_id ajoutée';
  ELSE
    RAISE NOTICE '⚠️ Colonne client_id existe déjà';
  END IF;
END $$;

-- Étape 2: Remplir les client_id des notes existantes en joignant avec projects
UPDATE notes n
SET client_id = p.client_id
FROM projects p
WHERE n.project_id = p.id
  AND n.client_id IS NULL;

-- Étape 3: Ajouter la contrainte de clé étrangère (si elle n'existe pas déjà)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_notes_client'
  ) THEN
    ALTER TABLE notes ADD CONSTRAINT fk_notes_client 
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Contrainte fk_notes_client ajoutée';
  ELSE
    RAISE NOTICE '⚠️ Contrainte fk_notes_client existe déjà';
  END IF;
END $$;

-- Étape 4: Ajouter l'index (si nécessaire)
CREATE INDEX IF NOT EXISTS idx_notes_client_id ON notes(client_id);

-- Étape 5: Vérifier le résultat
SELECT 
  COUNT(*) as total_notes,
  COUNT(client_id) as notes_avec_client_id,
  COUNT(*) - COUNT(client_id) as notes_sans_client_id
FROM notes;

-- Message final
SELECT '✅ Migration terminée!' as status;

