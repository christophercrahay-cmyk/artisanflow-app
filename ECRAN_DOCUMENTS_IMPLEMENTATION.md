# ✅ ÉCRAN DOCUMENTS - IMPLÉMENTATION TERMINÉE

## 📋 Résumé

Un nouvel écran **DocumentsScreen** a été créé pour centraliser la gestion des devis et factures avec :
- ✅ Filtres (Tous / Devis / Factures)
- ✅ Cartes de documents avec boutons 👁 (voir) et 🗑 (supprimer)
- ✅ Gestion des statuts (Brouillon → Envoyé → Signé)
- ✅ Génération PDF automatique
- ✅ UI propre et moderne (thème sombre)

---

## 🎯 FONCTIONNALITÉS

### 1️⃣ Filtres en haut de page

Trois boutons de filtre :
- **TOUS** : affiche tous les documents (devis + factures)
- **📋 DEVIS** : affiche uniquement les devis
- **💰 FACTURES** : affiche uniquement les factures

**Note** : L'emoji 💰 (sac d'argent) remplace l'ancien emoji 🧾 qui s'affichait comme "?" sur certains devices.

---

### 2️⃣ Cartes de documents

Chaque carte affiche :

```
┌─────────────────────────────────────────┐
│ 📋 DEVIS              640.80 €          │
│ DE-2025-0001                            │
│                                         │
│ Client Test                             │
│ Projet Test                             │
│                                         │
│ [Brouillon]              👁  🗑         │
└─────────────────────────────────────────┘
```

**Éléments** :
- Type de document (📋 DEVIS ou 💰 FACTURE)
- Numéro du document
- Montant TTC
- Nom du client
- Titre du projet
- Badge de statut (cliquable)
- Boutons d'action (👁 voir, 🗑 supprimer)

---

### 3️⃣ Gestion des statuts

#### A. Badge de statut (cliquable)

