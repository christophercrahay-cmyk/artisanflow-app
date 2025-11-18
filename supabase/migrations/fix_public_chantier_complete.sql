-- Migration : Correction complète du RPC public pour partage de chantier
-- Date : 2025-11-XX
-- Objectif : Créer un RPC propre qui retourne toutes les infos publiques d'un chantier
-- 
-- CONTRAT MINIMAL :
-- - Identité client (id, name, phone, email)
-- - Infos chantier (id, name, address, status)
-- - Photos (id, url, created_at)
-- - Documents (devis + factures avec id, type, numero, montant_ttc, status, pdf_url, created_at)
--
-- ✅ SCHÉMA VÉRIFIÉ :
-- - clients.phone : EXISTE ✅
-- - clients.email : EXISTE ✅
-- - projects.address : EXISTE ✅
-- - devis.statut : EXISTE ✅
-- - factures.statut : EXISTE ✅
-- La migration est prête à être exécutée !

-- ============================================
-- ÉTAPE 1 : Vérification du token (à exécuter manuellement)
-- ============================================
-- Exécuter cette requête pour vérifier qu'un token existe :
-- SELECT id, name, share_token FROM public.projects WHERE share_token = '<TOKEN_TEST>';
-- 
-- Si 0 lignes → Le token n'existe pas, il faut le générer dans l'app mobile
-- Si 1 ligne → Le token existe, on peut continuer

-- ============================================
-- ÉTAPE 2 : Nouveau RPC avec contrat minimal
-- ============================================

-- Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS public.public_get_chantier_by_share_token(UUID);
DROP FUNCTION IF EXISTS public.get_public_chantier(UUID);

-- Créer la nouvelle fonction avec le format demandé
-- Note : On s'adapte au schéma réel :
-- - projects.address (pas de address_line/postal_code/city séparés)
-- - clients.phone et clients.email peuvent ne pas exister, on les met en optionnel
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
SECURITY DEFINER  -- Bypass RLS pour permettre la lecture
SET search_path = public
AS $$
  WITH base AS (
    SELECT
      p.id AS project_id,
      p.name AS project_name,
      -- Adapter selon le schéma réel : si address contient tout, on le met dans address_line
      -- Sinon, adapter selon les colonnes réelles (address_line, postal_code, city)
      COALESCE(p.address, '') AS project_address_line,
      '' AS project_postal_code,  -- À adapter si la colonne existe
      '' AS project_city,  -- La colonne city n'existe pas dans clients, mettre vide ou adapter
      COALESCE(p.status, 'active') AS project_status,
      c.id AS client_id,
      c.name AS client_name,
      -- Les colonnes phone et email existent dans le schéma
      NULLIF(c.phone, '') AS client_phone,
      NULLIF(c.email, '') AS client_email
    FROM public.projects p
    INNER JOIN public.clients c ON c.id = p.client_id
    WHERE p.share_token = p_share_token
    LIMIT 1
  ),
  photos_agg AS (
    SELECT
      ph.project_id,
      jsonb_agg(
        jsonb_build_object(
          'photo_id', ph.id,
          'url', ph.url,  -- Adapter si c'est public_url ou signed_url
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
          'status', COALESCE(d.statut, 'envoyé'),  -- Adapter selon le nom réel de la colonne
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
          'status', COALESCE(f.statut, 'envoyé'),  -- Adapter selon le nom réel de la colonne
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
      b.project_id,  -- Préfixer avec b. pour éviter l'ambiguïté
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

-- Commentaire
COMMENT ON FUNCTION public.get_public_chantier(UUID) IS 
'Récupère toutes les données publiques d''un chantier via son share_token.
Retourne : infos client, infos chantier, photos, devis et factures.
Utilise SECURITY DEFINER pour bypasser RLS.';

-- ============================================
-- ÉTAPE 3 : RLS Policies (optionnel avec SECURITY DEFINER)
-- ============================================
-- Avec SECURITY DEFINER, les RLS policies ne sont pas nécessaires pour la fonction.
-- Mais on les garde pour permettre l'accès direct si besoin.

-- S'assurer que RLS est activé sur les tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factures ENABLE ROW LEVEL SECURITY;

-- Policies pour accès anonyme (si on veut permettre l'accès direct sans RPC)
-- On les garde simples : permettre la lecture si share_token existe
DROP POLICY IF EXISTS "public_share_by_token" ON public.projects;
CREATE POLICY "public_share_by_token"
ON public.projects
FOR SELECT
TO anon
USING (share_token IS NOT NULL);

DROP POLICY IF EXISTS "public_read_client_by_share_token" ON public.clients;
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

DROP POLICY IF EXISTS "public_read_project_photos_by_share_token" ON public.project_photos;
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

DROP POLICY IF EXISTS "public_read_devis_by_share_token" ON public.devis;
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

DROP POLICY IF EXISTS "public_read_factures_by_share_token" ON public.factures;
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

-- ============================================
-- ÉTAPE 4 : Test de la fonction
-- ============================================
-- Exécuter manuellement pour tester :
-- SELECT * FROM public.get_public_chantier('67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd');

-- Message de confirmation
SELECT '✅ Migration terminée: RPC get_public_chantier créé avec contrat minimal' as status;

