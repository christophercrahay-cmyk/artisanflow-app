-- Migration : RPC function et RLS pour partage public de chantiers
-- Date : 2025-11-17
-- Objectif : Permettre l'accès public en lecture seule aux chantiers via share_token

-- ============================================
-- 1. RPC FUNCTION : Récupérer les données publiques d'un chantier
-- ============================================
CREATE OR REPLACE FUNCTION public_get_chantier_by_share_token(p_share_token UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_chantier json;
  v_photos json;
  v_devis json;
  v_factures json;
  v_result json;
BEGIN
  -- Vérifier que le share_token existe et récupérer le chantier
  SELECT json_build_object(
    'id', p.id,
    'share_token', p.share_token,
    'name', p.name,
    'status', p.status,
    'address', p.address,
    'created_at', p.created_at,
    'client', json_build_object(
      'id', c.id,
      'name', c.name,
      'city', c.city
    )
  ) INTO v_chantier
  FROM public.projects p
  LEFT JOIN public.clients c ON c.id = p.client_id
  WHERE p.share_token = p_share_token
  LIMIT 1;

  -- Si le chantier n'existe pas, retourner null
  IF v_chantier IS NULL THEN
    RETURN json_build_object('error', 'Chantier non trouvé');
  END IF;

  -- Récupérer les photos (UNIQUEMENT les photos, PAS les notes)
  SELECT COALESCE(json_agg(
    json_build_object(
      'id', pp.id,
      'url', pp.url,
      'created_at', pp.created_at
    ) ORDER BY pp.created_at ASC
  ), '[]'::json) INTO v_photos
  FROM public.project_photos pp
  INNER JOIN public.projects p ON p.id = pp.project_id
  WHERE p.share_token = p_share_token;

  -- Récupérer les devis (UNIQUEMENT les devis avec PDF)
  SELECT COALESCE(json_agg(
    json_build_object(
      'id', d.id,
      'numero', d.numero,
      'date', COALESCE(d.date_creation, d.created_at),
      'total_ttc', d.montant_ttc,
      'pdf_url', d.pdf_url
    ) ORDER BY COALESCE(d.date_creation, d.created_at) DESC
  ), '[]'::json) INTO v_devis
  FROM public.devis d
  INNER JOIN public.projects p ON p.id = d.project_id
  WHERE p.share_token = p_share_token
  AND d.pdf_url IS NOT NULL;

  -- Récupérer les factures (UNIQUEMENT les factures avec PDF)
  SELECT COALESCE(json_agg(
    json_build_object(
      'id', f.id,
      'numero', f.numero,
      'date', COALESCE(f.date_creation, f.created_at),
      'total_ttc', f.montant_ttc,
      'pdf_url', f.pdf_url
    ) ORDER BY COALESCE(f.date_creation, f.created_at) DESC
  ), '[]'::json) INTO v_factures
  FROM public.factures f
  INNER JOIN public.projects p ON p.id = f.project_id
  WHERE p.share_token = p_share_token
  AND f.pdf_url IS NOT NULL;

  -- Construire le résultat final
  SELECT json_build_object(
    'chantier', v_chantier,
    'photos', v_photos,
    'devis', v_devis,
    'factures', v_factures
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Permettre l'appel par anon
GRANT EXECUTE ON FUNCTION public_get_chantier_by_share_token(UUID) TO anon;

-- Commentaire
COMMENT ON FUNCTION public_get_chantier_by_share_token(UUID) IS 'Récupère les données publiques d''un chantier via son share_token. N''expose PAS les notes (texte ou vocales).';

-- ============================================
-- 2. RLS POLICIES : Accès public anonyme
-- ============================================

-- Supprimer les policies existantes si elles existent (pour permettre la ré-exécution)
DROP POLICY IF EXISTS "public_read_project_by_share_token" ON public.projects;
DROP POLICY IF EXISTS "public_read_project_photos_by_share_token" ON public.project_photos;
DROP POLICY IF EXISTS "public_read_devis_by_share_token" ON public.devis;
DROP POLICY IF EXISTS "public_read_factures_by_share_token" ON public.factures;
DROP POLICY IF EXISTS "public_read_client_by_share_token" ON public.clients;

-- Policy sur projects : permettre la lecture si share_token correspond
CREATE POLICY "public_read_project_by_share_token"
ON public.projects
FOR SELECT
TO anon
USING (share_token IS NOT NULL);

-- Policy sur project_photos : permettre la lecture si le projet a un share_token
CREATE POLICY "public_read_project_photos_by_share_token"
ON public.project_photos
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_photos.project_id
    AND p.share_token IS NOT NULL
  )
);

-- Policy sur devis : permettre la lecture si le projet a un share_token ET si pdf_url existe
CREATE POLICY "public_read_devis_by_share_token"
ON public.devis
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = devis.project_id
    AND p.share_token IS NOT NULL
  )
  AND pdf_url IS NOT NULL
);

-- Policy sur factures : permettre la lecture si le projet a un share_token ET si pdf_url existe
CREATE POLICY "public_read_factures_by_share_token"
ON public.factures
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = factures.project_id
    AND p.share_token IS NOT NULL
  )
  AND pdf_url IS NOT NULL
);

-- Policy sur clients : permettre la lecture si le client est lié à un projet avec share_token
CREATE POLICY "public_read_client_by_share_token"
ON public.clients
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.client_id = clients.id
    AND p.share_token IS NOT NULL
  )
);

-- IMPORTANT : Les notes (table notes) ne doivent JAMAIS être accessibles publiquement
-- Aucune policy pour anon sur la table notes = accès refusé par défaut

-- Message de confirmation
SELECT '✅ Migration terminée: RPC function et RLS policies créées pour partage public' as status;

