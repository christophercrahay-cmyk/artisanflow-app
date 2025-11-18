-- Migration : Correction RPC avec LEFT JOIN pour gérer les projets sans client
-- Date : 2025-11-XX
-- Objectif : Permettre l'accès même si le client n'existe pas ou est NULL

-- Recréer la fonction avec LEFT JOIN au lieu de INNER JOIN
CREATE OR REPLACE FUNCTION public.get_public_chantier(p_share_token UUID)
RETURNS TABLE (
  project_id UUID,
  project_name TEXT,
  project_address_line TEXT,
  project_postal_code TEXT,
  project_city TEXT,
  project_status TEXT,
  client_id UUID,
  client_name TEXT,
  client_phone TEXT,
  client_email TEXT,
  photos JSONB,
  documents JSONB
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT
      p.id AS project_id,
      p.name AS project_name,
      COALESCE(p.address, '') AS project_address_line,
      '' AS project_postal_code,
      '' AS project_city,
      COALESCE(p.status, 'active') AS project_status,
      c.id AS client_id,  -- Peut être NULL maintenant
      COALESCE(c.name, '') AS client_name,  -- Gérer NULL
      NULLIF(COALESCE(c.phone, ''), '') AS client_phone,
      NULLIF(COALESCE(c.email, ''), '') AS client_email
    FROM public.projects p
    LEFT JOIN public.clients c ON c.id = p.client_id  -- ⚠️ CHANGEMENT : LEFT JOIN au lieu de INNER JOIN
    WHERE p.share_token = p_share_token
    LIMIT 1
  ),
  photos_agg AS (
    SELECT
      ph.project_id,
      jsonb_agg(
        jsonb_build_object(
          'photo_id', ph.id,
          'url', ph.url,
          'created_at', ph.created_at
        )
        ORDER BY ph.created_at ASC
      ) FILTER (WHERE ph.id IS NOT NULL) AS photos
    FROM public.project_photos ph
    INNER JOIN base b ON b.project_id = ph.project_id
    GROUP BY ph.project_id
  ),
  devis_agg AS (
    SELECT
      d.project_id,
      jsonb_agg(
        jsonb_build_object(
          'document_id', d.id,
          'type', 'devis',
          'numero', d.numero,
          'montant_ttc', COALESCE(d.montant_ttc, 0),
          'status', COALESCE(d.statut, 'envoyé'),
          'pdf_url', d.pdf_url,
          'created_at', COALESCE(d.date_creation, d.created_at)
        )
        ORDER BY COALESCE(d.date_creation, d.created_at) DESC
      ) FILTER (WHERE d.id IS NOT NULL AND d.pdf_url IS NOT NULL) AS documents
    FROM public.devis d
    INNER JOIN base b ON b.project_id = d.project_id
    WHERE d.pdf_url IS NOT NULL
    GROUP BY d.project_id
  ),
  factures_agg AS (
    SELECT
      f.project_id,
      jsonb_agg(
        jsonb_build_object(
          'document_id', f.id,
          'type', 'facture',
          'numero', f.numero,
          'montant_ttc', COALESCE(f.montant_ttc, 0),
          'status', COALESCE(f.statut, 'envoyé'),
          'pdf_url', f.pdf_url,
          'created_at', COALESCE(f.date_creation, f.created_at)
        )
        ORDER BY COALESCE(f.date_creation, f.created_at) DESC
      ) FILTER (WHERE f.id IS NOT NULL AND f.pdf_url IS NOT NULL) AS documents
    FROM public.factures f
    INNER JOIN base b ON b.project_id = f.project_id
    WHERE f.pdf_url IS NOT NULL
    GROUP BY f.project_id
  ),
  documents_combined AS (
    SELECT
      b.project_id,
      COALESCE(
        (SELECT jsonb_agg(elem) FROM jsonb_array_elements(devis_agg.documents) elem),
        '[]'::jsonb
      ) ||
      COALESCE(
        (SELECT jsonb_agg(elem) FROM jsonb_array_elements(factures_agg.documents) elem),
        '[]'::jsonb
      ) AS documents
    FROM base b
    LEFT JOIN devis_agg ON devis_agg.project_id = b.project_id
    LEFT JOIN factures_agg ON factures_agg.project_id = b.project_id
  )
  SELECT
    b.project_id,
    b.project_name,
    b.project_address_line,
    b.project_postal_code,
    b.project_city,
    b.project_status,
    b.client_id,
    b.client_name,
    b.client_phone,
    b.client_email,
    COALESCE(pa.photos, '[]'::jsonb) AS photos,
    COALESCE(dc.documents, '[]'::jsonb) AS documents
  FROM base b
  LEFT JOIN photos_agg pa ON pa.project_id = b.project_id
  LEFT JOIN documents_combined dc ON dc.project_id = b.project_id;
$$;

-- Permettre l'appel par anon et authenticated
GRANT EXECUTE ON FUNCTION public.get_public_chantier(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_chantier(UUID) TO authenticated;

SELECT '✅ Migration terminée: RPC corrigé avec LEFT JOIN pour clients' as status;

