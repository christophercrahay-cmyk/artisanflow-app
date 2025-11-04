-- Migration : Ajout de l'archivage pour les chantiers
-- Date : 4 novembre 2025

-- Ajouter colonne archived et archived_at à la table projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;

-- Créer un index pour les requêtes filtrées par archived
CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects(archived, user_id);

-- Commentaire pour documentation
COMMENT ON COLUMN projects.archived IS 'Indique si le chantier est archivé (true) ou actif (false)';
COMMENT ON COLUMN projects.archived_at IS 'Date et heure d''archivage du chantier';

