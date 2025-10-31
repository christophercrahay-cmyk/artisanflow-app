-- Script simple pour désactiver RLS sur toutes les tables
-- À exécuter dans le SQL Editor de Supabase

-- Désactiver RLS pour toutes les tables de l'application
ALTER TABLE client_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;

-- Vérifier aussi clients et projects au cas où
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Message de confirmation
SELECT 'RLS désactivé pour toutes les tables ✅' as status;

