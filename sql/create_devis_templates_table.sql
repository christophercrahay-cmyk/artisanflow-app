-- ============================================
-- TABLE DEVIS_TEMPLATES
-- ============================================
-- Pour stocker les templates de devis réutilisables
-- Un template contient plusieurs lignes pré-définies
-- ============================================

CREATE TABLE IF NOT EXISTS public.devis_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations du template
  name TEXT NOT NULL, -- Ex: "Rénovation cuisine", "Plomberie standard"
  description TEXT, -- Description optionnelle
  category TEXT, -- Ex: "Plomberie", "Électricité", "Peinture", "Général"
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les lignes des templates
CREATE TABLE IF NOT EXISTS public.devis_template_lignes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.devis_templates(id) ON DELETE CASCADE,
  
  -- Détails de la ligne (même structure que devis_lignes)
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
CREATE INDEX IF NOT EXISTS idx_devis_templates_user_id ON public.devis_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_devis_templates_category ON public.devis_templates(category);
CREATE INDEX IF NOT EXISTS idx_devis_template_lignes_template_id ON public.devis_template_lignes(template_id);
CREATE INDEX IF NOT EXISTS idx_devis_template_lignes_ordre ON public.devis_template_lignes(template_id, ordre);

-- RLS (Row Level Security)
ALTER TABLE public.devis_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis_template_lignes ENABLE ROW LEVEL SECURITY;

-- Policies pour devis_templates
CREATE POLICY "Users can view their own templates"
  ON public.devis_templates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates"
  ON public.devis_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON public.devis_templates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON public.devis_templates
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies pour devis_template_lignes
CREATE POLICY "Users can view their own template lignes"
  ON public.devis_template_lignes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.devis_templates
      WHERE devis_templates.id = devis_template_lignes.template_id
      AND devis_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own template lignes"
  ON public.devis_template_lignes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.devis_templates
      WHERE devis_templates.id = devis_template_lignes.template_id
      AND devis_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own template lignes"
  ON public.devis_template_lignes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.devis_templates
      WHERE devis_templates.id = devis_template_lignes.template_id
      AND devis_templates.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.devis_templates
      WHERE devis_templates.id = devis_template_lignes.template_id
      AND devis_templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own template lignes"
  ON public.devis_template_lignes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.devis_templates
      WHERE devis_templates.id = devis_template_lignes.template_id
      AND devis_templates.user_id = auth.uid()
    )
  );

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_devis_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_devis_templates_updated_at
  BEFORE UPDATE ON public.devis_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_devis_templates_updated_at();

-- Vérification
SELECT 
  '✅ Tables devis_templates créées avec succès !' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'devis_templates') as templates_table_exists,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'devis_template_lignes') as lignes_table_exists;

-- ============================================
-- EXEMPLE D'UTILISATION
-- ============================================
-- 
-- -- Créer un template
-- INSERT INTO devis_templates (user_id, name, description, category)
-- VALUES (auth.uid(), 'Plomberie standard', 'Template pour interventions plomberie courantes', 'Plomberie')
-- RETURNING id;
-- 
-- -- Ajouter des lignes au template
-- INSERT INTO devis_template_lignes (template_id, description, quantite, unite, prix_unitaire, prix_total, ordre)
-- VALUES 
--   ('uuid-template', 'Déplacement', 1, 'forfait', 50.00, 50.00, 1),
--   ('uuid-template', 'Main d''œuvre', 2, 'heure', 45.00, 90.00, 2),
--   ('uuid-template', 'Fourniture', 1, 'unité', 25.00, 25.00, 3);
-- 
-- ============================================

