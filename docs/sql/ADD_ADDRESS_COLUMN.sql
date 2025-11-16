-- Script pour ajouter la colonne 'address' à la table 'clients'
-- À exécuter dans le SQL Editor de Supabase si la colonne n'existe pas

-- Ajouter la colonne 'address' à la table 'clients' si elle n'existe pas
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;

-- Message de confirmation
SELECT '✅ La colonne address a été vérifiée/ajoutée dans la table clients' as status;
