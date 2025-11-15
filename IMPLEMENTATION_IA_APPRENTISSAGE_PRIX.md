# ✅ IMPLÉMENTATION - IA APPRENTISSAGE DES PRIX (PHASE 1)

**Date** : 9 novembre 2025  
**Statut** : ✅ Terminé - Prêt à tester

---

## 📁 **Fichiers créés / modifiés**

### **Fichiers créés** :

1. **`sql/create_ai_profiles_table.sql`** - Table pour stocker les profils IA
2. **`services/aiLearningService.js`** - Service d'apprentissage automatique

### **Fichiers modifiés** :

1. **`services/aiConversationalService.js`** - Ajout de l'appel au service d'apprentissage après création de devis IA

---

## 🔍 **Logique du service**

### **1. Comment je récupère les lignes de devis**

**Fonction** : `updateAIProfileFromDevis(devisId, userId)`

```javascript
// 1. Récupérer les lignes du devis
const { data: lignes } = await supabase
  .from('devis_lignes')
  .select('*')
  .eq('devis_id', devisId);

// Si aucune ligne, ne rien faire
if (!lignes || lignes.length === 0) {
  return; // Apprentissage ignoré
}
```

---

### **2. Comment je construis / mets à jour `avg_prices`**

**Fonction** : `normalizeKey(description)`

**Exemples** :
- "Prise électrique encastrée" → `"prise_electrique"`
- "Interrupteur va-et-vient" → `"interrupteur"`
- "Tableau électrique 3 rangées" → `"tableau_electrique"`
- "Main d'œuvre" → `"main_oeuvre"`

**Mots-clés détectés** :
- Électricité : prise, interrupteur, tableau, disjoncteur, cable, gaine, spot, luminaire
- Plomberie : robinet, lavabo, evier, douche, baignoire, wc, tuyau
- Menuiserie : porte, fenetre, placard, parquet
- Peinture : peinture, enduit
- Plâtrerie : placo, ba13, plaque
- Main d'œuvre : main d', heure, jour, journee

**Si aucun mot-clé** : `"autre"`

---

**Algorithme de mise à jour** :

```javascript
// Pour chaque ligne du devis
lignes.forEach((ligne) => {
  const key = normalizeKey(ligne.description);
  const prixUnitaire = parseFloat(ligne.prix_unitaire);

  // Si la clé n'existe pas, l'initialiser
  if (!avgPrices[key]) {
    avgPrices[key] = {
      avg: prixUnitaire,
      count: 1,
      min: prixUnitaire,
      max: prixUnitaire,
    };
  } else {
    // Sinon, mettre à jour la moyenne
    const current = avgPrices[key];
    const newCount = current.count + 1;
    const newAvg = (current.avg * current.count + prixUnitaire) / newCount;

    avgPrices[key] = {
      avg: newAvg,
      count: newCount,
      min: Math.min(current.min, prixUnitaire),
      max: Math.max(current.max, prixUnitaire),
    };
  }
});
```

**Exemple de résultat** :
```json
{
  "prise_electrique": {
    "avg": 45.5,
    "count": 23,
    "min": 35.0,
    "max": 55.0
  },
  "interrupteur": {
    "avg": 30.2,
    "count": 18,
    "min": 25.0,
    "max": 40.0
  }
}
```

---

### **3. Comment je mets à jour `total_devis`, `total_lignes`, `experience_score`**

```javascript
// Calculs
const newTotalDevis = profile.total_devis + 1;
const newTotalLignes = profile.total_lignes + lignes.length;
const newExperienceScore = Math.min(100, newTotalDevis * 5); // 5 points par devis, max 100

// Mise à jour en base
await supabase
  .from('ai_profiles')
  .update({
    avg_prices: avgPrices,
    total_devis: newTotalDevis,
    total_lignes: newTotalLignes,
    experience_score: newExperienceScore,
    last_updated: new Date().toISOString(),
  })
  .eq('id', profile.id);
```

**Formule `experience_score`** :
- 1 devis = 5 points
- 20 devis = 100 points (max)
- Simple et linéaire pour la Phase 1

---

## 🔄 **Workflow complet**

### **Création d'un devis IA**

```
1. Utilisateur clique "Générer devis IA"
   ↓
2. IA génère un devis avec lignes détaillées
   ↓
3. Utilisateur valide → "Créer le devis (brouillon)"
   ↓
4. Fonction createDevisFromAI() :
   - Crée le devis dans la table devis
   - Crée les lignes dans devis_lignes
   - ✨ Appelle updateAIProfileFromDevis() ✨
   ↓
5. Service d'apprentissage :
   - Récupère les lignes
   - Normalise les descriptions
   - Met à jour les moyennes de prix
   - Met à jour le profil IA
   ↓
6. Profil IA enrichi ✅
```

---

### **Création d'un devis manuel**

**⚠️ Pour l'instant, PAS d'apprentissage**

