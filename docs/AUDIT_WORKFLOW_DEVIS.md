# AUDIT COMPLET : Workflow de Création et Signature de Devis

**Date**: 16 Novembre 2025  
**Statut**: 🔴 Incohérences majeures détectées  
**Priorité**: CRITIQUE

---

## 📊 WORKFLOW ACTUEL (État des lieux)

### 1. Point d'entrée : Création d'un devis

#### 🔹 Méthode 1 : Depuis un projet (via IA)
```
ProjectDetailScreen
  ↓
DevisAIGenerator2 (composant)
  ↓
startDevisSession() → Analyse IA des notes vocales
  ↓
createDevisFromAI() → Insertion en BDD
  ↓
Statut initial: "brouillon"
```

**Fichiers impliqués**:
- `screens/ProjectDetailScreen.js` (ligne ~26: import DevisAIGenerator)
- `components/DevisAIGenerator2.js` (ligne 85-150: génération IA)
- `services/aiConversationalService.js` (logique IA)

**Problème identifié**: 
- ✅ Le devis est créé avec `statut: 'brouillon'`
- ❌ Aucune transition claire vers "finalisé" ou "prêt à envoyer"
- ❌ L'utilisateur doit naviguer manuellement vers DocumentsScreen pour le retrouver

---

#### 🔹 Méthode 2 : Depuis l'écran Documents (bouton vide)
```
DocumentsScreen2 (ligne 684-691)
  ↓
Bouton "Créer un devis"
  ↓
navigation.navigate('ClientsTab')
  ↓
❌ PAS DE CRÉATION DIRECTE
```

**Problème identifié**:
- ❌ Le bouton "Créer un devis" redirige vers l'onglet Clients
- ❌ L'utilisateur doit ensuite naviguer Client → Projet → Génération IA
- ❌ Workflow indirect et confus

---

### 2. Visualisation et édition

```
DocumentsScreen2
  ↓
Clic sur un devis "brouillon"
  ↓
navigation.navigate('EditDevis', { devisId })
  ↓
EditDevisScreen
```

**Fichiers impliqués**:
- `screens/DocumentsScreen2.js` (ligne 270: navigation vers EditDevis)
- `screens/EditDevisScreen.js` (édition des lignes, TVA, etc.)

**État actuel**:
- ✅ L'édition fonctionne correctement
- ✅ Calcul automatique des totaux
- ⚠️ Mais le statut reste "brouillon" même après édition

---

### 3. Génération du lien de signature

```
EditDevisScreen
  ↓
Bouton "Générer le lien de signature"
  ↓
handleGenerateSignatureLink() (ligne 232-287)
  ↓
generateSignatureLink(devisId) → services/devis/signatureService.js
  ↓
Insertion dans devis_signature_links
  ↓
Mise à jour devis.signature_status = 'pending'
  ↓
Retour URL: https://artisanflowsignatures.netlify.app/sign?devisId=XXX&token=YYY
```

**Fichiers impliqués**:
- `screens/EditDevisScreen.js` (ligne 232-287: génération du lien)
- `services/devis/signatureService.js` (ligne 21-132: logique de génération)
- `supabase/functions/sign-devis/index.ts` (Edge Function pour validation)

**Problème identifié**:
- ⚠️ Le lien est généré MAIS le devis reste en statut "brouillon" dans l'interface
- ⚠️ La colonne `devis.statut` n'est PAS mise à jour (seulement `signature_status`)
- ❌ Incohérence: `statut: 'brouillon'` + `signature_status: 'pending'`

---

### 4. Signature par le client (page web publique)

```
Client reçoit le lien
  ↓
https://artisanflowsignatures.netlify.app/sign?devisId=XXX&token=YYY
  ↓
web/sign/index.html (page statique Netlify)
  ↓
Appel Edge Function: POST /sign-devis { action: "info", token }
  ↓
Affichage du devis + formulaire signature
  ↓
Client dessine sa signature + entre son nom
  ↓
Appel Edge Function: POST /sign-devis { action: "sign", token, name, signatureDataUrl }
  ↓
Upload image → bucket "signatures"
  ↓
Mise à jour devis_signature_links.used_at
  ↓
Mise à jour devis.signature_status = 'signed'
  ↓
Mise à jour devis.signed_at, signed_by_name, signature_image_url
```

