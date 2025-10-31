-- Script SQL pour créer les tables manquantes dans Supabase
-- À exécuter dans le SQL Editor de Supabase
-- Compatible avec UUID (format par défaut de Supabase)

-- 1. Table client_photos
CREATE TABLE IF NOT EXISTS client_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Clé étrangère vers clients
  CONSTRAINT fk_client FOREIGN KEY (client_id) 
    REFERENCES clients(id) ON DELETE CASCADE
);

-- Créer un index pour les recherches par client
CREATE INDEX IF NOT EXISTS idx_client_photos_client_id ON client_photos(client_id);

-- 2. Vérifier que project_photos existe, sinon la créer
CREATE TABLE IF NOT EXISTS project_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Clé étrangère vers projects
  CONSTRAINT fk_project FOREIGN KEY (project_id) 
    REFERENCES projects(id) ON DELETE CASCADE
);

-- Créer un index pour les recherches par projet
CREATE INDEX IF NOT EXISTS idx_project_photos_project_id ON project_photos(project_id);

-- 3. Vérifier que notes existe, sinon la créer
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'voice',
  storage_path TEXT,
  transcription TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Clé étrangère vers projects
  CONSTRAINT fk_notes_project FOREIGN KEY (project_id) 
    REFERENCES projects(id) ON DELETE CASCADE
);

-- Créer un index pour les recherches par projet
CREATE INDEX IF NOT EXISTS idx_notes_project_id ON notes(project_id);

-- 4. Désactiver RLS pour toutes ces tables
ALTER TABLE client_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;

