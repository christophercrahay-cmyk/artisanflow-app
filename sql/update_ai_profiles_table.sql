-- ============================================
-- MISE A JOUR TABLE AI_PROFILES
-- ============================================
-- Met a jour la table existante si necessaire
-- ============================================

-- Verifier que la table existe
SELECT 
  '✅ Table ai_profiles existe deja' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'ai_profiles') as table_exists;

-- Verifier la structure actuelle
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'ai_profiles'
ORDER BY ordinal_position;

-- Verifier que RLS est active
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'ai_profiles';

-- Verifier les policies
SELECT 
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'ai_profiles'
ORDER BY cmd;

-- Lister les profils existants
SELECT 
  user_id,
  total_devis,
  total_lignes,
  experience_score,
  jsonb_object_keys(avg_prices) as prix_appris
FROM ai_profiles
ORDER BY created_at DESC;