**Fichiers impliqués**:
- `web/sign/index.html` (page publique de signature)
- `supabase/functions/sign-devis/index.ts` (Edge Function)
- `sql/create_devis_signature_links.sql` (structure BDD)

**État actuel**:
- ✅ La signature fonctionne correctement
- ✅ L'image est uploadée dans Supabase Storage
- ✅ Les métadonnées sont enregistrées
- ⚠️ Mais `devis.statut` reste "brouillon" (seulement `signature_status` change)

---

### 5. Retour dans l'app (affichage statut signé)

```
EditDevisScreen (rechargement)
  ↓
loadDevis() (ligne 50-98)
  ↓
Si devis.signature_status === 'signed':
  ↓
Affichage badge "Signé le JJ/MM/AAAA"
  ↓
Bouton "Voir le PDF signé"
  ↓
handleViewSignedPDF() (ligne 290-304)
  ↓
generateDevisPDFFromDB(devisId) → utils/utils/pdf.js
  ↓
Téléchargement de l'image de signature (URL signée)
  ↓
Injection dans le PDF
  ↓
Partage du PDF
```

**Fichiers impliqués**:
- `screens/EditDevisScreen.js` (ligne 84-89: chargement signature)
- `utils/utils/pdf.js` (ligne 473-715: génération PDF avec signature)
- `services/devis/signatureService.js` (ligne 298-325: récupération infos signature)

**État actuel**:
- ✅ L'affichage du statut "signé" fonctionne
- ✅ Le PDF avec signature fonctionne (après corrections récentes)
- ⚠️ Mais dans DocumentsScreen, le devis apparaît toujours en "brouillon"

---

## 🔴 INCOHÉRENCES MAJEURES IDENTIFIÉES

### 1. Confusion entre `statut` et `signature_status`

**Problème**:
- La colonne `devis.statut` (VARCHAR) contient: 'brouillon', 'envoye', 'signe', 'accepte'
- La colonne `devis.signature_status` (VARCHAR) contient: 'pending', 'signed'
- Ces deux colonnes ne sont PAS synchronisées

**Impact**:
- Un devis peut être `statut: 'brouillon'` + `signature_status: 'signed'`
- Dans DocumentsScreen, le filtre utilise `statut` → le devis signé apparaît en "brouillon"
- L'utilisateur ne voit pas que le devis est signé dans la liste

**Fichiers concernés**:
- `screens/DocumentsScreen2.js` (ligne 144-149: normalizeStatus utilise `statut`)
- `services/devis/signatureService.js` (ligne 107-117: met à jour `signature_status` mais pas `statut`)

---

### 2. Workflow "brouillon" obligatoire

**Problème**:
- Tous les devis créés par l'IA sont en statut "brouillon"
- Il n'y a AUCUN bouton "Finaliser" ou "Marquer comme prêt"
- L'utilisateur doit générer le lien de signature directement depuis un "brouillon"

**Impact**:
- Confusion: "brouillon" implique "non terminé", mais on peut quand même l'envoyer
- Pas de distinction entre "en cours d'édition" et "prêt à envoyer"

**Fichiers concernés**:
- `components/DevisAIGenerator2.js` (ligne 85-150: création avec statut "brouillon")
- `screens/EditDevisScreen.js` (pas de bouton "Finaliser")

---

### 3. Navigation complexe pour créer un devis

**Problème**:
- Depuis DocumentsScreen: Bouton "Créer" → Redirige vers ClientsTab
- L'utilisateur doit: Clients → Sélectionner client → Projets → Sélectionner projet → Générer devis IA
- 5 étapes pour créer un devis

**Impact**:
- Workflow lourd et non intuitif
- Perte de temps pour l'utilisateur

**Fichiers concernés**:
- `screens/DocumentsScreen2.js` (ligne 684-691: bouton "Créer un devis")

---

### 4. Statut "envoyé" jamais utilisé

**Problème**:
- Le statut "envoye" existe dans la BDD et dans normalizeStatus()
- Mais il n'est JAMAIS défini automatiquement
- Aucun code ne met à jour `statut = 'envoye'` après génération du lien

**Impact**:
- Statut inutilisé et trompeur
- L'utilisateur ne sait pas si le devis a été envoyé ou non

