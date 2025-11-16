# ✅ Fixes Appliqués - RLS Notes & Uploads

**Date** : 03/11/2025  
**Projet** : ArtisanFlow  
**Problème** : "new row violates row-level security policy for table notes"

---

## 🔍 Problème Identifié

### Symptômes
1. **Erreur RLS** : `new row violates row-level security policy for table "notes"` lors de l'upload
2. **Tests QA échoués** : `3_AddMockVoiceNote` échoue avec erreur RLS
3. **Cause racine** : Le code n'envoie pas `user_id` lors des INSERT

---

## 🔧 Solution Appliquée

### 1. Code JavaScript Modifié

#### VoiceRecorder.js (ligne 336)
```javascript
// Récupérer l'utilisateur connecté pour RLS
const { data: { user } } = await supabase.auth.getUser();

const noteData = {
  project_id: currentProject.id,
  client_id: currentClient.id,
  user_id: user?.id, // ✅ Nécessaire pour RLS
  type: 'voice',
  storage_path: up?.path || fileName,
  transcription: transcribedText || null,
};
```

#### PhotoUploader.js (ligne 79)
```javascript
// Récupérer l'utilisateur connecté pour RLS
const { data: { user } } = await supabase.auth.getUser();

const { error: insertErr } = await supabase.from('project_photos').insert([
  { 
    project_id: currentProject.id, 
    client_id: currentClient.id,
    user_id: user?.id, // ✅ Nécessaire pour RLS
    url: publicUrl 
  },
]);
```

#### PhotoUploaderClient.js (ligne 79)
```javascript
// Récupérer l'utilisateur connecté pour RLS
const { data: { user } } = await supabase.auth.getUser();

const { error: insertErr } = await supabase.from('client_photos').insert([
  { 
    client_id: currentClient.id, 
    user_id: user?.id, // ✅ Nécessaire pour RLS
    url: publicUrl 
  },
]);
```

---

## 📝 SQL à Exécuter

### Fichier : `FIX_RLS_NOTES_INSERT_MOBILE.sql`

Ce fichier corrige les policies RLS pour permettre l'INSERT si :
1. `user_id` est défini et égal à `auth.uid()`, OU
2. Le projet/client appartient à l'utilisateur via la relation `user_id`

**Commande** :
```sql
-- Dans Supabase SQL Editor
-- Exécuter tout le contenu de FIX_RLS_NOTES_INSERT_MOBILE.sql
```

---

## 🧪 Test Manuel

### Scénario Complet
1. **Se connecter** à l'app
2. **Créer un client** (ou utiliser QA_TestClient)
3. **Créer un chantier** pour ce client
4. **Ajouter une note vocale** :
   - Enregistrer
   - Envoyer
   - ✅ Pas d'erreur RLS
5. **Ajouter une photo** :
   - Prendre une photo
   - Envoyer
   - ✅ Pas d'erreur RLS

### Résultats Attendus
- ✅ Insertion DB réussie
- ✅ Upload Storage réussi
- ✅ Note/Photo affichée dans la liste
- ❌ Plus d'erreur "row-level security policy"

---

## 🔒 Storage Policies

### Buckets Utilisés
- **`project-photos`** : Photos chantiers et clients
- **`voices`** : Enregistrements audio

### Policies Actuelles (Publiques)
Ces buckets ont des policies **publiques** pour simplifier les tests :
```sql
CREATE POLICY "Public Upload project-photos"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'project-photos');

CREATE POLICY "Public Upload voices"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'voices');
```

**⚠️ Important** : En production, restreindre à authenticated users seulement.

---

## ✅ Checklist Finale

- [x] Code JS modifié pour envoyer `user_id`
- [x] SQL policies créées pour INSERT permissif
- [x] Storage buckets configurés (project-photos, voices)
- [x] Storage policies publiques pour tests
- [ ] **À FAIRE** : Exécuter `FIX_RLS_NOTES_INSERT_MOBILE.sql` dans Supabase
- [ ] **À FAIRE** : Tester upload note vocale
- [ ] **À FAIRE** : Tester upload photo

---

## 🚀 Prochaines Étapes

1. **Exécuter le SQL** dans Supabase
2. **Rebuild l'app** :
   ```bash
   npx eas-cli build --platform android --profile preview
   ```
3. **Réinstaller** sur le téléphone :
   ```bash
   powershell -ExecutionPolicy Bypass -File .\install-artisanflow.ps1
   ```
4. **Tester** le scénario complet

---

**Status** : ✅ **Code prêt, SQL à exécuter**

