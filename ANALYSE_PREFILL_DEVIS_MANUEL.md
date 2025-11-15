# 📋 ANALYSE - PRÉ-REMPLISSAGE DEVIS MANUELS

**Date** : 9 novembre 2025  
**Objectif** : Pré-remplir automatiquement les informations d'entreprise lors de la création de devis manuels

---

## 🔍 **ANALYSE DE L'EXISTANT**

### 1. **Stockage des informations d'entreprise**

**Table** : `brand_settings`

**Champs disponibles** :
- `id` (UUID)
- `user_id` (UUID) - Filtrage RLS
- `company_name` - Nom entreprise
- `company_siret` - SIRET
- `company_address` - Adresse
- `company_city` - Ville (pour météo)
- `company_phone` - Téléphone
- `company_email` - Email
- `tva_default` - TVA par défaut (%)
- `template_default` - Template PDF (minimal/classique/bandeBleue)
- `devis_prefix` - Préfixe devis (ex: DEV)
- `facture_prefix` - Préfixe facture (ex: FA)
- `primary_color` - Couleur principale
- `logo_url` - URL du logo
- `created_at` - Date création
- `updated_at` - Date mise à jour

**Écran de configuration** : `screens/SettingsScreen.js`

---

### 2. **Création de devis manuels**

**Composant** : `DevisFactures.js`

**Emplacement** : Racine du projet (ancien fichier, pas dans `/components/`)

**Fonctionnement actuel** :
- Le composant `DevisFactures` gère à la fois les devis ET les factures
- Il affiche une liste + un formulaire de création/édition
- Le formulaire est affiché quand `showForm === true`

**États du formulaire** (lignes 47-54) :
```javascript
const [numero, setNumero] = useState('');
const [montant, setMontant] = useState('');
const [tva, setTva] = useState('20'); // ⚠️ Valeur hardcodée
const [notes, setNotes] = useState('');
const [transcription, setTranscription] = useState('');
const [statut, setStatut] = useState(isDevis ? 'brouillon' : 'brouillon');
const [dateValidite, setDateValidite] = useState('');
```

**Fonction `resetForm()` (lignes 102-112)** :
```javascript
const resetForm = () => {
  setShowForm(false);
  setEditingId(null);
  setNumero('');
  setMontant('');
  setTva('20'); // ⚠️ Valeur hardcodée
  setNotes('');
  setTranscription('');
  setDateValidite('');
  setStatut(isDevis ? 'brouillon' : 'brouillon');
};
```

**Fonction `generateNumero()` (lignes 95-100)** :
```javascript
const generateNumero = () => {
  const prefix = isDevis ? 'DE' : 'FA'; // ⚠️ Préfixes hardcodés
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
};
```

---

## 🔥 **PROBLÈMES IDENTIFIÉS**

### 1. **TVA hardcodée à 20%**
- La TVA par défaut est toujours 20%
- Pas de récupération depuis `brand_settings.tva_default`

### 2. **Préfixes hardcodés**
- Préfixe devis : `DE` (au lieu de `brand_settings.devis_prefix`)
- Préfixe facture : `FA` (au lieu de `brand_settings.facture_prefix`)

### 3. **Aucune info entreprise pré-remplie**
- Le formulaire ne contient pas de champs pour les infos entreprise
- Ces infos sont uniquement utilisées lors de la génération PDF
- Mais elles ne sont pas visibles/modifiables dans le formulaire de création

---

## 💡 **SOLUTION PROPOSÉE**

### Approche

**Option A** : Charger les settings au montage du composant et utiliser les valeurs par défaut
- ✅ Simple
- ✅ Pas de refactor majeur
- ✅ Respecte l'architecture existante

**Option B** : Ajouter des champs entreprise dans le formulaire de devis
- ❌ Complexe
- ❌ Surcharge le formulaire
- ❌ Pas demandé par l'utilisateur

**👉 On choisit l'Option A**

---

## 🔧 **IMPLÉMENTATION**

### Modifications à apporter dans `DevisFactures.js`

#### 1. **Ajouter un état pour les settings**
```javascript
const [companySettings, setCompanySettings] = useState(null);
const [loadingSettings, setLoadingSettings] = useState(true);
```

