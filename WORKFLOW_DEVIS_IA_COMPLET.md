# 📋 WORKFLOW DEVIS IA - ARTISANFLOW

**Date** : 10 Novembre 2025

---

## ✅ CORRECTIONS APPLIQUÉES

### 1. Problème clavier résolu
**Fichier** : `components/DevisAIGenerator2.js`

**Avant** :
- ScrollView simple
- Bouton caché par le clavier

**Après** :
- ✅ `KeyboardAvoidingView` ajouté
- ✅ `contentContainerStyle` avec `paddingBottom: 120`
- ✅ `keyboardShouldPersistTaps="handled"`
- ✅ Le contenu défile correctement, le bouton est accessible

---

## 📊 WORKFLOW ACTUEL

### Étape 1 : Génération IA
1. Ouvre un chantier
2. Scroll jusqu'à "Devis IA"
3. Clique sur "Générer avec l'IA"
4. Réponds aux questions
5. L'IA génère le devis avec lignes détaillées

### Étape 2 : Validation du brouillon
1. Clique sur "Créer le devis (brouillon)"
2. Le devis est créé en DB :
   - Table `devis` : devis principal
   - Table `devis_lignes` : lignes détaillées
   - Statut : `brouillon`

### Étape 3 : Visualisation
1. Le devis apparaît dans la section "Devis & Factures"
2. Tu peux voir le numéro (ex: DE-2025-0001)
3. Tu peux voir le montant TTC

### ⚠️ LIMITATION ACTUELLE : ÉDITION

**Problème** : 
- Le composant `DevisFactures` permet l'édition simple (montant, TVA, notes)
- MAIS il n'édite PAS les lignes détaillées du devis
- Les lignes de `devis_lignes` ne sont pas modifiables dans l'UI actuelle

**Conséquence** :
- Le devis généré par l'IA est "figé"
- Tu peux changer le montant global, mais pas les lignes individuelles

---

## 🎯 WORKFLOW RECOMMANDÉ (À IMPLÉMENTER)

### Option A : Édition des lignes détaillées

Créer un écran d'édition de devis qui permet :
1. Voir toutes les lignes du devis
2. Modifier chaque ligne (description, quantité, prix)
3. Ajouter/supprimer des lignes
4. Recalculer automatiquement les totaux
5. Valider les modifications

### Option B : Workflow simplifié

1. Générer le devis IA
2. Créer en brouillon
3. **Modifier directement dans l'écran** (nouveau composant)
4. Changer le statut à "envoyé" ou "signé"
5. Exporter en PDF

---

## 📄 EXPORT PDF

**Actuel** :
- Fonction `generateDevisPDFFromDB` existe dans `utils/utils/pdf.js`
- Charge les lignes depuis `devis_lignes`
- Génère un PDF complet

**Accès** :
- Onglet Documents
- Clique sur un devis
- Le PDF est généré et partagé

---

## 🔧 PROCHAINES ACTIONS RECOMMANDÉES

### Priorité HAUTE
1. ✅ Clavier corrigé
2. ⏳ Créer un écran d'édition de devis avec lignes
3. ⏳ Bouton "Modifier" dans la liste des devis
4. ⏳ Workflow : Brouillon → Modifier → Valider → PDF

### Priorité MOYENNE
5. ⏳ Validation du statut (brouillon → envoyé → signé)
6. ⏳ Historique des modifications

---

## 💡 SOLUTION TEMPORAIRE

En attendant l'écran d'édition :
1. Utilise le générateur IA pour créer le devis
2. Si erreur dans les lignes, **régénère un nouveau devis**
3. Une fois satisfait, change le statut à "envoyé"
4. Exporte en PDF depuis l'onglet Documents

---

**Veux-tu que je crée l'écran d'édition de devis maintenant ?**

