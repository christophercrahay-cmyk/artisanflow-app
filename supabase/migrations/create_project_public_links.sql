-- Migration : Création de la table project_public_links
-- Date : 2025-11-10
-- Objectif : Permettre le partage sécurisé de chantiers via des liens publics avec tokens

-- 1. Créer la table project_public_links
CREATE TABLE IF NOT EXISTS public.project_public_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  expires_at TIMESTAMPTZ,
  is_revoked BOOLEAN NOT NULL DEFAULT false
);

-- 2. Créer un index sur le token pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_project_public_links_token ON public.project_public_links(token);
CREATE INDEX IF NOT EXISTS idx_project_public_links_project_id ON public.project_public_links(project_id);

-- 3. Activer RLS (Row Level Security)
ALTER TABLE public.project_public_links ENABLE ROW LEVEL SECURITY;

-- 4. Policy : Seul le propriétaire du projet peut gérer ses liens publics
CREATE POLICY "owner_can_manage_public_links"
ON public.project_public_links
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_public_links.project_id
    AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_public_links.project_id
    AND p.user_id = auth.uid()
  )
);

-- 5. Commentaires pour documentation
COMMENT ON TABLE public.project_public_links IS 'Liens publics sécurisés pour partager des chantiers avec les clients (lecture seule)';
COMMENT ON COLUMN public.project_public_links.token IS 'Token unique utilisé dans l''URL publique (généré aléatoirement)';
COMMENT ON COLUMN public.project_public_links.expires_at IS 'Date d''expiration du lien (NULL = pas d''expiration)';
COMMENT ON COLUMN public.project_public_links.is_revoked IS 'Si true, le lien est révoqué et ne fonctionne plus';

-- Message de confirmation
SELECT '✅ Migration terminée: table project_public_links créée avec RLS' as status;

