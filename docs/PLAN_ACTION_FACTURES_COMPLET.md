# 🚀 PLAN D'ACTION COMPLET - SYSTÈME FACTURES

**Date** : 19 novembre 2025  
**Objectif** : Finaliser système factures + Organisation documents + Conversion + Onboarding

---

## 📋 RÉSUMÉ DES ÉTAPES

1. **ÉTAPE 2** : Adapter factures pour avoir les mêmes fonctionnalités que devis
2. **ÉTAPE 4** : Organiser documents par client/chantier
3. **ÉTAPE 5** : Conversion devis → facture
4. **ÉTAPE 7** : Amélioration onboarding

---

## 🗂️ LISTE DES FICHIERS À CRÉER/MODIFIER

### ✅ **FICHIERS À CRÉER** (11 fichiers)

#### **ÉTAPE 2 - Adaptation Factures** :

1. **`sql/create_facture_lignes_table.sql`**
   - Table `facture_lignes` (identique à `devis_lignes`)
   - Index et contraintes

2. **`services/facture/factureService.ts`**
   - Service centralisé pour factures
   - Fonctions : `finalizeFacture()`, `markAsPaid()`, `markAsOverdue()`, etc.
   - Basé sur `services/devis/devisService.ts`

3. **`utils/factureRules.ts`**
   - Règles workflow factures
   - Fonctions : `canEditFacture()`, `isFactureLocked()`, `canMarkAsPaid()`, etc.
   - Basé sur `utils/devisRules.ts`

4. **`screens/EditFactureScreen.js`**
   - Écran d'édition facture complet
   - Basé sur `screens/EditDevisScreen.js`
   - **Différences** : Pas de signature, statuts différents, actions différentes

#### **ÉTAPE 4 - Organisation Documents** :

5. **`components/DevisList.js`**
   - Composant réutilisable liste devis
   - Props : `client_id?`, `project_id?`, `limit?`, `onPress?`

6. **`components/InvoicesList.js`**
   - Composant réutilisable liste factures
   - Props : `client_id?`, `project_id?`, `limit?`, `onPress?`

#### **ÉTAPE 5 - Conversion** :

7. **`services/facture/convertService.ts`**
   - Fonction `convertDevisToFacture(devisId)`
   - Copie lignes, génère numéro, crée facture

---

### 🔧 **FICHIERS À MODIFIER** (8 fichiers)

#### **ÉTAPE 2 - Adaptation Factures** :

1. **`screens/DocumentsScreen2.js`**
   - Ajouter navigation vers `EditFactureScreen` (comme pour devis)
   - Ligne ~495 : Ajouter `else if (document.type === 'facture')`

2. **`components/DocumentStatusBadge.js`**
   - Ajouter config statuts factures (`payee`, `en_retard`, `annulee`, etc.)

3. **`validation/schemas.js`**
   - Mettre à jour `factureSchema` avec nouveaux statuts (`en_retard`, `annulee`)

4. **`types/index.d.ts`**
   - Mettre à jour interface `Facture` avec nouveaux statuts

#### **ÉTAPE 4 - Organisation Documents** :

5. **`screens/ClientDetailScreen.js`**
   - Ajouter section "📄 Devis" avec `<DevisList client_id={clientId} />`
   - Ajouter section "💰 Factures" avec `<InvoicesList client_id={clientId} />`

6. **`screens/ProjectDetailScreen.js`**
   - Remplacer `<DevisFactures type="devis" />` par `<DevisList project_id={projectId} />`
   - Remplacer `<DevisFactures type="facture" />` par `<InvoicesList project_id={projectId} />`
   - (Ou garder les deux systèmes si besoin de compatibilité)

#### **ÉTAPE 5 - Conversion** :

7. **`screens/EditDevisScreen.js`**
   - Ajouter bouton "Convertir en facture" (si statut = `signe` ou `accepte`)
   - Appeler `convertDevisToFacture(devisId)`
   - Rediriger vers `EditFactureScreen`

#### **ÉTAPE 7 - Onboarding** :

8. **`screens/OnboardingScreen.js`**
   - Modifier écran 2 (ligne 28-34)
   - Changer icône : `'camera'` → `'mic'`
   - Changer titre : `'Capturez tout'` → `'Notes vocales IA'`
   - Changer description : Focus sur note vocale → devis IA

