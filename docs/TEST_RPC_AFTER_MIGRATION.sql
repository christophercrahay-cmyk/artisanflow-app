-- ============================================
-- TESTS APRÈS MIGRATION
-- ============================================
-- Exécuter ces requêtes pour vérifier que le RPC fonctionne

-- 1. Vérifier que la fonction existe
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_public_chantier';

-- 2. Vérifier les permissions
SELECT 
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
AND routine_name = 'get_public_chantier';

-- 3. Tester avec un token réel (remplacer par un token de votre base)
-- Remplacez 'VOTRE_TOKEN_ICI' par un share_token réel
SELECT * FROM public.get_public_chantier('VOTRE_TOKEN_ICI');

-- 4. Vérifier la structure du résultat
-- Le résultat doit contenir :
-- - project_id, project_name, project_address_line, project_postal_code, project_city, project_status
-- - client_id, client_name, client_phone, client_email
-- - photos : JSONB array
-- - documents : JSONB array (devis + factures)

