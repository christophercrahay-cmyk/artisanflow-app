-- ============================================
-- FIX RLS - PERMETTRE SUPPRESSION DES NOTES
-- ============================================
-- Ajoute ou corrige la policy DELETE sur notes
-- pour permettre aux users de supprimer leurs notes
-- ============================================

-- Supprimer l'ancienne policy DELETE si elle existe
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;
DROP POLICY IF EXISTS "notes_delete_policy" ON public.notes;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.notes;

-- Créer la nouvelle policy DELETE
CREATE POLICY "Users can delete their own notes"
  ON public.notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que RLS est activé
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'notes';

-- Vérifier toutes les policies sur notes
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
WHERE tablename = 'notes'
ORDER BY cmd;

-- Message de confirmation
SELECT '✅ Policy DELETE créée - Les utilisateurs peuvent maintenant supprimer leurs notes' as resultat;

