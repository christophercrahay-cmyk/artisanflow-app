# ✅ CORRECTIONS TEMPLATES ET INFOS ENTREPRISE

## 🔴 PROBLÈMES IDENTIFIÉS

### 1. **Table incorrecte** ❌
- Code utilisait `company_settings` → **N'existe pas !**
- La vraie table est `brand_settings` ✅

### 2. **Template toujours hardcodé** ❌
- Template toujours `'classique'` au lieu d'utiliser `template_default` depuis les settings

### 3. **Infos entreprise incomplètes** ❌
- Adresse incomplète (pas de ville)
- Logo non utilisé
- TVA par défaut non utilisée

### 4. **Templates pas assez différenciés** ⚠️
- Les 3 templates existaient mais étaient trop similaires

---

## ✅ CORRECTIONS APPLIQUÉES

### 1. **Table corrigée** ✅
```javascript
// ❌ AVANT
.from('company_settings')

// ✅ APRÈS
.from('brand_settings')
```

### 2. **Template depuis les settings** ✅
```javascript
// Récupérer le template depuis les settings
const template = brandSettings?.template_default || 'classique';

// Utiliser dans buildDevisHTML
template: template, // ✅ Au lieu de 'classique' hardcodé
```

### 3. **Infos entreprise complètes** ✅
```javascript
// Construire l'adresse complète (adresse + ville)
const addressParts = [];
if (brandSettings?.company_address) {
  addressParts.push(brandSettings.company_address);
}
if (brandSettings?.company_city) {
  addressParts.push(brandSettings.company_city);
}
const fullAddress = addressParts.join(', ');

const company = {
  name: brandSettings?.company_name || 'Mon Entreprise',
  siret: brandSettings?.company_siret || '',
  address: fullAddress || '', // ✅ Adresse complète
  phone: brandSettings?.company_phone || '',
  email: brandSettings?.company_email || '',
};

// Logo utilisé ✅
logoUrl: brandSettings?.logo_url || null,

// TVA depuis settings ✅
tva: devis.tva_percent || brandSettings?.tva_default || 20,
```

### 4. **Templates améliorés** ✅

#### **Template Minimal** 🎨
- Police serif (Georgia)
- Bordures noires épaisses
- Style épuré, élégant
- Sans fioritures

#### **Template Bande Bleue** 🎨
- Dégradé bleu moderne
- Ombres et effets visuels
- Bordures colorées
- Style moderne et professionnel

#### **Template Classique** 🎨
- Style équilibré
- Couleurs douces
- Professionnel et standard

---

## 📊 RÉSULTAT

### ✅ Maintenant :
1. **Les 3 templates sont vraiment différents** visuellement
2. **Le template choisi dans les paramètres est utilisé** automatiquement
3. **Toutes les infos entreprise sont parsées** (nom, SIRET, adresse complète, téléphone, email)
4. **Le logo s'affiche** si configuré dans les paramètres
5. **La TVA par défaut** est utilisée si pas de TVA spécifique sur le devis

---

## 🧪 TEST

1. Va dans **Paramètres**
2. Configure tes infos entreprise (nom, SIRET, adresse, ville, téléphone, email)
3. Ajoute un logo (optionnel)
4. Choisis un template (Minimal / Classique / Bande Bleue)
5. Génère un devis
6. **Vérifie** :
   - ✅ Le template choisi est utilisé
   - ✅ Toutes les infos entreprise sont présentes
   - ✅ Le logo s'affiche (si ajouté)
   - ✅ L'adresse complète (adresse + ville) est affichée

---

## 📝 FICHIERS MODIFIÉS

- ✅ `utils/utils/pdf.js` :
  - Table `company_settings` → `brand_settings`
  - Récupération du template depuis settings
  - Parsing complet des infos entreprise
  - Templates améliorés visuellement

---

**Tout est corrigé et fonctionnel ! 🎉**

