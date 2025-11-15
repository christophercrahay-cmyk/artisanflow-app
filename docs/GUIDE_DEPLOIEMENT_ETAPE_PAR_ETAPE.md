# 🎯 Guide Pas à Pas - Déploiement Système d'Import GPT

## 📋 Vue d'ensemble

Ce guide vous accompagne étape par étape pour déployer le nouveau système d'import universel basé sur GPT. **Temps estimé : 15-20 minutes**.

---

## ✅ ÉTAPE 1 : Vérifier l'installation Supabase CLI (5 min)

### 1.1 Vérifier si Supabase CLI est installé

Ouvrez PowerShell et tapez :

```powershell
supabase --version
```

**Si vous voyez une version** (ex: `1.x.x`) → ✅ C'est bon, passez à l'étape 1.2  
**Si vous voyez "command not found"** → Installez Supabase CLI :

```powershell
# Option 1 : Via npm (recommandé)
npm install -g supabase

# Option 2 : Via Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 1.2 Se connecter à Supabase

```powershell
supabase login
```

Cela ouvrira votre navigateur pour vous authentifier. Une fois connecté, vous verrez : `✅ Logged in as [votre-email]`

---

## ✅ ÉTAPE 2 : Lier votre projet Supabase (3 min)

### 2.1 Récupérer vos identifiants Supabase

1. Ouvrez votre **Supabase Dashboard** : https://supabase.com/dashboard
2. Sélectionnez votre projet ArtisanFlow
3. Allez dans **Settings** → **API**
4. Notez :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **Project Reference** : `xxxxx` (dans l'URL)

### 2.2 Lier le projet local

Depuis le dossier du projet (`C:\Users\Chris\Desktop\MVP_Artisan\artisanflow`), tapez :

```powershell
supabase link --project-ref VOTRE_PROJECT_REF
```

Remplacez `VOTRE_PROJECT_REF` par votre Project Reference (ex: `upihalivqstavxijlwaj`).

**Si ça demande une confirmation** → Tapez `y` et Entrée.

---

## ✅ ÉTAPE 3 : Créer le bucket Storage et configurer RLS (5 min)

### 3.1 Créer le bucket et configurer les politiques RLS

1. Ouvrez **Supabase Dashboard** → **SQL Editor**
2. Créez une nouvelle requête
3. Ouvrez le fichier `sql/setup_storage_imports_rls.sql` dans votre éditeur
4. **Copiez tout le contenu** du fichier
5. **Collez** dans l'éditeur SQL de Supabase
6. Cliquez sur **Run**

**Ce script va :**
- ✅ Créer le bucket `imports` (s'il n'existe pas)
- ✅ Configurer les politiques RLS pour l'isolation multi-tenant
- ✅ Autoriser les utilisateurs authentifiés à uploader dans leur propre dossier

### 3.2 Vérification

1. Ouvrez **Supabase Dashboard** → **Storage**
2. Vous devriez voir le bucket `imports` ✅
3. (Optionnel) Vérifiez les politiques RLS dans **Storage** → **Policies**

**⚠️ IMPORTANT** : Ne créez PAS le bucket manuellement via le Dashboard si vous utilisez le script SQL, car les politiques RLS doivent être créées en même temps.

---

## ✅ ÉTAPE 4 : Configurer OpenAI API Key (3 min)

### 4.1 Obtenir une clé OpenAI

1. Allez sur https://platform.openai.com/api-keys
2. Connectez-vous ou créez un compte
3. Cliquez sur **Create new secret key**
4. Nommez-la : `ArtisanFlow Import`
5. **Copiez la clé** (elle commence par `sk-...` et ne sera affichée qu'une fois !)

### 4.2 Ajouter le secret dans Supabase

1. Ouvrez **Supabase Dashboard** → **Edge Functions** → **Secrets**
2. Cliquez sur **Add new secret**
3. **Name** : `OPENAI_API_KEY`
4. **Value** : Collez votre clé OpenAI (`sk-...`)
5. Cliquez sur **Save**

**Vérification** : Vous devriez voir `OPENAI_API_KEY` dans la liste des secrets ✅

---

## ✅ ÉTAPE 5 : Déployer les Edge Functions (5 min)

### 5.1 Vérifier que vous êtes dans le bon dossier

```powershell
cd C:\Users\Chris\Desktop\MVP_Artisan\artisanflow
pwd  # Vérifie que vous êtes au bon endroit
```

### 5.2 Déployer la première fonction (analyse)

```powershell
supabase functions deploy ai-import-analyze
```

**Attendez la fin** (peut prendre 1-2 minutes). Vous devriez voir :
```
✅ Deployed Function ai-import-analyze
```

### 5.3 Déployer la deuxième fonction (traitement)

```powershell
supabase functions deploy ai-import-process
```

**Attendez la fin**. Vous devriez voir :
```
✅ Deployed Function ai-import-process
```

### 5.4 Vérifier le déploiement

1. Ouvrez **Supabase Dashboard** → **Edge Functions**
2. Vous devriez voir :
   - ✅ `ai-import-analyze`
   - ✅ `ai-import-process`

---

## ✅ ÉTAPE 6 : (Optionnel) Migration user_id (3 min)

Cette étape est **optionnelle** mais recommandée pour améliorer les performances.

### 6.1 Ouvrir le fichier SQL

Ouvrez le fichier : `sql/add_user_id_to_devis_factures.sql`

### 6.2 Exécuter dans Supabase

1. Ouvrez **Supabase Dashboard** → **SQL Editor**
2. Créez une nouvelle requête
3. **Copiez tout le contenu** de `sql/add_user_id_to_devis_factures.sql`
4. **Collez** dans l'éditeur SQL
5. Cliquez sur **Run**

**Vérification** : Vous devriez voir des messages `✅ Colonne user_id ajoutée...`

---

## 🧪 ÉTAPE 7 : Tester le système (5 min)

### 7.1 Créer un fichier CSV de test

Créez un fichier `test_import.csv` avec ce contenu :

```csv
Nom,Email,Téléphone,Adresse,Ville
Jean Dupont,jean@example.com,0123456789,123 Rue Test,Paris
Marie Martin,marie@example.com,0987654321,456 Avenue Test,Lyon
```

Sauvegardez-le sur votre téléphone ou dans un dossier accessible.

### 7.2 Tester dans l'app

1. **Lancez l'app** ArtisanFlow
2. Allez dans **Settings** (ou **Paramètres**)
3. Trouvez **Import de données** (ou **Importer mes données**)
4. Cliquez sur **Choisir un fichier**
5. Sélectionnez `test_import.csv`
6. Cliquez sur **Analyser le fichier**
7. **Attendez** (10-30 secondes pour l'analyse GPT)
8. Vérifiez le résumé : "2 clients détectés"
9. Cliquez sur **Importer les données**
10. **Vérifiez** dans la liste des clients que Jean Dupont et Marie Martin sont créés ✅

---

## 🐛 Dépannage

### ❌ Erreur "supabase: command not found"

→ Installez Supabase CLI (voir Étape 1.1)

### ❌ Erreur "Not logged in"

→ Exécutez `supabase login` (voir Étape 1.2)

### ❌ Erreur "Project not linked"

→ Exécutez `supabase link --project-ref VOTRE_REF` (voir Étape 2.2)

### ❌ Erreur "Bucket imports not found"

→ Créez le bucket (voir Étape 3)

### ❌ Erreur "OPENAI_API_KEY not found"

→ Ajoutez le secret (voir Étape 4)

### ❌ Erreur "Function deployment failed"

→ Vérifiez que vous êtes dans le bon dossier (`C:\Users\Chris\Desktop\MVP_Artisan\artisanflow`)  
→ Vérifiez que les dossiers `supabase/functions/ai-import-analyze` et `supabase/functions/ai-import-process` existent

### ❌ Erreur "Column user_id does not exist"

→ Exécutez la migration SQL (voir Étape 6) OU ignorez cette erreur (le système fonctionne sans)

### ❌ L'analyse GPT ne fonctionne pas

→ Vérifiez que votre clé OpenAI a des crédits  
→ Vérifiez que le secret `OPENAI_API_KEY` est bien configuré  
→ Regardez les logs dans Supabase Dashboard → Edge Functions → Logs

---

## ✅ Checklist finale

Avant de considérer le déploiement terminé, vérifiez :

- [ ] Supabase CLI installé et connecté
- [ ] Projet Supabase lié (`supabase link`)
- [ ] Bucket `imports` créé dans Storage
- [ ] Secret `OPENAI_API_KEY` configuré
- [ ] Edge Function `ai-import-analyze` déployée
- [ ] Edge Function `ai-import-process` déployée
- [ ] Test d'import CSV réussi
- [ ] Clients créés dans l'app après import

---

## 🎉 Félicitations !

Si toutes les étapes sont complétées, votre système d'import GPT est **opérationnel** !

Vous pouvez maintenant :
- ✅ Importer des clients depuis n'importe quel CSV
- ✅ Importer des projets et devis automatiquement
- ✅ Le système détecte automatiquement les colonnes avec GPT

---

## 📞 Besoin d'aide ?

Si vous êtes bloqué à une étape, dites-moi :
1. **À quelle étape** vous êtes bloqué
2. **Le message d'erreur exact** (copiez-collez)
3. **Ce que vous avez déjà fait**

Je vous aiderai à résoudre le problème ! 🚀

