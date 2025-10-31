-- ========================================
-- SCRIPT COMPLET D'INITIALISATION SUPABASE
-- ========================================
-- À exécuter dans le SQL Editor de Supabase
-- Copier-coller TOUT le contenu et cliquer RUN

-- ========================================
-- PARTIE 1 : TABLES DE BASE
-- ========================================

-- Supprimer les tables existantes si nécessaire
DROP TABLE IF EXISTS client_photos CASCADE;
DROP TABLE IF EXISTS project_photos CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS devis CASCADE;
DROP TABLE IF EXISTS factures CASCADE;

-- Créer les tables avec UUID
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
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'voice',
  storage_path TEXT,
  transcription TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_notes_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Créer les index
CREATE INDEX idx_client_photos_client_id ON client_photos(client_id);
CREATE INDEX idx_project_photos_project_id ON project_photos(project_id);
CREATE INDEX idx_notes_project_id ON notes(project_id);

-- Désactiver RLS pour les tables
ALTER TABLE client_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Créer tables Devis et Factures
CREATE TABLE devis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  client_id UUID NOT NULL,
  numero TEXT NOT NULL UNIQUE,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_validite DATE,
  montant_ht DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tva_percent DECIMAL(5, 2) DEFAULT 20.00,
  montant_ttc DECIMAL(10, 2) NOT NULL DEFAULT 0,
  statut TEXT DEFAULT 'brouillon',
  notes TEXT,
  transcription TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_devis_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_devis_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE factures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  client_id UUID NOT NULL,
  devis_id UUID,
  numero TEXT NOT NULL UNIQUE,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_echeance DATE,
  montant_ht DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tva_percent DECIMAL(5, 2) DEFAULT 20.00,
  montant_ttc DECIMAL(10, 2) NOT NULL DEFAULT 0,
  statut TEXT DEFAULT 'brouillon',
  notes TEXT,
  transcription TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_facture_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_facture_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_facture_devis FOREIGN KEY (devis_id) REFERENCES devis(id) ON DELETE SET NULL
);

CREATE INDEX idx_devis_project_id ON devis(project_id);
CREATE INDEX idx_devis_client_id ON devis(client_id);
CREATE INDEX idx_factures_project_id ON factures(project_id);
CREATE INDEX idx_factures_client_id ON factures(client_id);
CREATE INDEX idx_factures_devis_id ON factures(devis_id);

ALTER TABLE devis DISABLE ROW LEVEL SECURITY;
ALTER TABLE factures DISABLE ROW LEVEL SECURITY;

-- ========================================
-- PARTIE 2 : STORAGE (Buckets)
-- ========================================

-- Créer les buckets Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-photos', 'project-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('voices', 'voices', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Créer des politiques permissives pour Storage
-- Pour project-photos
DROP POLICY IF EXISTS "Public Access project-photos" ON storage.objects;
CREATE POLICY "Public Access project-photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'project-photos');

DROP POLICY IF EXISTS "Public Upload project-photos" ON storage.objects;
CREATE POLICY "Public Upload project-photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'project-photos');

DROP POLICY IF EXISTS "Public Delete project-photos" ON storage.objects;
CREATE POLICY "Public Delete project-photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'project-photos');

-- Pour voices
DROP POLICY IF EXISTS "Public Access voices" ON storage.objects;
CREATE POLICY "Public Access voices" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'voices');

DROP POLICY IF EXISTS "Public Upload voices" ON storage.objects;
CREATE POLICY "Public Upload voices" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'voices');

DROP POLICY IF EXISTS "Public Delete voices" ON storage.objects;
CREATE POLICY "Public Delete voices" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'voices');

-- ========================================
-- MESSAGE DE CONFIRMATION
-- ========================================

SELECT '✅ Initialisation complète ! Tables et Storage configurés.' as status;

