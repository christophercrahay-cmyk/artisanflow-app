-- ============================================
-- AJOUT COLONNE TYPE À DEVIS_AI_SESSIONS
-- ============================================
-- Permet de différencier les sessions devis/facture
-- ============================================

-- Ajouter la colonne type si elle n'existe pas
ALTER TABLE devis_ai_sessions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'devis';

-- Créer un index sur type pour des recherches plus rapides (optionnel)
CREATE INDEX IF NOT EXISTS idx_devis_ai_sessions_type ON devis_ai_sessions(type);

-- Mettre à jour les sessions existantes sans type (par défaut = 'devis')
UPDATE devis_ai_sessions 
SET type = 'devis' 
WHERE type IS NULL;

-- Vérification
SELECT 
  '✅ Colonne type ajoutée avec succès !' as status,
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'devis_ai_sessions' 
  AND column_name = 'type';

-- ============================================










