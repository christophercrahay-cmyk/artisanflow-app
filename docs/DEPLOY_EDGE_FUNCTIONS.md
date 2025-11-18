# 🚀 DÉPLOIEMENT DES EDGE FUNCTIONS

## 📋 Edge Functions à Déployer

3 nouvelles Edge Functions ont été créées pour sécuriser les appels OpenAI :

1. **`transcribe-audio`** - Transcription Whisper
2. **`correct-text`** - Correction orthographique
3. **`analyze-note`** - Analyse de note vocale

---

## 🔧 MÉTHODE 1 : Via Supabase Dashboard (Recommandé)

### Étape 1 : Aller dans le Dashboard

1. Ouvrir https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Edge Functions** (menu gauche)

### Étape 2 : Déployer chaque fonction

Pour chaque fonction (`transcribe-audio`, `correct-text`, `analyze-note`) :

1. Cliquer sur **"Deploy a new function"**
2. Nommer la fonction (ex: `transcribe-audio`)
3. Copier-coller le contenu du fichier `supabase/functions/[nom]/index.ts`
4. Cliquer sur **"Deploy"**

---

## 🔧 MÉTHODE 2 : Via CLI Supabase

### Prérequis

```bash
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase
```

### Authentification

```bash
# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref upihalivqstavxijlwaj
```

### Déployer les fonctions

```bash
# Déployer transcribe-audio
supabase functions deploy transcribe-audio

# Déployer correct-text
supabase functions deploy correct-text

# Déployer analyze-note
supabase functions deploy analyze-note
```

---

## 🔐 CONFIGURER LA CLÉ API OPENAI

### Via Dashboard

1. Aller dans **Edge Functions** → **Settings** → **Secrets**
2. Ajouter le secret :
   - **Name** : `OPENAI_API_KEY`
   - **Value** : `sk-votre-cle-api-openai`

### Via CLI

```bash
supabase secrets set OPENAI_API_KEY=sk-votre-cle-api-openai
```

---

## ✅ VÉRIFICATION

### Tester chaque fonction

#### 1. transcribe-audio

```bash
curl -X POST \
  https://upihalivqstavxijlwaj.supabase.co/functions/v1/transcribe-audio \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "rec_123_1234567890.m4a"
  }'
```

#### 2. correct-text

```bash
curl -X POST \
  https://upihalivqstavxijlwaj.supabase.co/functions/v1/correct-text \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "y faut changer 3 prise dan la cuissine"
  }'
```

#### 3. analyze-note

```bash
curl -X POST \
  https://upihalivqstavxijlwaj.supabase.co/functions/v1/analyze-note \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "noteText": "3 prises électriques à installer dans la cuisine"
  }'
```

---

## 📝 NOTES IMPORTANTES

1. **Service Role Key** : Les Edge Functions utilisent `SUPABASE_SERVICE_ROLE_KEY` pour accéder à Storage
   - Cette clé est automatiquement disponible dans les Edge Functions
   - Pas besoin de la configurer manuellement

2. **CORS** : Les fonctions sont configurées pour accepter les requêtes depuis le client mobile

3. **Authentification** : Les fonctions vérifient le token d'authentification dans le header `Authorization`

---

## 🐛 DÉPANNAGE

### Erreur : "OPENAI_API_KEY non configurée"

➡️ Vérifier que le secret est bien configuré dans le Dashboard

### Erreur : "Token d'authentification manquant"

➡️ Vérifier que le client envoie bien le token dans le header `Authorization`

### Erreur : "Fichier introuvable" (transcribe-audio)

➡️ Vérifier que le fichier existe bien dans le bucket `voices` avec le bon chemin

---

**Une fois déployées, les fonctions seront accessibles à :**
- `https://upihalivqstavxijlwaj.supabase.co/functions/v1/transcribe-audio`
- `https://upihalivqstavxijlwaj.supabase.co/functions/v1/correct-text`
- `https://upihalivqstavxijlwaj.supabase.co/functions/v1/analyze-note`

