# 📊 ANALYSE - GÉNÉRATION DEVIS IA + QUESTIONNAIRE

**Date** : 9 novembre 2025  
**Objectif** : Améliorer la génération de devis IA avec un questionnaire d'affinage

---

## 🔍 **WORKFLOW ACTUEL**

### **Fichiers impliqués**

1. **`components/DevisAIGenerator.js`** - Composant UI du bouton "Générer devis IA"
2. **`services/aiConversationalService.js`** - Service d'appel à l'Edge Function
3. **`supabase/functions/ai-devis-conversational/index.ts`** - Edge Function (backend)
4. **`screens/ProjectDetailScreen.js`** - Écran détail chantier (contient le bouton)

---

### **Workflow actuel (étape par étape)**

#### **Étape 1 : Clic sur "Générer devis IA"**

**Fichier** : `components/DevisAIGenerator.js` → `handleGenerateDevis()`

```javascript
const handleGenerateDevis = async () => {
  // 1. Récupérer TOUTES les notes du chantier
  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  // 2. Envoyer à l'IA
  const result = await startDevisSession(null, projectId, clientId, user.id, notes);

  // 3. Afficher le résultat dans une modal
  setAiResult(result);
  setShowModal(true);
};
```

**✅ Ce qui fonctionne** :
- Toutes les notes sont récupérées
- Filtre par `project_id` ✅
- Pas de filtre `user_id` explicite (mais RLS actif)

**❌ Ce qui manque** :
- Pas de questionnaire d'affinage
- Pas de contexte supplémentaire (type chantier, finitions, etc.)

---

#### **Étape 2 : Appel à l'Edge Function**

**Fichier** : `services/aiConversationalService.js` → `startDevisSession()`

```javascript
const response = await fetch(EDGE_FUNCTION_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  },
  body: JSON.stringify({
    action: 'start',
    transcription: null,
    notes,  // ✅ Toutes les notes envoyées
    project_id: projectId,
    client_id: clientId,
    user_id: userId,
  }),
});
```

**✅ Ce qui fonctionne** :
- Toutes les notes sont envoyées à l'IA
- Authentification via token

**❌ Ce qui manque** :
- Pas de données de questionnaire

---

#### **Étape 3 : Traitement par l'IA (Edge Function)**

**Fichier** : `supabase/functions/ai-devis-conversational/index.ts`

**Logique** :
1. Compile toutes les transcriptions des notes en un seul texte
2. Envoie ce texte à GPT-4o-mini avec un prompt générique
3. L'IA génère un devis + pose des questions de clarification
4. Retourne le résultat

**✅ Ce qui fonctionne** :
- Prompt générique pour tous métiers
- Questions de clarification générées par l'IA

**❌ Ce qui manque** :
- Pas de contexte structuré (type chantier, finitions, etc.)
- L'IA doit deviner le contexte uniquement depuis les notes

---

#### **Étape 4 : Affichage et Q/R**

**Fichier** : `components/DevisAIGenerator.js`

**Logique** :
1. Affiche le devis généré
2. Affiche les questions de l'IA
3. L'utilisateur répond (texte ou vocal)
4. Envoie les réponses → l'IA affine le devis
5. Quand `status === 'ready'`, permet de créer le devis

**✅ Ce qui fonctionne** :
- UI complète pour Q/R
- Mode texte ET vocal
- Création du devis en brouillon

---

## 🔥 **PROBLÈMES IDENTIFIÉS**

### 1. **Pas de questionnaire d'affinage initial** ❌