Le badge affiche le statut actuel avec un code couleur :
- **Brouillon** : fond gris (#444), texte blanc
- **Envoyé** : fond bleu (#1E88E5), texte blanc
- **Signé** : fond vert (#2E7D32), texte blanc

#### B. Menu d'actions

Au clic sur le badge, un menu s'ouvre avec les options disponibles :

**Si statut = Brouillon** :
- Marquer comme Envoyé
- Marquer comme Signé

**Si statut = Envoyé** :
- Revenir en Brouillon
- Marquer comme Signé

**Si statut = Signé** :
- Revenir en Envoyé
- Revenir en Brouillon

**Implémentation** :
- iOS : `ActionSheetIOS`
- Android : `Alert` avec options

#### C. Normalisation des statuts

La fonction `normalizeStatus()` convertit les différentes valeurs possibles :
- `brouillon`, `draft` → `brouillon`
- `envoye`, `envoyé`, `sent` → `envoye`
- `signe`, `signé`, `accepte`, `signed` → `signe`

---

### 4️⃣ Bouton "Voir" (👁)

**Comportement** :
1. Si le document a déjà un `pdf_url` :
   - Ouvrir/partager le PDF directement
2. Sinon :
   - **Pour les devis** :
     - Vérifier qu'il y a des lignes dans `devis_lignes`
     - Si oui : générer le PDF avec `generateDevisPDFFromDB(devis.id)`
     - Si non : afficher un message d'aide
   - **Pour les factures** :
     - Afficher "Génération PDF pour les factures à venir" (à implémenter)

**Partage** :
- Utilise `expo-sharing` pour ouvrir le PDF
- Compatible WhatsApp, email, etc.

---

### 5️⃣ Bouton "Supprimer" (🗑)

**Règles** :
- ✅ Visible uniquement si `status === 'brouillon'`
- ❌ Masqué si le document est Envoyé ou Signé

**Comportement** :
1. Afficher une confirmation
2. Supprimer le document de la table `devis` ou `factures`
3. Mise à jour locale de la liste (sans recharger)

---

## 🗄️ STRUCTURE DE DONNÉES

### Tables utilisées

#### 1. Table `devis`
```sql
- id (UUID)
- numero (TEXT) -- ex: DE-2025-0001
- project_id (UUID)
- client_id (UUID)
- montant_ht (DECIMAL)
- montant_ttc (DECIMAL)
- tva_percent (DECIMAL)
- statut (TEXT) -- brouillon / envoye / signe
- pdf_url (TEXT) -- URL du PDF généré
- sent_at (TIMESTAMP) -- Date d'envoi
- signed_at (TIMESTAMP) -- Date de signature
- created_at (TIMESTAMP)
```

#### 2. Table `factures`
```sql
- id (UUID)
- numero (TEXT) -- ex: FA-2025-0001
- project_id (UUID)
- client_id (UUID)
- montant_ht (DECIMAL)
- montant_ttc (DECIMAL)
- tva_percent (DECIMAL)
- statut (TEXT) -- brouillon / envoye / paye / impayee
- pdf_url (TEXT)
- sent_at (TIMESTAMP)
- paid_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### 3. Table `devis_lignes`
```sql
- id (UUID)
- devis_id (UUID)
- description (TEXT)
- quantite (DECIMAL)
- unite (TEXT)
- prix_unitaire (DECIMAL)
- prix_total (DECIMAL)
- ordre (INTEGER)
- created_at (TIMESTAMP)
```

---

## 📱 NAVIGATION

L'écran est accessible via :
- **Tab "Pro"** > **Documents**
- Ou directement depuis le Dashboard

**Fichier** : `navigation/AppNavigator.js` (ligne 75)

---

## 🎨 DESIGN

### Thème sombre
- Fond : `theme.colors.background`
- Cartes : `theme.colors.card`
- Bordures : `theme.colors.border`
- Texte principal : `theme.colors.text`
- Texte secondaire : `theme.colors.textSecondary`

### Couleurs des statuts
- Brouillon : `#444` (gris)
- Envoyé : `#1E88E5` (bleu)
- Signé : `#2E7D32` (vert)
- Montant : `theme.colors.success` (vert)
- Supprimer : `#D9534F` (rouge)

### Icônes
- Devis : 📋
- Factures : 💰
- Voir : 👁 (Feather: `eye`)
- Supprimer : 🗑 (Feather: `trash-2`)
- Vide : 📥 (Feather: `inbox`)

---

## 🔧 FONCTIONS PRINCIPALES

### `loadDocuments()`
Charge tous les devis et factures depuis Supabase avec jointures sur `projects` et `clients`.

### `normalizeStatus(status)`
Normalise les valeurs de statut pour avoir une cohérence.

### `openDocument(document)`
Ouvre ou génère le PDF du document.

### `openStatusMenu(document)`
Affiche le menu de changement de statut (ActionSheet ou Alert).

### `updateDocumentStatus(document, newStatus)`
Met à jour le statut dans la BDD et localement.

### `deleteDocument(document)`
Supprime le document après confirmation.

### `getStatusLabel(status)`
Retourne le label français du statut.

### `getStatusStyle(status)`
Retourne les couleurs du badge selon le statut.

---

## 🧪 TESTS À FAIRE

### Test 1 : Filtres
1. Ouvrir l'écran Documents
2. Cliquer sur "TOUS" → tous les documents s'affichent
3. Cliquer sur "📋 DEVIS" → seuls les devis s'affichent
4. Cliquer sur "💰 FACTURES" → seules les factures s'affichent
5. Vérifier qu'il n'y a **pas de "?"** devant "FACTURES"

**Critère de succès** : ✅ Les filtres fonctionnent, pas de "?"

---

### Test 2 : Affichage des cartes
1. Vérifier que chaque carte affiche :
   - Type (📋 ou 💰)
   - Numéro
   - Montant TTC
   - Client
   - Projet
   - Badge de statut
   - Bouton 👁
   - Bouton 🗑 (si brouillon)

**Critère de succès** : ✅ Toutes les infos sont visibles et lisibles

---

### Test 3 : Changement de statut
1. Cliquer sur le badge "Brouillon" d'un document
2. Sélectionner "Marquer comme Envoyé"
3. Vérifier que le badge devient bleu "Envoyé"
4. Re-cliquer sur le badge
5. Sélectionner "Marquer comme Signé"
6. Vérifier que le badge devient vert "Signé"
7. Vérifier dans Supabase que le statut est bien mis à jour

**Critère de succès** : ✅ Les changements de statut fonctionnent et persistent

---

### Test 4 : Voir le PDF
1. Cliquer sur l'icône 👁 d'un devis
2. Si le devis a des lignes :
   - Le PDF doit se générer
   - Le partage doit s'ouvrir
3. Si le devis n'a pas de lignes :
   - Message d'aide affiché

**Critère de succès** : ✅ Le PDF s'ouvre ou un message d'aide s'affiche

---

### Test 5 : Supprimer un document
1. Trouver un document en statut "Brouillon"
2. Vérifier que le bouton 🗑 est visible
3. Cliquer sur 🗑
4. Confirmer la suppression
5. Vérifier que le document disparaît de la liste
6. Trouver un document en statut "Envoyé" ou "Signé"
7. Vérifier que le bouton 🗑 est **masqué**

**Critère de succès** : ✅ La suppression fonctionne uniquement pour les brouillons

---

### Test 6 : Pull to refresh
1. Tirer la liste vers le bas
2. Vérifier que l'indicateur de chargement apparaît
3. Vérifier que la liste se recharge

**Critère de succès** : ✅ Le refresh fonctionne

---

### Test 7 : Liste vide
1. Filtrer sur "FACTURES" (si aucune facture)
2. Vérifier que l'écran vide s'affiche avec :
   - Icône 📥
   - Message "Aucun document"
   - Sous-message adapté au filtre

**Critère de succès** : ✅ L'écran vide est clair et informatif

---

## 🐛 PROBLÈMES CONNUS ET SOLUTIONS

### Problème 1 : "?" devant FACTURES
**Cause** : Emoji 🧾 non supporté  
**Solution** : Remplacé par 💰 (sac d'argent)

### Problème 2 : Bouton 🗑 visible sur documents envoyés
**Cause** : Condition `status === 'brouillon'` non respectée  
**Solution** : Vérifier la normalisation du statut

### Problème 3 : PDF ne se génère pas
**Cause** : Pas de lignes dans `devis_lignes`  
**Solution** : Message d'aide affiché, utiliser "Générer devis IA"

### Problème 4 : Statut ne se met pas à jour
**Cause** : Erreur dans la requête Supabase  
**Solution** : Vérifier les logs, vérifier que RLS est désactivé

---

## 📁 FICHIERS MODIFIÉS/CRÉÉS

### Créé
- `screens/DocumentsScreen.js` (nouveau fichier, 600+ lignes)

### Modifié
- `DevisFactures.js` (emoji factures : 🧾 → 💰)

### Déjà existant
- `navigation/AppNavigator.js` (écran déjà dans la navigation)
- `utils/utils/pdf.js` (fonction `generateDevisPDFFromDB` déjà créée)

---

## 🚀 DÉPLOIEMENT

### 1. Vérifier les tables
```sql
-- Vérifier que les colonnes existent
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'devis' AND column_name IN ('pdf_url', 'sent_at', 'signed_at');

SELECT column_name FROM information_schema.columns 
WHERE table_name = 'factures' AND column_name IN ('pdf_url', 'sent_at', 'paid_at');
```

### 2. Ajouter les colonnes si manquantes
```sql
ALTER TABLE devis ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE devis ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE devis ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE factures ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE factures ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE factures ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
```

### 3. Tester sur le device
```bash
npx expo start --tunnel
```

Puis :
1. Ouvrir l'app
2. Aller dans **Pro** > **Documents**
3. Tester tous les workflows

---

## ✅ RÉSULTAT FINAL

### Avant
❌ Pas d'écran centralisé pour les documents  
❌ Gestion des statuts compliquée  
❌ Pas de vue d'ensemble  
❌ "?" devant FACTURES  

### Après
✅ Écran Documents unifié (devis + factures)  
✅ Filtres clairs (Tous / Devis / Factures)  
✅ Gestion des statuts intuitive (badge cliquable)  
✅ Boutons d'action visibles (👁 voir, 🗑 supprimer)  
✅ Génération PDF automatique  
✅ UI propre et moderne  
✅ Plus de "?" devant FACTURES  

---

**Date** : 7 novembre 2025  
**Version** : 1.2.0  
**Status** : ✅ Prêt pour les tests

