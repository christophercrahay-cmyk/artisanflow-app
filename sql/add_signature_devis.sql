-- Migration SQL : Ajout du système de signature électronique pour les devis
-- À exécuter dans le SQL Editor de Supabase
-- Compatible avec l'architecture multi-tenant existante (RLS activé)

-- ========================================
-- 1. Ajouter les colonnes de signature à la table devis
-- ========================================

-- Vérifier et ajouter les colonnes si elles n'existent pas déjà
DO $$ 
BEGIN
  -- signature_token : token unique pour chaque lien de signature
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'devis' AND column_name = 'signature_token'
  ) THEN
    ALTER TABLE public.devis ADD COLUMN signature_token TEXT UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_devis_signature_token ON public.devis(signature_token);
  END IF;

  -- signature_status : statut de la signature ('pending' | 'signed')
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'devis' AND column_name = 'signature_status'
  ) THEN
    ALTER TABLE public.devis ADD COLUMN signature_status TEXT DEFAULT 'pending' CHECK (signature_status IN ('pending', 'signed'));
  END IF;

  -- signed_at : date/heure de signature
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'devis' AND column_name = 'signed_at'
  ) THEN
    ALTER TABLE public.devis ADD COLUMN signed_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- signed_by_name : nom du signataire
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'devis' AND column_name = 'signed_by_name'
  ) THEN
    ALTER TABLE public.devis ADD COLUMN signed_by_name TEXT;
  END IF;

  -- signed_by_email : email du signataire
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'devis' AND column_name = 'signed_by_email'
  ) THEN
    ALTER TABLE public.devis ADD COLUMN signed_by_email TEXT;
  END IF;
END $$;

-- ========================================
-- 2. Créer la table devis_signatures pour le log des signatures
-- ========================================

CREATE TABLE IF NOT EXISTS public.devis_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id UUID NOT NULL REFERENCES public.devis(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  signature_image_base64 TEXT NOT NULL, -- Stockage de l'image de signature en dataURL
  signer_ip TEXT, -- IP du signataire (optionnel)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_devis_signatures_devis_id ON public.devis_signatures(devis_id);
CREATE INDEX IF NOT EXISTS idx_devis_signatures_user_id ON public.devis_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_devis_signatures_signed_at ON public.devis_signatures(signed_at);

-- ========================================
-- 3. Activer RLS sur devis_signatures (multi-tenant)
-- ========================================

ALTER TABLE public.devis_signatures ENABLE ROW LEVEL SECURITY;

-- Policy SELECT : l'artisan peut voir les signatures de ses devis
CREATE POLICY "Users can view their own devis signatures"
  ON public.devis_signatures
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy INSERT : l'artisan peut insérer des signatures pour ses devis
-- Note: On vérifie que le devis appartient bien à l'artisan via projects.user_id
CREATE POLICY "Users can insert signatures for their own devis"
  ON public.devis_signatures
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.devis d
      INNER JOIN public.projects p ON d.project_id = p.id
      WHERE d.id = devis_signatures.devis_id
      AND p.user_id = auth.uid()
    )
  );

-- Policy UPDATE : l'artisan peut mettre à jour ses propres signatures (rare, mais utile)
CREATE POLICY "Users can update their own devis signatures"
  ON public.devis_signatures
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy DELETE : l'artisan peut supprimer ses propres signatures (rare, mais utile)
CREATE POLICY "Users can delete their own devis signatures"
  ON public.devis_signatures
  FOR DELETE
  USING (user_id = auth.uid());

-- ========================================
-- 4. Commentaires pour documentation
-- ========================================

COMMENT ON TABLE public.devis_signatures IS 'Log des signatures électroniques des devis - Signature Électronique Simple (SES)';
COMMENT ON COLUMN public.devis.signature_token IS 'Token unique pour le lien de signature publique';
COMMENT ON COLUMN public.devis.signature_status IS 'Statut de la signature: pending (en attente) ou signed (signé)';
COMMENT ON COLUMN public.devis_signatures.signature_image_base64 IS 'Image de la signature au format data:image/png;base64,...';

-- ========================================
-- Message de confirmation
-- ========================================

SELECT '✅ Migration signature électronique terminée !' as status;

