# ✅ Comment Vérifier les Migrations SQL

**Date** : 5 novembre 2025  
**Fichier** : `supabase/verification_migrations.sql`

---

## 🎯 Objectif

Vérifier que les migrations ont bien été exécutées et que toutes les colonnes nécessaires existent.

---

## 📋 Procédure de Vérification

### Étape 1 : Exécuter le Script

```
1. Supabase Dashboard → SQL Editor

2. Copier TOUT le contenu de :
   supabase/verification_migrations.sql

3. Coller dans l'éditeur

4. Cliquer "Run"

5. Lire les résultats
```

---

## 📊 Résultats Attendus

### Section 1 : project_photos

**Colonnes attendues** :
```
✅ id
✅ project_id
✅ client_id
✅ user_id         (NOT NULL)
✅ url
✅ taken_at        (NOT NULL)
✅ latitude        (NULLABLE)
✅ longitude       (NULLABLE)
✅ created_at
```

**Si une colonne manque** → Migration 1 non exécutée

---

### Section 2 : notes

**Colonnes attendues** :
```
✅ id
✅ project_id
✅ client_id       (NULLABLE)
✅ user_id         (NOT NULL)
✅ type
✅ storage_path
✅ transcription
✅ duration_ms
✅ created_at
```

**Si une colonne manque** → Migration 2 non exécutée

---

### Section 3 : Index

**project_photos** :
```
✅ idx_project_photos_user_id
✅ idx_project_photos_taken_at
✅ idx_project_photos_location
```

**notes** :
```
✅ idx_notes_client_id
✅ idx_notes_user_id
```

---

### Section 4 : Contraintes FK

**project_photos** :
```
✅ fk_project (vers projects)
✅ fk_project_photos_user (vers auth.users)
```

**notes** :
```
✅ fk_notes_project (vers projects)
✅ fk_notes_user (vers auth.users)
```

---

### Section 5 : Données

**project_photos** :
```
total_photos = photos_avec_user_id = photos_avec_taken_at

Exemple :
  total_photos:           10
  photos_avec_user_id:    10  ✅
  photos_avec_taken_at:   10  ✅
  photos_avec_gps:         0  ⚠️ Normal (GPS optionnel)
```

**notes** :
```
total_notes = notes_avec_user_id

Exemple :
  total_notes:           5
  notes_avec_user_id:    5  ✅
  notes_avec_client_id:  5  ✅ (peut varier)
```

---

## 🚦 Interprétation des Résultats

### ✅ TOUT EST OK

```
Toutes les colonnes présentes
Tous les index créés
Toutes les FK en place
Toutes les données migrées (counts égaux)

→ ✅ Migrations réussies
→ ✅ Relancer l'app : npm run start:tunnel
→ ✅ App fonctionnelle
```

---

### ❌ COLONNES MANQUANTES

```
user_id ou taken_at absent de project_photos
→ Migration 1 non exécutée ou échouée
→ Exécuter : add_user_id_to_photos.sql

client_id ou user_id absent de notes
→ Migration 2 non exécutée ou échouée
→ Exécuter : add_client_id_to_notes.sql
```

---

### ⚠️ DONNÉES NON MIGRÉES

```
total_photos = 10 mais photos_avec_user_id = 0
→ Colonne existe mais UPDATE a échoué
→ Vérifier qu'il y a des projets avec user_id
→ Relancer les UPDATE manuellement
```

---

## 🔧 Si Problème Détecté

### Colonne Manquante

```
1. Identifier quelle migration a échoué
2. Réexécuter la migration complète
3. Relancer le script de vérification
```

---

### Contrainte Manquante

```
1. Vérifier les erreurs dans SQL Editor
2. Contraintes créées avec DROP IF EXISTS + ADD
3. Relancer si nécessaire
```

---

### Index Manquant

```
-- Créer manuellement si besoin
CREATE INDEX IF NOT EXISTS idx_project_photos_user_id 
ON project_photos(user_id);
```

---

## 📝 Exemple de Résultat PARFAIT

```sql
-- Section 1 : project_photos
┌─────────────┬───────────────────┬──────────────┐
│ column_name │ data_type         │ nullable     │
├─────────────┼───────────────────┼──────────────┤
│ id          │ uuid              │ NOT NULL     │
│ project_id  │ uuid              │ NOT NULL     │
│ client_id   │ uuid              │ NULLABLE     │
│ user_id     │ uuid              │ NOT NULL ✅  │
│ url         │ text              │ NOT NULL     │
│ taken_at    │ timestamp...      │ NOT NULL ✅  │
│ latitude    │ double precision  │ NULLABLE ✅  │
│ longitude   │ double precision  │ NULLABLE ✅  │
│ created_at  │ timestamp...      │ NOT NULL     │
└─────────────┴───────────────────┴──────────────┘

-- Section 2 : notes
┌─────────────┬──────────┬──────────────┐
│ column_name │ datatype │ nullable     │
├─────────────┼──────────┼──────────────┤
│ id          │ uuid     │ NOT NULL     │
│ project_id  │ uuid     │ NOT NULL     │
│ client_id   │ uuid     │ NULLABLE ✅  │
│ user_id     │ uuid     │ NOT NULL ✅  │
│ type        │ text     │ NOT NULL     │
└─────────────┴──────────┴──────────────┘

-- Section 5 : Données
total_photos:        10
photos_avec_user_id: 10  ✅
photos_avec_taken_at:10  ✅

total_notes:         5
notes_avec_user_id:  5   ✅

✅ PARFAIT - Toutes les migrations sont OK
```

---

## 🚀 Exécutez le Script de Vérification

```
1. Supabase Dashboard → SQL Editor

2. Copier le fichier :
   supabase/verification_migrations.sql

3. Run

4. Lire les résultats et comparer avec les attendus ci-dessus
```

**Cela vous dira exactement si les migrations ont fonctionné !** ✅
