# ✅ VÉRIFICATION STOCKAGE PHOTOS - ARTISANFLOW

**Date** : 10 Novembre 2025  
**Status** : ✅ **TOUT EST CORRECT**

---

## 📸 SYSTÈME DE STOCKAGE DES PHOTOS

### Structure de stockage

**Bucket Supabase** : `project-photos`  
**Chemin** : `projects/{projectId}/{timestamp}.jpg`  
**Table DB** : `project_photos`

---

## 🔍 VÉRIFICATION PAR SOURCE

### 1. Onglet CAPTURE (CaptureHubScreen2)

**Fichier** : `hooks/useAttachCaptureToProject.ts`

```typescript
// Ligne 75-78
const fileName = `projects/${projectId}/${Date.now()}.jpg`;
const { error: uploadErr } = await supabase.storage
  .from('project-photos')
  .upload(fileName, bytes, { contentType: 'image/jpeg', upsert: false });

// Ligne 130
const { error: insertErr } = await supabase.from('project_photos').insert([photoData]);
```

**Données enregistrées** :
- ✅ `project_id` : ID du chantier
- ✅ `client_id` : ID du client
- ✅ `user_id` : ID de l'utilisateur (isolation)
- ✅ `url` : URL publique de la photo
- ✅ `taken_at` : Date/heure de prise de vue
- ✅ `latitude` / `longitude` : GPS (optionnel)

---

### 2. Onglet CHANTIER (PhotoUploader.js)

**Fichier** : `PhotoUploader.js`

```javascript
// Ligne 138-144
const fileName = `projects/${projectId}/${Date.now()}.jpg`;

const { data: uploadData, error: uploadErr } = await supabase.storage
  .from('project-photos')
  .upload(fileName, bytes, { contentType: 'image/jpeg', upsert: false });

// Ligne 170
const { error: insertErr } = await supabase.from('project_photos').insert([photoData]);
```

**Données enregistrées** :
- ✅ `project_id` : ID du chantier
- ✅ `client_id` : ID du client
- ✅ `user_id` : ID de l'utilisateur (isolation)
- ✅ `url` : URL publique de la photo
- ✅ `taken_at` : Date/heure de prise de vue
- ✅ `latitude` / `longitude` : GPS (optionnel)

---

## ✅ COHÉRENCE VÉRIFIÉE

### Bucket
- ✅ **Capture** : `project-photos`
- ✅ **PhotoUploader** : `project-photos`
- ✅ **Cohérent** : Même bucket

### Chemin de stockage
- ✅ **Capture** : `projects/{projectId}/{timestamp}.jpg`
- ✅ **PhotoUploader** : `projects/{projectId}/{timestamp}.jpg`
- ✅ **Cohérent** : Même structure

### Table DB
- ✅ **Capture** : `project_photos`
- ✅ **PhotoUploader** : `project_photos`
- ✅ **Cohérent** : Même table

### Champs DB
- ✅ Tous les champs sont identiques
- ✅ `user_id` est bien inclus (isolation multi-tenant)
- ✅ `project_id` et `client_id` sont bien renseignés

---

## 📁 STRUCTURE FINALE

```
Supabase Storage
└── project-photos/
    └── projects/
        ├── {project_id_1}/
        │   ├── 1699876543210.jpg  ← Photo 1
        │   ├── 1699876548765.jpg  ← Photo 2
        │   └── 1699876552341.jpg  ← Photo 3
        ├── {project_id_2}/
        │   ├── 1699876600123.jpg
        │   └── 1699876605678.jpg
        └── {project_id_3}/
            └── 1699876650000.jpg
```

Chaque projet a son propre sous-dossier, ce qui permet :
- ✅ Organisation claire par chantier
- ✅ Suppression facile d'un projet complet
- ✅ Pas de conflit de noms de fichiers

---

## 🎯 CONCLUSION

**Les photos prises dans l'onglet Capture vont bien dans le bon dossier.**

- ✅ Même bucket que PhotoUploader
- ✅ Même structure de dossiers
- ✅ Même table DB
- ✅ Données complètes (project_id, client_id, user_id, GPS)
- ✅ Isolation multi-tenant respectée

**Pas de problème détecté.**

---

## 🧪 TEST RECOMMANDÉ

1. Prends une photo depuis l'onglet **Capture**
2. Va dans l'onglet **Clients** → Sélectionne un chantier
3. Vérifie que la photo apparaît dans la galerie du chantier
4. Vérifie dans Supabase Storage : `project-photos/projects/{projectId}/`

---

**Fin de la vérification**

