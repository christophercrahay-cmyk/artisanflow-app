-- Migration : Ajout de l'horodatage et de la géolocalisation aux photos de chantier
-- À exécuter UNE FOIS dans Supabase SQL Editor

-- Ajouter les colonnes pour l'horodatage et la géolocalisation
ALTER TABLE public.project_photos
  ADD COLUMN IF NOT EXISTS taken_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Créer un index pour améliorer les requêtes de recherche par date
CREATE INDEX IF NOT EXISTS idx_project_photos_taken_at ON public.project_photos(taken_at);

-- Créer un index pour améliorer les requêtes de recherche par position (optionnel, pour futures fonctionnalités)
CREATE INDEX IF NOT EXISTS idx_project_photos_location ON public.project_photos(latitude, longitude) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Commentaire pour documentation
COMMENT ON COLUMN public.project_photos.taken_at IS 'Date et heure de prise de la photo (peut différer de created_at si la photo est uploadée plus tard)';
COMMENT ON COLUMN public.project_photos.latitude IS 'Latitude GPS de la prise de vue';
COMMENT ON COLUMN public.project_photos.longitude IS 'Longitude GPS de la prise de vue';

