-- ============================================
-- SETUP AUTHENTIFICATION + COMPTE ADMIN
-- ============================================
-- Ce script crée la table profiles et un compte admin test
-- Email: test@artisanflow.app
-- Password: Test1234
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

-- Désactiver RLS pour le MVP (à activer plus tard en production)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- ========================================
-- ÉTAPE 2 : CRÉER UN TRIGGER AUTO-PROFILE
-- ========================================
-- Crée automatiquement un profil quand un user s'inscrit

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    'artisan' -- Rôle par défaut
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
-- ÉTAPE 3 : CRÉER LE COMPTE ADMIN TEST
-- ========================================

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Génère un UUID
  new_user_id := gen_random_uuid();
  
  -- Vérifie si l'utilisateur existe déjà
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'test@artisanflow.app') THEN
    RAISE NOTICE 'L''utilisateur test@artisanflow.app existe déjà';
    RETURN;
  END IF;
  
  -- Insère dans auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'test@artisanflow.app',
    crypt('Test1234', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin Test"}',
    false,
    'authenticated',
    'authenticated'
  );
  
  -- Insère dans profiles (avec rôle admin)
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'test@artisanflow.app',
    'Admin Test',
    'admin',
    NOW(),
    NOW()
  );
  
  RAISE NOTICE '✅ Utilisateur admin créé avec succès - ID: %', new_user_id;
END $$;

-- ========================================
-- ÉTAPE 4 : AJOUTER user_id AUX TABLES
-- ========================================
-- Permet d'associer les données à un utilisateur

-- Ajouter user_id à clients (si pas déjà présent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clients' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_clients_user_id ON public.clients(user_id);
  END IF;
END $$;

-- Ajouter user_id à projects (si pas déjà présent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_projects_user_id ON public.projects(user_id);
  END IF;
END $$;

-- Ajouter user_id à client_photos (si pas déjà présent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'client_photos' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.client_photos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_client_photos_user_id ON public.client_photos(user_id);
  END IF;
END $$;

-- Ajouter user_id à project_photos (si pas déjà présent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'project_photos' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.project_photos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_project_photos_user_id ON public.project_photos(user_id);
  END IF;
END $$;

-- Ajouter user_id à notes (si pas déjà présent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notes' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.notes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_notes_user_id ON public.notes(user_id);
  END IF;
END $$;

-- Ajouter user_id à devis (si pas déjà présent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'devis' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.devis ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_devis_user_id ON public.devis(user_id);
  END IF;
END $$;

-- Ajouter user_id à factures (si pas déjà présent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'factures' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.factures ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX idx_factures_user_id ON public.factures(user_id);
  END IF;
END $$;

-- ========================================
-- VÉRIFICATION FINALE
-- ========================================

SELECT 
  '✅ Setup complet !' as status,
  (SELECT COUNT(*) FROM public.profiles) as profiles_count,
  (SELECT email FROM public.profiles WHERE role = 'admin' LIMIT 1) as admin_email;

-- Afficher les infos du compte admin
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  p.full_name,
  p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'test@artisanflow.app';

-- ========================================
-- NOTES IMPORTANTES
-- ========================================
-- 
-- 1. Compte admin créé :
--    Email    : test@artisanflow.app
--    Password : Test1234
--    Rôle     : admin
--
-- 2. Table profiles créée avec trigger auto
--    Chaque nouvel utilisateur aura automatiquement un profil
--
-- 3. Colonnes user_id ajoutées à toutes les tables
--    Prêt pour activer RLS plus tard
--
-- 4. RLS désactivé pour le MVP
--    À activer en production avec les bonnes policies
--
-- ========================================

