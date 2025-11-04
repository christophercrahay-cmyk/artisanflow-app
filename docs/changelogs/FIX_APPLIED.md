# 🔧 FIX APPLIQUÉ : Erreur PGRST204

## ❌ Problème

**Erreur** :
```
PGRST204: Could not find the 'client_id' column of 'project_photos' in the schema cache
```

**Cause** : Le code essayait d'insérer `client_id` dans `project_photos`, mais cette colonne n'existe pas dans la table Supabase.

---

## ✅ Solution Appliquée

**Fichier modifié** : `PhotoUploader.js`

**Ligne 76-81** : Suppression de `client_id` de l'insertion

**Avant** :
```javascript
const { error: insertErr } = await supabase.from('project_photos').insert([
  { 
    project_id: currentProject.id, 
    client_id: currentClient.id,  // ❌ Colonne inexistante
    url: publicUrl 
  },
]);
```

**Après** :
```javascript
const { error: insertErr } = await supabase.from('project_photos').insert([
  { 
    project_id: currentProject.id,  // ✅ Suffisant
    url: publicUrl 
  },
]);
```

---

## 🎯 Pourquoi ?

- La table `project_photos` n'a **PAS** besoin de `client_id` directement
- Il suffit d'avoir `project_id` qui fait déjà le lien vers le projet
- Le projet lui-même contient déjà `client_id`
- Donc la relation : `project_photos → project → client` est suffisante

---

## ⚠️ À Noter

**Alternative possible** : Si vous voulez absolument `client_id` dans `project_photos` :
1. Exécuter `ADD_CLIENT_ID_TO_PROJECT_PHOTOS.sql` dans Supabase
2. Revenir au code original avec `client_id`

**Mais ce n'est pas nécessaire !** L'architecture actuelle est correcte.

---

## 🧪 Test

Redémarrer l'app et tester :
1. Prendre une photo dans un chantier
2. ✅ Devrait fonctionner sans erreur

---

**Date** : 2025-01-XX  
**Statut** : ✅ **CORRIGÉ**

