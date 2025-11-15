-- ============================================
-- TABLES POUR IA CONVERSATIONNELLE DEVIS
-- ============================================
-- Tables pour gérer les sessions de génération
-- de devis IA avec mode conversationnel (Q/R)
-- ============================================

-- ========================================
-- TABLE 1 : SESSIONS IA DEVIS
-- ========================================
-- Stocke le contexte de chaque conversation IA

CREATE TABLE IF NOT EXISTS public.devis_ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- Contexte conversationnel (historique des échanges)
  context_json JSONB DEFAULT '{
    "tours": [],
    "transcription_initiale": "",
    "reponses_artisan": []
  }'::jsonb,
  
  -- Statut de la session
  status TEXT DEFAULT 'pending', -- 'pending', 'questions', 'ready', 'validated', 'cancelled'
  
  -- Nombre de tours de Q/R effectués
  tour_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_devis_ai_sessions_user_id ON public.devis_ai_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_devis_ai_sessions_project_id ON public.devis_ai_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_devis_ai_sessions_status ON public.devis_ai_sessions(status);
CREATE INDEX IF NOT EXISTS idx_devis_ai_sessions_created_at ON public.devis_ai_sessions(created_at DESC);

-- Désactiver RLS pour le MVP
ALTER TABLE public.devis_ai_sessions DISABLE ROW LEVEL SECURITY;

-- ========================================
-- TABLE 2 : DEVIS TEMPORAIRES IA
-- ========================================
-- Stocke les versions successives du devis IA

CREATE TABLE IF NOT EXISTS public.devis_temp_ai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.devis_ai_sessions(id) ON DELETE CASCADE,
  
  -- JSON du devis généré par l'IA
  json_devis JSONB NOT NULL,
  
  -- Questions en attente de réponse
  questions_pending JSONB DEFAULT '[]'::jsonb,
  
  -- Version du devis (incrémenté à chaque tour)
  version INTEGER DEFAULT 1,
  
  -- Validation
  is_validated BOOLEAN DEFAULT false,
  validated_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_devis_temp_ai_session_id ON public.devis_temp_ai(session_id);
CREATE INDEX IF NOT EXISTS idx_devis_temp_ai_version ON public.devis_temp_ai(session_id, version DESC);

-- Désactiver RLS pour le MVP
ALTER TABLE public.devis_temp_ai DISABLE ROW LEVEL SECURITY;

-- ========================================
-- TABLE 3 : HISTORIQUE TARIFS ARTISAN
-- ========================================
-- Pour apprendre des tarifs habituels de l'artisan

CREATE TABLE IF NOT EXISTS public.user_price_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Description de la prestation
  description TEXT NOT NULL,
  
  -- Catégorie (électricité, plomberie, etc.)
  category TEXT,
  
  -- Tarifs
  prix_unitaire DECIMAL(10, 2) NOT NULL,
  unite TEXT DEFAULT 'unité', -- 'unité', 'm²', 'ml', 'forfait', 'heure'
  
  -- Fréquence d'utilisation (pour pondérer les suggestions IA)
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_price_stats_user_id ON public.user_price_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_price_stats_category ON public.user_price_stats(category);
CREATE INDEX IF NOT EXISTS idx_user_price_stats_usage ON public.user_price_stats(user_id, usage_count DESC);

-- Désactiver RLS pour le MVP
ALTER TABLE public.user_price_stats DISABLE ROW LEVEL SECURITY;

-- ========================================
-- FONCTION : METTRE À JOUR updated_at
-- ========================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour devis_ai_sessions
DROP TRIGGER IF EXISTS update_devis_ai_sessions_updated_at ON public.devis_ai_sessions;
CREATE TRIGGER update_devis_ai_sessions_updated_at
  BEFORE UPDATE ON public.devis_ai_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour user_price_stats
DROP TRIGGER IF EXISTS update_user_price_stats_updated_at ON public.user_price_stats;
CREATE TRIGGER update_user_price_stats_updated_at
  BEFORE UPDATE ON public.user_price_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- VÉRIFICATION
-- ========================================

SELECT 
  '✅ Tables IA conversationnelle créées avec succès !' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'devis_ai_sessions') as sessions_table,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'devis_temp_ai') as temp_devis_table,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_price_stats') as price_stats_table;

-- Afficher la structure
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('devis_ai_sessions', 'devis_temp_ai', 'user_price_stats')
ORDER BY table_name, ordinal_position;

-- ============================================
-- NOTES D'UTILISATION
-- ============================================
-- 
-- WORKFLOW :
-- 
-- 1. Artisan enregistre une note vocale
--    → Transcription Whisper
--    → Création d'une session : INSERT INTO devis_ai_sessions
-- 
-- 2. Edge Function analyse la transcription
--    → Génère un devis JSON + questions
--    → INSERT INTO devis_temp_ai (version 1)
--    → UPDATE devis_ai_sessions SET status = 'questions'
-- 
-- 3. Artisan répond aux questions
--    → Edge Function met à jour le contexte
--    → Génère un nouveau devis JSON
--    → INSERT INTO devis_temp_ai (version 2)
--    → Si plus de questions : status = 'ready'
-- 
-- 4. Artisan valide le devis
--    → UPDATE devis_temp_ai SET is_validated = true
--    → INSERT INTO devis + devis_lignes
--    → UPDATE devis_ai_sessions SET status = 'validated'
-- 
-- ============================================

