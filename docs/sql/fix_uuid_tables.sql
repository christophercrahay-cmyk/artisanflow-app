-- Script de correction pour les tables avec mauvais types
-- À exécuter dans le SQL Editor de Supabase

-- 1. Supprimer les tables mal créées (si elles existent)
DROP TABLE IF EXISTS client_photos CASCADE;
DROP TABLE IF EXISTS project_photos CASCADE;
DROP TABLE IF EXISTS notes CASCADE;

-- 2. Recréer les tables avec UUID
CREATE TABLE client_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE project_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  client_id UUID,
  user_id UUID NOT NULL,
  url TEXT NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  client_id UUID,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'voice',
  storage_path TEXT,
  transcription TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_notes_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_notes_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. Créer les index
CREATE INDEX idx_client_photos_client_id ON client_photos(client_id);
CREATE INDEX idx_project_photos_project_id ON project_photos(project_id);
CREATE INDEX idx_project_photos_client_id ON project_photos(client_id);
CREATE INDEX idx_project_photos_user_id ON project_photos(user_id);
CREATE INDEX idx_project_photos_taken_at ON project_photos(taken_at);
CREATE INDEX idx_notes_project_id ON notes(project_id);
CREATE INDEX idx_notes_client_id ON notes(client_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);

-- 4. Désactiver RLS
ALTER TABLE client_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;

