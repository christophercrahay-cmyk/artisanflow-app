# 🚀 GUIDE DE DÉPLOIEMENT DES EDGE FUNCTIONS

## ❌ ERREUR 401 "Unauthorized"

Cette erreur signifie que Supabase CLI n'est pas authentifié ou que le projet n'est pas lié.

---

## ✅ SOLUTION 1 : Via Supabase Dashboard (RECOMMANDÉ)

### Étape 1 : Aller dans le Dashboard

1. Ouvrir https://supabase.com/dashboard
2. Sélectionner votre projet : **upihalivqstavxijlwaj**
3. Aller dans **Edge Functions** (menu gauche)

### Étape 2 : Déployer chaque fonction

Pour chaque fonction (`transcribe-audio`, `correct-text`, `analyze-note`) :

1. Cliquer sur **"Deploy a new function"** (ou **"New Function"**)
2. **Nommer la fonction** : `transcribe-audio` (puis `correct-text`, puis `analyze-note`)
3. **Copier le contenu** du fichier `supabase/functions/[nom]/index.ts`
4. **Coller dans l'éditeur** du Dashboard
5. Cliquer sur **"Deploy"**

### Étape 3 : Configurer le secret OpenAI

1. Aller dans **Edge Functions** → **Settings** → **Secrets**
2. Cliquer sur **"Add secret"**
3. **Name** : `OPENAI_API_KEY`
4. **Value** : `sk-votre-cle-api-openai`
5. Cliquer sur **"Save"**

---

## ✅ SOLUTION 2 : Via Supabase CLI (Si installé)

### Étape 1 : Installer Supabase CLI

**Windows (via Scoop)** :
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Windows (via npm)** :
```bash
npm install -g supabase
```

**Vérifier l'installation** :
```bash
supabase --version
```

### Étape 2 : Se connecter à Supabase

```bash
supabase login
```

Cela ouvrira votre navigateur pour vous authentifier.

### Étape 3 : Lier le projet

```bash
supabase link --project-ref upihalivqstavxijlwaj
```

Vous devrez entrer :
- **Database password** : (si demandé)
- **Git branch** : (optionnel, laisser vide)

### Étape 4 : Configurer le secret OpenAI

```bash
supabase secrets set OPENAI_API_KEY=sk-votre-cle-api-openai
```

### Étape 5 : Déployer les fonctions

**Option A : Utiliser le script**
```bash
deploy-edge-functions.bat
```

**Option B : Déployer manuellement**
```bash
supabase functions deploy transcribe-audio
supabase functions deploy correct-text
supabase functions deploy analyze-note
```

---

## 🔍 VÉRIFICATION

### Vérifier que les fonctions sont déployées

**Via Dashboard** :
1. Aller dans **Edge Functions**
2. Vous devriez voir les 3 fonctions listées :
   - ✅ `transcribe-audio`
   - ✅ `correct-text`
   - ✅ `analyze-note`

**Via CLI** :
```bash
supabase functions list
```

### Tester une fonction

**Via Dashboard** :
1. Cliquer sur une fonction
2. Aller dans l'onglet **"Invoke"**
3. Tester avec un payload JSON

**Via curl** :
```bash
curl -X POST https://upihalivqstavxijlwaj.supabase.co/functions/v1/correct-text \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "y faut changer 3 prise"}'
```

---

## ⚠️ DÉPANNAGE

### Erreur : "Unauthorized" (401)

**Causes possibles** :
- ❌ Pas connecté à Supabase (`supabase login`)
- ❌ Projet non lié (`supabase link`)
- ❌ Token expiré (relancer `supabase login`)

**Solution** :
```bash
supabase login
supabase link --project-ref upihalivqstavxijlwaj
```

### Erreur : "OPENAI_API_KEY non configurée"

**Solution** :
```bash
supabase secrets set OPENAI_API_KEY=sk-votre-cle-api
```

Ou via Dashboard : **Edge Functions** → **Settings** → **Secrets**

### Erreur : "Docker is not running"

**Note** : Ce warning est normal si vous déployez directement vers Supabase Cloud. Docker n'est nécessaire que pour le développement local.

---

## 📝 RÉCAPITULATIF

### Méthode Dashboard (Recommandée) ✅

1. ✅ Aller dans Supabase Dashboard
2. ✅ Edge Functions → Deploy a new function
3. ✅ Copier-coller le code de chaque `index.ts`
4. ✅ Configurer le secret `OPENAI_API_KEY`

### Méthode CLI

1. ✅ Installer Supabase CLI
2. ✅ `supabase login`
3. ✅ `supabase link --project-ref upihalivqstavxijlwaj`
4. ✅ `supabase secrets set OPENAI_API_KEY=...`
5. ✅ `deploy-edge-functions.bat`

---

**Une fois déployées, les fonctions seront accessibles à :**
- `https://upihalivqstavxijlwaj.supabase.co/functions/v1/transcribe-audio`
- `https://upihalivqstavxijlwaj.supabase.co/functions/v1/correct-text`
- `https://upihalivqstavxijlwaj.supabase.co/functions/v1/analyze-note`