#### **Navigation** :

9. **`navigation/AppNavigator.js`**
   - Ajouter route `EditFacture` dans `ProStackNavigator` (ligne ~88)

---

## 🏗️ ARCHITECTURE DES CHANGEMENTS

### **1. Structure Base de Données**

```
factures (existe déjà)
├── id
├── numero
├── statut (brouillon, envoye, payee, en_retard, annulee) ← À mettre à jour
├── montant_ht, montant_ttc, tva_percent
└── ...

facture_lignes (NOUVEAU)
├── id
├── facture_id (FK → factures)
├── description
├── quantite, unite
├── prix_unitaire, prix_total
└── ordre
```

### **2. Structure Services**

```
services/
├── devis/
│   ├── devisService.ts (existe)
│   └── signatureService.ts (existe)
└── facture/
    ├── factureService.ts (NOUVEAU)
    └── convertService.ts (NOUVEAU)
```

### **3. Structure Composants**

```
components/
├── DevisList.js (NOUVEAU)
├── InvoicesList.js (NOUVEAU)
└── DocumentStatusBadge.js (MODIFIER)
```

### **4. Structure Écrans**

```
screens/
├── EditDevisScreen.js (existe)
├── EditFactureScreen.js (NOUVEAU - copie de EditDevisScreen)
├── ClientDetailScreen.js (MODIFIER - ajouter sections)
├── ProjectDetailScreen.js (MODIFIER - remplacer composants)
└── OnboardingScreen.js (MODIFIER - écran 2)
```

### **5. Structure Utils**

```
utils/
├── devisRules.ts (existe)
└── factureRules.ts (NOUVEAU - copie de devisRules)
```

---

## 📐 ORDRE D'EXÉCUTION

### **PHASE 1 : Base de données et services** (Fondations)

#### **1.1 Créer table facture_lignes**
- **Fichier** : `sql/create_facture_lignes_table.sql`
- **Action** : Créer table identique à `devis_lignes`
- **Dépendances** : Aucune
- **Risque** : ⚪ Très faible (création table)

#### **1.2 Créer factureRules.ts**
- **Fichier** : `utils/factureRules.ts`
- **Action** : Copier `devisRules.ts` et adapter pour factures
- **Statuts** : `brouillon`, `envoye`, `payee`, `en_retard`, `annulee`
- **Dépendances** : Aucune
- **Risque** : ⚪ Très faible (nouveau fichier)

#### **1.3 Créer factureService.ts**
- **Fichier** : `services/facture/factureService.ts`
- **Action** : Copier `devisService.ts` et adapter pour factures
- **Fonctions** : `finalizeFacture()`, `markAsPaid()`, `markAsOverdue()`, `cancelFacture()`
- **Dépendances** : `factureRules.ts`
- **Risque** : 🟡 Moyen (logique métier)

#### **1.4 Créer convertService.ts**
- **Fichier** : `services/facture/convertService.ts`
- **Action** : Fonction `convertDevisToFacture(devisId)`
- **Logique** :
  1. Charger devis + lignes
  2. Vérifier statut = `signe` ou `accepte`
  3. Créer facture avec numéro FACT-YYYY-XXXX
  4. Copier toutes les lignes dans `facture_lignes`
  5. Lier facture au devis (`devis_id`)
  6. Retourner facture créée
- **Dépendances** : `factureService.ts`
- **Risque** : 🟡 Moyen (logique métier)

---

### **PHASE 2 : Écran d'édition facture** (Core feature)

#### **2.1 Créer EditFactureScreen.js**
- **Fichier** : `screens/EditFactureScreen.js`
- **Action** : Copier `EditDevisScreen.js` et adapter
- **Modifications** :
  - Table : `factures` au lieu de `devis`
  - Lignes : `facture_lignes` au lieu de `devis_lignes`
  - Statuts : Utiliser `factureRules.ts`
  - **SUPPRIMER** : Toute la logique de signature (modales, boutons, etc.)
  - **AJOUTER** : Boutons "Marquer comme payée", "Relancer"
  - **CHANGER** : "Finaliser" → "Finaliser facture"
  - **CHANGER** : "Générer lien signature" → Supprimé
