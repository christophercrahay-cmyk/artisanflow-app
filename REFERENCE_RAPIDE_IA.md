# 📚 RÉFÉRENCE RAPIDE - SYSTÈME IA ARTISANFLOW

**Guide de référence pour développeurs**

---

## 🔍 **TROUVER UN ÉLÉMENT RAPIDEMENT**

### **Je veux modifier...**

| Élément | Fichier | Ligne |
|---------|---------|-------|
| Prompt de génération devis | `supabase/functions/ai-devis-conversational/index.ts` | 378-414 |
| Prompt de correction orthographique | `services/transcriptionService.js` | 55-67 |
| Prompt d'analyse de note | `services/quoteAnalysisService.js` | 34-91 |
| Règles de colorisation des prix | `components/DevisAIGenerator.js` | 39-61 |
| Logique de normalisation des clés | `services/aiLearningService.js` | 14-87 |
| Calcul des moyennes de prix | `services/aiLearningService.js` | 184-210 |
| Affichage du devis IA | `components/DevisAIGenerator.js` | 268-337 |
| Enregistrement note vocale | `VoiceRecorder.js` | 185-320 |

---

## 📊 **TABLES SUPABASE - RÉFÉRENCE**

### **Table `notes`**

**Utilisation** : Stockage notes vocales/texte avec transcriptions corrigées

```sql
SELECT * FROM notes WHERE project_id = :id AND user_id = auth.uid();
```

**Colonnes clés** :
- `transcription` (TEXT) - Texte corrigé par GPT
- `analysis_data` (JSONB) - `{ type, categorie, description, quantite }`

---

### **Table `devis_ai_sessions`**

**Utilisation** : Sessions conversationnelles de génération de devis

```sql
SELECT * FROM devis_ai_sessions WHERE id = :session_id AND user_id = auth.uid();
```

**Colonnes clés** :
- `context_json` (JSONB) - Historique tours Q/R
- `status` (TEXT) - 'pending', 'questions', 'ready', 'validated'
- `tour_count` (INTEGER) - Nombre de tours effectués

---

### **Table `devis_temp_ai`**

**Utilisation** : Versions temporaires des devis pendant l'affinage

```sql
SELECT * FROM devis_temp_ai 
WHERE session_id = :session_id 
ORDER BY version DESC LIMIT 1;
```

**Colonnes clés** :
- `json_devis` (JSONB) - Devis complet (lignes, totaux)
- `questions_pending` (JSONB) - Questions en attente
- `version` (INTEGER) - Numéro de version

---

### **Table `ai_profiles`**

**Utilisation** : Profils IA personnalisés (prix moyens par artisan)

```sql
SELECT avg_prices FROM ai_profiles WHERE user_id = auth.uid();
```

**Structure `avg_prices`** :
```json
{
  "prise_electrique": {
    "avg": 45.5,
    "count": 23,
    "min": 35.0,
    "max": 55.0
  }
}
```

---

## 🔌 **APPELS API - RÉFÉRENCE**

### **1. Whisper - Transcription**

```javascript
const formData = new FormData();
formData.append('file', audioBlob, 'audio.m4a');
formData.append('model', 'whisper-1');
formData.append('language', 'fr');

const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
  body: formData
});

const { text } = await response.json();
```

**Fichier** : `services/transcriptionService.js` (ligne 16-54)

---

### **2. GPT-4o-mini - Correction**

```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Corrige uniquement l\'orthographe...' },
      { role: 'user', content: text }
    ],
    temperature: 0.3,
    max_tokens: 500
  })
});

const data = await response.json();
const correctedText = data.choices[0].message.content.trim();
```

**Fichier** : `services/transcriptionService.js` (ligne 55-103)

---

### **3. GPT-4o-mini - Analyse**

```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Détermine le type de note...' },
      { role: 'user', content: noteText }
    ],
    temperature: 0.3,
    response_format: { type: "json_object" }
  })
});

const data = await response.json();
const result = JSON.parse(data.choices[0].message.content);
// result = { type: 'prestation', categorie: 'Électricité', ... }
```

**Fichier** : `services/quoteAnalysisService.js` (ligne 17-123)

---

### **4. GPT-4o-mini - Génération devis**

```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Tu es un expert en devis...' },
      { role: 'user', content: 'Analyse cette note vocale...' }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: "json_object" }
  })
});

const data = await response.json();
const result = JSON.parse(data.choices[0].message.content);
// result = { titre, description, lignes[], total_ht, ... }
```

**Fichier** : `supabase/functions/ai-devis-conversational/index.ts` (ligne 444-469)

---

## 🛠️ **FONCTIONS UTILITAIRES**

### **normalizeKey(description)**

**Rôle** : Normaliser une description de ligne en clé générique

**Fichier** : `services/aiLearningService.js` (ligne 14-87)

**Exemple** :
```javascript
normalizeKey("Prise électrique encastrée") // → "prise_electrique"
normalizeKey("3 interrupteurs va-et-vient") // → "interrupteur"
normalizeKey("Installation tableau électrique") // → "tableau_electrique"
```

**Mots-clés détectés** : 30+ (prise, interrupteur, tableau, robinet, lavabo, porte, fenetre, peinture, placo, etc.)

---

