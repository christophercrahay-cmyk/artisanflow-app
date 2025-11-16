# 🔧 Guide : Colonnes Manquantes dans Supabase

## ⚠️ Problème Détecté

Erreur : `"Could not find the 'client_id' column of 'project_photos' in the schema cache"`

**Cause** : La base de données existante n'a pas la colonne `client_id` dans `project_photos`

---

## ✅ Solution Rapide

### Exécuter le Script de Migration

1. Ouvrir **Supabase Dashboard** → SQL Editor
2. Copier-coller **TOUT** le contenu de `ADD_CLIENT_ID_TO_PROJECT_PHOTOS.sql`
3. Cliquer **RUN**
4. ✅ Message : "Migration terminée!"

---

## 📝 Détails du Script

Le script `ADD_CLIENT_ID_TO_PROJECT_PHOTOS.sql` :
- ✅ Vérifie si la colonne existe déjà
- ✅ Ajoute `client_id` si manquante
- ✅ Remplit les valeurs existantes via la relation `projects → clients`
- ✅ Ajoute la contrainte FK
- ✅ Crée l'index
- ✅ Affiche un rapport de vérification

**Sécurité** : Le script est **idempotent** (peut être exécuté plusieurs fois sans problème)

---

## 🔍 Vérifier Après Migration

Exécuter dans SQL Editor :

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'project_photos' 
ORDER BY ordinal_position;
```

**Résultat attendu** :
```
id | uuid
project_id | uuid
client_id | uuid  ← DOIT apparaître
url | text
created_at | timestamp with time zone
```

---

## ⚡ Script Alternatif (Si le premier ne fonctionne pas)

Exécuter dans SQL Editor :

```sql
-- Ajouter la colonne
ALTER TABLE project_photos ADD COLUMN IF NOT EXISTS client_id UUID;

-- Remplir les valeurs
UPDATE project_photos pp
SET client_id = p.client_id
FROM projects p
WHERE pp.project_id = p.id
  AND pp.client_id IS NULL;

-- Ajouter contrainte
ALTER TABLE project_photos 
ADD CONSTRAINT fk_project_photos_client 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- Créer index
CREATE INDEX IF NOT EXISTS idx_project_photos_client_id 
ON project_photos(client_id);

-- Vérifier
SELECT '✅ Migration complète!' as status;
```

---

## 🎯 Pourquoi Cette Colonne ?

La colonne `client_id` dans `project_photos` permet de :
- Faciliter les requêtes de photos par client
- Améliorer les performances (moins de JOINs)
- Cohérence avec `notes` et `devis` qui ont aussi `client_id`

**Note** : Ce n'est pas strictement nécessaire (on peut toujours joindre via `projects`), mais c'est une bonne pratique pour les performances.

---

## 🔄 Autres Colonnes Vérifiées

### notes.client_id
- Script : `FIX_NOTES_CLIENT_ID.sql`
- Obligatoire pour l'IA devis

### devis.pdf_url & factures.pdf_url
- Script : `ADD_PDF_URL_TO_DOCS.sql`
- Obligatoire pour l'affichage des documents

### brand_settings (table complète)
- Script : `CREATE_BRAND_SETTINGS.sql`
- Obligatoire pour les paramètres

---

**Version** : 1.0.0  
**Date** : 2024

