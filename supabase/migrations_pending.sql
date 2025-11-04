-- ========================================
-- MIGRATION: Ajout de user_id à toutes les tables
-- ========================================
-- Date: 2025-11-04
-- Raison: Le code utilise user_id partout mais les tables ne l'ont pas
-- Erreur: PGRST204 - Could not find the 'user_id' column

-- ========================================
-- ÉTAPE 1: Ajouter les colonnes user_id
-- ========================================

-- Table clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Table projects  
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Table notes
ALTER TABLE public.notes
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Table project_photos
ALTER TABLE public.project_photos
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Table client_photos
ALTER TABLE public.client_photos
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Table devis
ALTER TABLE public.devis
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Table factures
ALTER TABLE public.factures
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Table brand_settings
ALTER TABLE public.brand_settings
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ========================================
-- ÉTAPE 2: Créer les index pour performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_project_photos_user_id ON public.project_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_client_photos_user_id ON public.client_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_devis_user_id ON public.devis(user_id);
CREATE INDEX IF NOT EXISTS idx_factures_user_id ON public.factures(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_settings_user_id ON public.brand_settings(user_id);

-- ========================================
-- ÉTAPE 3: Commentaires pour documentation
-- ========================================

COMMENT ON COLUMN public.clients.user_id IS 'ID de l''utilisateur propriétaire';
COMMENT ON COLUMN public.projects.user_id IS 'ID de l''utilisateur propriétaire';
COMMENT ON COLUMN public.notes.user_id IS 'ID de l''utilisateur propriétaire';
COMMENT ON COLUMN public.project_photos.user_id IS 'ID de l''utilisateur propriétaire';
COMMENT ON COLUMN public.client_photos.user_id IS 'ID de l''utilisateur propriétaire';
COMMENT ON COLUMN public.devis.user_id IS 'ID de l''utilisateur propriétaire';
COMMENT ON COLUMN public.factures.user_id IS 'ID de l''utilisateur propriétaire';
COMMENT ON COLUMN public.brand_settings.user_id IS 'ID de l''utilisateur propriétaire';

-- ========================================
-- MESSAGE DE CONFIRMATION
-- ========================================

SELECT '✅ Migration terminée: toutes les colonnes user_id ont été ajoutées!' as status;

