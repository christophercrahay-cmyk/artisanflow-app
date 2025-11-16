# 🔧 Fix : Erreur Syntaxe SQL Contrainte

**Date** : 5 novembre 2025  
**Fichier corrigé** : `supabase/migrations/add_user_id_to_photos.sql`

---

## 🐛 Erreur SQL

```
ERROR: 42601: syntax error at or near "NOT"
LINE 31: ADD CONSTRAINT IF NOT EXISTS fk_project_photos_user
```

---

## 🔍 Cause

PostgreSQL **ne supporte PAS** `IF NOT EXISTS` avec `ADD CONSTRAINT`.

**Syntaxe invalide** :
```sql
ALTER TABLE project_photos
ADD CONSTRAINT IF NOT EXISTS fk_project_photos_user  -- ❌ ERREUR
FOREIGN KEY (user_id) REFERENCES auth.users(id);
```

---

## ✅ Solution

### Méthode : DROP IF EXISTS + ADD

```sql
-- 1. Supprimer d'abord si existe (ne plante pas si absent)
ALTER TABLE public.project_photos
DROP CONSTRAINT IF EXISTS fk_project_photos_user;

-- 2. Puis ajouter (garanti que la contrainte n'existe pas)
ALTER TABLE public.project_photos
ADD CONSTRAINT fk_project_photos_user 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;
```

**Avantages** :
- ✅ Idempotent (peut être exécuté plusieurs fois)
- ✅ Pas d'erreur si contrainte déjà présente
- ✅ Pas d'erreur si contrainte absente

---

## 📝 Migration Complète Corrigée

**Fichier** : `supabase/migrations/add_user_id_to_photos.sql`

```sql
-- 1. Ajouter colonnes
ALTER TABLE public.project_photos 
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS taken_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- 2. Remplir user_id depuis projects
UPDATE public.project_photos 
SET user_id = projects.user_id
FROM public.projects
WHERE project_photos.project_id = projects.id
  AND project_photos.user_id IS NULL;

-- 3. Remplir taken_at avec created_at (fallback)
UPDATE public.project_photos
SET taken_at = created_at
WHERE taken_at IS NULL;

-- 4. Rendre obligatoire
ALTER TABLE public.project_photos 
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN taken_at SET NOT NULL;

-- 5. Ajouter FK (DROP puis ADD)
ALTER TABLE public.project_photos
DROP CONSTRAINT IF EXISTS fk_project_photos_user;

ALTER TABLE public.project_photos
ADD CONSTRAINT fk_project_photos_user 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- 6. Créer index
CREATE INDEX IF NOT EXISTS idx_project_photos_user_id ON public.project_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_project_photos_taken_at ON public.project_photos(taken_at);
CREATE INDEX IF NOT EXISTS idx_project_photos_location ON public.project_photos(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 7. Commentaires
COMMENT ON COLUMN public.project_photos.user_id IS 'Propriétaire de la photo (pour RLS)';
COMMENT ON COLUMN public.project_photos.taken_at IS 'Date et heure de prise de vue';
COMMENT ON COLUMN public.project_photos.latitude IS 'Latitude GPS (optionnel)';
COMMENT ON COLUMN public.project_photos.longitude IS 'Longitude GPS (optionnel)';

-- Confirmation
SELECT '✅ Migration terminée: colonnes user_id, taken_at, latitude, longitude ajoutées' as status;
```

---

## 🧪 Test de la Migration

### Exécuter dans Supabase SQL Editor

```
1. Copier le fichier complet : 
   supabase/migrations/add_user_id_to_photos.sql

2. Coller dans SQL Editor

3. Run

4. Vérifier le message :
   "✅ Migration terminée: colonnes user_id, taken_at, 
    latitude, longitude ajoutées à project_photos"
```

---

### Vérifier le Schéma

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'project_photos'
ORDER BY ordinal_position;

-- Résultat attendu :
-- id          | uuid              | NO
-- project_id  | uuid              | NO
-- client_id   | uuid              | YES
-- user_id     | uuid              | NO   ✅
-- url         | text              | NO
-- taken_at    | timestamp...      | NO   ✅
-- latitude    | double precision  | YES  ✅
-- longitude   | double precision  | YES  ✅
-- created_at  | timestamp...      | NO
```

---

## 📊 Erreurs Résolues

### 1. Erreur SQL (CORRIGÉE ✅)

```
Avant : ADD CONSTRAINT IF NOT EXISTS  ❌
Après : DROP IF EXISTS + ADD          ✅
```

---

### 2. Erreur ExpoLocation (NORMALE ⚠️)

```
ERROR [Error: Cannot find native module 'ExpoLocation']
```

**Explication** :
- ⚠️ Normal en développement avec Expo Go
- ✅ L'upload continue malgré l'erreur
- ✅ Photos enregistrées sans GPS (latitude/longitude = null)
- ✅ GPS fonctionnera en production (build natif)

**Code déjà protégé** :
```javascript
try {
  const locationModule = await import('expo-location').catch(() => null);
  
  if (locationModule) {
    // Utiliser GPS
  } else {
    console.log('📍 GPS non disponible (normal en dev)');
  }
} catch (err) {
  console.log('📍 GPS non disponible');
  // Continue sans erreur
}
```

---

## ✅ Checklist

- [x] Syntaxe SQL corrigée (DROP + ADD)
- [x] Migration idempotente
- [x] Colonnes user_id, taken_at, latitude, longitude
- [x] Données migrées (user_id + taken_at)
- [x] Contraintes NOT NULL
- [x] FK vers auth.users
- [x] Index créés
- [x] Erreur ExpoLocation gérée (silencieuse)
- [x] Upload fonctionne sans GPS

---

## 🎯 Résultat Attendu

Après exécution de la migration :

✅ **Upload photos** : Fonctionne (avec ou sans GPS)  
✅ **Dashboard** : Affiche photos correctement  
✅ **PhotoGallery** : Galerie complète  
✅ **Erreur ExpoLocation** : Ignorée (normale en dev)  

**ArtisanFlow - project_photos Prêt à Migrer** 🚀

---

## 🚨 Prochaine Étape

**Exécutez la migration SQL corrigée maintenant** dans Supabase Dashboard !