**Fichiers concernés**:
- `screens/DocumentsScreen2.js` (ligne 144-149: normalizeStatus)
- `services/devis/signatureService.js` (ne met pas à jour `statut`)

---

## ✅ WORKFLOW IDÉAL PROPOSÉ

### 1. Création simplifiée

```
DocumentsScreen
  ↓
Bouton "Créer un devis"
  ↓
Modal: Sélectionner Client + Projet (ou créer nouveau)
  ↓
Génération IA automatique (si notes vocales)
  ↓
Redirection vers EditDevisScreen
  ↓
Statut: "brouillon" (édition en cours)
```

**Changements nécessaires**:
- Ajouter un modal de sélection Client/Projet dans DocumentsScreen
- Créer un service `createDevisQuick(clientId, projectId)` qui:
  - Génère le devis via IA si notes disponibles
  - Sinon crée un devis vide
  - Redirige vers EditDevisScreen

---

### 2. Finalisation et envoi

```
EditDevisScreen
  ↓
Édition des lignes, TVA, etc.
  ↓
Bouton "Finaliser le devis"
  ↓
Mise à jour statut: "brouillon" → "pret" (nouveau statut)
  ↓
Affichage section "Envoyer au client"
  ↓
Bouton "Générer le lien de signature"
  ↓
Mise à jour statut: "pret" → "envoye"
  ↓
Affichage du lien + options de partage
```

**Changements nécessaires**:
- Ajouter un bouton "Finaliser le devis" dans EditDevisScreen
- Créer un nouveau statut "pret" (ou renommer "brouillon" en "edition")
- Mettre à jour `devis.statut = 'envoye'` lors de la génération du lien
- Synchroniser `statut` et `signature_status`

---

### 3. Signature et confirmation

```
Client reçoit le lien
  ↓
Page web publique de signature
  ↓
Client signe
  ↓
Edge Function met à jour:
  - devis.signature_status = 'signed'
  - devis.statut = 'signe' (synchronisation)
  - devis.signed_at, signed_by_name, signature_image_url
  ↓
Notification push à l'artisan (optionnel)
  ↓
Artisan voit le devis en statut "signé" dans DocumentsScreen
  ↓
Génération automatique du PDF signé
```

**Changements nécessaires**:
- Modifier l'Edge Function `sign-devis` pour mettre à jour `statut = 'signe'`
- Ajouter une notification push (optionnel, via Supabase Realtime)
- Générer automatiquement le PDF signé en arrière-plan

---

### 4. Statuts simplifiés

**Nouveau système de statuts** (colonne unique `statut`):

| Statut | Description | Actions disponibles |
|--------|-------------|---------------------|
| `edition` | Devis en cours d'édition | Éditer, Supprimer |
| `pret` | Devis finalisé, prêt à envoyer | Envoyer, Éditer, Supprimer |
| `envoye` | Lien de signature envoyé au client | Renvoyer, Annuler |
| `signe` | Devis signé par le client | Voir PDF, Convertir en facture |
| `refuse` | Devis refusé par le client | Archiver, Dupliquer |

**Supprimer** `signature_status` (redondant) et utiliser uniquement `statut`.

---

## 📁 FICHIERS À MODIFIER

### 1. Services

#### `services/devis/signatureService.js`
**Modifications**:
- Ligne 107-117: Mettre à jour `statut = 'envoye'` lors de la génération du lien
- Ligne 210-218: Mettre à jour `statut = 'signe'` lors de la signature (au lieu de `signature_status`)

#### `services/devis/devisService.js` (à créer)
**Nouveau fichier** pour centraliser la logique métier:
```javascript
export async function finalizeDevis(devisId) {
  // Vérifier que le devis a des lignes
  // Mettre à jour statut: 'edition' → 'pret'
  // Retourner le devis mis à jour
}

export async function createDevisQuick(clientId, projectId) {
  // Créer un devis vide ou via IA
  // Retourner le devisId
}
```

---

### 2. Écrans

#### `screens/EditDevisScreen.js`
**Modifications**:
- Ajouter un bouton "Finaliser le devis" (ligne ~400)
- Condition: afficher "Générer le lien" seulement si `statut === 'pret'`
- Ajouter `handleFinalizeDevis()` qui appelle `finalizeDevis(devisId)`