**Problème** :
- L'IA doit deviner le contexte uniquement depuis les notes
- Pas de structure pour capturer :
  - Type de chantier (neuf, rénovation, dépannage)
  - Niveau de finition (standard, haut de gamme)
  - Matériaux (fournis, à fournir, main-d'œuvre seule)
  - Surface / quantités
  - Contraintes (délais, accès, etc.)

**Impact** :
- Devis moins précis
- Plus de questions de clarification nécessaires
- Risque d'oublis

---

### 2. **Pas de table pour stocker le questionnaire** ❌

**Problème** :
- Aucune table `project_questions`, `project_preferences`, etc.
- Pas de structure pour sauvegarder les réponses

**Impact** :
- Impossible de réutiliser les réponses
- Pas d'historique
- Pas de pré-remplissage pour les chantiers similaires

---

### 3. **Filtre `user_id` implicite** ⚠️

**Problème** :
- Le filtre `user_id` n'est pas explicite dans la requête des notes
- On compte uniquement sur RLS

**Risque** :
- Si RLS désactivé par erreur, fuite de données

---

## ✅ **SOLUTION PROPOSÉE**

### **Approche : Questionnaire d'affinage AVANT génération IA**

**Workflow amélioré** :

```
1. Utilisateur clique "Générer devis IA"
   ↓
2. Modal s'ouvre avec questionnaire d'affinage
   ↓
3. Utilisateur remplit le questionnaire
   ↓
4. Sauvegarde des réponses dans `project_context`
   ↓
5. Récupération notes + contexte
   ↓
6. Envoi à l'IA (notes + contexte structuré)
   ↓
7. IA génère devis plus précis
   ↓
8. Questions de clarification (si nécessaire)
   ↓
9. Création devis
```

---

### **Structure de table proposée : `project_context`**

```sql
CREATE TABLE IF NOT EXISTS public.project_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Type de prestation
  type_prestation TEXT, -- 'renovation', 'neuf', 'depannage', 'maintenance', 'autre'
  
  -- Contexte général
  description_generale TEXT,
  
  -- Quantités / Surface
  surface_m2 DECIMAL(10, 2),
  nombre_pieces INTEGER,
  nombre_elements INTEGER,
  
  -- Matériaux
  fourniture TEXT, -- 'incluse', 'client', 'main_oeuvre_seule'
  
  -- Niveau de finition
  niveau_finition TEXT, -- 'standard', 'haut_gamme', 'economique'
  
  -- Contraintes
  delai_souhaite TEXT,
  contraintes_acces TEXT,
  exigences_specifiques TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_project_context_project_id ON public.project_context(project_id);
CREATE INDEX IF NOT EXISTS idx_project_context_user_id ON public.project_context(user_id);

-- RLS
ALTER TABLE public.project_context ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own project context"
  ON public.project_context FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project context"
  ON public.project_context FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project context"
  ON public.project_context FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project context"
  ON public.project_context FOR DELETE
  USING (auth.uid() = user_id);
```

---

### **Modifications à apporter**

#### **1. Créer le composant `QuestionnaireAffinageModal.js`**

**Localisation** : `components/QuestionnaireAffinageModal.js`

**Contenu** : Modal avec formulaire :
- Type de prestation (select)
- Description générale (textarea)
- Surface / Quantités (inputs)
- Fourniture (radio buttons)
- Niveau de finition (select)
- Contraintes (textarea)

---

#### **2. Modifier `DevisAIGenerator.js`**

**Changements** :

```javascript
const handleGenerateDevis = async () => {
  // 1. Ouvrir le questionnaire AVANT de générer
  setShowQuestionnaireModal(true);
};

const handleQuestionnaireSubmit = async (contextData) => {
  try {
    setLoading(true);

    // 1. Sauvegarder le contexte
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('project_context').upsert({
      project_id: projectId,
      user_id: user.id,
      ...contextData,
      updated_at: new Date().toISOString(),
    });

    // 2. Récupérer les notes
    const { data: notes } = await supabase
      .from('notes')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id) // ✅ Filtre explicite
      .order('created_at', { ascending: true });

    // 3. Récupérer le contexte
    const { data: context } = await supabase
      .from('project_context')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single();

    // 4. Envoyer notes + contexte à l'IA
    const result = await startDevisSession(
      null,
      projectId,
      clientId,
      user.id,
      notes,
      context // ✅ Nouveau paramètre
    );

    setAiResult(result);
    setShowModal(true);
  } catch (error) {
    Alert.alert('Erreur', error.message);
  } finally {
    setLoading(false);
  }
};
```

---

#### **3. Modifier `aiConversationalService.js`**

**Changements** :

```javascript
export async function startDevisSession(
  transcription,
  projectId,
  clientId,
  userId,
  notes = null,
  context = null // ✅ Nouveau paramètre
) {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      action: 'start',
      transcription,
      notes,
      context, // ✅ Envoyer le contexte
      project_id: projectId,
      client_id: clientId,
      user_id: userId,
    }),
  });

  return await response.json();
}
```

---

#### **4. Modifier l'Edge Function `ai-devis-conversational/index.ts`**

**Changements** :

```typescript
// Dans handleStart()
const { transcription, notes, context, project_id, client_id, user_id } = body;

// Construire le prompt avec le contexte
let promptText = '';

// Partie 1 : Contexte structuré
if (context) {
  promptText += `**CONTEXTE DU CHANTIER**\n\n`;
  promptText += `Type de prestation : ${context.type_prestation || 'Non spécifié'}\n`;
  promptText += `Description : ${context.description_generale || 'Non spécifié'}\n`;
  if (context.surface_m2) {
    promptText += `Surface : ${context.surface_m2} m²\n`;
  }
  promptText += `Fourniture : ${context.fourniture || 'Non spécifié'}\n`;
  promptText += `Niveau de finition : ${context.niveau_finition || 'Standard'}\n`;
  if (context.delai_souhaite) {
    promptText += `Délai souhaité : ${context.delai_souhaite}\n`;
  }
  if (context.contraintes_acces) {
    promptText += `Contraintes d'accès : ${context.contraintes_acces}\n`;
  }
  promptText += `\n`;
}

