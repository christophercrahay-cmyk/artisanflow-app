# 📊 ANALYSE - CORRECTION ORTHOGRAPHIQUE NOTES VOCALES

**Date** : 9 novembre 2025  
**Objectif** : Corriger automatiquement l'orthographe des transcriptions Whisper avec l'IA

---

## 🔍 **1️⃣ ANALYSE DE L'EXISTANT**

### **📁 Fichiers concernés**

1. **`VoiceRecorder.js`** - Composant principal d'enregistrement vocal
2. **`services/transcriptionService.js`** - Service Whisper (OpenAI)
3. **`services/quoteAnalysisService.js`** - Service d'analyse IA (GPT)
4. **Table `notes`** - Stockage des notes vocales

---

### **🔍 Workflow actuel : Audio → Transcription → Insertion en base**

#### **Étape 1 : Enregistrement audio**

**Fichier** : `VoiceRecorder.js` → `startRecording()` / `stopRecording()`

```javascript
// 1. Demande permission micro
// 2. Enregistrement audio (format M4A)
// 3. Sauvegarde locale de l'URI
// 4. Affichage du bouton "Envoyer"
```

---

#### **Étape 2 : Upload + Transcription**

**Fichier** : `VoiceRecorder.js` → `uploadAndSave()`

**Ligne 185-266** :

```javascript
const uploadAndSave = async () => {
  // 1. Upload du fichier audio vers Supabase Storage (bucket 'voices')
  const { data: up } = await supabase.storage
    .from('voices')
    .upload(fileName, bytes, { contentType: 'audio/m4a' });

  // 2. Transcription avec Whisper (OpenAI)
  let transcribedText = '';
  try {
    transcribedText = await transcribeAudio(recordUri); // ✅ Appel Whisper
    
    // 3. Analyse avec GPT (détection type de note)
    if (transcribedText && transcribedText.trim()) {
      analysis = await analyzeNote(transcribedText); // ✅ Appel GPT
    }
    
    setTranscription(transcribedText); // ✅ Affichage dans l'UI
    
  } catch (transcribeError) {
    // En cas d'erreur, continuer avec transcription vide
    transcribedText = '';
  }

  // 4. Sauvegarde en base
  const noteData = {
    project_id: currentProject.id,
    client_id: currentClient.id,
    user_id: user?.id,
    type: 'voice',
    storage_path: up?.path || fileName,
    transcription: transcribedText || null, // ❌ Transcription BRUTE stockée
    analysis_data: analysis ? JSON.stringify(analysis) : null,
  };

  await supabase.from('notes').insert([noteData]);
};
```

---

#### **Étape 3 : Service Whisper**

**Fichier** : `services/transcriptionService.js` → `transcribeAudio()`

**Ligne 16-55** :

```javascript
export const transcribeAudio = async (audioUri) => {
  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'audio.m4a'
  });
  formData.append('model', 'whisper-1');
  formData.append('language', 'fr'); // ✅ Français
  formData.append('response_format', 'json');
  
  const response = await fetch(
    'https://api.openai.com/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`,
      },
      body: formData
    }
  );
  
  const data = await response.json();
  return data.text; // ✅ Texte brut retourné
};
```

---

#### **Étape 4 : Stockage en base**

**Table** : `notes`

**Colonnes** :
- `id` (UUID)
- `project_id` (UUID)
- `client_id` (UUID)
- `user_id` (UUID)
- `type` (TEXT) - 'voice' ou 'text'
- `storage_path` (TEXT) - Chemin fichier audio
- **`transcription` (TEXT)** - ✅ Transcription Whisper (BRUTE)
- `analysis_data` (JSONB) - Analyse GPT
- `created_at` (TIMESTAMP)

---

## 🔥 **PROBLÈMES IDENTIFIÉS**

### **1. Transcription brute stockée** ❌

**Problème** :
- Whisper transcrit avec des fautes d'orthographe, accords manquants, ponctuation approximative
- Cette transcription brute est directement stockée dans `notes.transcription`
- Elle est utilisée telle quelle pour :
  - L'affichage dans l'app
  - La génération de devis IA

**Exemple** :
```
Whisper : "y faut changer 3 prise dan la cuissine"
Stocké : "y faut changer 3 prise dan la cuissine" ❌
Attendu : "Il faut changer 3 prises dans la cuisine" ✅
```

**Impact** :
- Mauvaise UX (fautes visibles)
- Devis IA moins précis (texte mal écrit)

---

### **2. Pas de correction orthographique** ❌

**Problème** :
- Aucune étape de correction entre Whisper et le stockage
- L'IA GPT est déjà utilisée pour l'analyse, mais pas pour la correction

---

## ✅ **2️⃣ SOLUTION PROPOSÉE**

### **Pipeline amélioré**

```
1. Enregistrement audio
   ↓
