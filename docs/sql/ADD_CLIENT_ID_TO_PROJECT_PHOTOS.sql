-- Script pour ajouter client_id à project_photos (optionnel, car projet_id suffit)
-- À exécuter dans Supabase SQL Editor si nécessaire

-- Vérifier si la colonne existe déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'project_photos' 
    AND column_name = 'client_id'
  ) THEN
    -- Ajouter la colonne
    ALTER TABLE project_photos ADD COLUMN client_id UUID;
    RAISE NOTICE '✅ Colonne client_id ajoutée à project_photos';
  ELSE
    RAISE NOTICE '⚠️ Colonne client_id existe déjà';
  END IF;
END $$;

-- Remplir les client_id existants via la relation project → client
UPDATE project_photos pp
SET client_id = p.client_id
FROM projects p
WHERE pp.project_id = p.id
  AND pp.client_id IS NULL;

-- Ajouter la contrainte si nécessaire
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_project_photos_client'
  ) THEN
    ALTER TABLE project_photos ADD CONSTRAINT fk_project_photos_client 
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
    RAISE NOTICE '✅ Contrainte fk_project_photos_client ajoutée';
  ELSE
    RAISE NOTICE '⚠️ Contrainte fk_project_photos_client existe déjà';
  END IF;
END $$;

-- Ajouter l'index
CREATE INDEX IF NOT EXISTS idx_project_photos_client_id ON project_photos(client_id);

-- Vérification
SELECT 
  COUNT(*) as total_photos,
  COUNT(client_id) as photos_avec_client_id
FROM project_photos;

SELECT '✅ Migration terminée!' as status;

