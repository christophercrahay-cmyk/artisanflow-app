-- ============================================
-- VÉRIFICATION RAPIDE AUTH + RLS
-- ArtisanFlow
-- ============================================

-- 1. Colonnes user_id créées et NULLABLES ?
SELECT 
  table_name, 
  column_name, 
  is_nullable, 
  data_type
FROM information_schema.columns 
WHERE column_name = 'user_id' 
AND table_schema = 'public'
ORDER BY table_name;

-- 2. RLS activé sur toutes les tables ?
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'projects', 'notes', 'client_photos', 'project_photos', 'devis', 'factures', 'brand_settings')
ORDER BY tablename;

-- 3. Politiques créées ? (devrait avoir 32 politiques = 8 tables × 4 policies)
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('clients', 'projects', 'notes', 'client_photos', 'project_photos', 'devis', 'factures', 'brand_settings')
ORDER BY tablename, policyname;

-- 4. Index créés ?
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes 
WHERE tablename IN ('clients', 'projects', 'notes', 'client_photos', 'project_photos', 'devis', 'factures', 'brand_settings')
AND indexname LIKE '%user_id%'
ORDER BY tablename;

-- ✅ Résultat attendu:
-- 1. 8 lignes avec is_nullable = 'YES'
-- 2. 8 lignes avec rowsecurity = true
-- 3. 32 lignes de politiques
-- 4. 8 lignes d'index

