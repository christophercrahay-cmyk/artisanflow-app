# ÉTAPE 1 : ANALYSE COMPLÈTE - Workflow Devis

**Date** : 2025-11-16  
**Statut** : ✅ ANALYSE TERMINÉE - EN ATTENTE VALIDATION  
**Objectif** : Identifier tous les fichiers, statuts et actions avant d'implémenter les vérifications de workflow

---

## 📁 1. FICHIERS CONCERNÉS PAR LES DEVIS

### Services (Logique métier)

#### ✅ `services/devis/devisService.js` (356 lignes)
**Rôle** : Service centralisé pour la gestion des devis
- `finalizeDevis(devisId)` : Transition `edition` → `pret`
- `unfinalizeDevis(devisId)` : Transition `pret` → `edition`
- `createDevisQuick(clientId, projectId)` : Création rapide avec statut `edition`
- `canFinalizeDevis(devisId)` : Vérification si devis peut être finalisé
- `generateDevisNumber(userId)` : Génération numéro unique (DE-YYYY-XXXX)

**Statuts gérés** :
- Vérifie `statut === 'edition'` avant finalisation
- Vérifie `statut === 'pret'` avant annulation finalisation
- Crée avec `statut: 'edition'` par défaut

#### ✅ `services/devis/signatureService.ts` (426 lignes)
**Rôle** : Gestion de la signature électronique
- `generateSignatureLink(devisId)` : Génère lien de signature
  - Met à jour `statut: 'envoye'` lors de la génération
- `markDevisAsSigned(options)` : Marque devis comme signé
  - Met à jour `statut: 'signe'` lors de la signature
- `getDevisSignatureInfo(devisId)` : Récupère infos signature

**Statuts gérés** :
- Transition `pret` → `envoye` lors génération lien
- Transition `envoye` → `signe` lors signature

#### ⚠️ `utils/supabase_helpers.js` (lignes 102-116)
**Rôle** : Helpers Supabase (ancien code)
- `deleteQuote(devisId)` : Suppression directe sans vérification de statut
- ⚠️ **PROBLÈME** : Pas de vérification de statut avant suppression

### Écrans (UI)

#### ✅ `screens/EditDevisScreen.js` (1328 lignes)
**Rôle** : Écran d'édition d'un devis
- Charge le devis et ses lignes
- Permet modification des lignes, TVA, totaux
- Affiche les boutons selon le statut :
  - `edition` → Bouton "Finaliser le devis"
  - `pret` → Boutons "Générer le lien" + "Revenir en édition"
  - `envoye` → Bouton "Renvoyer le lien"
  - `signe` → Bouton "Voir le PDF signé"
- **PROBLÈME ACTUEL** : Aucune vérification de verrouillage
  - Les champs sont toujours éditables même si `statut === 'signe'`
  - Pas d'alerte si tentative de modification d'un devis signé

**Fonctions clés** :
- `loadDevis()` : Charge devis + lignes
- `saveLigne()` : Sauvegarde une ligne
- `deleteLigne()` : Supprime une ligne
- `handleFinalizeDevis()` : Appelle `finalizeDevis()`
- `handleGenerateSignatureLink()` : Génère lien signature

#### ✅ `screens/DocumentsScreen2.js` (1105 lignes)
**Rôle** : Liste des documents (devis + factures)
- Affiche tous les devis avec leur statut
- Menu d'actions devis (nouveau, ajouté en Phase 2)
- Navigation vers `EditDevisScreen` pour édition
- **PROBLÈME ACTUEL** : Pas de vérification avant navigation
  - Permet de naviguer vers édition même si devis signé

**Fonctions clés** :
- `loadDocuments()` : Charge devis + factures
- `openDocument()` : Ouvre PDF (ancien comportement)
- `handlePressDevisCard()` : Ouvre menu d'actions (nouveau)
- `handleViewDocument()` : Ouvre PDF directement
- `shareDocument()` : Partage PDF
- `editDocument()` : Navigation vers EditDevisScreen

