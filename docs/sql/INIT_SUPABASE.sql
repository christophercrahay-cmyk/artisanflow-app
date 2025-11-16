-- ========================================
-- SCRIPT COMPLET D'INITIALISATION SUPABASE
-- ========================================
-- À exécuter dans le SQL Editor de Supabase
-- Copier-coller TOUT le contenu et cliquer RUN

-- ========================================
-- PARTIE 1 : TABLES PRINCIPALES
-- ========================================

-- Supprimer les tables existantes si nécessaire
DROP TABLE IF EXISTS client_photos CASCADE;
DROP TABLE IF EXISTS project_photos CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS devis CASCADE;
DROP TABLE IF EXISTS factures CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Créer les tables clients et projects
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  status TEXT DEFAULT 'active',
  status_text TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_projects_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Désactiver RLS
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- ========================================
-- PARTIE 2 : TABLES DE BASE
-- ========================================

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
  client_id UUID,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_project_photos_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  client_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'voice',
  storage_path TEXT,
  transcription TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_notes_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_notes_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Créer les index
CREATE INDEX idx_client_photos_client_id ON client_photos(client_id);
CREATE INDEX idx_project_photos_project_id ON project_photos(project_id);
CREATE INDEX idx_project_photos_client_id ON project_photos(client_id);
CREATE INDEX idx_notes_project_id ON notes(project_id);
CREATE INDEX idx_notes_client_id ON notes(client_id);

-- Désactiver RLS (déjà fait plus haut mais on garde pour sécurité)
ALTER TABLE client_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;

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
  pdf_url TEXT,
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
  pdf_url TEXT,
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
-- PARTIE 3 : BRAND SETTINGS
-- ========================================

-- Table brand_settings (paramètres artisan)
CREATE TABLE IF NOT EXISTS brand_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1D4ED8',
  secondary_color TEXT DEFAULT '#3B82F6',
  company_name TEXT DEFAULT 'Mon Entreprise',
  company_siret TEXT,
  company_address TEXT,
  company_phone TEXT,
  company_email TEXT,
  tva_default DECIMAL(5, 2) DEFAULT 20.00,
  template_default TEXT DEFAULT 'classique',
  devis_prefix TEXT DEFAULT 'DEV',
  facture_prefix TEXT DEFAULT 'FA',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer une ligne par défaut
INSERT INTO brand_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM brand_settings);

-- Désactiver RLS
ALTER TABLE brand_settings DISABLE ROW LEVEL SECURITY;

-- ========================================
-- PARTIE 4 : STORAGE (Buckets)
-- ========================================

-- Créer les buckets Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-photos', 'project-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('voices', 'voices', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('docs', 'docs', true)
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

-- Pour docs (PDFs)
DROP POLICY IF EXISTS "Public Access docs" ON storage.objects;
CREATE POLICY "Public Access docs" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'docs');

DROP POLICY IF EXISTS "Public Upload docs" ON storage.objects;
CREATE POLICY "Public Upload docs" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'docs');

DROP POLICY IF EXISTS "Public Delete docs" ON storage.objects;
CREATE POLICY "Public Delete docs" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'docs');

-- ========================================
-- MESSAGE DE CONFIRMATION
-- ========================================

SELECT '✅ Initialisation complète ! Tables et Storage configurés.' as status;

