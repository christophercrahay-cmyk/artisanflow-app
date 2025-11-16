-- ============================================
-- TEST RLS - VÉRIFICATION SÉCURITÉ
-- ============================================
-- À exécuter après activation RLS
-- ============================================

-- ============================================
-- ÉTAPE 1: Récupérer 2 user_id différents
-- ============================================

SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 📝 Copier les 2 premiers user_id pour les tests ci-dessous
-- user_A = premier ID
-- user_B = deuxième ID

-- ============================================
-- ÉTAPE 2: Vérifier que RLS est activé
-- ============================================

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'clients', 'projects', 'notes', 'devis', 'devis_lignes',
  'factures', 'brand_settings', 'project_photos', 'client_photos',
  'devis_ai_sessions', 'devis_temp_ai', 'profiles'
)
ORDER BY tablename;

-- ✅ RÉSULTAT ATTENDU: rls_enabled = true pour TOUTES les tables

-- ============================================
-- ÉTAPE 3: Tester isolation des clients
-- ============================================

-- Remplacer <user_A_id> et <user_B_id> par les vrais IDs

SELECT 
  id,
  name,
  user_id,
  CASE 
    WHEN user_id = '<user_A_id>' THEN '✅ User A'
    WHEN user_id = '<user_B_id>' THEN '✅ User B'
    ELSE '⚠️ Autre user'
  END as owner
FROM clients
WHERE user_id IN ('<user_A_id>', '<user_B_id>')
ORDER BY user_id, created_at;

-- 📊 RÉSULTAT: Vous devez voir les clients des 2 users
-- (Vous êtes admin, vous voyez tout)

-- ============================================
-- ÉTAPE 4: Tester dans l'app (CRITIQUE)
-- ============================================

-- 1. Se connecter avec User A dans l'app
-- 2. Aller dans Clients
-- 3. Compter le nombre de clients visibles
-- 4. Se déconnecter
-- 5. Se connecter avec User B
-- 6. Aller dans Clients
-- 7. Compter le nombre de clients visibles

-- ✅ RÉSULTAT ATTENDU:
-- User A voit UNIQUEMENT ses clients
-- User B voit UNIQUEMENT ses clients
-- User A ne voit PAS les clients de User B

-- ============================================
-- ÉTAPE 5: Test d'insertion croisée
-- ============================================

-- Cette requête doit ÉCHOUER si RLS fonctionne
-- (À tester via l'API de l'app, pas en tant qu'admin SQL)

-- Simuler une tentative d'insertion malveillante :
-- User A essaie d'insérer un client pour User B

-- ❌ DOIT ÉCHOUER avec: "new row violates row-level security policy"

-- ============================================
-- ÉTAPE 6: Vérifier les policies
-- ============================================

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('clients', 'projects', 'devis', 'factures')
ORDER BY tablename, policyname;

-- ✅ RÉSULTAT ATTENDU: 
-- Chaque table doit avoir 4 policies (SELECT, INSERT, UPDATE, DELETE)

-- ============================================
-- ÉTAPE 7: Test de performance
-- ============================================

-- Vérifier que les requêtes avec RLS ne sont pas trop lentes

EXPLAIN ANALYZE
SELECT * FROM clients WHERE user_id = '<user_A_id>';

-- ✅ RÉSULTAT ATTENDU: Execution time < 10ms

-- ============================================
-- ÉTAPE 8: Test des relations indirectes
-- ============================================

-- Tester que les notes sont bien isolées via project_id

SELECT 
  n.id,
  n.transcription,
  p.title as project_title,
  p.user_id,
  CASE 
    WHEN p.user_id = '<user_A_id>' THEN '✅ User A'
    WHEN p.user_id = '<user_B_id>' THEN '✅ User B'
    ELSE '⚠️ Autre'
  END as owner
FROM notes n
JOIN projects p ON p.id = n.project_id
WHERE p.user_id IN ('<user_A_id>', '<user_B_id>')
ORDER BY p.user_id, n.created_at DESC
LIMIT 10;

-- 📊 RÉSULTAT: Vous voyez les notes des 2 users (admin)
-- Mais dans l'app, chaque user ne voit que ses propres notes

-- ============================================
-- RÉSUMÉ TEST COMPLET
-- ============================================
-- 
-- ✅ RLS activé sur toutes les tables
-- ✅ Policies créées (4 par table)
-- ✅ User A voit uniquement ses données
-- ✅ User B voit uniquement ses données
-- ❌ User A ne peut pas insérer pour User B
-- ❌ User A ne peut pas lire les données de User B
-- ✅ Performance OK (< 10ms)
-- ✅ Relations indirectes fonctionnent (EXISTS + JOIN)
-- 
-- Si TOUS ces tests passent → RLS fonctionne correctement ✅
-- Sinon, vérifier les policies et les foreign keys
-- ============================================

-- ============================================
-- ROLLBACK (en cas de problème)
-- ============================================

-- Si RLS cause des problèmes, désactiver temporairement :

-- ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
-- etc.

-- ⚠️ À utiliser UNIQUEMENT en cas d'urgence
-- Réactiver dès que le problème est résolu
-- ============================================

