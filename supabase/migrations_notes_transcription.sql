-- Migration pour ajouter les colonnes transcription et analysis_data à la table notes
-- À exécuter UNE FOIS dans Supabase SQL Editor

ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS transcription TEXT,
  ADD COLUMN IF NOT EXISTS analysis_data JSONB;

-- Index optionnel pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_notes_transcription ON public.notes(transcription) 
  WHERE transcription IS NOT NULL;

-- Commentaires pour documentation
COMMENT ON COLUMN public.notes.transcription IS 'Texte transcrit d''une note vocale ou contenu d''une note texte';
COMMENT ON COLUMN public.notes.analysis_data IS 'Données JSON d''analyse IA (type, prestations détectées, etc.)';

