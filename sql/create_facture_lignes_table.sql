-- ============================================
-- TABLE FACTURE_LIGNES
-- ============================================
-- Pour stocker les lignes de facture de manière structurée
-- Identique à devis_lignes mais pour les factures
-- ============================================

CREATE TABLE IF NOT EXISTS public.facture_lignes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facture_id UUID NOT NULL REFERENCES public.factures(id) ON DELETE CASCADE,
  
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
CREATE INDEX IF NOT EXISTS idx_facture_lignes_facture_id ON public.facture_lignes(facture_id);
CREATE INDEX IF NOT EXISTS idx_facture_lignes_ordre ON public.facture_lignes(facture_id, ordre);

-- Désactiver RLS pour le MVP (à activer plus tard si nécessaire)
ALTER TABLE public.facture_lignes DISABLE ROW LEVEL SECURITY;

-- Vérification
SELECT 
  '✅ Table facture_lignes créée avec succès !' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'facture_lignes') as table_exists;

-- ============================================
-- EXEMPLE D'UTILISATION
-- ============================================
-- 
-- INSERT INTO facture_lignes (facture_id, description, quantite, unite, prix_unitaire, prix_total, ordre)
-- VALUES 
--   ('uuid-facture', 'Prise électrique encastrée', 8, 'unité', 45.00, 360.00, 1),
--   ('uuid-facture', 'Interrupteur simple', 3, 'unité', 30.00, 90.00, 2);
-- 
-- ============================================

