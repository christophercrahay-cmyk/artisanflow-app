-- ============================================
-- FIX RLS - TABLE DEVIS_AI_SESSIONS
-- ============================================
-- Corrige les policies pour permettre la création
-- de sessions IA
-- ============================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Users can view their own devis ai sessions" ON public.devis_ai_sessions;
DROP POLICY IF EXISTS "Users can insert their own devis ai sessions" ON public.devis_ai_sessions;
DROP POLICY IF EXISTS "Users can update their own devis ai sessions" ON public.devis_ai_sessions;
DROP POLICY IF EXISTS "Users can delete their own devis ai sessions" ON public.devis_ai_sessions;

-- Créer les nouvelles policies
CREATE POLICY "Users can view their own devis ai sessions"
  ON public.devis_ai_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devis ai sessions"
  ON public.devis_ai_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devis ai sessions"
  ON public.devis_ai_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devis ai sessions"
  ON public.devis_ai_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- MÊME CHOSE POUR DEVIS_TEMP_AI
-- ============================================

DROP POLICY IF EXISTS "Users can view their own devis temp ai" ON public.devis_temp_ai;
DROP POLICY IF EXISTS "Users can insert their own devis temp ai" ON public.devis_temp_ai;
DROP POLICY IF EXISTS "Users can update their own devis temp ai" ON public.devis_temp_ai;
DROP POLICY IF EXISTS "Users can delete their own devis temp ai" ON public.devis_temp_ai;

CREATE POLICY "Users can view their own devis temp ai"
  ON public.devis_temp_ai
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.devis_ai_sessions WHERE id = session_id
    )
  );

CREATE POLICY "Users can insert their own devis temp ai"
  ON public.devis_temp_ai
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.devis_ai_sessions WHERE id = session_id
    )
  );

CREATE POLICY "Users can update their own devis temp ai"
  ON public.devis_temp_ai
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.devis_ai_sessions WHERE id = session_id
    )
  );

CREATE POLICY "Users can delete their own devis temp ai"
  ON public.devis_temp_ai
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.devis_ai_sessions WHERE id = session_id
    )
  );

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier RLS
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('devis_ai_sessions', 'devis_temp_ai');

-- Vérifier les policies
SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename IN ('devis_ai_sessions', 'devis_temp_ai')
ORDER BY tablename, cmd;

-- Message de confirmation
SELECT '✅ Policies corrigées - La génération de devis IA devrait fonctionner' as resultat;