### **getPriceColor(description, price)**

**Rôle** : Calculer la couleur d'un prix selon le profil IA

**Fichier** : `components/DevisAIGenerator.js` (ligne 39-61)

**Exemple** :
```javascript
const avgPrices = {
  "prise_electrique": { avg: 45.0, count: 23, min: 35.0, max: 55.0 }
};

getPriceColor("Prise électrique", 46.0); // → "#16A34A" (vert, +2%)
getPriceColor("Prise électrique", 55.0); // → "#F59E0B" (orange, +22%)
getPriceColor("Prise électrique", 70.0); // → "#DC2626" (rouge, +55%)
getPriceColor("Prise électrique", 30.0); // → "#2563EB" (bleu, -33%)
```

---

### **updateAIProfileFromDevis(devisId, userId)**

**Rôle** : Mettre à jour le profil IA après création d'un devis

**Fichier** : `services/aiLearningService.js` (ligne 135-227)

**Exemple** :
```javascript
// Après création d'un devis avec 3 lignes
await updateAIProfileFromDevis(devis.id, user.id);

// Résultat dans ai_profiles.avg_prices:
{
  "prise_electrique": { avg: 45.5, count: 24, min: 35.0, max: 55.0 }, // +1
  "interrupteur": { avg: 30.2, count: 19, min: 25.0, max: 40.0 },     // +1
  "tableau_electrique": { avg: 650.0, count: 1, min: 650.0, max: 650.0 } // nouveau
}
```

---

## 🎨 **RÈGLES DE COLORISATION**

```javascript
const diffPercent = ((prix - stats.avg) / stats.avg) * 100;

if (Math.abs(diffPercent) <= 10) return '#16A34A';  // 🟢 Vert : cohérent
if (Math.abs(diffPercent) <= 20) return '#F59E0B';  // 🟠 Orange : limite
if (diffPercent > 20) return '#DC2626';             // 🔴 Rouge : trop cher
if (diffPercent < -20) return '#2563EB';            // 🔵 Bleu : trop bas
```

**Exemples** :

| Prix moyen | Prix actuel | Écart | Couleur |
|------------|-------------|-------|---------|
| 45.00€ | 46.00€ | +2% | 🟢 Vert |
| 45.00€ | 50.00€ | +11% | 🟠 Orange |
| 45.00€ | 55.00€ | +22% | 🔴 Rouge |
| 45.00€ | 30.00€ | -33% | 🔵 Bleu |

---

## 🔒 **VÉRIFIER LA SÉCURITÉ RLS**

### **Vérifier qu'une table a RLS activé**

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'notes';
-- Résultat attendu: rowsecurity = true
```

---

### **Vérifier les policies d'une table**

```sql
SELECT policyname, cmd as operation 
FROM pg_policies 
WHERE tablename = 'notes';
-- Résultat attendu: SELECT, INSERT, UPDATE, DELETE
```

---

### **Tester l'isolation utilisateur**

```sql
-- Se connecter avec user_A
SELECT * FROM notes; -- Doit voir uniquement ses notes

-- Se connecter avec user_B
SELECT * FROM notes; -- Doit voir uniquement ses notes (différentes)
```

---

## 🐛 **DEBUGGING**

### **Voir les logs Edge Function**

```bash
npx supabase functions logs ai-devis-conversational --tail
```

---

### **Tester l'Edge Function localement**

```bash
curl -X POST https://{project}.supabase.co/functions/v1/ai-devis-conversational \
  -H "Authorization: Bearer {user_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "start",
    "project_id": "uuid",
    "client_id": "uuid",
    "user_id": "uuid",
    "notes": [...]
  }'
```

---

### **Vérifier le profil IA d'un utilisateur**

```sql
SELECT 
  user_id,
  jsonb_object_keys(avg_prices) as type_poste,
  avg_prices->jsonb_object_keys(avg_prices) as stats
FROM ai_profiles
WHERE user_id = 'uuid';
```

---

### **Voir les sessions IA en cours**

```sql
SELECT 
  id, 
  status, 
  tour_count, 
  created_at 
FROM devis_ai_sessions 
WHERE user_id = 'uuid' 
ORDER BY created_at DESC;
```

---

## 💰 **COÛTS ESTIMÉS**

| Action | Appels API | Coût unitaire | Coût total |
|--------|------------|---------------|------------|
| 1 note vocale (30s) | Whisper + GPT (correction) + GPT (analyse) | $0.003 + $0.0001 + $0.0002 | ~$0.0033 |
| Génération devis IA (5 notes) | 1x GPT-4o-mini (génération) | $0.005 | ~$0.005 |
| Tour supplémentaire (réponses) | 1x GPT-4o-mini (raffinement) | $0.005 | ~$0.005 |
| **Total par devis complet** | - | - | **~$0.05 - $0.10** |

---

## 📞 **CONTACTS / RÉFÉRENCES**

- **Documentation OpenAI** : https://platform.openai.com/docs
- **Documentation Supabase** : https://supabase.com/docs
- **Modèle Whisper** : https://platform.openai.com/docs/models/whisper
- **Modèle GPT-4o-mini** : https://platform.openai.com/docs/models/gpt-4o-mini

---

**Dernière mise à jour** : 9 novembre 2025

