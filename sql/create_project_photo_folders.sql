-- ============================================
-- CRÉATION SYSTÈME DOSSIERS PHOTOS CHANTIER
-- ============================================
-- Permet d'organiser les photos de chantier en dossiers
-- ============================================

-- Table des dossiers de photos de chantier
CREATE TABLE IF NOT EXISTS project_photo_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Couleur optionnelle pour le dossier (ex: #FF5733)
  order_index INTEGER DEFAULT 0, -- Ordre d'affichage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contrainte : un nom de dossier unique par projet et utilisateur
  CONSTRAINT unique_folder_name_per_project UNIQUE (project_id, user_id, name)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_project_photo_folders_project_id ON project_photo_folders(project_id);
CREATE INDEX IF NOT EXISTS idx_project_photo_folders_user_id ON project_photo_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_project_photo_folders_order ON project_photo_folders(project_id, order_index);

-- Ajouter folder_id à project_photos si elle n'existe pas
ALTER TABLE project_photos ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES project_photo_folders(id) ON DELETE SET NULL;

-- Index pour folder_id
CREATE INDEX IF NOT EXISTS idx_project_photos_folder_id ON project_photos(folder_id);

-- RLS (Row Level Security)
ALTER TABLE project_photo_folders ENABLE ROW LEVEL SECURITY;

-- Policy : Les utilisateurs peuvent voir leurs propres dossiers
CREATE POLICY "Users can view their own photo folders"
  ON project_photo_folders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent créer leurs propres dossiers
CREATE POLICY "Users can create their own photo folders"
  ON project_photo_folders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent modifier leurs propres dossiers
CREATE POLICY "Users can update their own photo folders"
  ON project_photo_folders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent supprimer leurs propres dossiers
CREATE POLICY "Users can delete their own photo folders"
  ON project_photo_folders
  FOR DELETE
  USING (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_project_photo_folders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_project_photo_folders_updated_at ON project_photo_folders;
CREATE TRIGGER trigger_update_project_photo_folders_updated_at
  BEFORE UPDATE ON project_photo_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_project_photo_folders_updated_at();

-- Vérification
SELECT 
  '✅ Table project_photo_folders créée avec succès !' as status,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'project_photo_folders'
ORDER BY ordinal_position;

SELECT 
  '✅ Colonne folder_id ajoutée à project_photos !' as status,
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'project_photos' 
  AND column_name = 'folder_id';

-- ============================================







