-- Migration : Correction sécurité RPC function pour partage public
-- Date : 2025-11-XX
-- Objectif : Permettre l'accès public via share_token en bypassant RLS via SECURITY DEFINER
-- 
-- PROBLÈME IDENTIFIÉ :
-- La fonction public_get_chantier_by_share_token est en SECURITY INVOKER,
-- ce qui signifie qu'elle s'exécute avec les permissions de l'appelant (anon).
-- Si RLS bloque anon sur projects, la fonction ne peut pas lire la table.
--
-- SOLUTION :
-- Changer en SECURITY DEFINER pour que la fonction s'exécute avec les permissions
-- du propriétaire (postgres), bypassant ainsi RLS. La sécurité est assurée par
-- le filtrage strict dans la fonction (WHERE share_token = p_share_token).

-- ============================================
-- 1. RECRÉER LA FONCTION EN SECURITY DEFINER
-- ============================================

CREATE OR REPLACE FUNCTION public_get_chantier_by_share_token(p_share_token UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER  -- ⚠️ CHANGEMENT : SECURITY DEFINER au lieu de SECURITY INVOKER
SET search_path = public  -- Sécurité : limiter le search_path
AS $$
DECLARE
  v_chantier json;
  v_photos json;
  v_devis json;
  v_factures json;
  v_result json;
BEGIN
  -- Vérifier que le share_token existe et récupérer le chantier
  -- Cette requête bypass RLS grâce à SECURITY DEFINER
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

-- Permettre l'appel par anon (nécessaire même avec SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION public_get_chantier_by_share_token(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public_get_chantier_by_share_token(UUID) TO authenticated;

-- Commentaire
COMMENT ON FUNCTION public_get_chantier_by_share_token(UUID) IS 
'Récupère les données publiques d''un chantier via son share_token. 
Utilise SECURITY DEFINER pour bypasser RLS. 
N''expose PAS les notes (texte ou vocales).';

-- ============================================
-- 2. VÉRIFICATION : Tester la fonction
-- ============================================

-- Cette requête devrait maintenant fonctionner même si RLS bloque anon
-- (à exécuter manuellement pour vérifier)
-- SELECT public_get_chantier_by_share_token('67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd');

-- Message de confirmation
SELECT '✅ Migration terminée: RPC function corrigée en SECURITY DEFINER' as status;

