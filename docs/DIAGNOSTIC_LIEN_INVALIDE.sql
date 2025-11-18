-- ============================================
-- DIAGNOSTIC : Pourquoi "lien invalide" ?
-- ============================================

-- 0. Lister tous les tokens disponibles (pour choisir un token de test)
SELECT 
  id, 
  name, 
  share_token,
  client_id,
  status
FROM public.projects 
WHERE share_token IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 1. Vérifier que le token existe dans projects
-- Remplacez '67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd' par un token réel de la liste ci-dessus
SELECT 
  id, 
  name, 
  share_token,
  client_id,
  status
FROM public.projects 
WHERE share_token = '67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd'::UUID;

-- Si 0 lignes → Le token n'existe pas, régénérer le lien dans l'app mobile
-- Si 1 ligne → Le token existe, continuer les tests

-- 2. Tester le RPC directement
-- Remplacez '67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd' par un token réel
SELECT * FROM public.get_public_chantier('67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd'::UUID);

-- Résultat attendu : 1 ligne avec toutes les colonnes
-- Si 0 lignes → Problème dans le RPC (vérifier les JOINs)
-- Si erreur → Voir le message d'erreur

-- 3. Vérifier que le client existe
-- Remplacez '67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd' par un token réel
SELECT 
  p.id AS project_id,
  p.name AS project_name,
  p.share_token,
  p.client_id,
  c.id AS client_exists,
  c.name AS client_name
FROM public.projects p
LEFT JOIN public.clients c ON c.id = p.client_id
WHERE p.share_token = '67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd'::UUID;

-- Si client_id est NULL → Problème de relation
-- Si client n'existe pas → Le projet a un client_id invalide

-- 4. Vérifier les photos
-- Remplacez '67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd' par un token réel
SELECT COUNT(*) AS nb_photos
FROM public.project_photos pp
INNER JOIN public.projects p ON p.id = pp.project_id
WHERE p.share_token = '67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd'::UUID;

-- 5. Vérifier les devis
-- Remplacez '67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd' par un token réel
SELECT COUNT(*) AS nb_devis
FROM public.devis d
INNER JOIN public.projects p ON p.id = d.project_id
WHERE p.share_token = '67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd'::UUID
AND d.pdf_url IS NOT NULL;

-- 6. Vérifier les factures
-- Remplacez '67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd' par un token réel
SELECT COUNT(*) AS nb_factures
FROM public.factures f
INNER JOIN public.projects p ON p.id = f.project_id
WHERE p.share_token = '67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd'::UUID
AND f.pdf_url IS NOT NULL;

