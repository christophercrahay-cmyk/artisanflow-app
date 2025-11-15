-- ============================================
-- DÉSACTIVER RLS SUR TOUTES LES TABLES
-- ============================================
-- Pour le MVP, on désactive RLS temporairement
-- À réactiver en production avec des policies
-- ============================================

-- Tables principales
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.factures DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Tables IA
ALTER TABLE public.devis_ai_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis_temp_ai DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_price_stats DISABLE ROW LEVEL SECURITY;

-- Vérification
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'clients', 'projects', 'client_photos', 'project_photos', 
    'notes', 'devis', 'factures', 'brand_settings', 'profiles',
    'devis_ai_sessions', 'devis_temp_ai', 'user_price_stats'
  )
ORDER BY tablename;

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Toutes les tables doivent avoir rowsecurity = false
-- ============================================

