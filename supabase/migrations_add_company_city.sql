-- Migration : Ajout de la colonne company_city pour la météo par utilisateur
-- Date : 2025-11-04

-- Ajouter la colonne company_city si elle n'existe pas
ALTER TABLE public.brand_settings 
ADD COLUMN IF NOT EXISTS company_city TEXT;

-- Commentaire pour documentation
COMMENT ON COLUMN public.brand_settings.company_city IS 'Ville de l''entreprise (utilisée pour la météo par utilisateur)';

-- Message de confirmation
SELECT '✅ Migration terminée: colonne company_city ajoutée à brand_settings' as status;

