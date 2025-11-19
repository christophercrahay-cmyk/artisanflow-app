# 🔍 AUDIT COMPLET - SYSTÈME FACTURES

**Date** : 19 novembre 2025  
**Objectif** : Analyser l'existant pour finaliser le système factures et organiser les documents

---

## 📋 ÉTAPE 1 : AUDIT DE L'EXISTANT

### 1.1 FICHIERS/COMPOSANTS EXISTANTS

#### ✅ **Composants créés** :

1. **`DevisFactures.js`** (composant partagé)
   - **Rôle** : Gère à la fois devis ET factures via prop `type = 'devis' | 'facture'`
   - **Fonctionnalités** :
     - Liste des documents (devis ou factures)
     - Formulaire de création/édition inline
     - Enregistrement vocal avec transcription Whisper
     - Sauvegarde en base
   - **Limitations** :
     - Pas de gestion de lignes détaillées (pas de `facture_lignes`)
     - Formulaire simple (montant HT, TVA, TTC)
     - Pas d'écran d'édition dédié comme `EditDevisScreen`

2. **`components/FactureAIGenerator.js`** (générateur IA)
   - **Rôle** : Génère des factures via IA conversationnelle
   - **Fonctionnalités** :
     - Analyse notes vocales du chantier
     - Questions de clarification
     - Génération facture avec lignes détaillées
     - Colorisation prix selon profil IA
     - Validation pour créer facture en brouillon
   - **État** : ✅ Fonctionnel

3. **`screens/DocumentsScreen2.js`** (écran global)
   - **Rôle** : Affiche tous les devis et factures
   - **Fonctionnalités** :
     - Filtres (Tous / Devis / Factures)
     - Liste avec cartes de documents
     - Partage PDF
     - Navigation vers `EditDevisScreen` (pour devis uniquement)
   - **Limitations** :
     - Pas de navigation vers écran d'édition facture (n'existe pas)
     - Pas de filtrage par client/chantier dans cet écran

4. **`screens/ProjectDetailScreen.js`** (écran chantier)
   - **Rôle** : Affiche les détails d'un chantier
   - **Fonctionnalités** :
     - Section "Devis" avec `<DevisFactures type="devis" />`
     - Section "Factures" avec `<DevisFactures type="facture" />`
     - Générateur IA facture (`FactureAIGenerator`)
   - **État** : ✅ Fonctionnel

---

#### ✅ **Services créés** :

1. **`services/aiConversationalService.js`**
   - **Fonctions** :
     - `startFactureSession()` : Démarre session IA pour facture
     - `createFactureFromAI()` : Crée facture en base depuis résultat IA
   - **État** : ✅ Fonctionnel

---

#### ❌ **Fichiers manquants** :