**Raison** :
- Les devis manuels dans `DevisFactures.js` n'ont pas de lignes détaillées
- Ils ont juste un montant HT global
- Impossible d'apprendre des prix unitaires

**Solution future** (Phase 2) :
- Ajouter un formulaire de lignes détaillées dans les devis manuels
- Ou ignorer les devis manuels (seuls les devis IA apprennent)

---

## 🧪 **Comment tester**

### **Test 1 : Création du profil IA**

1. **Exécuter le script SQL** : `sql/create_ai_profiles_table.sql`
2. **Vérifier dans Supabase** :
   - Table `ai_profiles` créée
   - RLS activé
   - 3 policies créées (SELECT, INSERT, UPDATE)

---

### **Test 2 : Premier devis IA**

1. **Ouvrir un chantier** avec des notes vocales
2. **Cliquer sur "Générer devis IA"**
3. **Répondre aux questions**
4. **Cliquer sur "Créer le devis (brouillon)"**
5. **Vérifier dans les logs** :
   ```
   [AILearning] 🧠 Début apprentissage pour devis: ...
   [AILearning] 📊 X lignes à analyser
   [AILearning] 📝 "Prise électrique" → clé: "prise_electrique"
   [AILearning] ✅ "prise_electrique" mis à jour: { avg: 45, count: 1, ... }
   ✅ Profil IA mis à jour
   ```
6. **Vérifier dans Supabase** (table `ai_profiles`) :
   - 1 ligne créée pour ton `user_id`
   - `avg_prices` contient les clés détectées
   - `total_devis` = 1
   - `total_lignes` = nombre de lignes du devis
   - `experience_score` = 5

**Exemple de résultat** :
```json
{
  "id": "abc-123...",
  "user_id": "def-456...",
  "avg_prices": {
    "prise_electrique": { "avg": 45.0, "count": 8, "min": 45.0, "max": 45.0 },
    "interrupteur": { "avg": 30.0, "count": 3, "min": 30.0, "max": 30.0 }
  },
  "experience_score": 5,
  "total_devis": 1,
  "total_lignes": 11,
  "created_at": "2025-11-09...",
  "last_updated": "2025-11-09..."
}
```

---

### **Test 3 : Deuxième devis IA**

1. **Créer un autre devis IA** avec des prix différents :
   - Prise : 50€ (au lieu de 45€)
   - Interrupteur : 35€ (au lieu de 30€)
2. **Vérifier dans Supabase** :
   - `avg_prices.prise_electrique.avg` = **47.5** (moyenne de 45 et 50)
   - `avg_prices.prise_electrique.count` = **16** (8 + 8)
   - `avg_prices.prise_electrique.min` = **45.0**
   - `avg_prices.prise_electrique.max` = **50.0**
   - `total_devis` = **2**
   - `experience_score` = **10**

---

### **Test 4 : Isolation RLS**

1. **Se connecter avec un autre compte**
2. **Créer un devis IA**
3. **Vérifier** :
   - ✅ Un nouveau profil IA est créé pour ce user
   - ✅ Les 2 profils sont indépendants
   - ✅ Chaque user voit uniquement son profil

---

## ⚡ **Gestion des erreurs**

### **Cas 1 : Devis sans lignes**
```javascript
if (!lignes || lignes.length === 0) {
  console.log('[AILearning] ℹ️ Aucune ligne, apprentissage ignoré');
  return; // Pas d'erreur, juste ignoré
}
```

### **Cas 2 : Prix invalide**
```javascript
if (prixUnitaire <= 0) {
  console.log('[AILearning] ⚠️ Prix invalide ignoré');
  return; // Ligne ignorée, on continue
}
```

### **Cas 3 : Erreur Supabase**
```javascript
catch (learningError) {
  // Ne pas bloquer la création du devis
  console.warn('[AILearning] Erreur (non bloquant):', learningError);
}
```

**Garantie** : L'apprentissage ne fait JAMAIS planter l'app ✅

---

## 🔒 **Sécurité (RLS)**

### **Isolation multi-tenant** ✅

**Table `ai_profiles`** :
- RLS activé ✅
- Policy SELECT : `auth.uid() = user_id` ✅
- Policy INSERT : `auth.uid() = user_id` ✅
- Policy UPDATE : `auth.uid() = user_id` ✅
- Pas de policy DELETE (sécurité) ✅

**Garantie** :
- Chaque artisan voit uniquement son profil IA
- Pas de fuite de données entre utilisateurs
- Respect des règles `.cursorrules`

---

## 📊 **Structure de données**

### **Table `ai_profiles`**

| Colonne | Type | Description | Exemple |
|---------|------|-------------|---------|
| `id` | UUID | Identifiant unique | `abc-123...` |
| `user_id` | UUID | Artisan propriétaire | `def-456...` |
| `avg_prices` | JSONB | Prix moyens par type | `{"prise_electrique": {...}}` |
| `experience_score` | FLOAT | Score d'expérience (0-100) | `45.0` |
| `total_devis` | INTEGER | Nombre de devis créés | `9` |
| `total_lignes` | INTEGER | Nombre de lignes analysées | `87` |
| `created_at` | TIMESTAMP | Date création | `2025-11-09...` |
| `last_updated` | TIMESTAMP | Dernière mise à jour | `2025-11-09...` |

