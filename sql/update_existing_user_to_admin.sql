-- ============================================
-- METTRE À JOUR L'UTILISATEUR EXISTANT EN ADMIN
-- ============================================
-- L'utilisateur test@artisanflow.app existe déjà
-- On va juste mettre à jour son rôle en 'admin'
-- ============================================

-- Mettre à jour le profil existant
UPDATE public.profiles
SET 
  role = 'admin',
  full_name = COALESCE(full_name, 'Admin Test'),
  updated_at = NOW()
WHERE email = 'test@artisanflow.app';

-- Vérifier le résultat
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  p.full_name,
  p.role,
  p.updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'test@artisanflow.app';

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Tu devrais voir :
-- - email: test@artisanflow.app
-- - role: admin ✅
-- - full_name: Admin Test
-- - email_confirmed_at: (une date)
-- ============================================

-- ============================================
-- IDENTIFIANTS DE CONNEXION
-- ============================================
-- Email    : test@artisanflow.app
-- Password : Test1234
-- Rôle     : admin ✅
-- ============================================

