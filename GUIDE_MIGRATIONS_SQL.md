# 🚨 GUIDE COMPLET : Migrations SQL ArtisanFlow

**Date** : 5 novembre 2025  
**Problème** : Colonnes manquantes dans plusieurs tables  
**Solution** : 2 migrations SQL à exécuter

---

## 🎯 Résumé des Problèmes

```
❌ project_photos.user_id manquant    → Dashboard crash
❌ project_photos.taken_at manquant   → Upload photo crash
❌ notes.client_id manquant           → Note texte crash
❌ notes.user_id manquant             → RLS manquant
```

**Impact** : App partiellement cassée (photos, notes, dashboard)

---

## ✅ Solution : 2 Migrations SQL

### Migration 1 : project_photos
**Fichier** : `supabase/migrations/add_user_id_to_photos.sql`

**Colonnes ajoutées** :
- `user_id` (UUID, NOT NULL) - Pour RLS
- `taken_at` (TIMESTAMP, NOT NULL) - Horodatage
- `latitude` (DOUBLE) - GPS optionnel
- `longitude` (DOUBLE) - GPS optionnel

---

### Migration 2 : notes
**Fichier** : `supabase/migrations/add_client_id_to_notes.sql`

**Colonnes ajoutées** :
- `client_id` (UUID, nullable) - Lien client
- `user_id` (UUID, NOT NULL) - Pour RLS

---

## 📋 PROCÉDURE D'EXÉCUTION

### Étape 1 : Migration project_photos

```
1. Ouvrir Supabase Dashboard
   → https://app.supabase.com/project/[VOTRE_PROJECT_ID]

2. Cliquer "SQL Editor" dans le menu gauche

3. Cliquer "New Query"

4. Copier TOUT le contenu du fichier :
   supabase/migrations/add_user_id_to_photos.sql

5. Coller dans l'éditeur SQL

6. Cliquer "Run" (ou Ctrl+Enter)

7. Attendre le message de confirmation :
   ┌─────────────────────────────────────────────┐
   │ ✅ Migration terminée: colonnes user_id,   │
   │    taken_at, latitude, longitude ajoutées  │
   │    à project_photos                         │
   └─────────────────────────────────────────────┘

8. ✅ SUCCÈS → Passer à l'étape 2
```

---

### Étape 2 : Migration notes

```
1. Même fenêtre SQL Editor (ou nouvelle query)

2. Copier TOUT le contenu du fichier :
   supabase/migrations/add_client_id_to_notes.sql

3. Coller dans l'éditeur SQL

4. Cliquer "Run"

5. Attendre le message :
   ┌─────────────────────────────────────────────┐
   │ ✅ Migration terminée: colonnes client_id  │
   │    et user_id ajoutées à notes              │
   └─────────────────────────────────────────────┘

6. ✅ SUCCÈS → Passer à l'étape 3
```

---

### Étape 3 : Vérification

```sql
-- Vérifier project_photos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'project_photos'
  AND column_name IN ('user_id', 'taken_at', 'latitude', 'longitude')
ORDER BY column_name;

-- Résultat attendu : 4 lignes
-- user_id     | uuid              | NO
-- taken_at    | timestamp...      | NO
-- latitude    | double precision  | YES
-- longitude   | double precision  | YES

-- Vérifier notes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notes'
  AND column_name IN ('client_id', 'user_id')
ORDER BY column_name;

-- Résultat attendu : 2 lignes
-- client_id   | uuid      | YES
-- user_id     | uuid      | NO
```

---

### Étape 4 : Relancer l'Application

```bash
# Arrêter le serveur Expo (Ctrl+C)

# Relancer
npm run start:tunnel
```

---

## ✅ Résultat Attendu

Après les migrations et redémarrage :

### Upload Photo
```
1. Ouvrir chantier
2. PhotoUploader → Prendre photo
3. Upload
   → ✅ Compression OK
   → ✅ Photo uploadée (avec user_id + taken_at)
   → ✅ GPS capturé si permission OK
   → ✅ Toast "Photo envoyée"
   → ✅ PASS
```

---

### Note Texte
```
1. Chantier → "Ajouter une note texte"
2. Saisir "Test note"
3. Enregistrer
   → ✅ INSERT avec client_id + user_id
   → ✅ Toast "Note ajoutée"
   → ✅ PASS
```

---

### Dashboard
```
1. Ouvrir Dashboard
2. Section "8 Photos"
   → ✅ Photos affichées
   → ✅ Filtrées par user_id
   → ✅ Compteur correct
   → ✅ PASS
```

---

### PhotoGallery
```
1. Dashboard → Clic "Photos"
2. PhotoGalleryScreen
   → ✅ Galerie complète
   → ✅ Dates affichées (taken_at)
   → ✅ Filtrées par user_id
   → ✅ PASS
```

---

## ⚠️ Erreur ExpoLocation (IGNORER)

Si vous voyez encore :
```
ERROR [Error: Cannot find native module 'ExpoLocation']
```

**C'est normal si** :
- Vous utilisez Expo Dev Client mais certaines permissions ne sont pas configurées
- Le module n'est pas linké correctement dans le build natif

**Solution temporaire** : L'app continue de fonctionner, les photos sont uploadées **sans GPS** (latitude/longitude = null).

**Solution définitive** : Rebuild complet du dev client :
```bash
npx expo prebuild --clean
npm run android
```

**Pour l'instant** : L'app fonctionne, ignorez cette erreur (GPS optionnel).

---

## 🔧 Si Migrations Échouent

### Erreur : "column already exists"

**Solution** : Normal si vous avez déjà exécuté une partie des migrations.
```sql
-- Les migrations utilisent "IF NOT EXISTS" 
-- → Elles sont idempotentes (peuvent être relancées)
```

---

### Erreur : "constraint already exists"

**Solution** : Les migrations font `DROP CONSTRAINT IF EXISTS` avant `ADD`.
```sql
-- Relancer la migration, elle nettoiera et recréera
```

---

### Erreur : "no rows to update"

**Solution** : Normal si vous n'avez pas encore de données.
```sql
-- Les UPDATE ne font rien si table vide
-- → Pas un problème
```

---

## 📊 Checklist Finale

### Avant de Relancer l'App

- [ ] Migration 1 exécutée (project_photos)
  - Message : "✅ Migration terminée: colonnes... project_photos"
  
- [ ] Migration 2 exécutée (notes)
  - Message : "✅ Migration terminée: colonnes... notes"
  
- [ ] Vérification SQL passée (colonnes existent)

- [ ] App relancée (`npm run start:tunnel`)

---

### Tests Fonctionnels

- [ ] Upload photo fonctionne
- [ ] Note texte fonctionne
- [ ] Dashboard affiche photos
- [ ] PhotoGallery accessible
- [ ] Aucune erreur SQL dans console

---

## 🚀 Après Migrations

**App complètement fonctionnelle** :
- ✅ Photos avec horodatage + GPS
- ✅ Notes avec client_id + user_id
- ✅ RLS actif (isolation utilisateurs)
- ✅ Dashboard opérationnel
- ✅ Galerie photos complète

**ArtisanFlow - Base de Données Production Ready** ✅

---

## 🎯 RÉSUMÉ : 2 Fichiers SQL à Exécuter

```
1. supabase/migrations/add_user_id_to_photos.sql
2. supabase/migrations/add_client_id_to_notes.sql
```

**Exécutez-les dans l'ordre dans Supabase SQL Editor !** 🚀