---

## 🎯 **Limitations actuelles (Phase 1)**

### **Ce qui fonctionne** ✅
- Apprentissage depuis les **devis IA** (avec lignes détaillées)
- Moyennes de prix par type de poste
- Score d'expérience
- Isolation RLS

### **Ce qui ne fonctionne PAS encore** ⏳
- Apprentissage depuis les **devis manuels** (pas de lignes détaillées)
- Utilisation des prix appris pour générer de nouveaux devis
- Apprentissage du style d'écriture
- Suggestions intelligentes

**Ces features seront ajoutées dans les phases suivantes** 🚀

---

## 📋 **Prochaines étapes (Phase 2)**

### **Court terme (1-2 semaines)**

1. **Utiliser les prix appris** :
   - Modifier l'Edge Function `ai-devis-conversational`
   - Injecter les prix moyens dans le prompt GPT
   - Générer des devis avec les prix personnalisés

2. **Ajouter lignes détaillées aux devis manuels** :
   - Modifier `DevisFactures.js`
   - Ajouter un formulaire de lignes
   - Activer l'apprentissage pour les devis manuels

---

## ✅ **Avantages**

1. ✅ **Apprentissage automatique** : Pas de configuration manuelle
2. ✅ **Personnalisation** : Chaque artisan a ses propres prix
3. ✅ **Évolutif** : Plus de devis = meilleure précision
4. ✅ **Simple** : Pas de ML complexe, juste des moyennes
5. ✅ **Sécurisé** : RLS + isolation parfaite
6. ✅ **Robuste** : Ne fait jamais planter l'app
7. ✅ **Transparent** : Logs détaillés pour debugging

---

## 🔥 **Points d'attention**

### **1. Qualité des données**

**Problème** : Si l'artisan fait des erreurs de prix au début

**Solution actuelle** :
- Les premiers devis pèsent autant que les suivants
- Pas de pondération par `experience_score` pour l'instant

**Solution future** :
- Pondérer les prix par `experience_score`
- Les premiers devis pèsent moins
- Validation des prix aberrants

---

### **2. Cold start**

**Problème** : Nouvel artisan = pas de données

**Solution actuelle** :
- Le profil retourne `null` si inexistant
- L'IA utilise des prix de base (à implémenter en Phase 2)

**Solution future** :
- Questionnaire initial (optionnel)
- Prix de base par région
- Apprentissage rapide (5-10 devis suffisent)

---

## 📊 **Exemple concret**

### **Artisan A (économique)**

**Après 10 devis** :
```json
{
  "avg_prices": {
    "prise_electrique": { "avg": 35.0, "count": 80, "min": 30.0, "max": 40.0 },
    "interrupteur": { "avg": 25.0, "count": 45, "min": 20.0, "max": 30.0 }
  },
  "experience_score": 50,
  "total_devis": 10
}
```

---

### **Artisan B (haut de gamme)**

**Après 10 devis** :
```json
{
  "avg_prices": {
    "prise_electrique": { "avg": 55.0, "count": 80, "min": 50.0, "max": 60.0 },
    "interrupteur": { "avg": 40.0, "count": 45, "min": 35.0, "max": 45.0 }
  },
  "experience_score": 50,
  "total_devis": 10
}
```

**Résultat** :
- Même chantier, 2 devis différents
- Artisan A : 35€/prise
- Artisan B : 55€/prise
- **Automatiquement !** ✨

---

## 🚀 **Prochaines étapes**

### **Maintenant**

1. ✅ Exécuter `sql/create_ai_profiles_table.sql`
2. ✅ Redémarrer l'app
3. ✅ Créer un devis IA
4. ✅ Vérifier le profil IA dans Supabase

### **Phase 2 (1-2 semaines)**

1. Utiliser les prix appris dans la génération IA
2. Modifier le prompt GPT pour injecter les prix moyens
3. Tester que les devis générés utilisent les bons prix

### **Phase 3 (2-3 semaines)**

1. Apprentissage du style d'écriture
2. Extraction des phrases récurrentes
3. Personnalisation du ton

---

## 📚 **Documentation créée**

1. **`sql/create_ai_profiles_table.sql`** - Script SQL
2. **`services/aiLearningService.js`** - Service d'apprentissage
3. **`IMPLEMENTATION_IA_APPRENTISSAGE_PRIX.md`** - Ce document

---

**Temps d'implémentation** : 1 heure  
**Complexité** : Moyenne ⭐⭐  
**Impact** : Très élevé ⭐⭐⭐⭐⭐  
**Statut** : ✅ **PRÊT À TESTER**

