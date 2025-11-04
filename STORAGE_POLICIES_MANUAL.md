# 📦 CONFIGURATION STORAGE POLICIES - ArtisanFlow

**Date** : 2024  
**Méthode** : Via l'interface Supabase (pas en SQL direct)

---

## ❗ POURQUOI MANUEL ?

Supabase Storage `objects` table est une table système. Les politiques doivent être créées via l'interface ou avec des permissions admin spéciales.

---

## 🚀 ÉTAPES

### 1. Créer le bucket `artisanflow` (si pas déjà fait)

**Dans Supabase Dashboard** :
1. Aller dans **Storage**
2. Cliquer **"New bucket"**
3. Nom : `artisanflow`
4. Public : **OUI** ✅
5. Cliquer **"Create bucket"**

---

### 2. Configurer les politiques Storage

**Dans Supabase Dashboard** :
1. Aller dans **Storage** → **Policies**
2. Sélectionner le bucket `artisanflow`
3. Cliquer **"New Policy"**

#### **Politique 1 : SELECT (Read)**

- **Policy name** : `Users can read own files`
- **Allowed operation** : `SELECT`
- **Policy definition** : SQL suivant

```sql
(
  bucket_id = 'artisanflow' AND
  (storage.foldername(name))[1] = 'user' AND
  (storage.foldername(name))[2] = auth.uid()::text
)
```

- Cliquer **"Review"** puis **"Save policy"**

---

#### **Politique 2 : INSERT (Upload)**

- **Policy name** : `Users can upload own files`
- **Allowed operation** : `INSERT`
- **Policy definition** : SQL suivant

```sql
(
  bucket_id = 'artisanflow' AND
  (storage.foldername(name))[1] = 'user' AND
  (storage.foldername(name))[2] = auth.uid()::text
)
```

- Cliquer **"Review"** puis **"Save policy"**

---

#### **Politique 3 : UPDATE**

- **Policy name** : `Users can update own files`
- **Allowed operation** : `UPDATE`
- **Policy definition** : SQL suivant

```sql
(
  bucket_id = 'artisanflow' AND
  (storage.foldername(name))[1] = 'user' AND
  (storage.foldername(name))[2] = auth.uid()::text
)
```

- Cliquer **"Review"** puis **"Save policy"**

---

#### **Politique 4 : DELETE**

- **Policy name** : `Users can delete own files`
- **Allowed operation** : `DELETE`
- **Policy definition** : SQL suivant

```sql
(
  bucket_id = 'artisanflow' AND
  (storage.foldername(name))[1] = 'user' AND
  (storage.foldername(name))[2] = auth.uid()::text
)
```

- Cliquer **"Review"** puis **"Save policy"**

---

## 📁 CONVENTION CHEMINS

**Format** : `user/{auth.uid()}/projects/{projectId}/filename.jpg`

**Exemples** :
- `user/abc-123-def/projects/xyz-789/photo1.jpg`
- `user/abc-123-def/projects/xyz-789/rec_12345.m4a`

**Protection** :
- User avec `auth.uid() = abc-123-def` → Peut lire/écrire ses fichiers
- User avec `auth.uid() = autre-id` → **Refusé** par RLS

---

## ✅ VÉRIFICATION

### Test rapide dans SQL Editor :

```sql
-- Vérifier bucket existe
SELECT * FROM storage.buckets WHERE id = 'artisanflow';

-- Vérifier politiques (si accessible)
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%artisanflow%';
```

### Test dans l'app :

1. Se connecter avec un user
2. Uploader une photo vers un chantier
3. Vérifier le path dans Supabase Storage :
   - Devrait commencer par `user/{userId}/...`
4. Se connecter avec un autre user
5. Tenter d'accéder au même fichier
6. Devrait être refusé ✅

---

## 🔄 ALTERNATIVE : SQL DIRECT (ADMIN ONLY)

Si tu as accès admin/service_role, tu peux exécuter ce SQL directement dans SQL Editor (avec credentials admin) :

```sql
-- Activer RLS sur storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Politiques Storage
CREATE POLICY "Users can read own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'artisanflow' AND
    (storage.foldername(name))[1] = 'user' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'artisanflow' AND
    (storage.foldername(name))[1] = 'user' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'artisanflow' AND
    (storage.foldername(name))[1] = 'user' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'artisanflow' AND
    (storage.foldername(name))[1] = 'user' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );
```

**⚠️ ATTENTION** : Nécessite permissions admin/service_role.

---

## 📝 NOTES

### Pour l'instant (MVP)

Si tu veux tester rapidement, tu peux :
1. **Temporairement rendre le bucket public** (sans RLS)
2. Tester l'app
3. Puis configurer les politiques après

**⚠️ Ne pas utiliser en production sans RLS.**

---

**Status** : ✅ **READY TO CONFIGURE**

