-- ============================================
-- FIX RLS DELETE - TOUTES LES TABLES
-- ============================================
-- Ajoute ou corrige les policies DELETE sur toutes
-- les tables pour permettre aux users de supprimer
-- leurs propres données
-- ============================================

-- ============================================
-- 1. NOTES
-- ============================================

DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;
DROP POLICY IF EXISTS "notes_delete_policy" ON public.notes;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.notes;

CREATE POLICY "Users can delete their own notes"
  ON public.notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 2. CLIENTS
-- ============================================

DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;
DROP POLICY IF EXISTS "clients_delete_policy" ON public.clients;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.clients;

CREATE POLICY "Users can delete their own clients"
  ON public.clients
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. PROJECTS
-- ============================================

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON public.projects;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.projects;

CREATE POLICY "Users can delete their own projects"
  ON public.projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. PROJECT_PHOTOS
-- ============================================

DROP POLICY IF EXISTS "Users can delete their own project photos" ON public.project_photos;
DROP POLICY IF EXISTS "project_photos_delete_policy" ON public.project_photos;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.project_photos;

CREATE POLICY "Users can delete their own project photos"
  ON public.project_photos
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.projects WHERE id = project_id
    )
  );

-- ============================================
-- 5. CLIENT_PHOTOS
-- ============================================

DROP POLICY IF EXISTS "Users can delete their own client photos" ON public.client_photos;
DROP POLICY IF EXISTS "client_photos_delete_policy" ON public.client_photos;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.client_photos;

CREATE POLICY "Users can delete their own client photos"
  ON public.client_photos
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.clients WHERE id = client_id
    )
  );

-- ============================================
-- 6. DEVIS
-- ============================================

DROP POLICY IF EXISTS "Users can delete their own devis" ON public.devis;
DROP POLICY IF EXISTS "devis_delete_policy" ON public.devis;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.devis;

CREATE POLICY "Users can delete their own devis"
  ON public.devis
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. DEVIS_LIGNES
-- ============================================

DROP POLICY IF EXISTS "Users can delete their own devis lignes" ON public.devis_lignes;
DROP POLICY IF EXISTS "devis_lignes_delete_policy" ON public.devis_lignes;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.devis_lignes;

CREATE POLICY "Users can delete their own devis lignes"
  ON public.devis_lignes
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.devis WHERE id = devis_id
    )
  );

-- ============================================
-- 8. FACTURES
-- ============================================

DROP POLICY IF EXISTS "Users can delete their own factures" ON public.factures;
DROP POLICY IF EXISTS "factures_delete_policy" ON public.factures;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.factures;

CREATE POLICY "Users can delete their own factures"
  ON public.factures
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 9. BRAND_SETTINGS
-- ============================================

DROP POLICY IF EXISTS "Users can delete their own brand settings" ON public.brand_settings;
DROP POLICY IF EXISTS "brand_settings_delete_policy" ON public.brand_settings;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.brand_settings;

CREATE POLICY "Users can delete their own brand settings"
  ON public.brand_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 10. DEVIS_AI_SESSIONS
-- ============================================

DROP POLICY IF EXISTS "Users can delete their own devis ai sessions" ON public.devis_ai_sessions;
DROP POLICY IF EXISTS "devis_ai_sessions_delete_policy" ON public.devis_ai_sessions;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.devis_ai_sessions;

CREATE POLICY "Users can delete their own devis ai sessions"
  ON public.devis_ai_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 11. DEVIS_TEMP_AI
-- ============================================

DROP POLICY IF EXISTS "Users can delete their own devis temp ai" ON public.devis_temp_ai;
DROP POLICY IF EXISTS "devis_temp_ai_delete_policy" ON public.devis_temp_ai;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.devis_temp_ai;

CREATE POLICY "Users can delete their own devis temp ai"
  ON public.devis_temp_ai
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.devis_ai_sessions WHERE id = session_id
    )
  );

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================

-- Compter les policies DELETE créées
SELECT 
  tablename,
  COUNT(*) FILTER (WHERE cmd = 'DELETE') as delete_policies
FROM pg_policies
WHERE tablename IN (
  'notes', 'clients', 'projects', 'project_photos', 'client_photos',
  'devis', 'devis_lignes', 'factures', 'brand_settings',
  'devis_ai_sessions', 'devis_temp_ai'
)
GROUP BY tablename
ORDER BY tablename;

-- Message de confirmation
SELECT '✅ Policies DELETE créées sur toutes les tables - Les utilisateurs peuvent maintenant supprimer leurs données' as resultat;

