-- Table pour mémoriser les mappings d'import de clients par utilisateur
-- Permet de réutiliser automatiquement les mappings pour des fichiers avec la même structure

CREATE TABLE IF NOT EXISTS public.client_import_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  headers_signature TEXT NOT NULL,
  mapping JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Un utilisateur ne peut avoir qu'un seul mapping par signature
  UNIQUE(user_id, headers_signature)
);

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_client_import_mappings_user_id ON public.client_import_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_client_import_mappings_signature ON public.client_import_mappings(headers_signature);

-- Activer RLS
ALTER TABLE public.client_import_mappings ENABLE ROW LEVEL SECURITY;

-- Policy pour SELECT : un utilisateur peut voir ses propres mappings
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.client_import_mappings;
CREATE POLICY "Enable read access for users based on user_id"
  ON public.client_import_mappings FOR SELECT
  USING (auth.uid() = user_id);

-- Policy pour INSERT : un utilisateur peut créer ses propres mappings
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.client_import_mappings;
CREATE POLICY "Enable insert for users based on user_id"
  ON public.client_import_mappings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy pour UPDATE : un utilisateur peut modifier ses propres mappings
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.client_import_mappings;
CREATE POLICY "Enable update for users based on user_id"
  ON public.client_import_mappings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy pour DELETE : un utilisateur peut supprimer ses propres mappings
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.client_import_mappings;
CREATE POLICY "Enable delete for users based on user_id"
  ON public.client_import_mappings FOR DELETE
  USING (auth.uid() = user_id);

SELECT '✅ Table client_import_mappings créée avec RLS.' as status;

