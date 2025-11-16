-- ============================================
-- AJOUTER COLONNE analysis_data À LA TABLE notes
-- ============================================
-- Cette colonne stocke l'analyse GPT des notes vocales
-- (type de note, détection de prestation, etc.)
-- ============================================

-- Ajouter la colonne analysis_data
ALTER TABLE public.notes
ADD COLUMN IF NOT EXISTS analysis_data JSONB;

-- Commentaire pour documentation
COMMENT ON COLUMN public.notes.analysis_data IS 'Analyse GPT de la note (type, détection prestation, etc.) au format JSON';

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que la colonne a été ajoutée
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'notes'
  AND column_name = 'analysis_data';

-- Afficher la structure complète de la table notes
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'notes'
ORDER BY ordinal_position;

