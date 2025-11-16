-- ============================================
-- TABLE : openai_usage
-- Tracking des tokens OpenAI par utilisateur
-- ============================================

CREATE TABLE IF NOT EXISTS openai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Type d'appel
  service TEXT NOT NULL CHECK (service IN ('whisper', 'gpt-4o-mini', 'gpt-4', 'dalle-3')),
  
  -- Tokens utilisés
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER NOT NULL,
  
  -- Coût estimé (en centimes d'euro)
  estimated_cost_cents INTEGER DEFAULT 0,
  
  -- Contexte
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  devis_id UUID REFERENCES devis(id) ON DELETE SET NULL,
  
  -- Métadonnées
  model_version TEXT,
  duration_ms INTEGER, -- Durée de l'appel
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEX
-- ============================================

-- Index pour requêtes par utilisateur
CREATE INDEX IF NOT EXISTS idx_openai_usage_user_id ON openai_usage(user_id);

-- Index pour requêtes par date
CREATE INDEX IF NOT EXISTS idx_openai_usage_created_at ON openai_usage(created_at DESC);

-- Index composite pour stats par user + date
CREATE INDEX IF NOT EXISTS idx_openai_usage_user_date ON openai_usage(user_id, created_at DESC);

-- Index pour requêtes par service
CREATE INDEX IF NOT EXISTS idx_openai_usage_service ON openai_usage(service);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE openai_usage ENABLE ROW LEVEL SECURITY;

-- Policy : Utilisateurs peuvent voir uniquement leurs propres usages
CREATE POLICY openai_usage_select_policy ON openai_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy : Insertion automatique via app (user_id = auth.uid())
CREATE POLICY openai_usage_insert_policy ON openai_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- VUE : Stats mensuelles par utilisateur
-- ============================================

CREATE OR REPLACE VIEW openai_usage_monthly_stats AS
SELECT 
  user_id,
  DATE_TRUNC('month', created_at) AS month,
  service,
  COUNT(*) AS total_calls,
  SUM(total_tokens) AS total_tokens,
  SUM(estimated_cost_cents) AS total_cost_cents,
  AVG(duration_ms) AS avg_duration_ms
FROM openai_usage
GROUP BY user_id, DATE_TRUNC('month', created_at), service
ORDER BY month DESC, user_id, service;

-- ============================================
-- FONCTION : Calculer coût estimé
-- ============================================

CREATE OR REPLACE FUNCTION calculate_openai_cost(
  p_service TEXT,
  p_prompt_tokens INTEGER,
  p_completion_tokens INTEGER
) RETURNS INTEGER AS $$
DECLARE
  cost_cents INTEGER := 0;
BEGIN
  -- Tarifs OpenAI (novembre 2024)
  -- whisper : 0.006$ / minute (≈ 0.6 centimes)
  -- gpt-4o-mini : 0.15$ / 1M tokens input, 0.60$ / 1M tokens output
  -- gpt-4 : 30$ / 1M tokens input, 60$ / 1M tokens output
  
  IF p_service = 'whisper' THEN
    -- Approximation : 1 token ≈ 0.001 centime
    cost_cents := 1; -- Coût minimal
  ELSIF p_service = 'gpt-4o-mini' THEN
    -- Input : 0.15$ / 1M tokens = 0.000015 cents par token
    -- Output : 0.60$ / 1M tokens = 0.000060 cents par token
    cost_cents := CEIL(
      (p_prompt_tokens * 0.000015) + 
      (p_completion_tokens * 0.000060)
    );
  ELSIF p_service = 'gpt-4' THEN
    -- Input : 30$ / 1M tokens = 0.003 cents par token
    -- Output : 60$ / 1M tokens = 0.006 cents par token
    cost_cents := CEIL(
      (p_prompt_tokens * 0.003) + 
      (p_completion_tokens * 0.006)
    );
  END IF;
  
  RETURN cost_cents;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT 
  '✅ Table openai_usage créée avec succès !' AS status,
  COUNT(*) AS nombre_colonnes
FROM information_schema.columns 
WHERE table_name = 'openai_usage';

-- ============================================

