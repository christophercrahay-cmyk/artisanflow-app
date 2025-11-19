# 📋 PLAN DE TRAVAIL - RÉORGANISATION SYSTÈME DEVIS + HARMONISATION FACTURES

**Date** : 10 Décembre 2025  
**Objectif** : Réorganiser, simplifier et fiabiliser le système de devis + harmoniser avec les factures  
**Principe** : Refactor doux, ajouts progressifs, aucune suppression de code fonctionnel

---

## 🎯 STRATÉGIE GLOBALE

### Principes
1. **Aucune suppression** : Seulement des ajouts et des refactorings doux
2. **Compatibilité ascendante** : L'application reste fonctionnelle après chaque étape
3. **Tests incrémentaux** : Validation après chaque étape avant de passer à la suivante
4. **Documentation** : Chaque étape documente ses changements

### Ordre d'exécution
- **Phase 1** : Documentation et préparation (⚪ Très faible risque)
- **Phase 2** : Améliorations UI/UX (⚪ Très faible risque)
- **Phase 3** : Refactoring services (🟡 Moyen risque)
- **Phase 4** : Harmonisation devis/factures (🟡 Moyen risque)
- **Phase 5** : Robustesse et sécurité (🔴 Risqué)
- **Phase 6** : SQL et migrations (🔴 Risqué - à faire plus tard)

---

## 📦 PHASE 1 : DOCUMENTATION ET PRÉPARATION

### ÉTAPE 1.1 : Documenter la table `devis_signature_links`

**Niveau de risque** : ⚪ Très faible (documentation uniquement)

**Description** :
- Créer un fichier SQL de documentation pour la table `devis_signature_links`
- Documenter la structure attendue, les index, les contraintes
- Lister les dépendances (Edge Function, services)
- **Ne pas exécuter** : Juste documenter ce qui devrait exister

**Fichiers à créer** :
- `sql/documentation_devis_signature_links.sql` (nouveau fichier)

**Contenu du fichier** :
```sql
-- ========================================
-- DOCUMENTATION : Table devis_signature_links
-- ========================================
-- Cette table est utilisée par le code mais n'est pas créée dans les migrations visibles
-- Structure attendue basée sur l'analyse du code
-- ========================================

-- Structure attendue :
CREATE TABLE IF NOT EXISTS public.devis_signature_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id UUID NOT NULL REFERENCES public.devis(id) ON DELETE CASCADE,
  artisan_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index attendus :
CREATE INDEX IF NOT EXISTS idx_devis_signature_links_devis_id ON public.devis_signature_links(devis_id);
CREATE INDEX IF NOT EXISTS idx_devis_signature_links_token ON public.devis_signature_links(token);
CREATE INDEX IF NOT EXISTS idx_devis_signature_links_artisan_id ON public.devis_signature_links(artisan_id);
CREATE INDEX IF NOT EXISTS idx_devis_signature_links_expires_at ON public.devis_signature_links(expires_at);

-- RLS (à activer) :
ALTER TABLE public.devis_signature_links ENABLE ROW LEVEL SECURITY;

-- Policies attendues :
-- SELECT : artisan peut voir ses propres liens
-- INSERT : artisan peut créer des liens pour ses devis
-- UPDATE : artisan peut mettre à jour ses liens (used_at)
-- DELETE : artisan peut supprimer ses liens

-- Utilisation dans le code :
-- - services/devis/signatureService.ts (ligne 144-179)
-- - supabase/functions/sign-devis/index.ts (ligne 63-70)
```

**Impacts** :
- ✅ Aucun impact sur le code existant
- ✅ Documentation pour référence future
- ✅ Préparation pour migration SQL ultérieure

**Prérequis** :
- Aucun

**Validation** :
- Fichier créé et documenté
- Structure validée par rapport au code existant

---

### ÉTAPE 1.2 : Créer un fichier de constantes partagées devis/factures

