# 📄 Guide - Génération Facture IA

## ✅ Implémentation terminée

Le générateur de facture IA est maintenant disponible, similaire au générateur de devis IA.

## 📋 Fichiers créés/modifiés

### Nouveaux fichiers
- `components/FactureAIGenerator.js` - Composant générateur de facture IA

### Fichiers modifiés
- `services/aiConversationalService.js` - Ajout de `startFactureSession()` et `createFactureFromAI()`
- `screens/ProjectDetailScreen.js` - Intégration du générateur de facture IA

## 🎯 Fonctionnalités

### Générateur Facture IA
- **Bouton** : "Générer facture IA" dans la section Facture IA
- **Fonctionnement** : Identique au générateur de devis IA
  - Analyse les notes vocales du chantier
  - Pose des questions de clarification si nécessaire
  - Génère une facture avec lignes détaillées
  - Colorisation des prix selon le profil IA
  - Validation pour créer la facture en brouillon

### Différences avec Devis IA
- Utilise le préfixe `FA` (configurable dans les paramètres)
- Peut être liée à un devis (paramètre `devisId` optionnel)
- Crée une facture dans la table `factures` au lieu de `devis`

## 🔧 Utilisation

1. **Aller sur un chantier** → Section "Facture IA"
2. **Cliquer sur "Générer facture IA"**
3. **Répondre aux questions** (texte ou vocal) si demandées
4. **Valider** → La facture est créée en brouillon

## 📝 Notes techniques

### Edge Function
- Utilise la même Edge Function `ai-devis-conversational`
- Différenciée par le paramètre `type: 'facture'`
- L'Edge Function doit être adaptée pour gérer le type facture

### Structure des données
- La facture est créée avec les totaux calculés (HT, TVA, TTC)
- Les lignes détaillées ne sont pas encore stockées (structure à venir)
- La facture peut être liée à un devis via `devis_id`

### Adaptation du résultat IA
- Le composant adapte automatiquement le résultat si l'Edge Function retourne "devis" au lieu de "facture"
- Compatible avec l'Edge Function actuelle qui peut ne pas différencier facture/devis

## ⚠️ À noter

1. **Edge Function** : L'Edge Function `ai-devis-conversational` doit être adaptée pour gérer `type: 'facture'` et retourner `facture` au lieu de `devis` dans le résultat.

2. **Lignes de facture** : Pour l'instant, seules les totaux sont stockés. Les lignes détaillées pourront être ajoutées plus tard si une table `facture_lignes` est créée.

3. **Apprentissage IA** : Utilise la même fonction d'apprentissage que les devis (les prix sont similaires).

## 🧪 Test

1. Aller sur un chantier avec des notes vocales
2. Cliquer sur "Générer facture IA"
3. Vérifier que la modal s'ouvre
4. Répondre aux questions si demandées
5. Valider → La facture devrait être créée

---

**Version** : 1.0  
**Date** : 2025-11-13









