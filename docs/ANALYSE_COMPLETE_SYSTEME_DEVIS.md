# 📋 ANALYSE COMPLÈTE DU SYSTÈME DE DEVIS - ARTISANFLOW

**Date** : 10 Décembre 2025  
**Auteur** : Analyse technique complète  
**Version** : 1.0

---

## 📊 TABLE DES MATIÈRES

1. [Data Model / Supabase](#1-data-model--supabase)
2. [Frontend : Composants & Écrans](#2-frontend--composants--écrans)
3. [Logique de Statuts / State Machine](#3-logique-de-statuts--state-machine)
4. [Génération du Lien de Signature](#4-génération-du-lien-de-signature)
5. [Flux Complet Utilisateur](#5-flux-complet-utilisateur)
6. [Douleurs Identifiées](#6-douleurs-identifiées)

---

## 1. DATA MODEL / SUPABASE

### 1.1 Tables Principales

#### **Table `devis`**

**Colonnes principales** :
- `id` (UUID, PK) - Identifiant unique
- `project_id` (UUID, FK → `projects.id`) - Chantier associé
- `client_id` (UUID, FK → `clients.id`) - Client associé
- `user_id` (UUID, FK → `auth.users.id`) - Artisan propriétaire (pour RLS)
- `numero` (TEXT, UNIQUE) - Numéro de devis (format: `DE-YYYY-XXXX`)
- `date_creation` (TIMESTAMP) - Date de création
- `date_validite` (DATE, nullable) - Date d'expiration du devis
- `montant_ht` (DECIMAL 10,2) - Montant HT
- `tva_percent` (DECIMAL 5,2, default: 20.00) - Taux de TVA
- `montant_ttc` (DECIMAL 10,2) - Montant TTC
- `statut` (TEXT, default: 'brouillon') - **Statut principal du devis**
- `notes` (TEXT, nullable) - Notes libres
- `transcription` (TEXT, nullable) - Transcription vocale source (si généré par IA)
- `pdf_url` (TEXT, nullable) - URL du PDF généré
- `created_at` (TIMESTAMP) - Date de création
- `statut_updated_at` (TIMESTAMP, nullable) - Date de dernière mise à jour du statut

**Colonnes liées à la signature** :
- `signature_token` (TEXT, UNIQUE, nullable) - Token unique pour le lien de signature
- `signature_status` (TEXT, default: 'pending', CHECK: 'pending' | 'signed') - Statut de la signature
- `signed_at` (TIMESTAMP, nullable) - Date/heure de signature
- `signed_by_name` (TEXT, nullable) - Nom du signataire
- `signed_by_email` (TEXT, nullable) - Email du signataire
- `signed_ip` (TEXT, nullable) - IP du signataire (optionnel)
- `signed_user_agent` (TEXT, nullable) - User-Agent du signataire (optionnel)
- `signature_image_url` (TEXT, nullable) - URL publique de l'image de signature (Supabase Storage)

**Index** :
- `idx_devis_project_id` sur `project_id`
- `idx_devis_client_id` sur `client_id`
- `idx_devis_signature_token` sur `signature_token`

**Contraintes** :
- `CHECK (statut IN ('edition', 'pret', 'envoye', 'signe', 'refuse', 'brouillon', 'accepte'))`
- `CHECK (signature_status IN ('pending', 'signed'))`

**Fichier SQL** : `sql/INIT_SUPABASE.sql`, `sql/add_signature_devis.sql`, `sql/migrate_devis_statuts.sql`

---

#### **Table `devis_lignes`**

**Colonnes** :
- `id` (UUID, PK)
- `devis_id` (UUID, FK → `devis.id`, ON DELETE CASCADE)
- `description` (TEXT, NOT NULL) - Description de la prestation
- `quantite` (DECIMAL 10,2, default: 1) - Quantité
- `unite` (TEXT, default: 'unité') - Unité ('unité', 'm²', 'ml', 'forfait', 'heure')
- `prix_unitaire` (DECIMAL 10,2, NOT NULL) - Prix unitaire HT
- `prix_total` (DECIMAL 10,2, NOT NULL) - Prix total HT (quantité × prix_unitaire)
- `ordre` (INTEGER, default: 0) - Ordre d'affichage
- `created_at` (TIMESTAMP) - Date de création

**Index** :
- `idx_devis_lignes_devis_id` sur `devis_id`
- `idx_devis_lignes_ordre` sur `(devis_id, ordre)`

**Fichier SQL** : `sql/create_devis_lignes_table.sql`

---

#### **Table `devis_signature_links`**

**Colonnes** :
- `id` (UUID, PK)
- `devis_id` (UUID, FK → `devis.id`) - Devis concerné
- `artisan_id` (UUID, FK → `auth.users.id`) - Artisan qui a généré le lien
- `token` (TEXT, UNIQUE) - Token unique pour le lien de signature
- `expires_at` (TIMESTAMP) - Date d'expiration (7 jours par défaut)
- `used_at` (TIMESTAMP, nullable) - Date d'utilisation (NULL = non utilisé)
- `created_at` (TIMESTAMP) - Date de création

**Rôle** : Table de traçabilité des liens de signature. Source de vérité pour l'Edge Function `sign-devis`.

**Note** : Cette table n'est pas créée dans les fichiers SQL visibles, mais elle est utilisée dans le code. Elle doit être créée manuellement ou via une migration non documentée.

**Fichier de référence** : `services/devis/signatureService.ts` (ligne 144-179), `supabase/functions/sign-devis/index.ts` (ligne 63-70)

---

#### **Table `devis_signatures`**

**Colonnes** :
- `id` (UUID, PK)
- `devis_id` (UUID, FK → `devis.id`, ON DELETE CASCADE)
- `user_id` (UUID, FK → `auth.users.id`) - Artisan propriétaire (pour RLS)
- `signed_at` (TIMESTAMP, NOT NULL, default: NOW()) - Date/heure de signature
- `signer_name` (TEXT, NOT NULL) - Nom du signataire
- `signer_email` (TEXT, NOT NULL) - Email du signataire
- `signature_image_base64` (TEXT, NOT NULL) - Image de signature en base64 (format: `data:image/png;base64,...`)
- `signer_ip` (TEXT, nullable) - IP du signataire
- `created_at` (TIMESTAMP, NOT NULL, default: NOW()) - Date de création

**Index** :
- `idx_devis_signatures_devis_id` sur `devis_id`
- `idx_devis_signatures_user_id` sur `user_id`
- `idx_devis_signatures_signed_at` sur `signed_at`

**RLS** : Activé avec policies pour isolation multi-tenant

**Fichier SQL** : `sql/add_signature_devis.sql` (ligne 58-73)

---

#### **Table `devis_ai_sessions`** (Optionnel - pour génération IA)

**Colonnes** :
- `id` (UUID, PK)
- `user_id` (UUID, FK → `auth.users.id`)
- `project_id` (UUID, FK → `projects.id`)
- `client_id` (UUID, FK → `clients.id`)
- `context_json` (JSONB) - Contexte conversationnel (historique Q/R)
- `status` (TEXT, default: 'pending') - Statut de la session ('pending', 'questions', 'ready', 'validated', 'cancelled')
- `tour_count` (INTEGER, default: 0) - Nombre de tours de questions/réponses
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `completed_at` (TIMESTAMP, nullable)

**Fichier SQL** : `sql/create_ai_devis_tables.sql`

---

### 1.2 Statuts du Devis

#### **Champ `statut` (colonne principale)**

**Valeurs possibles** :
- `'edition'` - Devis en cours d'édition (peut être modifié)
- `'pret'` - Devis finalisé, prêt à être envoyé au client
- `'envoye'` - Devis envoyé au client (lien de signature généré)
- `'signe'` - Devis signé par le client
- `'refuse'` - Devis refusé par le client
- `'brouillon'` - Ancien statut (déprécié, migré vers 'edition')
- `'accepte'` - Ancien statut (déprécié, migré vers 'signe')

**Logique** :
- Le champ `statut` est la **source de vérité principale** pour l'affichage dans l'UI
- Il est synchronisé avec `signature_status` lors des transitions importantes
- Migration SQL disponible : `sql/migrate_devis_statuts.sql`

---

#### **Champ `signature_status` (complémentaire)**

**Valeurs possibles** :
- `'pending'` - Lien de signature généré, en attente de signature
- `'signed'` - Devis signé par le client
- `NULL` - Aucun lien de signature généré

**Logique** :
- Utilisé en complément de `statut` pour la gestion de la signature
- Synchronisé avec `statut` lors de la génération du lien (`statut='envoye'` + `signature_status='pending'`)
- Synchronisé avec `statut` lors de la signature (`statut='signe'` + `signature_status='signed'`)

---

### 1.3 Relations et Contraintes

**Relations** :
- `devis.project_id` → `projects.id` (CASCADE DELETE)
- `devis.client_id` → `clients.id` (CASCADE DELETE)
- `devis.user_id` → `auth.users.id` (pour RLS)
- `devis_lignes.devis_id` → `devis.id` (CASCADE DELETE)
- `devis_signatures.devis_id` → `devis.id` (CASCADE DELETE)
- `devis_signature_links.devis_id` → `devis.id`
- `devis_signature_links.artisan_id` → `auth.users.id`

**RLS (Row Level Security)** :
- ✅ Activé sur toutes les tables (isolation multi-tenant)
- Les policies filtrent par `user_id = auth.uid()`
- Les devis sont accessibles via `projects.user_id` pour garantir l'isolation

---

## 2. FRONTEND : COMPOSANTS & ÉCRANS

### 2.1 Écran Liste des Devis

**Fichier** : `screens/DocumentsScreen2.js`

**Rôle** :
- Affiche la liste de tous les devis et factures de l'artisan
- Permet la recherche, le filtrage par statut, et le tri
- Affiche les badges de statut normalisés
- Permet l'ouverture d'un devis (PDF ou édition selon le statut)

**Récupération des données** :
```javascript
// Ligne 296-300
const { data: devis } = await supabase
  .from('devis')
  .select(`*, projects!inner(id, name, user_id), clients(id, name, email, phone)`)
  .eq('projects.user_id', user.id)
  .order('created_at', { ascending: false });
```

**Navigation** :
- Clic sur un devis en statut `'edition'` ou `'brouillon'` → `EditDevisScreen` (ligne 426-444)
- Clic sur un devis finalisé → Génération PDF et ouverture (ligne 420-489)

**Fichier** : `screens/DocumentsScreen2.js` (ligne 228-830)

---

### 2.2 Écran Édition / Détail du Devis

**Fichier** : `screens/EditDevisScreen.js`

**Rôle** :
- Permet l'édition complète des lignes de devis (description, quantité, prix, unité)
- Affiche le statut du devis avec badge coloré
- Gère les transitions de statut (Finaliser, Revenir en édition)
- Génère le lien de signature et affiche la popup de partage
- Affiche les informations de signature si le devis est signé

**Récupération des données** :
```javascript
// Ligne 67-88
const { data: devisData } = await supabase
  .from('devis')
  .select('*')
  .eq('id', devisId)
  .eq('user_id', user.id)
  .single();

const { data: lignesData } = await supabase
  .from('devis_lignes')
  .select('*')
  .eq('devis_id', devisId)
  .order('ordre', { ascending: true });
```

**Fonctions principales** :
- `loadDevis()` - Charge le devis et ses lignes (ligne 57-105)
- `saveChanges()` - Sauvegarde les modifications (ligne 147-219)
- `handleFinalizeDevis()` - Finalise le devis (ligne 304-322)
- `handleUnfinalizeDevis()` - Annule la finalisation (ligne 325-345)
- `handleGenerateSignatureLink()` - Génère le lien de signature (ligne 239-301)
- `addLigne()` - Ajoute une nouvelle ligne (ligne 222-235)
- `deleteLigne()` - Supprime une ligne (ligne 385-414)

**UI selon le statut** :
- **Statut `'edition'`** : Badge bleu "En édition" + Bouton vert "Finaliser le devis"
- **Statut `'pret'`** : Badge orange "Prêt à envoyer" + Bouton bleu "Générer le lien de signature" + Bouton secondaire "Revenir en édition"
- **Statut `'envoye'`** : Badge bleu "Envoyé - En attente de signature" + Bouton bleu "Renvoyer le lien" + Message d'aide "⏳ En attente de la signature du client"
- **Statut `'signe'`** : Badge vert "Signé le JJ/MM/AAAA" + Informations signataire + Bouton vert "Voir le PDF signé"

**Fichier** : `screens/EditDevisScreen.js` (ligne 1-761)

---

### 2.3 Composant Génération IA

**Fichier** : `components/DevisAIGenerator2.js`

**Rôle** :
- Génère un devis via IA conversationnelle à partir des notes vocales
- Pose des questions à l'artisan pour affiner le devis
- Crée le devis avec statut `'edition'` dans la base de données
- Redirige vers `EditDevisScreen` après création

**Fonctions principales** :
- `handleStartDevis()` - Démarre une session IA (ligne ~85-150)
- `handleAnswerQuestions()` - Envoie les réponses aux questions (ligne ~250-310)
- `handleValiderDevis()` - Crée le devis définitif (ligne 315-349)

**Service utilisé** : `services/aiConversationalService.ts`

**Fichier** : `components/DevisAIGenerator2.js`

---

### 2.4 Écran de Signature (Client)

**Fichier** : `screens/SignDevisScreen.js`

**Rôle** :
- Écran public accessible via deep link pour la signature du devis
- Valide le token de signature
- Affiche les informations du devis et de l'artisan
- Permet au client de dessiner sa signature et d'entrer son nom/email
- Envoie la signature à l'Edge Function

**Récupération des données** :
```javascript
// Ligne 48-49
useEffect(() => {
  validateToken();
}, [devisId, token]);
```

**Fonctions principales** :
- `validateToken()` - Valide le token via `validateSignatureToken()` (ligne ~50-80)
- `handleSign()` - Envoie la signature à l'Edge Function (ligne ~150-250)

**Service utilisé** : `services/devis/signatureService.ts` → `validateSignatureToken()`, `markDevisAsSigned()`

**Fichier** : `screens/SignDevisScreen.js` (ligne 1-789)

---

### 2.5 Popup "Lien de Signature Généré"

**Fichier** : `screens/EditDevisScreen.js` (ligne 248-294)

**Rôle** :
- Affiche une `Alert.alert()` avec 4 options après la génération du lien
- Permet de tester, copier, partager ou annuler

**Options disponibles** :
1. **"Tester maintenant"** :
   - Extrait le token du lien
   - Navigue vers `SignDevisScreen` avec `devisId` et `token`
   - Permet à l'artisan de tester la signature

2. **"Copier le lien"** :
   - Utilise `expo-clipboard` pour copier le lien dans le presse-papiers
   - Affiche un toast de succès
   - Fallback vers `Alert.alert()` si la copie échoue

3. **"Partager"** :
   - Utilise `expo-sharing` pour ouvrir le menu de partage natif
   - Permet de partager via SMS, Email, WhatsApp, etc.
   - Fallback vers `Alert.alert()` si le partage n'est pas disponible

4. **"Annuler"** :
   - Ferme la popup sans action

**Code** :
```javascript
// Ligne 248-294
Alert.alert(
  'Lien de signature généré',
  'Que souhaitez-vous faire ?',
  [
    { text: 'Tester maintenant', onPress: () => { /* navigation vers SignDevisScreen */ } },
    { text: 'Copier le lien', onPress: async () => { /* Clipboard.setStringAsync(link) */ } },
    { text: 'Partager', onPress: async () => { /* Sharing.shareAsync(link) */ } },
    { text: 'Annuler', style: 'cancel' },
  ]
);
```

---

## 3. LOGIQUE DE STATUTS / STATE MACHINE

### 3.1 Statuts Possibles

| Statut | Description | Actions disponibles |
|--------|-------------|---------------------|
| `'edition'` | Devis en cours d'édition | Éditer lignes, Finaliser, Supprimer |
| `'pret'` | Devis finalisé, prêt à envoyer | Générer lien, Revenir en édition, Supprimer |
| `'envoye'` | Devis envoyé au client | Renvoyer le lien, Voir le statut |
| `'signe'` | Devis signé par le client | Voir le PDF signé, Générer facture |
| `'refuse'` | Devis refusé | (Non implémenté actuellement) |
| `'brouillon'` | Ancien statut (déprécié) | Migré vers `'edition'` |
| `'accepte'` | Ancien statut (déprécié) | Migré vers `'signe'` |

---

### 3.2 Transitions de Statut

| Action utilisateur | Statut avant | Statut après | Fichier + fonction |
|-------------------|--------------|--------------|-------------------|
| **Création devis (IA)** | - | `'edition'` | `services/aiConversationalService.ts` → `createDevisFromAI()` (ligne 393) |
| **Création devis (manuel)** | - | `'edition'` | `services/devis/devisService.ts` → `createDevisQuick()` (ligne 299) |
| **Clique sur "Finaliser le devis"** | `'edition'` | `'pret'` | `screens/EditDevisScreen.js` → `handleFinalizeDevis()` (ligne 304) → `services/devis/devisService.ts` → `finalizeDevis()` (ligne 137) |
| **Clique sur "Revenir en édition"** | `'pret'` | `'edition'` | `screens/EditDevisScreen.js` → `handleUnfinalizeDevis()` (ligne 325) → `services/devis/devisService.ts` → `unfinalizeDevis()` (ligne 221) |
| **Clique sur "Générer le lien de signature"** | `'pret'` | `'envoye'` | `screens/EditDevisScreen.js` → `handleGenerateSignatureLink()` (ligne 239) → `services/devis/signatureService.ts` → `generateSignatureLink()` (ligne 190) |
| **Signature réussie côté client** | `'envoye'` | `'signe'` | `supabase/functions/sign-devis/index.ts` → `handleSign()` (ligne 171) → Mise à jour `devis.statut = 'signe'` + `signature_status = 'signed'` |

---

### 3.3 Conditions de Transition

#### **Finalisation (`'edition'` → `'pret'`)**

**Conditions** :
- Le devis doit être en statut `'edition'`
- Le devis doit contenir au moins une ligne dans `devis_lignes`

**Vérification** :
```javascript
// services/devis/devisService.ts (ligne 109-131)
if (devis.statut !== 'edition') {
  throw new Error('Seuls les devis en édition peuvent être finalisés');
}

const { data: lignes } = await supabase
  .from('devis_lignes')
  .select('id')
  .eq('devis_id', devisId);

if (!lignes || lignes.length === 0) {
  throw new Error('Le devis doit contenir au moins une ligne');
}
```

**Mise à jour BDD** :
```javascript
await supabase
  .from('devis')
  .update({
    statut: 'pret',
    statut_updated_at: new Date().toISOString(),
  })
  .eq('id', devisId);
```

---

#### **Génération du lien (`'pret'` → `'envoye'`)**

**Conditions** :
- Le devis doit être en statut `'pret'` (vérifié implicitement dans l'UI)
- L'utilisateur doit être authentifié
- Le devis doit appartenir à l'utilisateur (vérifié via RLS)

**Mise à jour BDD** :
```javascript
// services/devis/signatureService.ts (ligne 186-193)
await supabase
  .from('devis')
  .update({
    statut: 'envoye',
    signature_status: 'pending',
  })
  .eq('id', devisId);
```

**Création du lien** :
```javascript
// services/devis/signatureService.ts (ligne 172-179)
await supabase
  .from('devis_signature_links')
  .insert({
    devis_id: devisId,
    artisan_id: user.id,
    token: signatureToken,
    expires_at: expiresAt, // 7 jours
  });
```

---

#### **Signature (`'envoye'` → `'signe'`)**

**Conditions** :
- Le token doit être valide (non expiré, non utilisé)
- Le devis ne doit pas être déjà signé
- Le nom et l'email du signataire doivent être fournis

**Mise à jour BDD** :
```javascript
// supabase/functions/sign-devis/index.ts (ligne 168-179)
await supabaseAdmin
  .from('devis')
  .update({
    statut: 'signe',
    signature_status: 'signed',
    signed_at: new Date().toISOString(),
    signed_by_name: body.name,
    signed_by_email: body.email, // (non stocké actuellement, à vérifier)
    signed_ip: ip,
    signed_user_agent: userAgent,
    signature_image_url: signatureUrl,
  })
  .eq('id', link.devis_id);

// Marquer le lien comme utilisé
await supabaseAdmin
  .from('devis_signature_links')
  .update({ used_at: new Date().toISOString() })
  .eq('id', link.id);
```

---

## 4. GÉNÉRATION DU LIEN DE SIGNATURE

### 4.1 Fonction Principale

**Fichier** : `services/devis/signatureService.ts`  
**Fonction** : `generateSignatureLink(devisId: string): Promise<string>` (ligne 108-207)

**Étapes** :

1. **Vérification de l'authentification** :
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) throw new Error('Utilisateur non authentifié');
   ```

2. **Vérification du devis** :
   ```typescript
   const { data: devis } = await supabase
     .from('devis')
     .select(`id, signature_status, projects!inner(user_id)`)
     .eq('id', devisId)
     .single();
   ```

3. **Vérification d'un lien actif existant** :
   ```typescript
   const { data: existingLinks } = await supabase
     .from('devis_signature_links')
     .select('id, token, expires_at, used_at')
     .eq('devis_id', devisId)
     .eq('artisan_id', user.id)
     .is('used_at', null)
     .gt('expires_at', nowIso)
     .order('created_at', { ascending: false })
     .limit(1);
   ```

4. **Réutilisation ou création d'un nouveau lien** :
   - Si un lien actif existe → Réutilise le token existant
   - Sinon → Génère un nouveau UUID et crée une entrée dans `devis_signature_links`

5. **Mise à jour du statut** :
   ```typescript
   await supabase
     .from('devis')
     .update({
       statut: 'envoye',
       signature_status: 'pending',
     })
     .eq('id', devisId);
   ```

6. **Construction de l'URL** :
   ```typescript
   const finalUrl = `${SIGN_BASE_URL}?devisId=${encodeURIComponent(devisId)}&token=${encodeURIComponent(signatureToken)}`;
   ```

**URL de base** : `https://artisanflowsignatures.netlify.app/sign` (définie ligne 77-79)

---

### 4.2 Informations Stockées

**Table `devis_signature_links`** :
- `devis_id` - ID du devis
- `artisan_id` - ID de l'artisan (pour traçabilité)
- `token` - Token unique (UUID)
- `expires_at` - Date d'expiration (7 jours après création)
- `used_at` - Date d'utilisation (NULL = non utilisé)

**Table `devis`** :
- `statut` → `'envoye'`
- `signature_status` → `'pending'`

---

### 4.3 Validation du Token (Côté Client)

**Fichier** : `services/devis/signatureService.ts`  
**Fonction** : `validateSignatureToken(devisId: string, signatureToken: string)` (ligne 316-363)

**Étapes** :
1. Récupère le devis avec le token
2. Vérifie que le devis existe et que le token correspond
3. Vérifie que le devis n'est pas déjà signé
4. Retourne les informations du devis et du projet

**Utilisé par** : `screens/SignDevisScreen.js` → `validateToken()` (ligne ~50-80)

---

### 4.4 Popup "Lien de Signature Généré"

**Fichier** : `screens/EditDevisScreen.js` (ligne 248-294)

**Options** :

1. **"Tester maintenant"** :
   - Extrait le token du lien (parsing de l'URL)
   - Navigue vers `SignDevisScreen` avec `{ devisId, token }`
   - Permet à l'artisan de tester la signature avant de l'envoyer au client

2. **"Copier le lien"** :
   - Utilise `expo-clipboard` pour copier le lien
   - Affiche un toast de succès
   - Fallback vers `Alert.alert()` si la copie échoue

3. **"Partager"** :
   - Utilise `expo-sharing` pour ouvrir le menu de partage natif
   - Permet de partager via SMS, Email, WhatsApp, etc.

4. **"Annuler"** :
   - Ferme la popup sans action

---

## 5. FLUX COMPLET UTILISATEUR

### 5.1 Création d'un Devis

#### **Méthode 1 : Via IA (Recommandé)**

**Étape 1** : Ouvrir un chantier
- Écran : `screens/ProjectDetailScreen.js`
- Action : L'utilisateur ouvre un chantier depuis la liste des projets

**Étape 2** : Générer le devis avec l'IA
- Écran : `screens/ProjectDetailScreen.js` → Composant `DevisAIGenerator2`
- Action : L'utilisateur clique sur "Générer avec l'IA"
- Code : `components/DevisAIGenerator2.js` → `handleStartDevis()`
- Service : `services/aiConversationalService.ts` → `startDevisSession()`
- Résultat : Session IA créée, questions posées à l'artisan

**Étape 3** : Répondre aux questions
- Écran : `components/DevisAIGenerator2.js` (modal)
- Action : L'utilisateur répond aux questions de l'IA
- Code : `handleAnswerQuestions()`
- Service : `services/aiConversationalService.ts` → `answerQuestions()`
- Résultat : Devis généré avec lignes détaillées (affiché dans la modal)

**Étape 4** : Valider le devis
- Écran : `components/DevisAIGenerator2.js` (modal)
- Action : L'utilisateur clique sur "Créer le devis (brouillon)"
- Code : `handleValiderDevis()`
- Service : `services/aiConversationalService.ts` → `createDevisFromAI()`
- **Mise à jour BDD** :
  - Insertion dans `devis` avec `statut = 'edition'`
  - Insertion des lignes dans `devis_lignes`
  - Mise à jour de `devis_ai_sessions.status = 'validated'`
- Résultat : Devis créé, modal fermée, redirection vers `EditDevisScreen` (optionnel)

---

#### **Méthode 2 : Création Manuelle (Non implémentée actuellement)**

**Note** : La fonction `createDevisQuick()` existe dans `services/devis/devisService.ts` mais n'est pas utilisée dans l'UI actuelle.

---

### 5.2 Édition du Devis

**Écran** : `screens/EditDevisScreen.js`

**Actions disponibles** :
1. **Modifier les lignes** :
   - Ajouter une ligne : `addLigne()` (ligne 222)
   - Modifier une ligne : `updateLigne()` (ligne 127)
   - Supprimer une ligne : `deleteLigne()` (ligne 385)

2. **Modifier la TVA** :
   - Champ `tvaPercent` (ligne 43)
   - Recalcul automatique des totaux (ligne 112-124)

3. **Sauvegarder les modifications** :
   - Bouton "Enregistrer" (ligne 450-459)
   - Fonction `saveChanges()` (ligne 147-219)
   - Mise à jour de `devis_lignes` et `devis` (montants recalculés)

**Statut** : Le devis reste en statut `'edition'` pendant l'édition

---

### 5.3 Finalisation du Devis

**Écran** : `screens/EditDevisScreen.js`

**Action** : L'utilisateur clique sur "Finaliser le devis" (ligne 526-542)

**Conditions** :
- Le devis doit être en statut `'edition'`
- Le devis doit contenir au moins une ligne

**Processus** :
1. Modal de confirmation (ligne 315)
2. Appel à `finalizeDevis(devisId)` (ligne 351)
3. Service : `services/devis/devisService.ts` → `finalizeDevis()` (ligne 72-166)
4. **Mise à jour BDD** :
   ```sql
   UPDATE devis
   SET statut = 'pret', statut_updated_at = NOW()
   WHERE id = devisId;
   ```
5. Rechargement du devis (ligne 356)
6. Toast de succès : "Devis finalisé avec succès"

**Résultat** :
- Badge change : "En édition" → "Prêt à envoyer"
- Bouton change : "Finaliser le devis" → "Générer le lien de signature" + "Revenir en édition"

---

### 5.4 Génération du Lien de Signature

**Écran** : `screens/EditDevisScreen.js`

**Action** : L'utilisateur clique sur "Générer le lien de signature" (ligne 548-563)

**Processus** :
1. Appel à `generateSignatureLink(devisId)` (ligne 242)
2. Service : `services/devis/signatureService.ts` → `generateSignatureLink()` (ligne 108-207)
3. **Mise à jour BDD** :
   - Insertion dans `devis_signature_links` (token, expires_at, etc.)
   - Mise à jour `devis.statut = 'envoye'` et `signature_status = 'pending'`
4. **Popup "Lien de signature généré"** (ligne 248-294) :
   - Options : Tester, Copier, Partager, Annuler
5. Rechargement du devis (optionnel)

**Résultat** :
- Badge change : "Prêt à envoyer" → "Envoyé - En attente de signature"
- Bouton change : "Générer le lien" → "Renvoyer le lien"
- Message d'aide : "⏳ En attente de la signature du client"

---

### 5.5 Signature par le Client

**Écran** : Page web publique (`web/sign/index.html`) ou `screens/SignDevisScreen.js` (test)

**URL** : `https://artisanflowsignatures.netlify.app/sign?devisId=XXX&token=YYY`

**Processus** :

1. **Validation du token** :
   - Appel Edge Function : `POST /sign-devis { action: "info", token }`
   - Edge Function : `supabase/functions/sign-devis/index.ts` → `handleInfo()` (ligne 112-140)
   - Vérification : Token valide, non expiré, non utilisé
   - Retour : Informations du devis et de l'artisan

2. **Affichage du formulaire** :
   - Informations du devis (numéro, montant, client, projet)
   - Informations de l'artisan (nom, entreprise, email, téléphone)
   - Canvas de signature
   - Champs : Nom complet, Email

3. **Signature** :
   - Le client dessine sa signature dans le canvas
   - Le client entre son nom et email
   - Le client clique sur "Signer le devis"

4. **Envoi de la signature** :
   - Appel Edge Function : `POST /sign-devis { action: "sign", token, name, signatureDataUrl }`
   - Edge Function : `supabase/functions/sign-devis/index.ts` → `handleSign()` (ligne 142-183)
   - **Mise à jour BDD** :
     ```sql
     -- Upload de l'image dans Supabase Storage
     INSERT INTO storage.buckets('signatures').upload(...)
     
     -- Marquer le lien comme utilisé
     UPDATE devis_signature_links
     SET used_at = NOW()
     WHERE id = link.id;
     
     -- Mettre à jour le devis
     UPDATE devis
     SET statut = 'signe',
         signature_status = 'signed',
         signed_at = NOW(),
         signed_by_name = body.name,
         signed_ip = ip,
         signed_user_agent = userAgent,
         signature_image_url = signatureUrl
     WHERE id = link.devis_id;
     ```
   - Retour : `{ ok: true }`

5. **Confirmation** :
   - Message de succès : "✅ Devis signé avec succès !"
   - Le client peut fermer la page

---

### 5.6 Retour dans l'App (Artisan)

**Écran** : `screens/EditDevisScreen.js` ou `screens/DocumentsScreen2.js`

**Processus** :
1. L'artisan ouvre le devis (ou recharge l'écran)
2. Le devis est rechargé depuis Supabase
3. **Affichage** :
   - Badge : "Signé le JJ/MM/AAAA" (vert)
   - Informations : "Signé par: [Nom du signataire]"
   - Email : "[Email du signataire]"
   - Bouton : "Voir le PDF signé" (vert)

4. **Génération du PDF signé** :
   - Action : Clic sur "Voir le PDF signé"
   - Fonction : `handleViewSignedPDF()` (ligne 369-383)
   - Service : `utils/utils/pdf.js` → `generateDevisPDFFromDB()`
   - Processus :
     - Téléchargement de l'image de signature depuis `signature_image_url`
     - Injection de l'image dans le PDF
     - Génération du PDF avec section "Signé électroniquement"
   - Résultat : PDF ouvert dans le viewer natif ou partagé

---

## 6. DOULEURS IDENTIFIÉES

### 6.1 Incohérences de Statuts

**Problème** :
- Deux champs de statut coexistent : `statut` et `signature_status`
- Risque de désynchronisation entre les deux champs
- Migration SQL disponible mais pas toujours appliquée

**Impact** :
- Devis signés peuvent apparaître en "brouillon" si la synchronisation échoue
- Confusion pour l'utilisateur

**Fichiers concernés** :
- `sql/migrate_devis_statuts.sql` (migration disponible)
- `services/devis/signatureService.ts` (synchronisation manuelle)
- `supabase/functions/sign-devis/index.ts` (synchronisation manuelle)

---

### 6.2 Table `devis_signature_links` Non Documentée

**Problème** :
- La table `devis_signature_links` est utilisée dans le code mais n'est pas créée dans les fichiers SQL visibles
- Risque d'erreur si la table n'existe pas en production

**Impact** :
- Erreur lors de la génération du lien si la table est absente
- Pas de traçabilité des liens générés

**Fichiers concernés** :
- `services/devis/signatureService.ts` (ligne 144-179)
- `supabase/functions/sign-devis/index.ts` (ligne 63-70)

**Solution recommandée** : Créer un fichier SQL de migration pour cette table

---

### 6.3 Workflow de Création Manuelle Incomplet

**Problème** :
- La fonction `createDevisQuick()` existe mais n'est pas utilisée dans l'UI
- Le bouton "Créer un devis" dans `DocumentsScreen2` redirige vers l'onglet Clients au lieu de créer directement un devis

**Impact** :
- L'utilisateur doit passer par plusieurs écrans pour créer un devis manuellement
- Workflow indirect et confus

**Fichiers concernés** :
- `screens/DocumentsScreen2.js` (ligne 684-691)
- `services/devis/devisService.ts` → `createDevisQuick()` (ligne 259-329)

---

### 6.4 Gestion des Erreurs de Signature

**Problème** :
- Pas de gestion explicite des erreurs si la signature échoue (réseau, token expiré, etc.)
- Pas de notification push à l'artisan quand un devis est signé

**Impact** :
- L'artisan doit vérifier manuellement si le devis est signé
- Pas de feedback en temps réel

**Fichiers concernés** :
- `supabase/functions/sign-devis/index.ts` (gestion d'erreurs basique)
- Pas de système de notifications push

---

### 6.5 Extraction du Token dans la Popup

**Problème** :
- L'extraction du token depuis l'URL dans la popup "Tester maintenant" est fragile (parsing manuel)
- Si le format de l'URL change, le test ne fonctionnera plus

**Impact** :
- Risque d'erreur si l'URL change de format
- Code fragile et difficile à maintenir

**Fichier concerné** :
- `screens/EditDevisScreen.js` (ligne 244-246)

**Solution recommandée** : Retourner le token directement depuis `generateSignatureLink()` au lieu de le parser depuis l'URL

---

### 6.6 Pas de Gestion du Statut "Refusé"

**Problème** :
- Le statut `'refuse'` existe dans la contrainte SQL mais n'est pas géré dans l'UI
- Aucun moyen pour le client de refuser un devis

**Impact** :
- Fonctionnalité incomplète
- Pas de traçabilité des refus

**Fichiers concernés** :
- `sql/migrate_devis_statuts.sql` (statut défini mais non utilisé)
- Aucun écran ou fonction pour gérer le refus

---

### 6.7 Pas de Validation du Nom/Email du Signataire

**Problème** :
- Pas de validation stricte du format email dans `SignDevisScreen`
- Pas de vérification que le nom n'est pas vide

**Impact** :
- Risque de signatures invalides
- Données incomplètes en base

**Fichier concerné** :
- `screens/SignDevisScreen.js` (validation basique uniquement)

---

### 6.8 Pas de Limite de Tentatives de Signature

**Problème** :
- Un token peut être utilisé plusieurs fois si l'utilisateur rafraîchit la page avant la mise à jour de `used_at`
- Pas de protection contre les tentatives multiples

**Impact** :
- Risque de signatures multiples pour le même devis
- Incohérence des données

**Fichier concerné** :
- `supabase/functions/sign-devis/index.ts` (vérification de `used_at` mais pas de verrouillage transactionnel)

---

### 6.9 Pas de Révocation de Lien

**Problème** :
- Une fois un lien généré, il n'y a pas de moyen de le révoquer avant expiration
- L'artisan doit attendre 7 jours pour que le lien expire

**Impact** :
- Pas de contrôle sur les liens envoyés
- Risque de sécurité si le lien est compromis

**Fichiers concernés** :
- `services/devis/signatureService.ts` (pas de fonction de révocation)
- Pas d'UI pour révoquer un lien

---

### 6.10 Pas de Historique des Signatures

**Problème** :
- La table `devis_signatures` stocke les signatures mais il n'y a pas d'UI pour voir l'historique
- Pas de moyen de voir qui a signé et quand

**Impact** :
- Pas de traçabilité complète
- Difficile de déboguer en cas de problème

**Fichiers concernés** :
- `sql/add_signature_devis.sql` (table créée mais non utilisée dans l'UI)
- Pas d'écran pour afficher l'historique

---

## 📝 CONCLUSION

Le système de devis d'ArtisanFlow est **fonctionnel** mais présente plusieurs **points d'amélioration** :

✅ **Points forts** :
- Architecture claire avec séparation des responsabilités
- Gestion multi-tenant robuste (RLS)
- Workflow de signature électronique complet
- Génération IA des devis

⚠️ **Points à améliorer** :
- Synchronisation des statuts (`statut` vs `signature_status`)
- Documentation des tables (notamment `devis_signature_links`)
- Workflow de création manuelle
- Gestion des erreurs et notifications
- Validation et sécurité des signatures

**Priorités recommandées** :
1. **CRITIQUE** : Documenter et créer la table `devis_signature_links`
2. **IMPORTANT** : Améliorer la synchronisation des statuts
3. **MOYEN** : Compléter le workflow de création manuelle
4. **MOYEN** : Ajouter des notifications push pour les signatures
5. **FAIBLE** : Ajouter la gestion du statut "refusé"

---

**Fin du rapport**

