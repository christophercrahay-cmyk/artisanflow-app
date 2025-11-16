-- ============================================
-- TABLE DEVIS_LIGNES
-- ============================================
-- Pour stocker les lignes de devis de manière structurée
-- Au lieu de les mettre dans le champ "notes" (TEXT)
-- ============================================

CREATE TABLE IF NOT EXISTS public.devis_lignes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id UUID NOT NULL REFERENCES public.devis(id) ON DELETE CASCADE,
  
  -- Détails de la ligne
  description TEXT NOT NULL,
  quantite DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unite TEXT DEFAULT 'unité', -- 'unité', 'm²', 'ml', 'forfait', 'heure'
  prix_unitaire DECIMAL(10, 2) NOT NULL,
  prix_total DECIMAL(10, 2) NOT NULL,
  
  -- Ordre d'affichage
  ordre INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_devis_lignes_devis_id ON public.devis_lignes(devis_id);
CREATE INDEX IF NOT EXISTS idx_devis_lignes_ordre ON public.devis_lignes(devis_id, ordre);

-- Désactiver RLS pour le MVP
ALTER TABLE public.devis_lignes DISABLE ROW LEVEL SECURITY;

-- Vérification
SELECT 
  '✅ Table devis_lignes créée avec succès !' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'devis_lignes') as table_exists;

-- ============================================
-- EXEMPLE D'UTILISATION
-- ============================================
-- 
-- INSERT INTO devis_lignes (devis_id, description, quantite, unite, prix_unitaire, prix_total, ordre)
-- VALUES 
--   ('uuid-devis', 'Prise électrique encastrée', 8, 'unité', 45.00, 360.00, 1),
--   ('uuid-devis', 'Interrupteur simple', 3, 'unité', 30.00, 90.00, 2);
-- 
-- ============================================

