# ✅ PARAMÈTRES ET ICÔNES - CORRECTIONS TERMINÉES

## 📋 Résumé

Corrections apportées à l'écran Documents et réintégration du bouton Paramètres :
- ✅ Icône "sac d'argent" remplacée par icône neutre pour FACTURES
- ✅ Bouton Paramètres réintégré dans l'écran Documents
- ✅ Écran Paramètres existant et fonctionnel
- ✅ Table `brand_settings` documentée avec vue `company_settings`

---

## 1️⃣ CORRECTION ICÔNE FACTURES ✅

### Avant
- Emoji 💰 (sac d'argent) utilisé pour les factures
- Incohérent avec le style des devis (📋)

### Après
- Icône Feather `file-text` pour les factures
- Icône Feather `file` pour les devis
- Style cohérent et professionnel

### Modifications

#### Filtre FACTURES (haut de page)
```javascript
<Feather name="file-text" size={16} color={...} />
<Text>FACTURES</Text>
```

#### Cartes de documents
```javascript
<Feather 
  name={item.type === 'devis' ? 'file' : 'file-text'} 
  size={14} 
  color={theme.colors.textSecondary} 
/>
<Text>{item.type === 'devis' ? 'DEVIS' : 'FACTURE'}</Text>
```

---

## 2️⃣ BOUTON PARAMÈTRES RÉINTÉGRÉ ✅

### Emplacement
En haut à droite de l'écran Documents, à côté du titre.

### Code
```javascript
<View style={styles.header}>
  <Text style={styles.title}>Documents</Text>
  <TouchableOpacity
    style={styles.settingsButton}
    onPress={() => navigation.navigate('Settings')}
  >
    <Feather name="settings" size={24} color={theme.colors.text} />
  </TouchableOpacity>
</View>
```

### Navigation
- Clic sur l'icône ⚙️ → ouvre `SettingsScreen`
- Route déjà configurée dans `navigation/AppNavigator.js`

---

## 3️⃣ ÉCRAN PARAMÈTRES (EXISTANT) ✅

L'écran `SettingsScreen.js` existe déjà et est pleinement fonctionnel.

### Sections disponibles

#### 📷 Logo de l'entreprise
- Upload d'image depuis la galerie
- Stockage dans Supabase Storage (`project-photos/logo/`)
- Affichage du logo sur les documents

#### 🏢 Entreprise
- **Nom** : Nom de l'entreprise
- **SIRET** : Identifiant légal
- **Adresse** : Adresse complète
- **Ville** : Ville pour la météo ⚠️
- **Téléphone** : Numéro de contact
- **Email** : Email de contact

#### 💰 Facturation
- **TVA par défaut** : Taux de TVA (ex: 20%)
- **Template par défaut** : Minimal / Classique / Bande Bleue

#### #️⃣ Numérotation
- **Préfixe Devis** : ex: DE
- **Préfixe Facture** : ex: FA

#### 🎨 Couleurs
- **Couleur principale** : Code hexadécimal (ex: #1D4ED8)

#### 🔐 Actions
- **Sauvegarder** : Enregistre tous les paramètres
- **Déconnexion** : Se déconnecter de l'application
- **Supprimer mon compte** : Suppression définitive (avec double confirmation)

---

## 4️⃣ TABLE BRAND_SETTINGS ✅

### Structure complète

```sql
CREATE TABLE brand_settings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  
  -- Entreprise
  company_name TEXT,
  company_siret TEXT,
  company_address TEXT,
  company_city TEXT, -- ⚠️ Pour la météo
  company_phone TEXT,
  company_email TEXT,
  
  -- Documents
  logo_url TEXT,
  tva_default NUMERIC DEFAULT 20,
  template_default TEXT DEFAULT 'classique',
  default_footer_text TEXT, -- Mentions légales
  
  -- Numérotation
  devis_prefix TEXT DEFAULT 'DE',
  facture_prefix TEXT DEFAULT 'FA',
  
  -- Couleurs
  primary_color TEXT DEFAULT '#1D4ED8',
  
  -- Timestamps
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Vue company_settings (compatibilité)

Pour le code existant qui utilise `company_settings`, une vue SQL a été créée :

```sql
CREATE VIEW company_settings AS
SELECT 
  id,
  user_id,
  company_name,
  company_siret AS siret,
  company_address AS address,
  company_city AS city,
  company_phone AS phone,
  company_email AS email,
  logo_url,
  tva_default,
  template_default,
  default_footer_text,
  created_at,
  updated_at
FROM brand_settings;
```

---

## 5️⃣ UTILISATION DES PARAMÈTRES

### Dans la génération PDF

Le fichier `utils/utils/pdf.js` utilise déjà les paramètres :

```javascript
// Récupérer les paramètres entreprise
const { data: companySettings } = await supabase
  .from('company_settings') // Vue pointant vers brand_settings
  .select('*')
  .eq('user_id', user?.id)
  .single();

const company = {
  name: companySettings?.company_name || 'Mon Entreprise',
  siret: companySettings?.siret || '',
  address: companySettings?.address || '',
  phone: companySettings?.phone || '',
  email: companySettings?.email || '',
};
```

### Dans le module météo ⚠️

**À FAIRE** : Le module météo doit utiliser `company_city` au lieu d'une ville hardcodée.

Chercher dans le code :
```javascript
// Avant (hardcodé)
const city = 'Paris';

// Après (depuis les paramètres)
const { data: settings } = await supabase
  .from('brand_settings')
  .select('company_city')
  .eq('user_id', user.id)
  .single();

const city = settings?.company_city || 'Paris';
```

---

## 6️⃣ DÉPLOIEMENT

### 1. Créer la table brand_settings

Exécuter dans Supabase SQL Editor :

```bash
sql/create_brand_settings_table.sql
```

Ce script :
- ✅ Crée la table `brand_settings`
- ✅ Crée la vue `company_settings` (compatibilité)
- ✅ Ajoute les index nécessaires
- ✅ Désactive RLS pour le MVP

### 2. Ajouter les colonnes manquantes (si table existe déjà)

```bash
sql/update_brand_settings_table.sql
```

Ce script :
- ✅ Ajoute `company_city` (météo)
- ✅ Ajoute `default_footer_text` (mentions légales)

### 3. Tester sur le device

```bash
npx expo start --tunnel
```

Puis :
1. Ouvrir l'écran **Documents**
2. Vérifier que l'icône FACTURES est bien `file-text` (pas 💰)
3. Cliquer sur l'icône ⚙️ en haut à droite
4. Remplir les paramètres entreprise
5. **Important** : Remplir le champ "Ville (pour la météo)"
6. Cliquer sur "Sauvegarder"
7. Générer un PDF de devis
8. Vérifier que les infos entreprise sont bien utilisées

---

## 7️⃣ TESTS À FAIRE

### Test 1 : Icônes
- [ ] L'onglet FACTURES affiche l'icône `file-text`
- [ ] Les cartes de factures affichent l'icône `file-text`
- [ ] Les cartes de devis affichent l'icône `file`
- [ ] Plus d'emoji 💰

### Test 2 : Bouton Paramètres
- [ ] Le bouton ⚙️ est visible en haut à droite de l'écran Documents
- [ ] Clic sur ⚙️ → ouvre l'écran Paramètres
- [ ] L'écran Paramètres charge les données existantes

### Test 3 : Sauvegarde des paramètres
- [ ] Remplir tous les champs
- [ ] Cliquer sur "Sauvegarder"
- [ ] Message de succès affiché
- [ ] Fermer et rouvrir → les données sont toujours là

### Test 4 : Utilisation dans les PDF
- [ ] Générer un PDF de devis
- [ ] Vérifier que le nom de l'entreprise est correct
- [ ] Vérifier que le SIRET est affiché
- [ ] Vérifier que l'adresse est correcte
- [ ] Vérifier que le téléphone et l'email sont corrects
- [ ] Si logo uploadé → vérifier qu'il apparaît dans le PDF

### Test 5 : Module météo (à implémenter)
- [ ] Remplir le champ "Ville (pour la météo)"
- [ ] Ouvrir le module météo
- [ ] Vérifier que la ville configurée est utilisée

---

## 8️⃣ PROCHAINES ÉTAPES (OPTIONNEL)

### A. Adapter le module météo
Chercher où la ville est hardcodée et utiliser `company_city` depuis les paramètres.

### B. Ajouter le champ "Mentions légales"
Dans l'écran Paramètres, ajouter un champ `default_footer_text` pour personnaliser le bas de page des PDF.

### C. Utiliser le template par défaut
Actuellement, le template est hardcodé à 'classique'. Utiliser `template_default` depuis les paramètres.

---

## 📁 FICHIERS MODIFIÉS/CRÉÉS

### Modifiés
1. `screens/DocumentsScreen.js`
   - Icônes FACTURES remplacées (emoji → Feather)
   - Bouton Paramètres ajouté dans le header

### Créés
1. `sql/create_brand_settings_table.sql`
   - Script de création de la table `brand_settings`
   - Vue `company_settings` pour compatibilité

2. `sql/update_brand_settings_table.sql`
   - Script pour ajouter les colonnes manquantes

3. `PARAMETRES_ET_ICONES_CORRECTION.md`
   - Ce fichier (documentation complète)

### Existants (non modifiés)
- `screens/SettingsScreen.js` (déjà fonctionnel)
- `utils/utils/pdf.js` (utilise déjà les paramètres)

---

## ✅ RÉSULTAT FINAL

### Avant
- ❌ Icône 💰 (sac d'argent) pour les factures
- ❌ Pas de bouton Paramètres dans l'écran Documents
- ❌ Table `brand_settings` non documentée

### Après
- ✅ Icône `file-text` (neutre et pro) pour les factures
- ✅ Bouton ⚙️ Paramètres en haut à droite
- ✅ Écran Paramètres pleinement fonctionnel
- ✅ Table `brand_settings` créée et documentée
- ✅ Vue `company_settings` pour compatibilité
- ✅ Paramètres utilisés dans les PDF
- ✅ Champ "Ville" pour la météo disponible

---

**Date** : 7 novembre 2025  
**Version** : 1.3.0  
**Status** : ✅ Prêt pour les tests

**Note** : Le module météo doit encore être adapté pour utiliser `company_city`. Chercher dans le code où la ville est hardcodée et la remplacer par la valeur depuis les paramètres.