- **Dépendances** : `factureService.ts`, `factureRules.ts`
- **Risque** : 🟡 Moyen (copie + modifications)

#### **2.2 Ajouter route navigation**
- **Fichier** : `navigation/AppNavigator.js`
- **Action** : Ajouter `EditFacture` dans `ProStackNavigator`
- **Dépendances** : `EditFactureScreen.js`
- **Risque** : ⚪ Très faible

#### **2.3 Mettre à jour DocumentsScreen2**
- **Fichier** : `screens/DocumentsScreen2.js`
- **Action** : Ajouter navigation vers `EditFactureScreen` (ligne ~495)
- **Code** :
  ```javascript
  else if (document.type === 'facture') {
    navigation.navigate('EditFacture', { factureId: document.id });
  }
  ```
- **Dépendances** : `EditFactureScreen.js`, route navigation
- **Risque** : ⚪ Très faible

---

### **PHASE 3 : Composants réutilisables** (Organisation)

#### **3.1 Créer DevisList.js**
- **Fichier** : `components/DevisList.js`
- **Props** :
  ```typescript
  {
    client_id?: string;
    project_id?: string;
    limit?: number;
    onPress?: (devis) => void;
    showHeader?: boolean;
  }
  ```
- **Fonctionnalités** :
  - Requête Supabase avec filtres optionnels
  - Affichage liste avec badges statut
  - Gestion clic (navigation ou callback)
  - Design cohérent avec `DocumentsScreen2`
- **Dépendances** : Aucune
- **Risque** : ⚪ Très faible

#### **3.2 Créer InvoicesList.js**
- **Fichier** : `components/InvoicesList.js`
- **Props** : Identique à `DevisList.js`
- **Fonctionnalités** : Identique à `DevisList.js` mais pour factures
- **Dépendances** : Aucune
- **Risque** : ⚪ Très faible

---

### **PHASE 4 : Intégration dans écrans** (UI)

#### **4.1 Intégrer dans ClientDetailScreen**
- **Fichier** : `screens/ClientDetailScreen.js`
- **Action** : Ajouter 2 sections après "Chantiers"
- **Code** :
  ```javascript
  {/* Section Devis */}
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>📄 Devis</Text>
    <DevisList client_id={clientId} />
  </View>

  {/* Section Factures */}
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>💰 Factures</Text>
    <InvoicesList client_id={clientId} />
  </View>
  ```
- **Dépendances** : `DevisList.js`, `InvoicesList.js`
- **Risque** : ⚪ Très faible

#### **4.2 Intégrer dans ProjectDetailScreen**
- **Fichier** : `screens/ProjectDetailScreen.js`
- **Action** : Remplacer ou compléter `<DevisFactures />` par composants réutilisables
- **Option A** : Remplacer complètement
- **Option B** : Garder les deux (compatibilité)
- **Dépendances** : `DevisList.js`, `InvoicesList.js`
- **Risque** : ⚪ Très faible

---

### **PHASE 5 : Conversion devis → facture** (Feature)

#### **5.1 Ajouter bouton dans EditDevisScreen**
- **Fichier** : `screens/EditDevisScreen.js`
- **Action** : Ajouter bouton "Convertir en facture"
- **Conditions** :
  - Afficher uniquement si `canConvertToFacture(devis.statut)` (déjà dans `devisRules.ts`)
  - Ou si statut = `signe` ou `accepte`
- **Code** :
  ```javascript
  {canConvertToFacture(devis.statut) && (
    <TouchableOpacity
      onPress={handleConvertToFacture}
      style={styles.convertButton}
    >
      <Text>Convertir en facture</Text>
    </TouchableOpacity>
  )}
  ```
- **Dépendances** : `convertService.ts`
- **Risque** : ⚪ Très faible

#### **5.2 Implémenter handleConvertToFacture**
- **Fichier** : `screens/EditDevisScreen.js`
- **Action** : Appeler `convertDevisToFacture(devisId)` et naviguer
- **Code** :
  ```javascript
  const handleConvertToFacture = async () => {
    try {
      const facture = await convertDevisToFacture(devisId);
      showSuccess('Facture créée avec succès');
      navigation.navigate('EditFacture', { factureId: facture.id });
    } catch (error) {
      showError('Erreur lors de la conversion');
    }
  };
  ```