2. Upload vers Supabase Storage
   ↓
3. Transcription Whisper (texte brut)
   ↓
4. ✨ CORRECTION ORTHOGRAPHIQUE IA ✨ (NOUVEAU)
   ↓
5. Analyse GPT (type de note)
   ↓
6. Stockage en base (texte corrigé)
```

---

### **Fonction de correction**

**Fichier** : `services/transcriptionService.js`

**Nouvelle fonction** : `correctNoteText(text)`

```javascript
/**
 * Corrige l'orthographe et la grammaire d'une transcription
 * @param {string} text - Texte brut de Whisper
 * @returns {Promise<string>} Texte corrigé
 */
export const correctNoteText = async (text) => {
  try {
    console.log('[Correction] Texte original:', text);
    
    // Si texte vide, retourner tel quel
    if (!text || !text.trim()) {
      return text;
    }
    
    // Appel à GPT-4o-mini pour correction
    const response = await fetch(
      `${OPENAI_CONFIG.apiUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OPENAI_CONFIG.models.gpt, // 'gpt-4o-mini'
          messages: [
            {
              role: 'system',
              content: `Tu es un correcteur orthographique pour des notes vocales d'artisans du bâtiment.

RÈGLES STRICTES :
1. Corrige UNIQUEMENT l'orthographe, les accords et la ponctuation
2. NE CHANGE PAS le sens ni la formulation
3. NE REFORMULE PAS les phrases
4. Garde le style oral et naturel
5. Renvoie UNIQUEMENT le texte corrigé, sans explications

Exemples :
- "y faut changer 3 prise dan la cuissine" → "Il faut changer 3 prises dans la cuisine"
- "jai refait lelectricite du salon" → "J'ai refait l'électricité du salon"
- "8 prise 3 interrupteur" → "8 prises, 3 interrupteurs"`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3, // Peu de créativité
          max_tokens: 500,
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`GPT API error: ${response.status}`);
    }
    
    const data = await response.json();
    const correctedText = data.choices[0]?.message?.content?.trim() || text;
    
    console.log('[Correction] Texte corrigé:', correctedText);
    
    return correctedText;
    
  } catch (error) {
    console.error('[Correction] Erreur:', error);
    // En cas d'erreur, retourner le texte original
    return text;
  }
};
```

---

### **Modification du workflow**

**Fichier** : `VoiceRecorder.js` → `uploadAndSave()`

**Changement** (ligne 222-238) :

```javascript
// AVANT ❌
try {
  transcribedText = await transcribeAudio(recordUri);
  setTranscription(transcribedText);
  
  if (transcribedText && transcribedText.trim()) {
    analysis = await analyzeNote(transcribedText);
  }
} catch (transcribeError) {
  transcribedText = '';
}

// APRÈS ✅
try {
  // 1. Transcription Whisper (brut)
  const rawText = await transcribeAudio(recordUri);
  console.log('[VoiceRecorder] Transcription brute:', rawText);
  
  // 2. ✨ Correction orthographique ✨
  transcribedText = await correctNoteText(rawText);
  console.log('[VoiceRecorder] Transcription corrigée:', transcribedText);
  
  setTranscription(transcribedText); // ✅ Afficher la version corrigée
  
  // 3. Analyse GPT (sur texte corrigé)
  if (transcribedText && transcribedText.trim()) {
    analysis = await analyzeNote(transcribedText);
  }
} catch (transcribeError) {
  // En cas d'erreur, continuer avec transcription vide
  transcribedText = '';
}
```

---

## 📋 **3️⃣ MODIFICATIONS À APPORTER**

### **Fichier 1 : `services/transcriptionService.js`**

**Action** : AJOUTER la fonction `correctNoteText()`

**Localisation** : Après la fonction `transcribeAudio()` (ligne 56)

---

### **Fichier 2 : `VoiceRecorder.js`**

**Action** : MODIFIER la fonction `uploadAndSave()`

**Changements** :
1. Importer `correctNoteText` depuis `transcriptionService`
2. Appeler `correctNoteText()` après `transcribeAudio()`
3. Utiliser le texte corrigé pour l'affichage et le stockage

---

### **Pas de modification SQL** ✅

**Raison** :
- La colonne `transcription` existe déjà
- On stocke directement le texte corrigé à la place du texte brut
- Pas besoin de colonne `raw_text` (simplification)

---

## 🔍 **WORKFLOW AVANT vs APRÈS**

### **AVANT** ❌

```
1. Audio enregistré
   ↓
2. Upload Supabase Storage
   ↓
3. Whisper transcrit → "y faut changer 3 prise dan la cuissine"
   ↓
4. Analyse GPT → type: "travaux"
   ↓
5. Stockage en base :
   transcription: "y faut changer 3 prise dan la cuissine" ❌
   ↓
6. Affichage dans l'app : texte avec fautes ❌
   ↓
7. Génération devis IA : texte avec fautes ❌
```

---

### **APRÈS** ✅

```
1. Audio enregistré
   ↓
2. Upload Supabase Storage
   ↓
3. Whisper transcrit → "y faut changer 3 prise dan la cuissine"
   ↓
4. ✨ GPT corrige → "Il faut changer 3 prises dans la cuisine" ✨
   ↓
5. Analyse GPT → type: "travaux"
   ↓
6. Stockage en base :
   transcription: "Il faut changer 3 prises dans la cuisine" ✅
   ↓
7. Affichage dans l'app : texte propre ✅
   ↓
8. Génération devis IA : texte propre ✅
```

---

## ✅ **CE QUI EST STOCKÉ**

### **Table `notes`**

| Colonne | Contenu | Exemple |
|---------|---------|---------|
| `id` | UUID | `abc-123...` |
| `project_id` | UUID chantier | `def-456...` |
| `user_id` | UUID artisan | `ghi-789...` |
| `type` | Type de note | `'voice'` |
| `storage_path` | Fichier audio | `rec_xxx_123.m4a` |
| **`transcription`** | **Texte CORRIGÉ** ✅ | `"Il faut changer 3 prises dans la cuisine"` |
| `analysis_data` | Analyse JSON | `{"type": "travaux", ...}` |

**Note** : On ne stocke PAS le texte brut (simplification)

---

## 🧪 **4️⃣ SCÉNARIO DE TEST**

### **Test 1 : Note vocale avec fautes**

1. **Ouvrir un chantier**
2. **Enregistrer une note vocale** en parlant vite :
   - "y faut changer 3 prise dan la cuissine"
3. **Cliquer sur "Envoyer"**
4. **Vérifier dans l'app** :
   - ✅ Le texte affiché est : "Il faut changer 3 prises dans la cuisine"
5. **Vérifier dans Supabase** (table `notes`) :
   - ✅ La colonne `transcription` contient le texte corrigé

---

### **Test 2 : Génération devis IA**

1. **Créer plusieurs notes vocales** avec fautes
2. **Cliquer sur "Générer devis IA"**
3. **Vérifier** :
   - ✅ Le devis généré utilise les textes corrigés
   - ✅ Pas de fautes dans le contexte envoyé à l'IA

---

### **Test 3 : Erreur IA (timeout)**

1. **Simuler une erreur** (déconnecter internet pendant la correction)
2. **Enregistrer une note vocale**
3. **Vérifier** :
   - ✅ La note est quand même enregistrée (avec texte brut)
   - ✅ L'utilisateur n'est pas bloqué
   - ✅ Un log d'erreur est affiché dans la console

---

## ⚡ **AVANTAGES**

1. ✅ **UX améliorée** : Textes propres dans l'app
2. ✅ **Devis IA plus précis** : Contexte de qualité
3. ✅ **Robuste** : Fallback vers texte brut en cas d'erreur
4. ✅ **Simple** : Pas de nouvelle table, pas de nouveau service
5. ✅ **Réutilise l'existant** : Même API OpenAI, même config
6. ✅ **Rapide** : GPT-4o-mini est très rapide (~1s)
7. ✅ **Peu coûteux** : GPT-4o-mini est très économique

---

## 📊 **COÛT ESTIMÉ**

**Par note vocale** :
- Whisper : ~$0.006 / minute (déjà en place)
- GPT-4o-mini : ~$0.0001 / correction (NOUVEAU)

**Total ajouté** : ~$0.0001 par note = **négligeable** ✅

---

## ⏱️ **TEMPS D'IMPLÉMENTATION**

**Estimation** : 30-45 minutes

**Répartition** :
- Ajouter fonction `correctNoteText()` : 15 min
- Modifier `VoiceRecorder.js` : 15 min
- Tests : 15 min

---

## 🚀 **PROCHAINES ÉTAPES**

1. ✅ Ajouter `correctNoteText()` dans `transcriptionService.js`
2. ✅ Modifier `uploadAndSave()` dans `VoiceRecorder.js`
3. ✅ Tester le workflow complet
4. ✅ Vérifier que la génération de devis IA fonctionne toujours

---

**Complexité** : Faible ⭐  
**Impact** : Élevé ✅  
**Risque** : Faible (fallback en cas d'erreur)

