# 📋 INSTRUCTIONS SETUP RLS STORAGE - BUCKET DOCS

## ✅ CE QUI A ÉTÉ FAIT POUR TOI

1. ✅ **Script SQL créé** : `sql/setup_storage_docs_rls.sql`
2. ✅ **Code modifié** : `utils/utils/pdf.js` - Upload réactivé avec la bonne structure

---

## 🚀 ÉTAPES À SUIVRE (5 minutes)

### Étape 1 : Exécuter le script SQL dans Supabase

1. Va sur **https://supabase.com/dashboard**
2. Sélectionne ton projet **ArtisanFlow**
3. Va dans **SQL Editor** (icône SQL dans la sidebar)
4. Clique sur **New Query**
5. **Copie-colle** tout le contenu du fichier `sql/setup_storage_docs_rls.sql`
6. Clique sur **Run** (ou `Ctrl+Enter`)

**✅ Résultat attendu** : 
```
Success. No rows returned
```

---

### Étape 2 : Vérifier que le bucket existe

1. Va dans **Storage** (icône dans la sidebar)
2. Tu devrais voir le bucket **`docs`** dans la liste
3. Si tu ne le vois pas, clique sur **New bucket** et crée-le avec le nom `docs`

---

### Étape 3 : Vérifier les policies

1. Dans **Storage**, clique sur le bucket **`docs`**
2. Va dans l'onglet **Policies**
3. Tu devrais voir **4 policies** :
   - ✅ `Users can upload their own PDFs` (INSERT)
   - ✅ `Users can read their own PDFs` (SELECT)
   - ✅ `Users can update their own PDFs` (UPDATE)
   - ✅ `Users can delete their own PDFs` (DELETE)

---

### Étape 4 : Tester dans l'app

1. Lance l'app
2. Génère un devis avec l'IA
3. Va dans l'onglet **Documents**
4. Clique sur le devis
5. Le PDF devrait se partager **sans erreur** ✅

---

## 🔍 STRUCTURE DES FICHIERS

Les PDFs seront stockés avec cette structure :
```
docs/
  └─ {user_id}/
      └─ {project_id}/
          └─ {numero}.pdf
```

**Exemple** :
```
docs/
  └─ abc123-user-id/
      └─ xyz789-project-id/
          └─ DE-2025-1234.pdf
```

---

## ⚠️ EN CAS D'ERREUR

### Erreur : "bucket does not exist"
→ Crée le bucket manuellement dans Storage → New bucket → Nom: `docs`

### Erreur : "new row violates row-level security policy"
→ Vérifie que les 4 policies sont bien créées dans Storage → docs → Policies

### Erreur : "permission denied"
→ Vérifie que tu es bien connecté dans l'app (session active)

---

## ✅ TOUT EST PRÊT !

Une fois le script SQL exécuté, **tout fonctionnera automatiquement** ! 🎉

Le code est déjà modifié et prêt à uploader les PDFs dans Storage.

**Temps total** : ~2 minutes (juste copier-coller le SQL) ⏱️