1. **`screens/EditFactureScreen.js`** (écran d'édition facture)
   - **Manque** : Pas d'écran dédié pour éditer une facture
   - **Impact** : Impossible d'éditer une facture comme on édite un devis
   - **Solution** : Créer sur le modèle de `EditDevisScreen.js`

2. **`services/factureService.ts`** (service factures)
   - **Manque** : Pas de service dédié pour les factures
   - **Impact** : Logique métier dispersée
   - **Solution** : Créer sur le modèle de `services/devis/devisService.ts`

3. **`utils/factureRules.ts`** (règles workflow factures)
   - **Manque** : Pas de règles de workflow pour factures
   - **Impact** : Pas de protection contre modifications de factures payées
   - **Solution** : Créer sur le modèle de `utils/devisRules.ts`

4. **Composants réutilisables** :
   - `<DevisList client_id={...} project_id={...} />` : ❌ N'existe pas
   - `<InvoicesList client_id={...} project_id={...} />` : ❌ N'existe pas

---

### 1.2 STRUCTURE ACTUELLE

#### **Table `factures` dans Supabase** :

```sql
CREATE TABLE factures (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL,
  client_id UUID NOT NULL,
  devis_id UUID,                    -- ✅ Lien avec devis
  numero TEXT NOT NULL UNIQUE,
  date_creation TIMESTAMP DEFAULT NOW(),
  date_echeance DATE,               -- ✅ Spécifique factures
  montant_ht DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tva_percent DECIMAL(5, 2) DEFAULT 20.00,
  montant_ttc DECIMAL(10, 2) NOT NULL DEFAULT 0,
  statut TEXT DEFAULT 'brouillon',  -- brouillon, envoye, paye, impayee
  notes TEXT,
  transcription TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  user_id UUID,                     -- ✅ Pour RLS
  -- Colonnes entreprise (ajoutées plus tard)
  company_name TEXT,
  company_siret TEXT,
  company_address TEXT,
  company_city TEXT,
  company_phone TEXT,
  company_email TEXT,
  
  CONSTRAINT fk_facture_project FOREIGN KEY (project_id) REFERENCES projects(id),
  CONSTRAINT fk_facture_client FOREIGN KEY (client_id) REFERENCES clients(id),
  CONSTRAINT fk_facture_devis FOREIGN KEY (devis_id) REFERENCES devis(id)
);
```

**Index** :
- ✅ `idx_factures_project_id` (project_id)
- ✅ `idx_factures_client_id` (client_id)
- ✅ `idx_factures_devis_id` (devis_id)

**❌ Manque** :
- ❌ Table `facture_lignes` (contrairement à `devis_lignes`)
- ❌ Colonne `date_paiement` (pour factures payées)
- ❌ Colonne `updated_at` (pour tracking)

---

#### **Table `devis_lignes` (référence)** :

```sql
CREATE TABLE devis_lignes (
  id UUID PRIMARY KEY,
  devis_id UUID NOT NULL,
  description TEXT NOT NULL,
  quantite DECIMAL(10, 2) NOT NULL,
  unite TEXT,
  prix_unitaire DECIMAL(10, 2) NOT NULL,
  tva_percent DECIMAL(5, 2) DEFAULT 20.00,
  montant_ht DECIMAL(10, 2) NOT NULL,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_devis_ligne FOREIGN KEY (devis_id) REFERENCES devis(id) ON DELETE CASCADE
);
```

**❌ Manque équivalent pour factures** :
- ❌ Table `facture_lignes` n'existe pas

---

### 1.3 CE QUI FONCTIONNE DÉJÀ

#### ✅ **Fonctionnalités opérationnelles** :

1. **Génération IA facture** :
   - ✅ `FactureAIGenerator` fonctionne
   - ✅ Analyse notes vocales
   - ✅ Questions de clarification
   - ✅ Création facture en base

2. **Affichage factures** :
   - ✅ Liste dans `DocumentsScreen2` (filtre "Factures")
   - ✅ Liste dans `ProjectDetailScreen` (section Factures)
   - ✅ Affichage via `DevisFactures` avec `type="facture"`

3. **Création manuelle** :
   - ✅ Formulaire inline dans `DevisFactures`
   - ✅ Sauvegarde en base
   - ✅ Numérotation automatique (FA-YYYY-XXXX)

4. **Partage PDF** :
   - ✅ Génération PDF facture (`ensureFacturePdfFile`)
   - ✅ Partage email/WhatsApp

5. **Base de données** :
   - ✅ Table `factures` existe
   - ✅ Index créés
   - ✅ Relations FK (project, client, devis)

---

### 1.4 CE QUI MANQUE VS LES DEVIS

#### ❌ **Fonctionnalités manquantes** :

1. **Écran d'édition dédié** :
   - ❌ Pas d'`EditFactureScreen.js`
   - ❌ Impossible d'éditer une facture comme un devis
   - ✅ **Devis a** : `EditDevisScreen.js` complet avec lignes, TVA, totaux

2. **Gestion des lignes détaillées** :
   - ❌ Pas de table `facture_lignes`
   - ❌ Impossible d'ajouter/modifier/supprimer des lignes
   - ✅ **Devis a** : Table `devis_lignes` + gestion complète dans `EditDevisScreen`

3. **Workflow de statuts** :
   - ❌ Pas de règles de workflow (`factureRules.ts`)
   - ❌ Pas de protection contre modifications factures payées
   - ✅ **Devis a** : `devisRules.ts` avec `canEditDevis()`, `isDevisLocked()`, etc.

4. **Service dédié** :
   - ❌ Pas de `factureService.ts`
   - ❌ Logique métier dispersée
   - ✅ **Devis a** : `services/devis/devisService.ts` complet

5. **Composant StatusBadge** :
   - ⚠️ `DocumentStatusBadge` existe mais pas de config pour statuts factures
   - ✅ **Devis a** : Badge configuré pour tous les statuts

6. **Conversion devis → facture** :
   - ❌ Pas de fonction `convertQuoteToInvoice()`
   - ❌ Pas de bouton "Convertir en facture" dans `EditDevisScreen`

7. **Affichage par client/chantier** :
   - ❌ Pas de composants `<DevisList />` ou `<InvoicesList />`
   - ❌ Factures non affichées dans écran Client
   - ✅ **Devis a** : Affichage dans `ProjectDetailScreen` via `DevisFactures`

8. **Signature électronique** :
   - ❌ Pas de signature (normal, factures n'ont pas de signature)
   - ✅ **Devis a** : Signature électronique complète

---

### 1.5 COMPARAISON DEVIS VS FACTURES

| Fonctionnalité | Devis | Factures | État |
|----------------|-------|----------|------|
| **Table principale** | ✅ `devis` | ✅ `factures` | ✅ OK |
| **Table lignes** | ✅ `devis_lignes` | ❌ `facture_lignes` | ❌ Manque |
| **Écran édition** | ✅ `EditDevisScreen.js` | ❌ N'existe pas | ❌ Manque |
| **Service dédié** | ✅ `devisService.ts` | ❌ N'existe pas | ❌ Manque |
| **Règles workflow** | ✅ `devisRules.ts` | ❌ N'existe pas | ❌ Manque |
| **Génération IA** | ✅ `DevisAIGenerator` | ✅ `FactureAIGenerator` | ✅ OK |
| **Signature électronique** | ✅ Complète | ❌ Pas de signature | ✅ Normal |
| **Statuts** | ✅ 6 statuts | ⚠️ 4 statuts | ⚠️ À harmoniser |
| **Numérotation** | ✅ DEV-YYYY-XXXX | ✅ FA-YYYY-XXXX | ✅ OK |
| **Affichage global** | ✅ `DocumentsScreen2` | ✅ `DocumentsScreen2` | ✅ OK |
| **Affichage chantier** | ✅ `ProjectDetailScreen` | ✅ `ProjectDetailScreen` | ✅ OK |
| **Affichage client** | ❌ N'existe pas | ❌ N'existe pas | ❌ Manque |
| **Conversion** | ❌ N'existe pas | ❌ N'existe pas | ❌ Manque |

---

### 1.6 STATUTS ACTUELS

#### **Statuts devis** (dans `DocumentStatusBadge.js`) :
- `edition` : En édition
- `pret` : Prêt
- `envoye` : Envoyé
- `signe` : Signé
- `refuse` : Refusé
- `brouillon` : Brouillon (ancien)
- `accepte` : Accepté (ancien)

#### **Statuts factures** (dans `validation/schemas.js`) :
- `brouillon` : Brouillon
- `envoye` : Envoyée
- `paye` : Payée
- `impayee` : Impayée

**❌ Manque** :
- `en_retard` : En retard (mentionné dans la demande)
- `annulee` : Annulée (mentionné dans la demande)
- `partiellement_payee` : Partiellement payée (mentionné dans `DocumentStatusBadge.js`)

---

### 1.7 ARCHITECTURE DES ÉCRANS

#### **Écran Client** (`ClientDetailScreen.js`) :
- **Fichier** : `screens/ClientDetailScreen.js` ✅ Existe
- **État** : ✅ Fonctionnel
- **Contenu actuel** :
  - ✅ Infos client (nom, adresse, téléphone, email) - cliquables
  - ✅ Section "Chantiers" avec liste des chantiers du client
  - ✅ Bouton "Nouveau chantier"
  - ✅ Toggle pour afficher/masquer chantiers archivés
  - ❌ **MANQUE** : Section "Devis" (liste filtrée par client)
  - ❌ **MANQUE** : Section "Factures" (liste filtrée par client)
  - ❌ **MANQUE** : Stats (total devis, total factures, CA)

#### **Écran Chantier** (`ProjectDetailScreen.js`) :
- **Sections existantes** :
  - ✅ Infos chantier
  - ✅ Photos de chantier
  - ✅ Notes vocales
  - ✅ Section "Devis" avec `<DevisFactures type="devis" />`
  - ✅ Section "Factures" avec `<DevisFactures type="facture" />`
  - ✅ Générateur Devis IA
  - ✅ Générateur Facture IA

**✅ Déjà bien organisé** : Les devis et factures sont déjà affichés dans le chantier

---

### 1.8 PROBLÈME PRIX EN ORANGE

**Localisation confirmée** : `components/FactureAIGenerator.js`

**Fonction responsable** : `getPriceColor(description, price)` (ligne 54)

**Code actuel** :
```javascript
const getPriceColor = (description, price) => {
  // ... logique de colorisation selon profil IA
  // Retourne une couleur (probablement orange) ou null
};
```

**Utilisation** : Ligne 431-443
```javascript
const priceColor = getPriceColor(ligne.description, ligne.prix_unitaire);
// ...
<Text style={[
  styles.lignePrix,
  priceColor ? { color: priceColor, fontWeight: '700' } : { color: theme.colors.text }
]}>
  {ligne.prix_unitaire.toFixed(2)}€
</Text>
```

**Code complet** (lignes 54-75) :
```javascript
const getPriceColor = (description, price) => {
  if (!avgPrices || !description || typeof price !== 'number') {
    return undefined;
  }
  const key = normalizeKey(description);
  const stats = avgPrices[key];
  if (!stats || !stats.avg || stats.avg <= 0) {
    return undefined;
  }
  const diffPercent = ((price - stats.avg) / stats.avg) * 100;
  // Utiliser les couleurs du nouveau thème
  if (Math.abs(diffPercent) <= 10) {return theme.colors.priceCoherent;}
  if (Math.abs(diffPercent) <= 20) {return theme.colors.priceLimit;}
  if (diffPercent > 20) {return theme.colors.priceTooHigh;}
  if (diffPercent < -20) {return theme.colors.priceTooLow;}
  return undefined;
};
```

**Solution** : Modifier `getPriceColor` pour retourner `undefined` ou `theme.colors.text` au lieu des couleurs de profil IA. Ou simplement désactiver la colorisation pour les factures.

---

## 📊 RÉSUMÉ DE L'AUDIT

### ✅ **Points forts** :
1. Table `factures` existe avec structure de base
2. Génération IA facture fonctionnelle
3. Affichage factures dans `DocumentsScreen2` et `ProjectDetailScreen`
4. Partage PDF fonctionnel
5. Numérotation automatique (FA-YYYY-XXXX)

### ❌ **Points faibles** :
1. Pas d'écran d'édition dédié (`EditFactureScreen`)
2. Pas de table `facture_lignes` (impossible de gérer lignes détaillées)
3. Pas de service dédié (`factureService.ts`)
4. Pas de règles workflow (`factureRules.ts`)
5. Pas de composants réutilisables (`<DevisList />`, `<InvoicesList />`)
6. Pas d'affichage dans écran Client
7. Pas de conversion devis → facture
8. Statuts factures incomplets (manque `en_retard`, `annulee`)

### ⚠️ **Points à vérifier** :
1. Écran Client existe-t-il ? Où afficher les factures par client ?
2. Prix en orange dans `FactureAIGenerator` : où est la colorisation ?
3. Table `factures` a-t-elle toutes les colonnes nécessaires ?

---

## 🎯 PROCHAINES ÉTAPES

### **ÉTAPE 2** : Adapter factures pour avoir les mêmes fonctionnalités que devis
### **ÉTAPE 3** : Fix prix en orange
### **ÉTAPE 4** : Organiser documents par client/chantier
### **ÉTAPE 5** : Conversion devis → facture
### **ÉTAPE 6** : Vérification table Supabase

---

**Fin de l'audit - ÉTAPE 1 terminée**

