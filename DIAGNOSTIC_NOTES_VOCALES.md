# 🔍 DIAGNOSTIC - NOTES VOCALES NON SUPPRIMABLES

**Date** : 9 novembre 2025  
**Problème** : Certaines notes vocales ne peuvent pas être supprimées

---

## 📋 **2 TYPES DE NOTES VOCALES**

### **Type 1 : Notes de terrain** (`VoiceRecorder.js`)
- **Où** : Écran détail chantier, section "Notes vocales"
- **Utilisation** : Notes générales du chantier
- **Suppression** : ✅ Oui (appui long → bouton "🗑️ Supprimer")
- **Stockage** : Table `notes` en base de données

### **Type 2 : Réponses vocales IA** (`VoiceRecorderSimple.js`)
- **Où** : Modal "Devis IA", pour répondre aux questions
- **Utilisation** : Réponses vocales temporaires
- **Suppression** : ❌ Non (composant temporaire)
- **Stockage** : Aucun (juste pour transcription)

---

## 🔍 **CAUSES POSSIBLES**

### **Cause 1 : RLS bloque la suppression** 🔥

**Symptôme** :
- Tu cliques sur "🗑️ Supprimer"
- Rien ne se passe ou erreur silencieuse

**Explication** :
- RLS est activé sur la table `notes`
- La policy DELETE vérifie `auth.uid() = user_id`
- Si une note a un `user_id` différent ou NULL, tu ne peux pas la supprimer

**Solution** :
- Vérifier les policies RLS
- Vérifier que toutes les notes ont le bon `user_id`

---

### **Cause 2 : Notes sans `user_id`** ⚠️

**Symptôme** :
- Certaines notes se suppriment, d'autres non

**Explication** :
- Notes créées avant l'activation de RLS
- Notes sans `user_id` → RLS bloque la suppression

**Solution** :
- Identifier les notes sans `user_id`
- Les supprimer manuellement ou leur assigner un `user_id`

---

### **Cause 3 : Erreur dans le code** 💡

**Symptôme** :
- Erreur dans les logs lors de la suppression

**Explication** :
- Bug dans la fonction `deleteNote()`
- Erreur de permission Storage

**Solution** :
- Vérifier les logs
- Corriger le code si nécessaire

---

## 🔧 **DIAGNOSTIC À FAIRE**

### **Étape 1 : Vérifier la structure et RLS**

**Exécute ce script** : `sql/verifier_notes_et_rls.sql`

**Tu devrais voir** :
1. Structure de la table `notes`
2. RLS activé ou non
3. Policies RLS
4. Liste des notes avec leurs `user_id`

**Donne-moi les résultats** pour que je puisse diagnostiquer !

---

### **Étape 2 : Tester la suppression**

1. **Ouvrir un chantier**
2. **Trouver une note que tu ne peux pas supprimer**
3. **Appuyer longuement** sur la note
4. **Observer** :
   - Est-ce que l'alerte "Supprimer cette note ?" apparaît ?
   - Est-ce qu'il y a une erreur dans les logs ?
   - Est-ce que la note disparaît ou reste ?

---

### **Étape 3 : Vérifier les logs**

**Dans le terminal Expo, cherche** :
```
ERROR [VoiceRecorder] Erreur suppression note
```

**Ou** :
```
WARN [VoiceRecorder] Erreur suppression storage
```

**Donne-moi ces logs !**

---

## 🎯 **SOLUTIONS POSSIBLES**

### **Solution 1 : Ajouter filtre `user_id` explicite**

**Si le problème vient de RLS**, modifier `deleteNote()` :

```javascript
// AVANT
const { error } = await supabase
  .from('notes')
  .delete()
  .eq('id', noteId);

// APRÈS
const { data: { user } } = await supabase.auth.getUser();
const { error } = await supabase
  .from('notes')
  .delete()
  .eq('id', noteId)
  .eq('user_id', user.id); // ✅ Filtre explicite
```

---

### **Solution 2 : Corriger les notes sans `user_id`**

**Si certaines notes n'ont pas de `user_id`** :

```sql
-- Identifier les notes problématiques
SELECT id, project_id, user_id, transcription
FROM notes
WHERE user_id IS NULL;

-- Les supprimer (si ce sont des tests)
DELETE FROM notes WHERE user_id IS NULL;

-- OU leur assigner un user_id (si ce sont de vraies notes)
UPDATE notes
SET user_id = '<ton_user_id>'
WHERE user_id IS NULL;
```

---

### **Solution 3 : Désactiver temporairement RLS**

**⚠️ À utiliser UNIQUEMENT pour tester** :

```sql
-- Désactiver RLS temporairement
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;

-- Tester la suppression dans l'app

-- Réactiver RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
```

---

## 📊 **PROCHAINES ÉTAPES**

1. **Exécuter** `sql/verifier_notes_et_rls.sql`
2. **Donner les résultats** (structure, RLS, policies, liste des notes)
3. **Tester** la suppression et noter les logs d'erreur
4. **Je diagnostiquerai** et proposerai la solution exacte

---

**En attendant, exécute les 2 scripts SQL urgents** :
1. `sql/add_company_info_to_devis_factures.sql`
2. `sql/add_analysis_data_to_notes.sql`

**Ça permettra déjà de sauvegarder les nouvelles notes !** ✅

