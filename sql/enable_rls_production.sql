-- ============================================
-- ACTIVER RLS (ROW LEVEL SECURITY) - PRODUCTION
-- ============================================
-- ⚠️ CRITIQUE: À exécuter avant mise en production
-- ============================================AC

-- ============================================
-- 1. ACTIVER RLS SUR TOUTES LES TABLES
-- ============================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis_lignes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis_ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis_temp_ai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. POLICIES POUR CLIENTS
-- ============================================

CREATE POLICY "Users can view their own clients"
  ON public.clients FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own clients"
  ON public.clients FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own clients"
  ON public.clients FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own clients"
  ON public.clients FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 3. POLICIES POUR PROJECTS
-- ============================================

CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 4. POLICIES POUR NOTES
-- ============================================

CREATE POLICY "Users can view notes from their projects"
  ON public.notes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = notes.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert notes in their projects"
  ON public.notes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = notes.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update notes in their projects"
  ON public.notes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = notes.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete notes in their projects"
  ON public.notes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = notes.project_id
    AND projects.user_id = auth.uid()
  ));

-- ============================================
-- 5. POLICIES POUR DEVIS
-- ============================================

CREATE POLICY "Users can view devis from their projects"
  ON public.devis FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = devis.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert devis in their projects"
  ON public.devis FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = devis.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update devis in their projects"
  ON public.devis FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = devis.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete devis in their projects"
  ON public.devis FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = devis.project_id
    AND projects.user_id = auth.uid()
  ));

-- ============================================
-- 6. POLICIES POUR DEVIS_LIGNES
-- ============================================

CREATE POLICY "Users can view lines from their devis"
  ON public.devis_lignes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.devis
    JOIN public.projects ON projects.id = devis.project_id
    WHERE devis.id = devis_lignes.devis_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert lines in their devis"
  ON public.devis_lignes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.devis
    JOIN public.projects ON projects.id = devis.project_id
    WHERE devis.id = devis_lignes.devis_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update lines in their devis"
  ON public.devis_lignes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.devis
    JOIN public.projects ON projects.id = devis.project_id
    WHERE devis.id = devis_lignes.devis_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete lines in their devis"
  ON public.devis_lignes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.devis
    JOIN public.projects ON projects.id = devis.project_id
    WHERE devis.id = devis_lignes.devis_id
    AND projects.user_id = auth.uid()
  ));

-- ============================================
-- 7. POLICIES POUR FACTURES
-- ============================================

CREATE POLICY "Users can view factures from their projects"
  ON public.factures FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = factures.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert factures in their projects"
  ON public.factures FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = factures.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update factures in their projects"
  ON public.factures FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = factures.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete factures in their projects"
  ON public.factures FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = factures.project_id
    AND projects.user_id = auth.uid()
  ));

-- ============================================
-- 8. POLICIES POUR BRAND_SETTINGS
-- ============================================

CREATE POLICY "Users can view their own settings"
  ON public.brand_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own settings"
  ON public.brand_settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own settings"
  ON public.brand_settings FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own settings"
  ON public.brand_settings FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 9. POLICIES POUR PHOTOS
-- ============================================

CREATE POLICY "Users can view photos from their projects"
  ON public.project_photos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_photos.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert photos in their projects"
  ON public.project_photos FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_photos.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete photos from their projects"
  ON public.project_photos FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_photos.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can view photos from their clients"
  ON public.client_photos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = client_photos.client_id
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert photos for their clients"
  ON public.client_photos FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = client_photos.client_id
    AND clients.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete photos from their clients"
  ON public.client_photos FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = client_photos.client_id
    AND clients.user_id = auth.uid()
  ));

-- ============================================
-- 10. POLICIES POUR DEVIS_AI_SESSIONS
-- ============================================

CREATE POLICY "Users can view their own AI sessions"
  ON public.devis_ai_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own AI sessions"
  ON public.devis_ai_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own AI sessions"
  ON public.devis_ai_sessions FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- 11. POLICIES POUR DEVIS_TEMP_AI
-- ============================================

CREATE POLICY "Users can view their own temp devis"
  ON public.devis_temp_ai FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.devis_ai_sessions
    WHERE devis_ai_sessions.id = devis_temp_ai.session_id
    AND devis_ai_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own temp devis"
  ON public.devis_temp_ai FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.devis_ai_sessions
    WHERE devis_ai_sessions.id = devis_temp_ai.session_id
    AND devis_ai_sessions.user_id = auth.uid()
  ));

-- ============================================
-- 12. POLICIES POUR PROFILES
-- ============================================

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'clients', 'projects', 'notes', 'devis', 'devis_lignes',
  'factures', 'brand_settings', 'project_photos', 'client_photos',
  'devis_ai_sessions', 'devis_temp_ai', 'profiles'
)
ORDER BY tablename;

-- ✅ Toutes les tables doivent avoir rls_enabled = true

-- ============================================
-- TEST
-- ============================================
-- Se connecter avec 2 users différents et vérifier que :
-- 1. User A ne voit que ses propres données
-- 2. User B ne voit que ses propres données
-- 3. User A ne peut pas accéder aux données de User B
-- ============================================