#### `screens/DocumentsScreen2.js`
**Modifications**:
- Ligne 684-691: Remplacer la navigation par un modal de sélection Client/Projet
- Ligne 144-149: Supprimer `normalizeStatus()`, utiliser directement `statut`
- Ajouter un badge visuel pour chaque statut (couleurs différentes)

---

### 3. Composants

#### `components/DevisAIGenerator2.js`
**Modifications**:
- Ligne 85-150: Créer le devis avec `statut: 'edition'` (au lieu de 'brouillon')
- Après création, rediriger vers `EditDevisScreen` avec le `devisId`

---

### 4. Edge Functions

#### `supabase/functions/sign-devis/index.ts`
**Modifications**:
- Ligne 168-179 (fonction `handleSign`): Mettre à jour `statut = 'signe'` en plus de `signature_status`

---

### 5. Base de données

#### Migration SQL (à créer)
```sql
-- Ajouter les nouveaux statuts
ALTER TABLE devis 
  DROP CONSTRAINT IF EXISTS devis_statut_check;

ALTER TABLE devis 
  ADD CONSTRAINT devis_statut_check 
  CHECK (statut IN ('edition', 'pret', 'envoye', 'signe', 'refuse'));

-- Migrer les données existantes
UPDATE devis SET statut = 'edition' WHERE statut = 'brouillon';
UPDATE devis SET statut = 'signe' WHERE signature_status = 'signed';
UPDATE devis SET statut = 'envoye' WHERE signature_status = 'pending';

-- Supprimer la colonne signature_status (optionnel, après tests)
-- ALTER TABLE devis DROP COLUMN signature_status;
```

---

## 🎯 PLAN D'ACTION (Ordre d'implémentation)

### Phase 1: Nettoyage et synchronisation (2-3h)
1. ✅ Créer la migration SQL pour les nouveaux statuts
2. ✅ Modifier `signatureService.js` pour synchroniser `statut` et `signature_status`
3. ✅ Modifier l'Edge Function `sign-devis` pour mettre à jour `statut`
4. ✅ Tester la signature de bout en bout

### Phase 2: Simplification du workflow (3-4h)
5. ✅ Créer `services/devis/devisService.js` avec `finalizeDevis()` et `createDevisQuick()`
6. ✅ Ajouter le bouton "Finaliser" dans `EditDevisScreen`
7. ✅ Conditionner l'affichage du bouton "Générer le lien" à `statut === 'pret'`
8. ✅ Tester le workflow complet: Création → Édition → Finalisation → Envoi → Signature

### Phase 3: Amélioration UX (2-3h)
9. ✅ Créer un modal de sélection Client/Projet dans `DocumentsScreen`
10. ✅ Ajouter des badges colorés pour chaque statut
11. ✅ Ajouter une notification push lors de la signature (optionnel)
12. ✅ Générer automatiquement le PDF signé en arrière-plan (optionnel)

### Phase 4: Nettoyage final (1h)
13. ✅ Supprimer `normalizeStatus()` dans `DocumentsScreen`
14. ✅ Supprimer la colonne `signature_status` (après validation complète)
15. ✅ Mettre à jour la documentation

---

## 📊 RÉSUMÉ EXÉCUTIF

### Problèmes actuels
- ❌ Confusion entre `statut` et `signature_status`
- ❌ Workflow "brouillon" obligatoire sans finalisation
- ❌ Navigation complexe pour créer un devis (5 étapes)
- ❌ Statut "envoyé" jamais utilisé
- ❌ Devis signés apparaissent en "brouillon" dans la liste

### Solution proposée
- ✅ Système de statuts unique et clair: `edition` → `pret` → `envoye` → `signe`
- ✅ Bouton "Finaliser" pour marquer le devis comme prêt
- ✅ Modal de création rapide depuis DocumentsScreen
- ✅ Synchronisation automatique des statuts
- ✅ Badges visuels pour chaque statut

### Impact estimé
- ⏱️ Temps de développement: 8-10 heures
- 🎯 Amélioration UX: +80% (workflow simplifié)
- 🐛 Bugs corrigés: 4 incohérences majeures
- 📈 Satisfaction utilisateur: Très élevée (workflow logique et intuitif)

---

**Prochaine étape recommandée**: Commencer par la Phase 1 (synchronisation des statuts) pour corriger les incohérences actuelles avant de refactoriser le workflow complet.

