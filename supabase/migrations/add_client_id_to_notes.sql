-- Migration : Ajout des colonnes manquantes à notes
-- Date : 2025-11-05
-- Colonnes ajoutées : client_id, user_id

-- 1. Ajouter les colonnes si elles n'existent pas
ALTER TABLE public.notes 
  ADD COLUMN IF NOT EXISTS client_id UUID,
  ADD COLUMN IF NOT EXISTS user_id UUID;

-- 2. Remplir client_id pour les notes existantes à partir des projets
UPDATE public.notes 
SET client_id = projects.client_id
FROM public.projects
WHERE notes.project_id = projects.id
  AND notes.client_id IS NULL;

-- 3. Remplir user_id pour les notes existantes à partir des projets
UPDATE public.notes 
SET user_id = projects.user_id
FROM public.projects
WHERE notes.project_id = projects.id
  AND notes.user_id IS NULL;

-- 4. Rendre user_id NOT NULL après remplissage
ALTER TABLE public.notes 
ALTER COLUMN user_id SET NOT NULL;

-- 5. Ajouter contrainte FK pour user_id
-- Supprimer d'abord si existe
ALTER TABLE public.notes
DROP CONSTRAINT IF EXISTS fk_notes_user;

-- Puis ajouter
ALTER TABLE public.notes
ADD CONSTRAINT fk_notes_user 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- 6. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_notes_client_id ON public.notes(client_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);

-- 7. Commentaires pour documentation
COMMENT ON COLUMN public.notes.client_id IS 'Client associé à la note (via le projet, optionnel)';
COMMENT ON COLUMN public.notes.user_id IS 'Propriétaire de la note (pour RLS et filtrage par utilisateur)';

-- Message de confirmation
SELECT '✅ Migration terminée: colonnes client_id et user_id ajoutées à notes' as status;

