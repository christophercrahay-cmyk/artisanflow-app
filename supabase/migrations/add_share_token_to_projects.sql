-- Migration : Ajout de share_token sur la table projects
-- Date : 2025-11-17
-- Objectif : Permettre le partage public de chantiers via un token unique sur la table projects

-- 1. Ajouter la colonne share_token si elle n'existe pas
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS share_token UUID UNIQUE;

-- 2. Générer un share_token pour les projets existants qui n'en ont pas
UPDATE public.projects 
SET share_token = gen_random_uuid()
WHERE share_token IS NULL;

-- 3. Rendre share_token NOT NULL avec valeur par défaut pour les nouveaux projets
ALTER TABLE public.projects 
  ALTER COLUMN share_token SET DEFAULT gen_random_uuid(),
  ALTER COLUMN share_token SET NOT NULL;

-- 4. Créer un index pour les recherches rapides par share_token
CREATE INDEX IF NOT EXISTS idx_projects_share_token ON public.projects(share_token);

-- 5. Commentaires pour documentation
COMMENT ON COLUMN public.projects.share_token IS 'Token unique pour partage public du chantier (lecture seule). NULL = partage désactivé.';

-- Message de confirmation
SELECT '✅ Migration terminée: colonne share_token ajoutée à projects' as status;


