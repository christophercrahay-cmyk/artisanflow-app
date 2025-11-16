# ✅ IMPLÉMENTATION COMPLÈTE - INFOS ENTREPRISE DANS DEVIS/FACTURES

**Date** : 9 novembre 2025  
**Statut** : ✅ Terminé - **NÉCESSITE MIGRATION SQL**

---

## 🎯 **OBJECTIF ATTEINT**

Lors de la création d'un devis ou d'une facture, **TOUTES les informations entreprise** sont maintenant :
- ✅ **Pré-remplies** depuis les paramètres (`brand_settings`)
- ✅ **Modifiables** pour ce document spécifique
- ✅ **Sauvegardées** dans la base de données
- ✅ **Affichées** dans le formulaire

---

## 📁 **FICHIERS MODIFIÉS**

### 1. `DevisFactures.js` - Composant principal

**Nouveaux états ajoutés** :
```javascript
// États pour les informations entreprise
const [companyName, setCompanyName] = useState('');
const [companySiret, setCompanySiret] = useState('');
const [companyAddress, setCompanyAddress] = useState('');
const [companyPhone, setCompanyPhone] = useState('');
const [companyEmail, setCompanyEmail] = useState('');
```

**Fonctions modifiées** :
- `loadCompanySettings()` - Charge les settings
- `resetForm()` - Réinitialise avec les settings
- `saveItem()` - Sauvegarde les infos entreprise
- `editItem()` - Charge les infos du document

**UI modifiée** :
- Ajout d'une section "📋 Informations Entreprise"
- 5 nouveaux champs : Nom, SIRET, Adresse, Téléphone, Email
- Section "💰 Montants" pour séparer visuellement

---

### 2. `sql/add_company_info_to_devis_factures.sql` - Migration SQL

**⚠️ IMPORTANT : CE SCRIPT DOIT ÊTRE EXÉCUTÉ DANS SUPABASE**

**Colonnes ajoutées** :
- `company_name` (TEXT)
- `company_siret` (TEXT)
- `company_address` (TEXT)
- `company_phone` (TEXT)
- `company_email` (TEXT)

**Tables modifiées** :
- `devis`
- `factures`

---

## 🔧 **COMMENT ÇA MARCHE**

### **1. Au chargement du composant**

```javascript
useEffect(() => {
  loadItems();
  loadCompanySettings(); // Charge les settings
}, [projectId]);
```

### **2. Pré-remplissage automatique**

```javascript
useEffect(() => {
  if (companySettings && !editingId) {
    // Pré-remplir tous les champs
    setCompanyName(companySettings.company_name || '');
    setCompanySiret(companySettings.company_siret || '');
    setCompanyAddress(companySettings.company_address || '');
    setCompanyPhone(companySettings.company_phone || '');
    setCompanyEmail(companySettings.company_email || '');
  }
}, [companySettings, editingId]);
```

### **3. Sauvegarde dans la base**

```javascript
const data = {
  // ... autres champs ...
  company_name: companyName.trim() || null,
  company_siret: companySiret.trim() || null,
  company_address: companyAddress.trim() || null,
  company_phone: companyPhone.trim() || null,
  company_email: companyEmail.trim() || null,
};
```

### **4. Chargement lors de l'édition**

```javascript
const editItem = (item) => {
  // Charger les infos du document (si elles existent)
  // Sinon fallback vers les settings
  setCompanyName(item.company_name || companySettings?.company_name || '');
  setCompanySiret(item.company_siret || companySettings?.company_siret || '');
  // ... etc
};
```

---

## 🚨 **ÉTAPES OBLIGATOIRES AVANT DE TESTER**

### **Étape 1 : Exécuter la migration SQL** ⚠️

1. **Ouvrir Supabase SQL Editor**
2. **Copier/coller** le contenu de `sql/add_company_info_to_devis_factures.sql`
3. **Exécuter** le script
4. **Vérifier** que les colonnes ont été ajoutées :
   - Tu devrais voir 2 tableaux de résultats
   - Chaque tableau liste les 5 nouvelles colonnes

**Résultat attendu** :
```
table_name | column_name      | data_type
-----------+------------------+-----------
devis      | company_address  | text
devis      | company_email    | text
devis      | company_name     | text
devis      | company_phone    | text
devis      | company_siret    | text
```

### **Étape 2 : Redémarrer l'app**

```bash
# Arrêter l'app (Ctrl+C)
# Relancer
npx expo start --tunnel
```

---

## 🧪 **SCÉNARIOS DE TEST**

### **Test 1 : Création d'un devis avec settings configurés**

1. **Configurer les paramètres** :
   - Aller dans Documents → ⚙️
   - Remplir : Nom, SIRET, Adresse, Téléphone, Email
   - Sauvegarder

2. **Créer un devis** :
   - Aller sur un chantier
   - Scroller jusqu'à "📋 Devis"
   - Cliquer sur "+"

