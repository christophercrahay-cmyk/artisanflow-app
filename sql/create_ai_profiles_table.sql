-- ============================================
-- TABLE AI_PROFILES
-- ============================================
-- Profil IA personnalisé pour chaque artisan
-- Apprend automatiquement les prix moyens
-- à partir des devis créés
-- ============================================

CREATE TABLE IF NOT EXISTS public.ai_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Statistiques de prix (moyennes, min, max, nombre de lignes)
  -- Structure JSON exemple :
  -- prise_electrique: avg 45.0, count 23, min 35.0, max 55.0
  -- interrupteur: avg 30.0, count 18, min 25.0, max 40.0
  avg_prices JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Métadonnées d'apprentissage
  experience_score FLOAT NOT NULL DEFAULT 0.0,  -- 0 à 100 (augmente avec le nombre de devis)
  total_devis INTEGER NOT NULL DEFAULT 0,       -- Nombre total de devis créés
  total_lignes INTEGER NOT NULL DEFAULT 0,      -- Nombre total de lignes analysées
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Contrainte : un seul profil par utilisateur
  CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- ============================================
-- INDEX
-- ============================================

CREATE INDEX IF NOT EXISTS idx_ai_profiles_user_id
  ON public.ai_profiles(user_id);

-- ============================================
-- RLS (ROW LEVEL SECURITY)
-- ============================================

ALTER TABLE public.ai_profiles ENABLE ROW LEVEL SECURITY;

-- Policy SELECT : l'utilisateur peut voir son propre profil
CREATE POLICY "Users can view their own AI profile"
  ON public.ai_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Policy INSERT : l'utilisateur peut créer son propre profil
CREATE POLICY "Users can insert their own AI profile"
  ON public.ai_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy UPDATE : l'utilisateur peut modifier son propre profil
CREATE POLICY "Users can update their own AI profile"
  ON public.ai_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ⚠️ Pas de policy DELETE pour l'instant (sécurité)

-- ============================================
-- COMMENTAIRES
-- ============================================

COMMENT ON TABLE public.ai_profiles IS 'Profil IA personnalisé de chaque artisan - Apprend automatiquement les prix moyens';
COMMENT ON COLUMN public.ai_profiles.avg_prices IS 'Statistiques de prix par type de poste (JSON: clé → {avg, count, min, max})';
COMMENT ON COLUMN public.ai_profiles.experience_score IS 'Score d''expérience (0-100) basé sur le nombre de devis créés';
COMMENT ON COLUMN public.ai_profiles.total_devis IS 'Nombre total de devis créés par l''artisan';
COMMENT ON COLUMN public.ai_profiles.total_lignes IS 'Nombre total de lignes de devis analysées';

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que la table a été créée
SELECT 
  '✅ Table ai_profiles créée avec succès !' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'ai_profiles') as table_exists;

-- Vérifier la structure de la table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'ai_profiles'
ORDER BY ordinal_position;

-- Vérifier que RLS est activé
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'ai_profiles';

-- Vérifier les policies
SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Lecture'
    WHEN cmd = 'INSERT' THEN 'Création'
    WHEN cmd = 'UPDATE' THEN 'Modification'
    WHEN cmd = 'DELETE' THEN 'Suppression'
  END as operation_fr
FROM pg_policies
WHERE tablename = 'ai_profiles'
ORDER BY cmd;

-- ============================================
-- EXEMPLE D UTILISATION
-- ============================================
-- 
-- Creer un profil IA pour un utilisateur :
-- INSERT INTO ai_profiles (user_id) VALUES ('user-uuid-here');
-- 
-- Mettre a jour les prix moyens :
-- UPDATE ai_profiles SET avg_prices = '{"prise_electrique": {"avg": 45.0}}'::jsonb
-- WHERE user_id = 'user-uuid-here';
-- 
-- ============================================