### Autres fichiers

#### ✅ `services/aiConversationalService.js`
- `createDevisFromAI()` : Crée devis avec `statut: 'edition'`

#### ⚠️ `DevisFactures.js` (ancien composant)
- `deleteItem(id)` : Suppression directe sans vérification
- ⚠️ **PROBLÈME** : Pas de vérification de statut

---

## 📊 2. STATUTS ACTUELLEMENT UTILISÉS

### Liste des statuts dans le code

D'après l'analyse du code, les statuts suivants sont utilisés :

| Statut | Où défini | Utilisation |
|--------|-----------|-------------|
| `'edition'` | `devisService.js` ligne 54, 81, 165, 240, 332 | Devis en cours d'édition |
| `'pret'` | `devisService.js` ligne 81, 157, 221 | Devis finalisé, prêt à envoyer |
| `'envoye'` | `signatureService.ts` ligne 203 | Devis avec lien de signature généré |
| `'signe'` | `signatureService.ts` ligne 297 | Devis signé par le client |
| `'refuse'` | Migration SQL ligne 16 | Devis refusé (mentionné dans migration) |
| `'brouillon'` | `EditDevisScreen.js` ligne 500 | Ancien statut (compatibilité) |
| `'accepte'` | Migration SQL ligne 16 | Ancien statut (compatibilité) |
| `'annule'` | `devisService.ts` ligne 13 (type) | Statut mentionné dans types |

### Où sont-ils définis

#### ✅ Contrainte SQL (Base de données)
```sql
-- sql/migrate_devis_statuts.sql ligne 16
CHECK (statut IN ('edition', 'pret', 'envoye', 'signe', 'refuse', 'brouillon', 'accepte'));
```

#### ✅ Type TypeScript (si .ts existe)
```typescript
// services/devis/devisService.ts ligne 13
export type DevisStatus = 'edition' | 'pret' | 'envoye' | 'signe' | 'refuse' | 'annule';
```

#### ⚠️ Validation Zod (ancien)
```javascript
// validation/schemas.js ligne 104
statut: z.enum(['brouillon', 'envoye', 'accepte', 'refuse']).default('brouillon');
```
⚠️ **PROBLÈME** : Schema Zod ne correspond pas aux statuts réels utilisés

### Comment sont-ils utilisés

#### Transitions de statut actuelles

| Action | Statut avant | Statut après | Fichier + fonction |
|--------|--------------|-------------|-------------------|
| Création devis | - | `'edition'` | `devisService.js` `createDevisQuick()` |
| Finalisation | `'edition'` | `'pret'` | `devisService.js` `finalizeDevis()` |
| Annulation finalisation | `'pret'` | `'edition'` | `devisService.js` `unfinalizeDevis()` |
| Génération lien signature | `'pret'` | `'envoye'` | `signatureService.ts` `generateSignatureLink()` |
| Signature client | `'envoye'` | `'signe'` | `signatureService.ts` `markDevisAsSigned()` |

---

## 🔧 3. ACTIONS ACTUELLES SUR LES DEVIS

### A) Modification

#### ✅ Où est le code de modification

**Fichier** : `screens/EditDevisScreen.js`

**Fonctions** :
- `saveLigne()` (ligne ~200) : Sauvegarde une ligne de devis
- `updateLigne()` : Met à jour une ligne existante
- `addLigne()` : Ajoute une nouvelle ligne
- `saveDevis()` : Sauvegarde les modifications du devis (TVA, notes, etc.)

**Problème actuel** :
- ❌ Aucune vérification de statut avant modification
- ❌ Les champs sont toujours éditables même si `statut === 'signe'`
- ❌ Pas d'alerte si tentative de modification d'un devis verrouillé

**Code actuel** :
```javascript
// EditDevisScreen.js - Aucune vérification
const saveLigne = async (ligne) => {
  // ... sauvegarde directe sans vérification
};
```

### B) Suppression

#### ✅ Où est le code de suppression

