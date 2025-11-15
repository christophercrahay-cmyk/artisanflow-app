-- ============================================
-- Migration optionnelle : Ajouter user_id aux tables devis et factures
-- ============================================
-- Cette migration est optionnelle car le RLS peut fonctionner via projects.user_id
-- Mais ajouter user_id directement améliore les performances et la clarté
-- ============================================

-- 1. Ajouter user_id à la table devis (si pas déjà présent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'devis' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.devis 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    -- Mettre à jour les devis existants avec le user_id du projet associé
    UPDATE public.devis d
    SET user_id = p.user_id
    FROM public.projects p
    WHERE d.project_id = p.id AND d.user_id IS NULL;
    
    CREATE INDEX IF NOT EXISTS idx_devis_user_id ON public.devis(user_id);
    
    RAISE NOTICE '✅ Colonne user_id ajoutée à la table devis';
  ELSE
    RAISE NOTICE '⚠️ Colonne user_id existe déjà dans la table devis';
  END IF;
END $$;

-- 2. Ajouter user_id à la table factures (si pas déjà présent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'factures' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.factures 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    -- Mettre à jour les factures existantes avec le user_id du projet associé
    UPDATE public.factures f
    SET user_id = p.user_id
    FROM public.projects p
    WHERE f.project_id = p.id AND f.user_id IS NULL;
    
    CREATE INDEX IF NOT EXISTS idx_factures_user_id ON public.factures(user_id);
    
    RAISE NOTICE '✅ Colonne user_id ajoutée à la table factures';
  ELSE
    RAISE NOTICE '⚠️ Colonne user_id existe déjà dans la table factures';
  END IF;
END $$;

-- 3. Mettre à jour les RLS policies pour utiliser user_id directement (optionnel)
-- Si vous préférez utiliser projects.user_id, vous pouvez ignorer cette partie

-- Policy pour devis (si user_id existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'devis' AND column_name = 'user_id'
  ) THEN
    -- Supprimer les anciennes policies si elles existent
    DROP POLICY IF EXISTS "Users can select their own devis via user_id" ON public.devis;
    DROP POLICY IF EXISTS "Users can insert their own devis via user_id" ON public.devis;
    DROP POLICY IF EXISTS "Users can update their own devis via user_id" ON public.devis;
    DROP POLICY IF EXISTS "Users can delete their own devis via user_id" ON public.devis;
    
    -- Créer les nouvelles policies basées sur user_id
    CREATE POLICY "Users can select their own devis via user_id"
      ON public.devis FOR SELECT
      USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own devis via user_id"
      ON public.devis FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own devis via user_id"
      ON public.devis FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own devis via user_id"
      ON public.devis FOR DELETE
      USING (auth.uid() = user_id);
    
    RAISE NOTICE '✅ RLS policies mises à jour pour devis (basées sur user_id)';
  END IF;
END $$;

-- Policy pour factures (si user_id existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'factures' AND column_name = 'user_id'
  ) THEN
    -- Supprimer les anciennes policies si elles existent
    DROP POLICY IF EXISTS "Users can select their own factures via user_id" ON public.factures;
    DROP POLICY IF EXISTS "Users can insert their own factures via user_id" ON public.factures;
    DROP POLICY IF EXISTS "Users can update their own factures via user_id" ON public.factures;
    DROP POLICY IF EXISTS "Users can delete their own factures via user_id" ON public.factures;
    
    -- Créer les nouvelles policies basées sur user_id
    CREATE POLICY "Users can select their own factures via user_id"
      ON public.factures FOR SELECT
      USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own factures via user_id"
      ON public.factures FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own factures via user_id"
      ON public.factures FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own factures via user_id"
      ON public.factures FOR DELETE
      USING (auth.uid() = user_id);
    
    RAISE NOTICE '✅ RLS policies mises à jour pour factures (basées sur user_id)';
  END IF;
END $$;

SELECT '✅ Migration user_id terminée. Vérifiez les messages ci-dessus.' as status;