// Partie 2 : Notes terrain
if (notes && notes.length > 0) {
  promptText += `**NOTES DE TERRAIN**\n\n`;
  notes.forEach((note, index) => {
    if (note.transcription) {
      promptText += `Note ${index + 1} : ${note.transcription}\n`;
    }
  });
}

// Partie 3 : Instruction IA
promptText += `\n**INSTRUCTION**\n\n`;
promptText += `Génère un devis détaillé avec lignes (description, quantité, unité, prix unitaire HT, prix total HT).`;

// Envoyer à GPT
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'system',
      content: 'Tu es un assistant IA spécialisé dans la génération de devis pour artisans...',
    },
    {
      role: 'user',
      content: promptText,
    },
  ],
  // ...
});
```

---

## 📋 **RÉSUMÉ DES MODIFICATIONS**

| Fichier | Action | Détails |
|---------|--------|---------|
| `sql/create_project_context_table.sql` | **CRÉER** | Nouvelle table pour le questionnaire |
| `components/QuestionnaireAffinageModal.js` | **CRÉER** | Modal de questionnaire |
| `components/DevisAIGenerator.js` | **MODIFIER** | Intégrer le questionnaire avant génération |
| `services/aiConversationalService.js` | **MODIFIER** | Ajouter paramètre `context` |
| `supabase/functions/ai-devis-conversational/index.ts` | **MODIFIER** | Utiliser le contexte dans le prompt |

---

## 🧪 **SCÉNARIO DE TEST**

### **Test complet**

1. **Ouvrir un chantier**
2. **Ajouter des notes vocales** :
   - "J'ai refait l'électricité du salon"
   - "8 prises, 3 interrupteurs"
3. **Cliquer sur "Générer devis IA"**
4. **Remplir le questionnaire** :
   - Type : Rénovation
   - Surface : 20 m²
   - Fourniture : Incluse
   - Finition : Standard
   - Délai : Sous 1 semaine
5. **Valider**
6. **Vérifier** :
   - ✅ Le devis généré correspond au contexte + notes
   - ✅ Les lignes sont détaillées et réalistes
   - ✅ Le devis est créé en brouillon
   - ✅ Il est visible dans la liste des devis
   - ✅ Il est modifiable

---

## ✅ **AVANTAGES**

1. ✅ **Devis plus précis** : Contexte structuré
2. ✅ **Moins de questions** : L'IA a plus d'infos
3. ✅ **Historique** : Contexte sauvegardé par chantier
4. ✅ **Réutilisable** : Pré-remplissage pour chantiers similaires
5. ✅ **Sécurité** : Filtres `user_id` explicites
6. ✅ **UX** : Guidage de l'utilisateur

---

## 🚀 **PROCHAINES ÉTAPES**

1. **Valider** la structure de table `project_context`
2. **Créer** le script SQL
3. **Créer** le composant `QuestionnaireAffinageModal`
4. **Modifier** `DevisAIGenerator`
5. **Modifier** le service et l'Edge Function
6. **Tester** le workflow complet

---

**Temps estimé** : 2-3 heures

**Complexité** : Moyenne ⭐⭐⭐

**Impact** : Élevé ✅

