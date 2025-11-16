-- ============================================
-- CRÉER DES COMPTES DE TEST
-- ============================================
-- Crée plusieurs comptes de test avec différents rôles
-- ============================================

-- ========================================
-- COMPTE 1 : ADMIN TEST
-- ========================================

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  new_user_id := gen_random_uuid();
  
  -- Vérifie si l'utilisateur existe déjà
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'test@artisanflow.app') THEN
    RAISE NOTICE 'L''utilisateur test@artisanflow.app existe déjà';
    -- Mettre à jour en admin si existe
    UPDATE public.profiles SET role = 'admin', full_name = 'Admin Test' WHERE email = 'test@artisanflow.app';
  ELSE
    -- Créer l'utilisateur
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
    
    -- Créer le profil (le trigger le fera automatiquement, mais on force le rôle admin)
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (new_user_id, 'test@artisanflow.app', 'Admin Test', 'admin', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Admin Test';
    
    RAISE NOTICE '✅ Compte admin créé : test@artisanflow.app / Test1234';
  END IF;
END $$;

-- ========================================
-- COMPTE 2 : ARTISAN TEST
-- ========================================

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  new_user_id := gen_random_uuid();
  
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'artisan@artisanflow.app') THEN
    RAISE NOTICE 'L''utilisateur artisan@artisanflow.app existe déjà';
  ELSE
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
      'artisan@artisanflow.app',
      crypt('Test1234', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Artisan Test"}',
      false,
      'authenticated',
      'authenticated'
    );
    
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (new_user_id, 'artisan@artisanflow.app', 'Artisan Test', 'artisan', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET role = 'artisan', full_name = 'Artisan Test';
    
    RAISE NOTICE '✅ Compte artisan créé : artisan@artisanflow.app / Test1234';
  END IF;
END $$;

-- ========================================
-- COMPTE 3 : USER TEST (lecture seule)
-- ========================================

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  new_user_id := gen_random_uuid();
  
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'user@artisanflow.app') THEN
    RAISE NOTICE 'L''utilisateur user@artisanflow.app existe déjà';
  ELSE
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
      'user@artisanflow.app',
      crypt('Test1234', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"User Test"}',
      false,
      'authenticated',
      'authenticated'
    );
    
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (new_user_id, 'user@artisanflow.app', 'User Test', 'user', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET role = 'user', full_name = 'User Test';
    
    RAISE NOTICE '✅ Compte user créé : user@artisanflow.app / Test1234';
  END IF;
END $$;

-- ========================================
-- VÉRIFICATION FINALE
-- ========================================

SELECT 
  '✅ Comptes de test créés avec succès !' as status,
  (SELECT COUNT(*) FROM public.profiles WHERE email LIKE '%@artisanflow.app') as test_accounts_count;

-- Afficher tous les comptes de test
SELECT 
  u.email,
  p.full_name,
  p.role,
  u.email_confirmed_at,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE '%@artisanflow.app'
ORDER BY p.role DESC, u.created_at DESC;

-- ============================================
-- RÉCAPITULATIF DES COMPTES CRÉÉS
-- ============================================
-- 
-- 1. ADMIN (accès complet)
--    Email    : test@artisanflow.app
--    Password : Test1234
--    Rôle     : admin
--
-- 2. ARTISAN (accès standard)
--    Email    : artisan@artisanflow.app
--    Password : Test1234
--    Rôle     : artisan
--
-- 3. USER (lecture seule)
--    Email    : user@artisanflow.app
--    Password : Test1234
--    Rôle     : user
--
-- Tous les comptes sont confirmés et prêts à l'emploi ✅
-- ============================================

