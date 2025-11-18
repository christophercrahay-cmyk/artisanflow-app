-- ============================================
-- DIAGNOSTIC SIMPLE - Copier-coller directement
-- ============================================

-- ÉTAPE 1 : Lister les tokens disponibles
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

-- ÉTAPE 2 : Choisir un token de la liste ci-dessus et le tester
-- Exemple avec le token '67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd'
-- Remplacez-le par un token réel de la liste

-- 2a. Vérifier que le token existe
SELECT 
  id, 
  name, 
  share_token,
  client_id,
  status
FROM public.projects 
WHERE share_token = '67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd'::UUID;

-- 2b. Vérifier le client
SELECT 
  p.id AS project_id,
  p.name AS project_name,
  p.client_id,
  c.id AS client_exists,
  c.name AS client_name
FROM public.projects p
LEFT JOIN public.clients c ON c.id = p.client_id
WHERE p.share_token = '67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd'::UUID;

-- 2c. Tester le RPC (LE PLUS IMPORTANT)
SELECT * FROM public.get_public_chantier('67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd'::UUID);

-- Si cette dernière requête retourne 0 lignes, le problème vient du RPC
-- Si elle retourne 1 ligne, le problème vient du front