#### 2. **Charger les settings au montage**
```javascript
useEffect(() => {
  loadCompanySettings();
}, []);

const loadCompanySettings = async () => {
  try {
    setLoadingSettings(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {return;}
    
    const { data, error } = await supabase
      .from('brand_settings')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Erreur chargement settings:', error);
    }
    
    if (data) {
      setCompanySettings(data);
    }
  } catch (err) {
    console.error('Exception load settings:', err);
  } finally {
    setLoadingSettings(false);
  }
};
```

#### 3. **Modifier `resetForm()` pour utiliser les settings**
```javascript
const resetForm = () => {
  setShowForm(false);
  setEditingId(null);
  setNumero('');
  setMontant('');
  // Utiliser la TVA par défaut depuis les settings
  setTva(companySettings?.tva_default?.toString() || '20');
  setNotes('');
  setTranscription('');
  setDateValidite('');
  setStatut(isDevis ? 'brouillon' : 'brouillon');
};
```

#### 4. **Modifier `generateNumero()` pour utiliser les préfixes**
```javascript
const generateNumero = () => {
  // Utiliser les préfixes depuis les settings
  const prefix = isDevis 
    ? (companySettings?.devis_prefix || 'DEV')
    : (companySettings?.facture_prefix || 'FA');
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
};
```

#### 5. **Initialiser la TVA au montage**
```javascript
// Modifier l'état initial de TVA
const [tva, setTva] = useState('20'); // Valeur par défaut temporaire

// Ajouter un useEffect pour mettre à jour la TVA quand les settings sont chargés
useEffect(() => {
  if (companySettings?.tva_default) {
    setTva(companySettings.tva_default.toString());
  }
}, [companySettings]);
```

---

## ✅ **AVANTAGES DE CETTE SOLUTION**

1. ✅ **Simple** : Pas de refactor majeur
2. ✅ **Respecte l'architecture** : Utilise les settings existants
3. ✅ **Isolation RLS** : Filtre par `user_id`
4. ✅ **Valeurs par défaut** : Fallback si settings absents
5. ✅ **Modifiable** : L'utilisateur peut changer la TVA pour un devis spécifique
6. ✅ **Pas de side-effect** : Ne modifie pas les settings globaux

---

## 🧪 **SCÉNARIO DE TEST**

### Test 1 : Settings configurés
1. Aller dans **Paramètres > Entreprise**
2. Configurer :
   - TVA par défaut : `10`
   - Préfixe devis : `DEVIS`
   - Préfixe facture : `FACT`
3. Sauvegarder
4. Aller sur un chantier
5. Cliquer sur **"Créer un devis"** (ou ouvrir le formulaire)
6. **Résultat attendu** :
   - Champ TVA pré-rempli avec `10`
   - Numéro généré avec préfixe `DEVIS-2025-XXXX`

### Test 2 : Settings absents
1. Supprimer les settings (ou utiliser un nouveau compte)
2. Aller sur un chantier
3. Cliquer sur **"Créer un devis"**
4. **Résultat attendu** :
   - Champ TVA pré-rempli avec `20` (fallback)
   - Numéro généré avec préfixe `DEV-2025-XXXX` (fallback)

### Test 3 : Modification ponctuelle
1. Créer un devis avec TVA 10% (depuis settings)
2. Modifier manuellement la TVA à `5.5%` pour CE devis
3. Sauvegarder le devis
4. Retourner dans **Paramètres > Entreprise**
5. **Résultat attendu** :
   - TVA par défaut toujours à `10%` (pas modifiée)
   - Le devis créé a bien `5.5%` (modification ponctuelle)

---

## 📁 **FICHIERS À MODIFIER**

1. `DevisFactures.js` - Composant principal (création devis/factures)

**Aucune modification de table Supabase nécessaire** ✅

---

## 🚀 **PROCHAINES ÉTAPES**

1. Implémenter les modifications dans `DevisFactures.js`
2. Tester les 3 scénarios
3. Vérifier que les PDF utilisent bien les settings (déjà fait normalement)

---

**Temps estimé** : 15-20 minutes

**Complexité** : Faible ⭐

**Impact** : Amélioration UX importante ✅

