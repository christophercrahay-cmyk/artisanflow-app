-- Vérification SIMPLE des colonnes
-- Exécuter dans Supabase SQL Editor

-- Vérifier project_photos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'project_photos'
ORDER BY ordinal_position;

