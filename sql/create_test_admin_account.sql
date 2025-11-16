-- ============================================
-- CRÉATION COMPTE TEST ADMIN
-- ============================================
-- Email: test@artisanflow.app
-- Mot de passe: Test1234
-- Rôle: admin
-- ============================================

-- 1. Créer l'utilisateur dans auth.users
-- Note: Supabase hash automatiquement le mot de passe avec bcrypt
-- Le hash ci-dessous correspond à "Test1234"

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
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(), -- Génère un UUID aléatoire
  '00000000-0000-0000-0000-000000000000', -- Instance ID par défaut
  'test@artisanflow.app',
  crypt('Test1234', gen_salt('bf')), -- Hash bcrypt du mot de passe
  NOW(), -- Email confirmé immédiatement
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin Test"}',
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  ''
)
RETURNING id; -- Retourne l'ID pour l'utiliser dans la prochaine requête

-- ============================================
-- ALTERNATIVE SIMPLE (recommandée)
-- ============================================
-- Si tu veux créer le compte via l'interface Supabase Dashboard:
-- 1. Va dans Authentication → Users
-- 2. Clique "Add user"
-- 3. Email: test@artisanflow.app
-- 4. Password: Test1234
-- 5. Auto Confirm User: ✅ (coché)
-- 6. Clique "Create user"
-- 7. Copie l'UUID généré
-- 8. Exécute la requête ci-dessous en remplaçant <USER_ID>

-- ============================================
-- 2. CRÉER LE PROFIL ADMIN
-- ============================================
-- Remplace <USER_ID> par l'UUID de l'utilisateur créé ci-dessus

INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  '<USER_ID>', -- Remplace par l'UUID de auth.users
  'test@artisanflow.app',
  'Admin Test',
  'admin', -- Rôle admin
  NOW(),
  NOW()
);

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Vérifie que le compte a été créé correctement

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

-- ============================================
-- MÉTHODE RECOMMANDÉE (LA PLUS SIMPLE)
-- ============================================
-- Utilise la fonction Supabase Auth pour créer l'utilisateur
-- Cette méthode gère automatiquement le hash du mot de passe
-- et déclenche les triggers pour créer le profil

-- ÉTAPE 1: Crée l'utilisateur via Dashboard Supabase
-- Authentication → Users → Add user
-- Email: test@artisanflow.app
-- Password: Test1234
-- Auto Confirm: ✅

-- ÉTAPE 2: Récupère l'UUID de l'utilisateur créé
SELECT id FROM auth.users WHERE email = 'test@artisanflow.app';

-- ÉTAPE 3: Met à jour le profil pour le rendre admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'test@artisanflow.app';

-- ============================================
-- ALTERNATIVE: TOUT EN UNE SEULE REQUÊTE
-- ============================================
-- Si tu as accès à l'extension pgcrypto (normalement activée sur Supabase)

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Génère un UUID
  new_user_id := gen_random_uuid();
  
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
  
  -- Insère dans profiles
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
  
  RAISE NOTICE 'Utilisateur créé avec ID: %', new_user_id;
END $$;

-- ============================================
-- NETTOYAGE (si besoin de supprimer le compte test)
-- ============================================

-- DELETE FROM public.profiles WHERE email = 'test@artisanflow.app';
-- DELETE FROM auth.users WHERE email = 'test@artisanflow.app';

