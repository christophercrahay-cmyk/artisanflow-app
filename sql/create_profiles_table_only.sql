-- ============================================
-- CRÉER LA TABLE PROFILES UNIQUEMENT
-- ============================================
-- Script simplifié pour créer juste la table profiles
-- sans toucher aux utilisateurs existants
-- ============================================

-- ========================================
-- ÉTAPE 1 : CRÉER LA TABLE PROFILES
-- ========================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'artisan', -- 'admin', 'artisan', 'user'
  company_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Désactiver RLS pour le MVP
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- ========================================
-- ÉTAPE 2 : CRÉER UN TRIGGER AUTO-PROFILE
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    'artisan'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- ÉTAPE 3 : CRÉER LES PROFILS POUR LES USERS EXISTANTS
-- ========================================

-- Insérer un profil pour chaque utilisateur existant qui n'en a pas
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Utilisateur'),
  'artisan', -- Rôle par défaut
  u.created_at,
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- ========================================
-- ÉTAPE 4 : METTRE test@artisanflow.app EN ADMIN
-- ========================================

UPDATE public.profiles
SET 
  role = 'admin',
  full_name = 'Admin Test',
  updated_at = NOW()
WHERE email = 'test@artisanflow.app';

-- ========================================
-- VÉRIFICATION
-- ========================================

SELECT 
  '✅ Table profiles créée et configurée !' as status,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') as admin_count;

-- Afficher tous les profils
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.role,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Tu devrais voir :
-- - Table profiles créée ✅
-- - Trigger automatique activé ✅
-- - Profils créés pour tous les users existants ✅
-- - test@artisanflow.app avec rôle 'admin' ✅
-- ============================================

-- ============================================
-- IDENTIFIANTS DE CONNEXION
-- ============================================
-- Email    : test@artisanflow.app
-- Password : Test1234
-- Rôle     : admin ✅
-- ============================================