3. **Vérifier** :
   - ✅ Section "📋 Informations Entreprise" visible
   - ✅ Tous les champs pré-remplis avec les valeurs configurées
   - ✅ Champs modifiables

4. **Modifier un champ** (ex: Nom) :
   - Changer "Mon Entreprise" en "Entreprise Test"
   - Remplir le reste du formulaire
   - Cliquer sur "💾 Créer"

5. **Résultat attendu** :
   - ✅ Devis créé avec succès
   - ✅ Les infos entreprise sont sauvegardées

---

### **Test 2 : Édition d'un devis existant**

1. **Créer un devis** avec des infos entreprise
2. **Cliquer sur le devis** dans la liste
3. **Vérifier** :
   - ✅ Les infos entreprise du devis sont chargées
   - ✅ Pas les settings globaux (si différents)

4. **Modifier une info** (ex: Téléphone)
5. **Sauvegarder**
6. **Vérifier** :
   - ✅ Les infos sont mises à jour
   - ✅ Les settings globaux ne changent pas

---

### **Test 3 : Settings absents**

1. **Nouveau compte** ou supprimer les settings
2. **Créer un devis**
3. **Vérifier** :
   - ✅ Champs vides (pas de pré-remplissage)
   - ✅ Possibilité de remplir manuellement
   - ✅ Sauvegarde fonctionne

---

### **Test 4 : Factures**

1. **Créer une facture** (au lieu d'un devis)
2. **Vérifier** :
   - ✅ Même comportement que pour les devis
   - ✅ Infos entreprise pré-remplies
   - ✅ Sauvegarde fonctionne

---

## 📊 **STRUCTURE DU FORMULAIRE**

```
┌─────────────────────────────────────┐
│ Numéro: DEV-2025-XXXX              │
├─────────────────────────────────────┤
│ 📋 Informations Entreprise          │
│                                     │
│ Nom de l'entreprise *               │
│ SIRET                               │
│ Adresse                             │
│ Téléphone | Email                   │
├─────────────────────────────────────┤
│ 💰 Montants                         │
│                                     │
│ Montant HT | TVA %                  │
│ TTC: XXX.XX €                       │
├─────────────────────────────────────┤
│ Date validité                       │
│ Statut                              │
│ Notes                               │
└─────────────────────────────────────┘
```

---

## ✅ **AVANTAGES**

1. ✅ **Conformité légale** : Toutes les infos obligatoires présentes
2. ✅ **Gain de temps** : Pré-remplissage automatique
3. ✅ **Flexibilité** : Modification possible par document
4. ✅ **Historique** : Infos sauvegardées avec chaque document
5. ✅ **Indépendance** : Chaque document a ses propres infos
6. ✅ **Sécurité** : RLS respecté (filtre par `user_id`)

---

## 🔒 **SÉCURITÉ**

### **Isolation RLS** ✅

Les infos entreprise sont sauvegardées **par document** :
- Chaque devis/facture a ses propres infos
- Pas de fuite entre utilisateurs
- Respect des politiques RLS existantes

---

## 📋 **CHECKLIST FINALE**

- [ ] Migration SQL exécutée
- [ ] App redémarrée
- [ ] Settings entreprise configurés
- [ ] Devis créé avec infos pré-remplies
- [ ] Infos modifiables et sauvegardées
- [ ] Édition d'un devis charge les bonnes infos
- [ ] Factures fonctionnent pareil
- [ ] Settings globaux non modifiés par les documents

---

## 🐛 **EN CAS DE PROBLÈME**

### Problème 1 : Champs vides malgré settings configurés

**Cause** : Migration SQL pas exécutée

**Solution** :
1. Exécuter `sql/add_company_info_to_devis_factures.sql`
2. Redémarrer l'app
3. Réessayer

---

### Problème 2 : Erreur lors de la sauvegarde

**Cause** : Colonnes manquantes dans la table

**Solution** :
1. Vérifier que la migration SQL a bien été exécutée
2. Dans Supabase, aller dans Table Editor → `devis`
3. Vérifier que les colonnes `company_name`, `company_siret`, etc. existent

---

### Problème 3 : Infos pas chargées lors de l'édition

**Cause** : Documents créés avant la migration

**Solution** :
- Normal : les anciens documents n'ont pas ces infos
- Éditer le document et remplir manuellement
- Ou recréer le document

---

## 🎉 **RÉSULTAT FINAL**

**Avant** ❌ :
- Aucune info entreprise dans le formulaire
- Infos uniquement dans les PDF (depuis settings)
- Pas de personnalisation par document

**Après** ✅ :
- **Toutes les infos entreprise** dans le formulaire
- **Pré-remplissage** depuis les settings
- **Modification** possible par document
- **Sauvegarde** dans la base de données
- **Historique** complet par document

---

**La fonctionnalité est prête !** 🚀

**⚠️ N'OUBLIE PAS D'EXÉCUTER LE SCRIPT SQL AVANT DE TESTER !**

