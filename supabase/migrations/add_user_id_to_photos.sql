-- Migration : Ajout des colonnes manquantes à project_photos
-- Date : 2025-11-05
-- Colonnes ajoutées : user_id, taken_at, latitude, longitude

-- 1. Ajouter les colonnes si elles n'existent pas
ALTER TABLE public.project_photos 
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS taken_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- 2. Remplir user_id pour les photos existantes à partir des projets
UPDATE public.project_photos 
SET user_id = projects.user_id
FROM public.projects
WHERE project_photos.project_id = projects.id
  AND project_photos.user_id IS NULL;

-- 3. Remplir taken_at avec created_at pour les photos existantes (fallback)
UPDATE public.project_photos
SET taken_at = created_at
WHERE taken_at IS NULL;

-- 4. Rendre user_id et taken_at NOT NULL après remplissage
ALTER TABLE public.project_photos 
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN taken_at SET NOT NULL;

-- 5. Ajouter une contrainte de clé étrangère pour user_id
-- Supprimer la contrainte si elle existe déjà (pour éviter les erreurs)
ALTER TABLE public.project_photos
DROP CONSTRAINT IF EXISTS fk_project_photos_user;

-- Ajouter la contrainte
ALTER TABLE public.project_photos
ADD CONSTRAINT fk_project_photos_user 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- 6. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_project_photos_user_id ON public.project_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_project_photos_taken_at ON public.project_photos(taken_at);
CREATE INDEX IF NOT EXISTS idx_project_photos_location ON public.project_photos(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 7. Commentaires pour documentation
COMMENT ON COLUMN public.project_photos.user_id IS 'Propriétaire de la photo (pour RLS et filtrage par utilisateur)';
COMMENT ON COLUMN public.project_photos.taken_at IS 'Date et heure de prise de la photo (peut différer de created_at si uploadée plus tard)';
COMMENT ON COLUMN public.project_photos.latitude IS 'Latitude GPS de la prise de vue (optionnel)';
COMMENT ON COLUMN public.project_photos.longitude IS 'Longitude GPS de la prise de vue (optionnel)';

-- Message de confirmation
SELECT '✅ Migration terminée: colonnes user_id, taken_at, latitude, longitude ajoutées à project_photos' as status;