**Niveau de risque** : ⚪ Très faible (nouveau fichier, pas d'imports)

**Description** :
- Créer un fichier de constantes pour les statuts, types, et valeurs partagées entre devis et factures
- Centraliser les définitions pour faciliter l'harmonisation future
- **Ne pas utiliser** dans le code existant pour l'instant (juste créer le fichier)

**Fichiers à créer** :
- `constants/documentTypes.ts` (nouveau fichier)

**Contenu du fichier** :
```typescript
// ========================================
// CONSTANTES PARTAGÉES : DEVIS & FACTURES
// ========================================

// Types de documents
export type DocumentType = 'devis' | 'facture';

// Statuts communs (à harmoniser progressivement)
export type DocumentStatus = 
  | 'edition'    // En cours d'édition
  | 'pret'       // Prêt à envoyer
  | 'envoye'     // Envoyé au client
  | 'signe'      // Signé (devis) / Payé (facture) - à harmoniser
  | 'refuse'     // Refusé (devis uniquement)
  | 'paye'       // Payé (facture uniquement)
  | 'impayee'    // Impayée (facture uniquement)
  | 'brouillon'  // Ancien statut (déprécié)
  | 'accepte';   // Ancien statut (déprécié)

// Statuts spécifiques devis
export type DevisStatus = 
  | 'edition' 
  | 'pret' 
  | 'envoye' 
  | 'signe' 
  | 'refuse' 
  | 'brouillon' 
  | 'accepte';

// Statuts spécifiques factures
export type FactureStatus = 
  | 'edition' 
  | 'pret' 
  | 'envoye' 
  | 'paye' 
  | 'impayee' 
  | 'brouillon';

// Configuration des statuts pour l'affichage
export const STATUS_CONFIG = {
  edition: { 
    color: '#3B82F6', 
    bg: '#3B82F620', 
    icon: '✏️', 
    label: 'Édition' 
  },
  pret: { 
    color: '#6366F1', 
    bg: '#6366F120', 
    icon: '📄', 
    label: 'Prêt' 
  },
  envoye: { 
    color: '#F97316', 
    bg: '#F9731620', 
    icon: '📤', 
    label: 'Envoyé' 
  },
  signe: { 
    color: '#10B981', 
    bg: '#10B98120', 
    icon: '✔️', 
    label: 'Signé' 
  },
  paye: { 
    color: '#10B981', 
    bg: '#10B98120', 
    icon: '💰', 
    label: 'Payé' 
  },
  refuse: { 
    color: '#EF4444', 
    bg: '#EF444420', 
    icon: '❌', 
    label: 'Refusé' 
  },
  impayee: { 
    color: '#EF4444', 
    bg: '#EF444420', 
    icon: '⚠️', 
    label: 'Impayée' 
  },
  brouillon: { 
    color: '#6B7280', 
    bg: '#6B728020', 
    icon: '📝', 
    label: 'Brouillon' 
  },
  accepte: { 
    color: '#10B981', 
    bg: '#10B98120', 
    icon: '✅', 
    label: 'Accepté' 
  },
} as const;

// Transitions de statut autorisées
export const ALLOWED_TRANSITIONS: Record<DocumentStatus, DocumentStatus[]> = {
  edition: ['pret', 'brouillon'],
  pret: ['edition', 'envoye'],
  envoye: ['signe', 'refuse'], // pour devis
  signe: [], // État final
  paye: [], // État final (facture)
  refuse: [], // État final
  impayee: ['paye'], // pour facture
  brouillon: ['edition'],
  accepte: [], // État final (déprécié)
};
```

**Impacts** :
- ✅ Aucun impact sur le code existant (fichier non importé)
- ✅ Préparation pour harmonisation future
- ✅ Source de vérité unique pour les statuts

**Prérequis** :
- Aucun

**Validation** :
- Fichier créé avec toutes les constantes
- Types TypeScript valides

---

### ÉTAPE 1.3 : Créer un helper de synchronisation des statuts

**Niveau de risque** : ⚪ Très faible (nouveau fichier, pas d'utilisation)

**Description** :
- Créer une fonction helper pour synchroniser `statut` et `signature_status`
- Centraliser la logique de synchronisation pour éviter les incohérences
- **Ne pas utiliser** dans le code existant pour l'instant (juste créer le fichier)

**Fichiers à créer** :
- `utils/statusSync.ts` (nouveau fichier)

**Contenu du fichier** :
```typescript
/**
 * Helper pour synchroniser les statuts de devis
 * Évite les incohérences entre statut et signature_status
 */

import { supabase } from '../supabaseClient';
import logger from './logger';

export type DevisStatus = 'edition' | 'pret' | 'envoye' | 'signe' | 'refuse' | 'brouillon' | 'accepte';
export type SignatureStatus = 'pending' | 'signed' | null;

export interface SyncStatusResult {
  success: boolean;
  error?: string;
}

/**
 * Synchronise statut et signature_status pour un devis
 * Règle : signature_status doit toujours être cohérent avec statut
 */
export async function syncDevisStatus(
  devisId: string,
  newStatut: DevisStatus,
  newSignatureStatus?: SignatureStatus
): Promise<SyncStatusResult> {
  try {
    // Déterminer signature_status automatiquement si non fourni
    let finalSignatureStatus: SignatureStatus = null;
    
    if (newStatut === 'envoye') {
      finalSignatureStatus = 'pending';
    } else if (newStatut === 'signe') {
      finalSignatureStatus = 'signed';
    } else {
      finalSignatureStatus = null;
    }

    // Utiliser la valeur fournie si présente, sinon la valeur calculée
    if (newSignatureStatus !== undefined) {
      finalSignatureStatus = newSignatureStatus;
    }

    // Mettre à jour le devis
    const { error } = await supabase
      .from('devis')
      .update({
        statut: newStatut,
        signature_status: finalSignatureStatus,
        statut_updated_at: new Date().toISOString(),
      })
      .eq('id', devisId);

    if (error) {
      logger.error('StatusSync', 'Erreur synchronisation statut', error);
      return { success: false, error: error.message };
    }

    logger.info('StatusSync', 'Statut synchronisé', { devisId, newStatut, finalSignatureStatus });
    return { success: true };
  } catch (error: any) {
    logger.error('StatusSync', 'Exception synchronisation statut', error);
    return { success: false, error: error.message };
  }
}

/**
 * Vérifie la cohérence des statuts d'un devis
 * Retourne true si cohérent, false sinon
 */
export async function checkStatusConsistency(devisId: string): Promise<boolean> {
  try {
    const { data: devis, error } = await supabase
      .from('devis')
      .select('statut, signature_status')
      .eq('id', devisId)
      .single();

    if (error || !devis) {
      return false;
    }

    // Règles de cohérence
    if (devis.statut === 'envoye' && devis.signature_status !== 'pending') {
      return false;
    }
    if (devis.statut === 'signe' && devis.signature_status !== 'signed') {
      return false;
    }
    if ((devis.statut === 'edition' || devis.statut === 'pret') && devis.signature_status !== null) {
      return false;
    }

    return true;
  } catch (error) {
    logger.error('StatusSync', 'Erreur vérification cohérence', error);
    return false;
  }
}
```

**Impacts** :
- ✅ Aucun impact sur le code existant (fichier non importé)
- ✅ Préparation pour refactoring des services
- ✅ Fonction réutilisable pour synchronisation

**Prérequis** :
- Aucun

**Validation** :
- Fichier créé avec fonctions complètes
- Types TypeScript valides
- Pas d'erreurs de compilation

---

## 🎨 PHASE 2 : AMÉLIORATIONS UI/UX

### ÉTAPE 2.1 : Améliorer la popup "Lien de signature généré"

**Niveau de risque** : ⚪ Très faible (UI seulement, pas de logique métier)

**Description** :
- Remplacer `Alert.alert()` par un composant modal personnalisé
- Améliorer l'UX avec un design cohérent
- Retourner le token directement depuis `generateSignatureLink()` au lieu de le parser depuis l'URL
- **Refactor doux** : Garder l'ancien code en commentaire pour rollback si besoin

**Fichiers à modifier** :
- `screens/EditDevisScreen.js` (ligne 239-301)
- `services/devis/signatureService.ts` (ligne 108-207) - modifier le retour

**Changements dans `signatureService.ts`** :
```typescript
// AVANT
export async function generateSignatureLink(devisId: string): Promise<string>

// APRÈS
export interface GenerateSignatureLinkResult {
  url: string;
  token: string;
  expiresAt: string;
}

export async function generateSignatureLink(
  devisId: string
): Promise<GenerateSignatureLinkResult>
```

**Changements dans `EditDevisScreen.js`** :
- Créer un composant modal `SignatureLinkModal` (nouveau composant dans le même fichier)
- Remplacer `Alert.alert()` par ce modal
- Utiliser directement `result.token` au lieu de parser l'URL
- Améliorer le design (icônes, couleurs, animations)

**Impacts** :
- ✅ Améliore l'UX (modal plus joli que Alert)
- ✅ Code plus robuste (pas de parsing d'URL)
- ✅ Meilleure maintenabilité
- ⚠️ Changement visuel pour l'utilisateur (mais positif)

**Prérequis** :
- Aucun

**Validation** :
- Modal fonctionne correctement
- Token extrait correctement
- Toutes les options (Tester, Copier, Partager) fonctionnent
- Design cohérent avec le reste de l'app

---

### ÉTAPE 2.2 : Ajouter la validation du nom/email dans SignDevisScreen

**Niveau de risque** : ⚪ Très faible (validation côté client uniquement)

**Description** :
- Ajouter une validation stricte du format email
- Vérifier que le nom n'est pas vide
- Afficher des messages d'erreur clairs
- Désactiver le bouton "Signer" si les champs sont invalides

**Fichiers à modifier** :
- `screens/SignDevisScreen.js` (ligne ~100-200, zone formulaire)

**Changements** :
- Ajouter une fonction `validateForm()` qui vérifie :
  - Nom non vide (trim, min 2 caractères)
  - Email valide (regex strict)
- Afficher des messages d'erreur sous chaque champ
- Désactiver le bouton "Signer le devis" si validation échoue
- Ajouter un indicateur visuel (bordure rouge) sur les champs invalides

**Impacts** :
- ✅ Améliore la qualité des données
- ✅ Meilleure UX (feedback immédiat)
- ✅ Réduit les erreurs côté serveur
- ⚠️ Aucun impact sur le code existant

**Prérequis** :
- Aucun

**Validation** :
- Validation email fonctionne (formats valides/invalides testés)
- Validation nom fonctionne (vide, trop court, OK)
- Messages d'erreur clairs
- Bouton désactivé correctement

---

### ÉTAPE 2.3 : Créer un composant StatusBadge réutilisable

**Niveau de risque** : ⚪ Très faible (nouveau composant, pas de modification existante)

**Description** :
- Créer un composant `StatusBadge` réutilisable pour devis et factures
- Utiliser les constantes de `constants/documentTypes.ts`
- Remplacer progressivement les badges inline dans `DocumentsScreen2.js` et `EditDevisScreen.js`
- **Refactor doux** : Commencer par créer le composant, puis remplacer un usage à la fois

**Fichiers à créer** :
- `components/StatusBadge.js` (nouveau composant)

**Fichiers à modifier** (progressivement) :
- `screens/DocumentsScreen2.js` (ligne 72-120, composant `StatusTag`)
- `screens/EditDevisScreen.js` (ligne 474-507, badges de statut)

**Structure du composant** :
```javascript
// components/StatusBadge.js
export default function StatusBadge({ 
  status, 
  type = 'devis', // 'devis' | 'facture'
  onPress,
  style 
}) {
  // Utilise STATUS_CONFIG de constants/documentTypes.ts
  // Gère les statuts spécifiques devis/factures
  // Design cohérent avec le reste de l'app
}
```

**Impacts** :
- ✅ Code plus maintenable (un seul composant)
- ✅ Design cohérent entre devis et factures
- ✅ Facilite l'harmonisation future
- ⚠️ Changement visuel mineur (mais positif)

**Prérequis** :
- Étape 1.2 terminée (constantes créées)

**Validation** :
- Composant créé et fonctionnel
- Tous les statuts affichés correctement
- Design cohérent
- Pas de régression visuelle

---

## 🔧 PHASE 3 : REFACTORING SERVICES

### ÉTAPE 3.1 : Utiliser le helper de synchronisation dans signatureService

**Niveau de risque** : 🟡 Moyen (logique métier, mais refactor doux)

**Description** :
- Remplacer les mises à jour manuelles de `statut` et `signature_status` par l'utilisation de `syncDevisStatus()`
- Centraliser la logique de synchronisation
- **Refactor doux** : Garder l'ancien code en commentaire pour rollback

**Fichiers à modifier** :
- `services/devis/signatureService.ts` (ligne 186-193, `generateSignatureLink`)
- `services/devis/signatureService.ts` (ligne 276-286, `markDevisAsSigned`)

**Changements** :
```typescript
// AVANT (ligne 186-193)
await supabase
  .from('devis')
  .update({
    statut: 'envoye',
    signature_status: 'pending',
  })
  .eq('id', devisId);

// APRÈS
import { syncDevisStatus } from '../../utils/statusSync';
await syncDevisStatus(devisId, 'envoye', 'pending');
```

**Impacts** :
- ✅ Code plus maintenable (logique centralisée)
- ✅ Réduit les risques d'incohérence
- ✅ Facilite les tests
- ⚠️ Changement de logique (mais équivalent)

**Prérequis** :
- Étape 1.3 terminée (helper créé)

**Validation** :
- Tests manuels : Génération de lien fonctionne
- Tests manuels : Signature fonctionne
- Vérification BDD : Statuts synchronisés correctement
- Pas de régression

---

### ÉTAPE 3.2 : Utiliser le helper de synchronisation dans devisService

**Niveau de risque** : 🟡 Moyen (logique métier, mais refactor doux)

**Description** :
- Remplacer les mises à jour de `statut` dans `finalizeDevis()` et `unfinalizeDevis()` par `syncDevisStatus()`
- Centraliser la logique de synchronisation
- **Refactor doux** : Garder l'ancien code en commentaire

**Fichiers à modifier** :
- `services/devis/devisService.ts` (ligne 134-139, `finalizeDevis`)
- `services/devis/devisService.ts` (ligne 218-223, `unfinalizeDevis`)

**Changements** :
```typescript
// AVANT (ligne 134-139)
await supabase
  .from('devis')
  .update({
    statut: 'pret',
    statut_updated_at: new Date().toISOString(),
  })
  .eq('id', devisId);

// APRÈS
import { syncDevisStatus } from '../../utils/statusSync';
await syncDevisStatus(devisId, 'pret');
```

**Impacts** :
- ✅ Code plus maintenable
- ✅ Cohérence avec signatureService
- ✅ Réduit les risques d'incohérence
- ⚠️ Changement de logique (mais équivalent)

**Prérequis** :
- Étape 1.3 terminée (helper créé)
- Étape 3.1 terminée (validation du pattern)

**Validation** :
- Tests manuels : Finalisation fonctionne
- Tests manuels : Retour en édition fonctionne
- Vérification BDD : Statuts corrects
- Pas de régression

---

### ÉTAPE 3.3 : Utiliser le helper de synchronisation dans l'Edge Function

**Niveau de risque** : 🔴 Risqué (Edge Function, nécessite déploiement)

**Description** :
- Modifier l'Edge Function `sign-devis` pour utiliser une logique de synchronisation similaire
- Créer une fonction helper dans l'Edge Function (pas d'import externe possible)
- **Refactor doux** : Garder l'ancien code en commentaire

**Fichiers à modifier** :
- `supabase/functions/sign-devis/index.ts` (ligne 168-179, `handleSign`)

**Changements** :
```typescript
// Créer une fonction helper dans l'Edge Function
async function syncDevisStatus(
  devisId: string,
  newStatut: string,
  newSignatureStatus: string | null
): Promise<void> {
  await supabaseAdmin
    .from('devis')
    .update({
      statut: newStatut,
      signature_status: newSignatureStatus,
      signed_at: newStatut === 'signe' ? new Date().toISOString() : undefined,
    })
    .eq('id', devisId);
}

// Utiliser dans handleSign
await syncDevisStatus(link.devis_id, 'signe', 'signed');
```

**Impacts** :
- ✅ Code plus maintenable
- ✅ Cohérence avec les services frontend
- ✅ Réduit les risques d'incohérence
- ⚠️ **Nécessite déploiement** de l'Edge Function
- ⚠️ **Risque si déploiement échoue** (mais rollback possible)

**Prérequis** :
- Étape 3.1 et 3.2 terminées (validation du pattern)
- Tests en local de l'Edge Function

**Validation** :
- Tests en local : Signature fonctionne
- Déploiement : Edge Function déployée sans erreur
- Tests en production : Signature fonctionne
- Vérification BDD : Statuts synchronisés correctement
- **Rollback plan** : Ancien code en commentaire

---

## 🔄 PHASE 4 : HARMONISATION DEVIS/FACTURES

### ÉTAPE 4.1 : Créer un service documentService générique

**Niveau de risque** : 🟡 Moyen (nouveau service, pas de modification existante)

**Description** :
- Créer un service générique `documentService.ts` qui abstrait les opérations communes devis/factures
- Implémenter les fonctions communes (création, édition, finalisation)
- **Refactor doux** : Ne pas modifier les services existants, juste créer le nouveau service

**Fichiers à créer** :
- `services/document/documentService.ts` (nouveau fichier)

**Structure du service** :
```typescript
// services/document/documentService.ts
export type DocumentType = 'devis' | 'facture';

export interface Document {
  id: string;
  type: DocumentType;
  numero: string;
  statut: string;
  montant_ht: number;
  montant_ttc: number;
  // ... autres champs communs
}

export interface DocumentLigne {
  id: string;
  document_id: string;
  description: string;
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
  // ...
}

// Fonctions génériques
export async function createDocument(
  type: DocumentType,
  data: Partial<Document>
): Promise<Document>;

export async function finalizeDocument(
  type: DocumentType,
  documentId: string
): Promise<Document>;

export async function getDocument(
  type: DocumentType,
  documentId: string
): Promise<Document | null>;

// ... autres fonctions communes
```

**Impacts** :
- ✅ Préparation pour harmonisation
- ✅ Code réutilisable
- ✅ Aucun impact sur le code existant (service non utilisé)

**Prérequis** :
- Étape 1.2 terminée (constantes créées)

**Validation** :
- Service créé avec types complets
- Fonctions génériques implémentées
- Types TypeScript valides
- Pas d'erreurs de compilation

---

### ÉTAPE 4.2 : Créer un écran EditDocumentScreen générique

**Niveau de risque** : 🟡 Moyen (nouveau composant, pas de modification existante)

**Description** :
- Créer un composant générique `EditDocumentScreen` qui peut gérer devis et factures
- Utiliser le service `documentService` créé à l'étape 4.1
- **Refactor doux** : Ne pas modifier `EditDevisScreen`, juste créer le nouveau composant

**Fichiers à créer** :
- `screens/EditDocumentScreen.js` (nouveau fichier)

**Structure du composant** :
```javascript
// screens/EditDocumentScreen.js
export default function EditDocumentScreen({ route, navigation }) {
  const { documentId, documentType } = route.params; // 'devis' | 'facture'
  
  // Utilise documentService au lieu de devisService
  // Gère les différences devis/factures (signature, paiement, etc.)
  // Design cohérent avec EditDevisScreen
}
```

**Impacts** :
- ✅ Préparation pour harmonisation
- ✅ Code réutilisable
- ✅ Aucun impact sur le code existant (composant non utilisé)

**Prérequis** :
- Étape 4.1 terminée (service créé)
- Étape 2.3 terminée (StatusBadge créé)

**Validation** :
- Composant créé et fonctionnel
- Gère devis et factures
- Design cohérent
- Pas d'erreurs

---

### ÉTAPE 4.3 : Créer factureService.ts sur le modèle de devisService.ts

**Niveau de risque** : 🟡 Moyen (nouveau service, pas de modification existante)

**Description** :
- Créer `services/factures/factureService.ts` sur le modèle de `services/devis/devisService.ts`
- Implémenter les mêmes fonctions (finalizeFacture, unfinalizeFacture, createFactureQuick)
- Utiliser les constantes partagées
- **Refactor doux** : Ne pas modifier les services existants

**Fichiers à créer** :
- `services/factures/factureService.ts` (nouveau fichier)

**Structure du service** :
```typescript
// services/factures/factureService.ts
// Même structure que devisService.ts mais pour factures
// Utilise les constantes de documentTypes.ts
// Statuts spécifiques factures : 'paye', 'impayee'
```

**Impacts** :
- ✅ Harmonisation devis/factures
- ✅ Code réutilisable
- ✅ Aucun impact sur le code existant (service non utilisé)

**Prérequis** :
- Étape 1.2 terminée (constantes créées)
- Étape 3.2 terminée (pattern validé)

**Validation** :
- Service créé avec toutes les fonctions
- Types TypeScript valides
- Pas d'erreurs de compilation

---

### ÉTAPE 4.4 : Créer facture_lignes table (si nécessaire)

**Niveau de risque** : 🔴 Risqué (SQL, nécessite migration)

**Description** :
- **À FAIRE PLUS TARD** : Créer la table `facture_lignes` sur le modèle de `devis_lignes`
- Documenter la structure dans un fichier SQL (ne pas exécuter pour l'instant)
- Préparer la migration pour plus tard

**Fichiers à créer** :
- `sql/documentation_facture_lignes.sql` (nouveau fichier, documentation uniquement)

**Contenu** :
```sql
-- ========================================
-- DOCUMENTATION : Table facture_lignes
-- ========================================
-- Structure attendue pour harmonisation avec devis_lignes
-- À créer plus tard via migration
-- ========================================

CREATE TABLE IF NOT EXISTS public.facture_lignes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facture_id UUID NOT NULL REFERENCES public.factures(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantite DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unite TEXT DEFAULT 'unité',
  prix_unitaire DECIMAL(10, 2) NOT NULL,
  prix_total DECIMAL(10, 2) NOT NULL,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_facture_lignes_facture_id ON public.facture_lignes(facture_id);
CREATE INDEX IF NOT EXISTS idx_facture_lignes_ordre ON public.facture_lignes(facture_id, ordre);
```

**Impacts** :
- ✅ Documentation pour migration future
- ✅ Aucun impact immédiat (non exécuté)

**Prérequis** :
- Aucun (documentation uniquement)

**Validation** :
- Fichier créé et documenté
- Structure validée

---

## 🛡️ PHASE 5 : ROBUSTESSE ET SÉCURITÉ

### ÉTAPE 5.1 : Ajouter la vérification de cohérence des statuts au chargement

**Niveau de risque** : 🟡 Moyen (logique métier, mais ajout seulement)

**Description** :
- Ajouter une vérification de cohérence des statuts dans `EditDevisScreen.loadDevis()`
- Utiliser `checkStatusConsistency()` de `statusSync.ts`
- Afficher un warning si incohérence détectée (mais ne pas bloquer)
- **Refactor doux** : Ajout seulement, pas de modification de logique existante

**Fichiers à modifier** :
- `screens/EditDevisScreen.js` (ligne 57-105, `loadDevis`)

**Changements** :
```javascript
// Ajouter après le chargement du devis
import { checkStatusConsistency } from '../utils/statusSync';

const isConsistent = await checkStatusConsistency(devisId);
if (!isConsistent) {
  logger.warn('EditDevisScreen', 'Incohérence de statut détectée', { devisId });
  // Optionnel : Afficher un toast d'avertissement
  // showWarning('Incohérence de statut détectée. Veuillez contacter le support.');
}
```

**Impacts** :
- ✅ Détection précoce des incohérences
- ✅ Meilleure observabilité
- ✅ Aucun impact sur le fonctionnement (warning seulement)

**Prérequis** :
- Étape 1.3 terminée (helper créé)

**Validation** :
- Vérification fonctionne
- Warning affiché si incohérence
- Pas de blocage du fonctionnement

---

### ÉTAPE 5.2 : Ajouter la validation du token avec verrouillage transactionnel

**Niveau de risque** : 🔴 Risqué (Edge Function, logique critique)

**Description** :
- Améliorer la validation du token dans l'Edge Function pour éviter les signatures multiples
- Utiliser un verrouillage transactionnel (SELECT FOR UPDATE) pour garantir l'atomicité
- **Refactor doux** : Amélioration seulement, pas de changement de comportement

**Fichiers à modifier** :
- `supabase/functions/sign-devis/index.ts` (ligne 142-183, `handleSign`)

**Changements** :
```typescript
// Utiliser une transaction pour garantir l'atomicité
async function handleSign(...) {
  // 1. Vérifier et verrouiller le lien (SELECT FOR UPDATE)
  const { data: link } = await supabaseAdmin
    .rpc('get_and_lock_signature_link', { p_token: body.token });
  
  // 2. Vérifier que le lien n'est pas utilisé
  if (link.used_at) {
    return jsonResponseWithCors(httpReq, { ok: false, reason: "used" }, 400);
  }
  
  // 3. Marquer comme utilisé et signer (dans la même transaction)
  // ...
}

// Créer une fonction SQL pour le verrouillage
// (à documenter dans sql/, ne pas exécuter pour l'instant)
```

**Impacts** :
- ✅ Sécurité améliorée (évite signatures multiples)
- ✅ Atomicité garantie
- ⚠️ **Nécessite fonction SQL** (à créer plus tard)
- ⚠️ **Nécessite déploiement** Edge Function

**Prérequis** :
- Tests en local de l'Edge Function
- Documentation de la fonction SQL nécessaire

**Validation** :
- Tests en local : Signature fonctionne
- Tests : Tentative de signature multiple bloquée
- Déploiement : Edge Function déployée
- Tests en production : Fonctionne correctement

---

### ÉTAPE 5.3 : Ajouter la fonction de révocation de lien

**Niveau de risque** : 🟡 Moyen (nouveau service, pas de modification existante)

**Description** :
- Ajouter une fonction `revokeSignatureLink()` dans `signatureService.ts`
- Permettre à l'artisan de révoquer un lien avant expiration
- **Refactor doux** : Ajout seulement, pas de modification existante

**Fichiers à modifier** :
- `services/devis/signatureService.ts` (ajout de fonction)

**Changements** :
```typescript
/**
 * Révoque un lien de signature (marque comme utilisé sans signature)
 */
export async function revokeSignatureLink(
  devisId: string,
  linkId?: string
): Promise<void> {
  // Si linkId fourni, révoquer ce lien spécifique
  // Sinon, révoquer tous les liens actifs du devis
  // Mettre à jour used_at = NOW()
  // Optionnel : Mettre à jour le statut du devis si nécessaire
}
```

**Impacts** :
- ✅ Contrôle amélioré sur les liens
- ✅ Sécurité améliorée
- ✅ Aucun impact sur le code existant (fonction non utilisée)

**Prérequis** :
- Aucun

**Validation** :
- Fonction créée et testée
- Révocation fonctionne
- Statut mis à jour correctement

---

### ÉTAPE 5.4 : Ajouter l'UI de révocation dans EditDevisScreen

**Niveau de risque** : ⚪ Très faible (UI seulement)

**Description** :
- Ajouter un bouton "Révoquer le lien" dans `EditDevisScreen` pour les devis en statut `'envoye'`
- Utiliser la fonction `revokeSignatureLink()` créée à l'étape 5.3
- Afficher une confirmation avant révocation

**Fichiers à modifier** :
- `screens/EditDevisScreen.js` (ligne 580-598, section statut 'envoye')

**Changements** :
- Ajouter un bouton "Révoquer le lien" à côté de "Renvoyer le lien"
- Modal de confirmation avant révocation
- Appel à `revokeSignatureLink()`
- Mise à jour de l'affichage après révocation

**Impacts** :
- ✅ UX améliorée (contrôle sur les liens)
- ✅ Sécurité améliorée
- ⚠️ Changement visuel (ajout de bouton)

**Prérequis** :
- Étape 5.3 terminée (fonction créée)

**Validation** :
- Bouton affiché correctement
- Confirmation fonctionne
- Révocation fonctionne
- Affichage mis à jour

---

## 📊 PHASE 6 : SQL ET MIGRATIONS (À FAIRE PLUS TARD)

### ÉTAPE 6.1 : Créer la table devis_signature_links

**Niveau de risque** : 🔴 Risqué (SQL, migration de production)

**Description** :
- Créer la table `devis_signature_links` en production
- Utiliser le fichier de documentation créé à l'étape 1.1
- Activer RLS et créer les policies
- **À FAIRE APRÈS VALIDATION** de toutes les phases précédentes

**Fichiers à créer** :
- `sql/migration_create_devis_signature_links.sql` (nouveau fichier, à exécuter)

**Prérequis** :
- Toutes les phases précédentes terminées et validées
- Backup de la base de données
- Tests en environnement de staging

**Validation** :
- Table créée sans erreur
- RLS activé
- Policies créées
- Tests : Génération de lien fonctionne
- Tests : Signature fonctionne

---

### ÉTAPE 6.2 : Créer la table facture_lignes

**Niveau de risque** : 🔴 Risqué (SQL, migration de production)

**Description** :
- Créer la table `facture_lignes` en production
- Utiliser le fichier de documentation créé à l'étape 4.4
- **À FAIRE APRÈS VALIDATION** de la phase 4

**Fichiers à créer** :
- `sql/migration_create_facture_lignes.sql` (nouveau fichier, à exécuter)

**Prérequis** :
- Phase 4 terminée et validée
- Backup de la base de données
- Tests en environnement de staging

**Validation** :
- Table créée sans erreur
- Index créés
- Tests : Création de facture avec lignes fonctionne

---

### ÉTAPE 6.3 : Migration des statuts dépréciés

**Niveau de risque** : 🔴 Risqué (SQL, migration de données)

**Description** :
- Migrer les statuts `'brouillon'` → `'edition'`
- Migrer les statuts `'accepte'` → `'signe'`
- Utiliser le fichier `sql/migrate_devis_statuts.sql` existant
- **À FAIRE APRÈS VALIDATION** de toutes les phases

**Fichiers à utiliser** :
- `sql/migrate_devis_statuts.sql` (existant, à exécuter)

**Prérequis** :
- Toutes les phases précédentes terminées
- Backup de la base de données
- Tests en environnement de staging

**Validation** :
- Migration exécutée sans erreur
- Vérification : Tous les statuts migrés
- Tests : Affichage correct dans l'UI
- Pas de régression

---

## 📋 ORDRE D'EXÉCUTION RECOMMANDÉ

### Séquençage optimal

1. **Phase 1** (Documentation) : Toutes les étapes en parallèle
   - 1.1 → 1.2 → 1.3 (séquentiel)

2. **Phase 2** (UI/UX) : Séquentiel
   - 2.1 → 2.2 → 2.3

3. **Phase 3** (Services) : Séquentiel
   - 3.1 → 3.2 → 3.3

4. **Phase 4** (Harmonisation) : Séquentiel
   - 4.1 → 4.2 → 4.3 → 4.4

5. **Phase 5** (Robustesse) : Séquentiel
   - 5.1 → 5.2 → 5.3 → 5.4

6. **Phase 6** (SQL) : **À FAIRE PLUS TARD**, après validation complète
   - 6.1 → 6.2 → 6.3

### Points de validation

- ✅ Après chaque étape : Tests manuels + vérification BDD
- ✅ Après chaque phase : Tests de régression complets
- ✅ Avant Phase 6 : Validation complète de toutes les phases précédentes

---

## 🎯 RÉSUMÉ DES RISQUES

| Phase | Risque global | Étapes risquées |
|-------|--------------|-----------------|
| Phase 1 | ⚪ Très faible | Aucune |
| Phase 2 | ⚪ Très faible | Aucune |
| Phase 3 | 🟡 Moyen | 3.3 (Edge Function) |
| Phase 4 | 🟡 Moyen | Aucune (création seulement) |
| Phase 5 | 🟡 Moyen | 5.2 (Edge Function) |
| Phase 6 | 🔴 Risqué | Toutes (SQL) |

---

## 📝 NOTES IMPORTANTES

1. **Aucune suppression de code** : Tous les changements sont des ajouts ou des refactorings doux
2. **Rollback possible** : Ancien code gardé en commentaire quand nécessaire
3. **Tests incrémentaux** : Validation après chaque étape
4. **Documentation** : Chaque étape documente ses changements
5. **SQL plus tard** : Les migrations SQL sont documentées mais non exécutées dans ce plan

---

**Fin du plan**

