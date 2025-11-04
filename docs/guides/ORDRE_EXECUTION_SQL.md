# 📋 Ordre d'Exécution SQL - ArtisanFlow

**Date** : 03/11/2025  
**Important** : Exécuter dans l'ordre indiqué

---

## 🚨 ATTENTION

**L'ordre est CRITIQUE** ! Ne pas inverser.

---

## 📝 Étape 1 : Ajouter les colonnes user_id

**Fichier** : `ADD_AUTH_RLS_FIXED.sql`

**Objectif** : Ajouter les colonnes `user_id` à toutes les tables

**Dans Supabase SQL Editor** :
1. Ouvrir `ADD_AUTH_RLS_FIXED.sql`
2. Copier TOUT le contenu
3. Coller dans SQL Editor
4. Exécuter (RUN)

**Vérification** :
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'clients' 
AND column_name = 'user_id';
```
→ Devrait retourner 1 ligne

---

## 📝 Étape 2 : Activer RLS avec séparation utilisateurs

**Fichier** : `ACTIVER_RLS_SEPARATION_UTILISATEURS.sql`

**Objectif** : Activer RLS et créer toutes les policies

**Dans Supabase SQL Editor** :
1. Ouvrir `ACTIVER_RLS_SEPARATION_UTILISATEURS.sql`
2. Copier TOUT le contenu
3. Coller dans SQL Editor
4. Exécuter (RUN)

**Vérification** :
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'projects', 'notes')
ORDER BY tablename;
```
→ `rowsecurity` doit être `true` pour toutes

---

## 📝 Étape 3 (Optionnel) : Corriger policies INSERT uploads

**Fichier** : `FIX_RLS_NOTES_INSERT_MOBILE.sql`

**Objectif** : Surcharger policies INSERT pour notes/photos

**Dans Supabase SQL Editor** :
1. Ouvrir `FIX_RLS_NOTES_INSERT_MOBILE.sql`
2. Copier TOUT le contenu
3. Coller dans SQL Editor
4. Exécuter (RUN)

**Note** : Déjà inclus dans `ACTIVER_RLS_SEPARATION_UTILISATEURS.sql`, donc optionnel

---

## 🧪 Vérification Complète

**Test complet** :

```sql
-- 1. Vérifier colonnes user_id
SELECT 
  table_name,
  column_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'user_id'
ORDER BY table_name;

-- 2. Vérifier RLS activé
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'projects', 'notes', 'client_photos', 'project_photos', 'devis', 'factures')
ORDER BY tablename;

-- 3. Vérifier policies
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'projects', 'notes')
ORDER BY tablename, policyname;
```

**Résultats attendus** :
- 8 tables avec colonne `user_id`
- `rowsecurity = true` sur toutes
- ~32 policies créées (4 par table)

---

## ⚠️ IMPORTANT

### Après activation RLS

**Les anciennes données sans user_id ne seront PAS visibles !**

Si tu veux migrer les anciennes données :
```sql
-- Remplace UUID_ADMIN par ton UUID
UPDATE clients SET user_id = 'UUID_ADMIN' WHERE user_id IS NULL;
UPDATE projects SET user_id = 'UUID_ADMIN' WHERE user_id IS NULL;
UPDATE notes SET user_id = 'UUID_ADMIN' WHERE user_id IS NULL;
UPDATE client_photos SET user_id = 'UUID_ADMIN' WHERE user_id IS NULL;
UPDATE project_photos SET user_id = 'UUID_ADMIN' WHERE user_id IS NULL;
UPDATE devis SET user_id = 'UUID_ADMIN' WHERE user_id IS NULL;
UPDATE factures SET user_id = 'UUID_ADMIN' WHERE user_id IS NULL;
UPDATE brand_settings SET user_id = 'UUID_ADMIN' WHERE user_id IS NULL;
```

---

## ✅ Checklist

- [ ] Exécuté `ADD_AUTH_RLS_FIXED.sql`
- [ ] Exécuté `ACTIVER_RLS_SEPARATION_UTILISATEURS.sql`
- [ ] Vérifié colonnes `user_id` existent
- [ ] Vérifié RLS activé
- [ ] Vérifié policies créées
- [ ] Build EAS terminé
- [ ] App réinstallée
- [ ] Testé création compte → liste vide
- [ ] Testé upload photo
- [ ] Testé upload note vocale

---

**Status** : ✅ **SQL PRÊT - EXÉCUTER MAINTENANT**