- **Dépendances** : `convertService.ts`, `EditFactureScreen.js`
- **Risque** : 🟡 Moyen (logique métier)

---

### **PHASE 6 : Mise à jour statuts et badges** (Polish)

#### **6.1 Mettre à jour DocumentStatusBadge**
- **Fichier** : `components/DocumentStatusBadge.js`
- **Action** : Ajouter config statuts factures
- **Statuts** : `payee`, `en_retard`, `annulee`, `partiellement_payee`
- **Dépendances** : Aucune
- **Risque** : ⚪ Très faible

#### **6.2 Mettre à jour schemas.js**
- **Fichier** : `validation/schemas.js`
- **Action** : Mettre à jour `factureSchema` avec nouveaux statuts
- **Dépendances** : Aucune
- **Risque** : ⚪ Très faible

#### **6.3 Mettre à jour types/index.d.ts**
- **Fichier** : `types/index.d.ts`
- **Action** : Mettre à jour interface `Facture` avec nouveaux statuts
- **Dépendances** : Aucune
- **Risque** : ⚪ Très faible

---

### **PHASE 7 : Amélioration onboarding** (UX)

#### **7.1 Modifier OnboardingScreen.js**
- **Fichier** : `screens/OnboardingScreen.js`
- **Action** : Modifier écran 2 (ligne 28-34)
- **Changements** :
  ```javascript
  {
    id: 2,
    icon: 'mic',  // ← 'camera' → 'mic'
    title: 'Notes vocales IA',  // ← 'Capturez tout' → 'Notes vocales IA'
    description: 'Parle, l\'IA fait le devis.\n\nNote vocale → Devis en 20 secondes\n\nL\'IA transcrit et calcule automatiquement.',  // ← Nouveau texte
    color: '#1D4ED8',
  },
  ```
- **Dépendances** : Aucune
- **Risque** : ⚪ Très faible

---

## 🔄 ORDRE D'EXÉCUTION RECOMMANDÉ

### **Séquence optimale** :

1. ✅ **PHASE 1** : Base de données et services (fondations)
   - 1.1 → 1.2 → 1.3 → 1.4

2. ✅ **PHASE 2** : Écran d'édition facture (core feature)
   - 2.1 → 2.2 → 2.3

3. ✅ **PHASE 3** : Composants réutilisables (organisation)
   - 3.1 → 3.2

4. ✅ **PHASE 4** : Intégration dans écrans (UI)
   - 4.1 → 4.2

5. ✅ **PHASE 5** : Conversion devis → facture (feature)
   - 5.1 → 5.2

6. ✅ **PHASE 6** : Mise à jour statuts et badges (polish)
   - 6.1 → 6.2 → 6.3

7. ✅ **PHASE 7** : Amélioration onboarding (UX)
   - 7.1

---

## ⚠️ POINTS D'ATTENTION

### **1. Isolation multi-tenant**
- ✅ Toutes les requêtes doivent filtrer par `user_id`
- ✅ Vérifier RLS sur `facture_lignes`

### **2. Compatibilité**
- ✅ Ne pas casser `DevisFactures.js` (garder pour compatibilité si besoin)
- ✅ Tester navigation existante

### **3. Statuts**
- ✅ Normaliser statuts factures (ajouter `en_retard`, `annulee`)
- ✅ Mettre à jour tous les endroits qui utilisent les statuts

### **4. Tests**
- ✅ Tester création facture avec lignes
- ✅ Tester conversion devis → facture
- ✅ Tester filtres par client/chantier
- ✅ Tester workflow statuts

---

## 📊 ESTIMATION

- **Fichiers à créer** : 7
- **Fichiers à modifier** : 8
- **Temps estimé** : 4-6 heures
- **Risque global** : 🟡 Moyen (logique métier factures)

---

## ✅ VALIDATION

Après chaque phase :
1. ✅ Vérifier compilation (pas d'erreurs TypeScript/ESLint)
2. ✅ Tester fonctionnalité créée
3. ✅ Vérifier isolation multi-tenant
4. ✅ Valider avec utilisateur

---

**Plan prêt pour exécution** 🚀

