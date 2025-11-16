-- Script pour ajouter les tables Devis et Factures
-- À exécuter dans le SQL Editor de Supabase

-- Table devis (estimates)
CREATE TABLE IF NOT EXISTS devis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  client_id UUID NOT NULL,
  numero TEXT NOT NULL UNIQUE,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_validite DATE,
  montant_ht DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tva_percent DECIMAL(5, 2) DEFAULT 20.00,
  montant_ttc DECIMAL(10, 2) NOT NULL DEFAULT 0,
  statut TEXT DEFAULT 'brouillon', -- brouillon, envoye, accepte, refuse
  notes TEXT,
  transcription TEXT, -- Transcription vocale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_devis_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_devis_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX idx_devis_project_id ON devis(project_id);
CREATE INDEX idx_devis_client_id ON devis(client_id);

-- Table factures (invoices)
CREATE TABLE IF NOT EXISTS factures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  client_id UUID NOT NULL,
  devis_id UUID, -- Facture peut être liée à un devis
  numero TEXT NOT NULL UNIQUE,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_echeance DATE,
  montant_ht DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tva_percent DECIMAL(5, 2) DEFAULT 20.00,
  montant_ttc DECIMAL(10, 2) NOT NULL DEFAULT 0,
  statut TEXT DEFAULT 'brouillon', -- brouillon, envoye, paye, impayee
  notes TEXT,
  transcription TEXT, -- Transcription vocale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_facture_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_facture_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_facture_devis FOREIGN KEY (devis_id) REFERENCES devis(id) ON DELETE SET NULL
);

CREATE INDEX idx_factures_project_id ON factures(project_id);
CREATE INDEX idx_factures_client_id ON factures(client_id);
CREATE INDEX idx_factures_devis_id ON factures(devis_id);

-- Désactiver RLS pour ces nouvelles tables
ALTER TABLE devis DISABLE ROW LEVEL SECURITY;
ALTER TABLE factures DISABLE ROW LEVEL SECURITY;

-- Message de confirmation
SELECT '✅ Tables devis et factures créées !' as status;

