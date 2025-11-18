# 🔍 AUDIT COMPLET : SYSTÈME VOCAL / TRANSCRIPTION / GÉNÉRATION IA

**Date** : 2025-01-XX  
**Objectif** : Analyser le système actuel avant refactoring sécurisé (migration vers Edge Functions)

---

## 📋 TABLE DES MATIÈRES

1. [Workflow Actuel Complet](#1-workflow-actuel-complet)
2. [Fichiers Impliqués](#2-fichiers-impliqués)
3. [Problèmes de Sécurité](#3-problèmes-de-sécurité)
4. [État Fonctionnel vs Cassé](#4-état-fonctionnel-vs-cassé)
5. [Plan de Migration](#5-plan-de-migration)

---

## 1. WORKFLOW ACTUEL COMPLET

### 🎤 **ÉTAPE 1 : ENREGISTREMENT VOCAL**

**Composant** : `VoiceRecorder.js` (ligne 115-156)

1. **Démarrage** :
   - Demande permission micro (`Audio.requestPermissionsAsync()`)
   - Configure mode audio (`Audio.setAudioModeAsync()`)
   - Crée `Audio.Recording` avec preset `HIGH_QUALITY`
   - Démarre l'enregistrement (`recording.startAsync()`)

2. **Arrêt** :
   - Arrête l'enregistrement (`recording.stopAndUnloadAsync()`)
   - Récupère l'URI du fichier audio (format M4A)
   - Vérifie durée minimale (2 secondes)

**Résultat** : Fichier audio local (`file://...`)

---

### 📤 **ÉTAPE 2 : UPLOAD VERS SUPABASE STORAGE**

**Composant** : `VoiceRecorder.js` (ligne 204-229)

1. Lit le fichier audio en `Uint8Array`
2. Upload vers bucket `voices` dans Supabase Storage
3. Nom du fichier : `rec_{projectId}_{timestamp}.m4a`

**Résultat** : Fichier audio dans Supabase Storage

---

### 🎙️ **ÉTAPE 3 : TRANSCRIPTION**

**⚠️ DEUX MÉTHODES PARALLÈLES (non exclusives)** :

#### **3A. Transcription Locale (whisper.rn)** - ⚠️ NON UTILISÉE ACTUELLEMENT

**Composant** : `VoiceRecorder.js` (ligne 319-393)  
**Module** : `whisper.rn` (package natif)

- **État** : Code présent mais **non utilisé** dans le workflow principal
- **Fonctionnement** :
  - Télécharge modèle `ggml-base.bin` (140MB) depuis HuggingFace
  - Initialise contexte Whisper local
  - Transcrit l'audio localement
- **Problème** : Le code existe mais n'est jamais appelé dans `uploadAndSave()`

#### **3B. Transcription API OpenAI Whisper** - ✅ UTILISÉE

**Service** : `services/transcriptionService.js` (ligne 16-60)  
**Fonction** : `transcribeAudio(audioUri)`

1. **Appel API** :
   - Endpoint : `https://api.openai.com/v1/audio/transcriptions`
   - Méthode : `POST` avec `FormData`
   - Headers : `Authorization: Bearer ${OPENAI_CONFIG.apiKey}`
   - Modèle : `whisper-1`
   - Langue : `fr`

2. **⚠️ PROBLÈME SÉCURITÉ** :
   - Clé API envoyée depuis le **client mobile**
   - Clé stockée dans `process.env.EXPO_PUBLIC_OPENAI_API_KEY` (exposée dans le bundle JS)

**Résultat** : Texte brut transcrit (ex: "Il faut changer 3 prises dans la cuisine")

---

### ✏️ **ÉTAPE 4 : CORRECTION ORTHOGRAPHIQUE**

**Service** : `services/transcriptionService.js` (ligne 67-134)  
**Fonction** : `correctNoteText(text)`

1. **Appel GPT-4o-mini** :
   - Endpoint : `https://api.openai.com/v1/chat/completions`
   - Modèle : `gpt-4o-mini`
   - Prompt système : Correcteur orthographique strict (ne change pas le sens)
   - Temperature : `0.3` (peu de créativité)

2. **⚠️ PROBLÈME SÉCURITÉ** :
   - Même clé API exposée côté client

**Résultat** : Texte corrigé (ex: "Il faut changer 3 prises dans la cuisine")

---

### 🧠 **ÉTAPE 5 : ANALYSE DE LA NOTE**

**Service** : `services/quoteAnalysisService.js` (ligne 17-128)  
**Fonction** : `analyzeNote(noteText)`

1. **Appel GPT-4o-mini** :
   - Endpoint : `https://api.openai.com/v1/chat/completions`
   - Modèle : `gpt-4o-mini`
   - Format réponse : `json_object`
   - Prompt système : Analyse pour déterminer type (prestation / client_info / note_perso)

2. **Résultat JSON** :
   ```json
   {
     "type": "prestation",
     "categorie": "Électricité",
     "description": "Installation prises cuisine",
     "quantite": 3,
     "unite": "pièce",
     "details": "cuisine"
   }
   ```

3. **⚠️ PROBLÈME SÉCURITÉ** :
   - Même clé API exposée côté client

**Résultat** : Objet d'analyse structuré

---

### 💾 **ÉTAPE 6 : SAUVEGARDE NOTE EN BASE**

**Composant** : `VoiceRecorder.js` (ligne 308-341)

1. Insert dans table `notes` :
   - `project_id`, `client_id`, `user_id`
   - `type: 'voice'`
   - `storage_path` (chemin dans Storage)
   - `transcription` (texte corrigé)
   - `analysis_data` (JSON stringifié de l'analyse)

**Résultat** : Note sauvegardée en base de données

---

### 🤖 **ÉTAPE 7 : GÉNÉRATION DEVIS AUTOMATIQUE (optionnel)**

**Composant** : `VoiceRecorder.js` (ligne 362-403)

**Condition** : Si `analysis.type === 'prestation'`

1. **Génération devis** :
   - **Service** : `utils/ai_quote_generator.js` (ligne 228-241)
   - **Fonction** : `generateQuoteFromTranscription(transcription, projectId, clientId, tvaPercent)`
   - **Méthode** : Parsing regex local (pas d'IA)
   - **Base de prix** : `PRICE_DATABASE` (hardcodé dans le code)

2. **Insertion devis** :
   - **Service** : `utils/supabase_helpers.js` (fonction `insertAutoQuote`)
   - Crée un devis avec statut `'edition'`
   - Crée les lignes dans `devis_lignes`

**Résultat** : Devis créé automatiquement si prestation détectée

---

### 🎯 **ÉTAPE 8 : GÉNÉRATION DEVIS IA CONVERSATIONNEL (alternative)**

**Composant** : `components/DevisAIGenerator2.js`

**Workflow différent** (non utilisé dans VoiceRecorder) :

1. **Démarrage session** :
   - **Service** : `services/aiConversationalService.js` (ligne 22-61)
   - **Edge Function** : `ai-devis-conversational` (✅ SÉCURISÉ)
   - Envoie transcription + notes du chantier
   - Reçoit questions de clarification

2. **Réponses** :
   - **Service** : `services/aiConversationalService.js` (ligne 69-105)
   - Envoie réponses aux questions
   - Reçoit devis généré ou nouvelles questions

3. **Finalisation** :
   - **Service** : `services/aiConversationalService.js` (ligne 112-146)
   - Force génération du devis final

4. **Création devis** :
   - **Service** : `services/aiConversationalService.js` (ligne 156-243)
   - Crée devis dans `devis` + lignes dans `devis_lignes`

**✅ SÉCURISÉ** : Clé API dans Edge Function (variable d'environnement serveur)

---

## 2. FICHIERS IMPLIQUÉS

### 📱 **COMPOSANTS UI**

| Fichier | Rôle | Lignes clés |
|---------|------|-------------|
| `VoiceRecorder.js` | Composant principal d'enregistrement | 38-805 |
| `DevisFactures.js` | Composant alternatif (non utilisé pour transcription) | 37-721 |
| `components/DevisAIGenerator2.js` | Générateur devis IA conversationnel | 38-879 |
| `components/VoiceRecorderSimple.js` | Version simplifiée (non utilisée) | - |

### 🔧 **SERVICES**

| Fichier | Rôle | Problème Sécurité |
|---------|------|-------------------|
| `services/transcriptionService.js` | Transcription Whisper + Correction GPT | ❌ Clé API client |
| `services/quoteAnalysisService.js` | Analyse note (prestation/client_info/note_perso) | ❌ Clé API client |
| `services/aiConversationalService.js` | Appels Edge Function (sécurisé) | ✅ OK |
| `services/aiLearningService.js` | Apprentissage IA (prix moyens) | ✅ OK (pas d'API) |

### 🛠️ **UTILS**

| Fichier | Rôle | Méthode |
|---------|------|---------|
| `utils/ai_quote_generator.js` | Génération devis depuis transcription | Parsing regex local |
| `utils/ai_quote_generator_improved.js` | Version améliorée (non utilisée) | Parsing regex local |

### ⚙️ **CONFIGURATION**

| Fichier | Rôle | Problème |
|---------|------|----------|
| `config/openai.js` | Configuration OpenAI | ❌ Clé API dans `EXPO_PUBLIC_*` (exposée) |

### 🚀 **EDGE FUNCTIONS (Supabase)**

| Fichier | Rôle | Sécurité |
|---------|------|----------|
| `supabase/functions/ai-devis-conversational/index.ts` | Génération devis IA Q/R | ✅ Clé API serveur |
| `supabase/functions/ai-import-analyze/index.ts` | Analyse CSV import | ✅ Clé API serveur |
| `supabase/functions/ai-import-process/index.ts` | Traitement import | ✅ Pas d'API OpenAI |
| `supabase/functions/sign-devis/index.ts` | Signature électronique | ✅ Pas d'API OpenAI |

---

## 3. PROBLÈMES DE SÉCURITÉ

### 🔴 **CRITIQUE : Clé API OpenAI Exposée**

**Fichiers concernés** :
- `config/openai.js` : `process.env.EXPO_PUBLIC_OPENAI_API_KEY`
- `services/transcriptionService.js` : Utilise `OPENAI_CONFIG.apiKey`
- `services/quoteAnalysisService.js` : Utilise `OPENAI_CONFIG.apiKey`

**Problème** :
1. Variable `EXPO_PUBLIC_*` = **exposée dans le bundle JavaScript**
2. Clé API visible dans le code source de l'app
3. Risque de vol / abus / facturation non contrôlée

**Impact** :
- ❌ Coûts OpenAI non maîtrisés
- ❌ Clé peut être extraite et réutilisée
- ❌ Pas de rate limiting côté client
- ❌ Pas de logs centralisés

**Solution** : Migrer vers Edge Functions (comme `ai-devis-conversational`)

---

### 🟡 **MOYEN : Transcription Locale Non Utilisée**

**Fichier** : `VoiceRecorder.js` (ligne 319-393)

**Problème** :
- Code `whisper.rn` présent mais **jamais appelé**
- Ligne 254 : `await transcribeAudio(recordUri)` → utilise toujours l'API OpenAI
- Code mort qui alourdit le bundle

**Impact** :
- Pas de transcription offline possible
- Dépendance totale à l'API OpenAI

**Solution** : Soit supprimer le code, soit l'activer comme fallback

---

### 🟢 **FAIBLE : Parsing Regex Local**

**Fichier** : `utils/ai_quote_generator.js`

**Problème** :
- Base de prix hardcodée dans le code
- Parsing regex fragile (ne détecte pas toutes les prestations)
- Pas d'apprentissage automatique

**Impact** :
- Génération de devis peu précise
- Prix fixes (pas de personnalisation par artisan)

**Solution** : Utiliser l'Edge Function `ai-devis-conversational` (déjà implémentée)

---

## 4. ÉTAT FONCTIONNEL VS CASSÉ

### ✅ **FONCTIONNE**

| Fonctionnalité | État | Fichier |
|----------------|------|---------|
| Enregistrement audio | ✅ OK | `VoiceRecorder.js` |
| Upload Supabase Storage | ✅ OK | `VoiceRecorder.js` |
| Transcription Whisper API | ✅ OK | `services/transcriptionService.js` |
| Correction orthographique GPT | ✅ OK | `services/transcriptionService.js` |
| Analyse note (prestation/client_info) | ✅ OK | `services/quoteAnalysisService.js` |
| Sauvegarde note en base | ✅ OK | `VoiceRecorder.js` |
| Génération devis IA conversationnel | ✅ OK | `components/DevisAIGenerator2.js` + Edge Function |
| Edge Function sécurisée | ✅ OK | `supabase/functions/ai-devis-conversational/` |

### ❌ **CASSÉ / INCOMPLET**

| Fonctionnalité | État | Problème |
|----------------|------|----------|
| Transcription locale whisper.rn | ❌ NON UTILISÉE | Code présent mais jamais appelé |
| Génération devis automatique | ⚠️ LIMITÉE | Parsing regex basique, prix hardcodés |
| Clé API sécurisée | ❌ EXPOSÉE | Dans `EXPO_PUBLIC_*` (visible dans bundle) |

### 🟡 **PARTIELLEMENT FONCTIONNEL**

| Fonctionnalité | État | Détails |
|----------------|------|---------|
| Génération devis depuis note vocale | 🟡 FONCTIONNE MAIS LIMITÉ | Utilise parsing regex au lieu de l'IA conversationnelle |

---

## 5. PLAN DE MIGRATION

### 🎯 **OBJECTIF**

Migrer **tous les appels OpenAI** depuis le client mobile vers des **Edge Functions Supabase** pour :
- ✅ Sécuriser les clés API
- ✅ Centraliser les logs
- ✅ Implémenter rate limiting
- ✅ Contrôler les coûts

---

### 📋 **PHASE 1 : CRÉER EDGE FUNCTIONS**

#### **1.1. Edge Function : Transcription Whisper**

**Fichier** : `supabase/functions/transcribe-audio/index.ts`

**Fonctionnalités** :
- Reçoit `filePath` (chemin dans Storage) ou `audioBase64`
- Appelle Whisper API avec clé serveur
- Retourne texte transcrit

**Signature** :
```typescript
POST /functions/v1/transcribe-audio
Body: { filePath: string } | { audioBase64: string }
Response: { transcription: string }
```

---

#### **1.2. Edge Function : Correction Orthographique**

**Fichier** : `supabase/functions/correct-text/index.ts`

**Fonctionnalités** :
- Reçoit texte brut
- Appelle GPT-4o-mini pour correction
- Retourne texte corrigé

**Signature** :
```typescript
POST /functions/v1/correct-text
Body: { text: string }
Response: { correctedText: string }
```

---

#### **1.3. Edge Function : Analyse Note**

**Fichier** : `supabase/functions/analyze-note/index.ts`

**Fonctionnalités** :
- Reçoit texte de note
- Appelle GPT-4o-mini pour analyse
- Retourne JSON structuré (prestation/client_info/note_perso)

**Signature** :
```typescript
POST /functions/v1/analyze-note
Body: { noteText: string }
Response: { type: string, ... }
```

---

### 📋 **PHASE 2 : MODIFIER SERVICES CLIENT**

#### **2.1. Refactoriser `transcriptionService.js`**

**Avant** :
```javascript
export const transcribeAudio = async (audioUri) => {
  const response = await fetch(`${OPENAI_CONFIG.apiUrl}/audio/transcriptions`, {
    headers: { 'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}` },
    // ...
  });
};
```

**Après** :
```javascript
export const transcribeAudio = async (audioUri) => {
  // Upload audio vers Storage si nécessaire
  const filePath = await uploadAudioToStorage(audioUri);
  
  // Appel Edge Function
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${SUPABASE_URL}/functions/v1/transcribe-audio`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filePath }),
  });
  
  const result = await response.json();
  return result.transcription;
};
```

---

#### **2.2. Refactoriser `quoteAnalysisService.js`**

**Avant** :
```javascript
export const analyzeNote = async (noteText) => {
  const response = await fetch(`${OPENAI_CONFIG.apiUrl}/chat/completions`, {
    headers: { 'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}` },
    // ...
  });
};
```

**Après** :
```javascript
export const analyzeNote = async (noteText) => {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-note`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ noteText }),
  });
  
  const result = await response.json();
  return result;
};
```

---

#### **2.3. Refactoriser `correctNoteText`**

**Même principe** : Remplacer appel API direct par Edge Function

---

### 📋 **PHASE 3 : NETTOYER CODE**

#### **3.1. Supprimer `config/openai.js`**

**Raison** : Plus besoin de config OpenAI côté client

**Action** : Supprimer le fichier (ou le garder vide avec juste les modèles)

---

#### **3.2. Supprimer Code Whisper.rn (ou l'activer)**

**Option A : Supprimer** (si on garde uniquement API)
- Supprimer imports `whisper.rn` dans `VoiceRecorder.js` et `DevisFactures.js`
- Supprimer code d'initialisation (ligne 319-393 dans `VoiceRecorder.js`)

**Option B : Activer comme Fallback** (si on veut transcription offline)
- Modifier `uploadAndSave()` pour essayer `whisper.rn` d'abord
- Fallback vers API si échec

**Recommandation** : **Option A** (simplifier, garder uniquement API)

---

#### **3.3. Supprimer `utils/ai_quote_generator.js`**

**Raison** : Remplacé par Edge Function `ai-devis-conversational`

**Action** : Supprimer le fichier (ou le garder comme fallback si Edge Function échoue)

---

### 📋 **PHASE 4 : CONFIGURER SECRETS SUPABASE**

#### **4.1. Variables d'Environnement Edge Functions**

Dans Supabase Dashboard → Edge Functions → Secrets :

```
OPENAI_API_KEY=sk-...
```

**Action** : Configurer via Dashboard ou CLI :
```bash
supabase secrets set OPENAI_API_KEY=sk-...
```

---

#### **4.2. Déployer Edge Functions**

```bash
supabase functions deploy transcribe-audio
supabase functions deploy correct-text
supabase functions deploy analyze-note
```

---

### 📋 **PHASE 5 : TESTER**

#### **5.1. Tests Manuels**

1. ✅ Enregistrer note vocale
2. ✅ Vérifier transcription via Edge Function
3. ✅ Vérifier correction orthographique
4. ✅ Vérifier analyse note
5. ✅ Vérifier génération devis automatique

#### **5.2. Tests de Sécurité**

1. ✅ Vérifier que clé API n'est plus dans le bundle JS
2. ✅ Vérifier que appels passent par Edge Functions
3. ✅ Vérifier logs dans Supabase Dashboard

---

## 📊 **RÉSUMÉ EXÉCUTIF**

### **État Actuel**

- ✅ **Fonctionnel** : Enregistrement, upload, transcription, analyse, génération devis
- ❌ **Sécurité** : Clé API OpenAI exposée côté client
- 🟡 **Code mort** : `whisper.rn` présent mais non utilisé

### **Actions Prioritaires**

1. **🔴 CRITIQUE** : Créer Edge Functions pour transcription/correction/analyse
2. **🟡 IMPORTANT** : Refactoriser services client pour utiliser Edge Functions
3. **🟢 OPTIONNEL** : Nettoyer code mort (`whisper.rn`, `ai_quote_generator.js`)

### **Estimation**

- **Phase 1** (Edge Functions) : 4-6h
- **Phase 2** (Refactoring client) : 2-3h
- **Phase 3** (Nettoyage) : 1h
- **Phase 4** (Config) : 30min
- **Phase 5** (Tests) : 2h

**Total** : ~10-12h de développement

---

## 🔗 **RÉFÉRENCES**

- Edge Function existante : `supabase/functions/ai-devis-conversational/index.ts`
- Documentation Supabase Edge Functions : https://supabase.com/docs/guides/functions
- Documentation OpenAI Whisper API : https://platform.openai.com/docs/guides/speech-to-text

---

**Fin du rapport d'audit**

