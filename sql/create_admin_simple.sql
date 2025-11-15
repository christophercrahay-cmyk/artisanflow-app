-- ============================================
-- CRÉER UN COMPTE ADMIN SIMPLE (SANS PROFILES)
-- ============================================
-- Cette méthode crée juste un compte dans auth.users
-- Pas besoin de table profiles
-- ============================================

-- MÉTHODE RECOMMANDÉE : Via Dashboard Supabase
-- ============================================
-- 
-- 1. Va sur : https://supabase.com/dashboard
-- 2. Sélectionne ton projet ArtisanFlow
-- 3. Menu : Authentication → Users
-- 4. Clique : "Add user" (bouton vert)
-- 5. Remplis :
--    - Email : test@artisanflow.app
--    - Password : Test1234
--    - ✅ Auto Confirm User (coché)
-- 6. Clique : "Create user"
-- 7. ✅ C'est fini !
--
-- ============================================

-- MÉTHODE ALTERNATIVE : Via SQL
-- ============================================
-- Si tu préfères créer le compte en SQL :

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Génère un UUID
  new_user_id := gen_random_uuid();
  
  -- Vérifie si l'utilisateur existe déjà
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'test@artisanflow.app') THEN
    RAISE NOTICE 'L''utilisateur test@artisanflow.app existe déjà';
    
    -- Affiche les infos
    SELECT 
      id,
      email,
      email_confirmed_at,
      created_at
    FROM auth.users
    WHERE email = 'test@artisanflow.app';
    
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
    NOW(), -- Email confirmé immédiatement
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin Test"}',
    false,
    'authenticated',
    'authenticated'
  );
  
  RAISE NOTICE '✅ Utilisateur créé avec succès - ID: %', new_user_id;
  RAISE NOTICE '📧 Email: test@artisanflow.app';
  RAISE NOTICE '🔑 Password: Test1234';
END $$;

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
WHERE email = 'test@artisanflow.app';

-- ============================================
-- IDENTIFIANTS DU COMPTE
-- ============================================
-- 
-- Email    : test@artisanflow.app
-- Password : Test1234
-- 
-- Tu peux te connecter avec ces identifiants dans ton app
-- 
-- ============================================