**Fichier 1** : `utils/supabase_helpers.js` (lignes 102-116)
```javascript
export async function deleteQuote(devisId) {
  const { error } = await supabase.from('devis').delete().eq('id', devisId);
  // ⚠️ Pas de vérification de statut
}
```

**Fichier 2** : `DevisFactures.js` (lignes 395-419)
```javascript
const deleteItem = async (id) => {
  const { error } = await supabase.from('devis').delete().eq('id', id);
  // ⚠️ Pas de vérification de statut
};
```

**Problème actuel** :
- ❌ Aucune vérification de statut avant suppression
- ❌ Permet de supprimer un devis signé
- ❌ Pas de fonction centralisée dans `devisService.js`

### C) Envoi

#### ✅ Où est le code d'envoi

**Fichier** : `services/devis/signatureService.ts`

**Fonction** : `generateSignatureLink(devisId)` (ligne ~100)
- Génère un lien de signature
- Met à jour `statut: 'envoye'` automatiquement
- ✅ **DÉJÀ PROTÉGÉ** : Vérifie que le devis est en statut `'pret'` ou `'edition'`

**Code actuel** :
```typescript
// signatureService.ts - Déjà protégé
if (devis.statut !== 'pret' && devis.statut !== 'edition') {
  throw new Error('Le devis doit être finalisé avant de générer le lien');
}
```

### D) Signature

#### ✅ Où est le code de signature

**Fichier** : `services/devis/signatureService.ts`

**Fonction** : `markDevisAsSigned(options)` (ligne ~250)
- Marque le devis comme signé
- Met à jour `statut: 'signe'` automatiquement
- ✅ **DÉJÀ PROTÉGÉ** : Vérifie le token de signature

**Fichier Edge Function** : `supabase/functions/sign-devis/index.ts`
- Traite la signature côté serveur
- Met à jour `statut: 'signe'` dans la BDD

---

## 🎯 RÉSUMÉ DES PROBLÈMES IDENTIFIÉS

### ❌ Problèmes critiques

1. **Modification sans vérification**
   - `EditDevisScreen.js` permet de modifier un devis signé
   - Pas de vérification de statut avant sauvegarde
   - Champs toujours éditables

2. **Suppression sans vérification**
   - `utils/supabase_helpers.js` `deleteQuote()` : Pas de vérification
   - `DevisFactures.js` `deleteItem()` : Pas de vérification
   - Permet de supprimer un devis signé

3. **Navigation sans vérification**
   - `DocumentsScreen2.js` permet de naviguer vers édition même si devis signé
   - Pas d'alerte préventive

### ✅ Déjà protégé

1. **Envoi** : `signatureService.ts` vérifie déjà le statut
2. **Signature** : Edge Function vérifie déjà le token

---

## 📋 PROCHAINES ÉTAPES (À VALIDER)

### ÉTAPE 2 : Créer les fonctions de vérification
- Créer `canEditDevis(status)`
- Créer `canDeleteDevis(status)`
- Créer `isDevisLocked(status)`
- Créer `getDevisLockMessage(status)`

### ÉTAPE 3 : Ajouter vérifications dans EditDevisScreen
- Vérifier au chargement si devis verrouillé
- Désactiver les champs si verrouillé
- Afficher alerte si tentative de modification

### ÉTAPE 4 : Conditionner les boutons dans DocumentsScreen
- Masquer bouton "Modifier" si devis verrouillé
- Masquer bouton "Supprimer" si devis verrouillé
- Afficher badge "Verrouillé" si applicable

### ÉTAPE 5 : Protéger la suppression
- Ajouter vérification dans `deleteQuote()`
- Créer fonction centralisée `deleteDevis()` dans `devisService.js`

---

## ✅ VALIDATION REQUISE

**Avant de passer à l'ÉTAPE 2**, confirmer :

1. ✅ Les fichiers identifiés sont corrects
2. ✅ Les statuts listés sont complets
3. ✅ Les problèmes identifiés correspondent à la réalité
4. ✅ L'approche proposée est acceptable

**En attente de validation pour continuer...**

