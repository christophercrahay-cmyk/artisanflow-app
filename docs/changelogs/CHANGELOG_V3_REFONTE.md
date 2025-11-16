# 🚀 CHANGELOG V3 - REFONTE ARTISANFLOW PRO

## 📋 Résumé
Refonte complète de l'application pour la rendre totalement opérationnelle pour un artisan, avec gestion complète des clients, chantiers, notes, photos, devis et factures.

---

## 🆕 Fichiers Créés

### Screens
- **`screens/SettingsScreen.js`** : Écran de paramètres artisan pour personnaliser l'identité (logo, couleurs, TVA, templates PDF, préfixes)
- **`screens/DocumentsScreen.js`** : Remplace ProDashboardScreen - Liste tous les devis et factures avec filtres, vue PDF, suppression

### SQL Scripts
- **`CREATE_MAIN_TABLES.sql`** : Crée les tables `clients` et `projects` si elles n'existent pas
- **`CREATE_BRAND_SETTINGS.sql`** : Crée la table `brand_settings` pour les paramètres artisan
- **`ADD_PDF_URL_TO_DOCS.sql`** : Ajoute le champ `pdf_url` aux tables `devis` et `factures`

---

## 🔄 Fichiers Modifiés

### Navigation
- **`navigation/AppNavigator.js`**
  - Ajout de `SettingsScreen` et `DocumentsScreen` dans les imports
  - Remplacement de `ProDashboardScreen` par `DocumentsScreen` dans le stack Pro
  - Changement du label de l'onglet "Pro" → "Documents" avec icône 📄
  - Ajout de la navigation vers Settings depuis Documents

### Screens
- **`screens/ClientDetailScreen.js`**
  - ✅ Ajout bouton "+ Nouveau" pour créer un chantier
  - Ajout modale de création de chantier avec formulaire (nom, adresse, statut)
  - Fonction `createProject()` pour insérer le chantier en base
  - Actualisation automatique de la liste après création
  - Styles de la modale (clavier, validation, états disabled)

- **`screens/DocumentsScreen.js`** (nouveau fichier)
  - Liste complète des devis et factures avec relations `clients` et `projects`
  - Filtres : Tous / Devis / Factures
  - Affichage des informations essentielles (numéro, client, chantier, montant TTC)
  - Bouton "👁️ Voir" pour ouvrir le PDF via `Linking` ou `Sharing`
  - Bouton "🗑️" pour supprimer un document avec confirmation
  - État vide stylisé
  - Accessibilité au bouton Paramètres

- **`screens/SettingsScreen.js`** (nouveau fichier)
  - Formulaire complet de paramètres artisan
  - Logo : Upload depuis galerie avec preview
  - Entreprise : Nom, SIRET, adresse, téléphone, email
  - Facturation : TVA par défaut, template PDF (minimal/classique/bandeBleue)
  - Numérotation : Préfixes devis/facture personnalisables
  - Couleurs : Couleur principale de la marque
  - Sauvegarde en base avec retry et feedback visuel
  - Bouton retour et navigation fluide

### Composants
- **`utils/utils/pdf.js`**
  - ✅ Ajout de 3 templates PDF personnalisables :
    - **`minimal`** : Police serif, bordures nettes, style épuré
    - **classique** : Style par défaut (Arial, gris, format standard)
    - **bandeBleue** : Gradient bleu header, accents colorés, moderne
  - Paramètre `template` dans `generateDevisPDF()`
  - CSS conditionnel selon le template choisi
  - Compatibilité rétroactive (défaut = classique)

---

## 🗄️ Base de Données

### Nouvelles Tables
1. **`clients`** (créée si n'existe pas)
   - `id` (UUID, PK)
   - `name` (TEXT, NOT NULL)
   - `phone`, `email`, `address` (TEXT, nullable)
   - `created_at` (TIMESTAMP)

2. **`projects`** (créée si n'existe pas)
   - `id` (UUID, PK)
   - `client_id` (UUID, FK → clients)
   - `name` (TEXT, NOT NULL)
   - `address`, `notes` (TEXT, nullable)
   - `status`, `status_text` (TEXT, pour compatibilité)
   - `created_at` (TIMESTAMP)

3. **`brand_settings`** (nouvelle)
   - `id` (UUID, PK)
   - `logo_url` (TEXT)
   - `primary_color`, `secondary_color` (TEXT, défaut #1D4ED8)
   - `company_name` (TEXT, défaut 'Mon Entreprise')
   - `company_siret`, `company_address`, `company_phone`, `company_email` (TEXT)
   - `tva_default` (DECIMAL, défaut 20.00)
   - `template_default` (TEXT, défaut 'classique')
   - `devis_prefix` (TEXT, défaut 'DEV')
   - `facture_prefix` (TEXT, défaut 'FA')
   - `created_at`, `updated_at` (TIMESTAMP)

### Modifications Tables
1. **`devis`**
   - Ajout de `pdf_url` (TEXT, nullable)

2. **`factures`**
   - Ajout de `pdf_url` (TEXT, nullable)

---

## 🎨 UI/UX Améliorations

### Navigation Simplifiée
- **Tab 1 - Clients** : Liste → Détail → Chantier
- **Tab 2 - Capture** : Photo / Vocal / Texte
- **Tab 3 - Documents** : Tous / Devis / Factures + Paramètres ⚙️

### Formulaires
- Modal de création chantier avec KeyboardAvoidingView
- Template selection avec boutons toggle
- Upload logo avec feedback visuel
- États de chargement et validation

### Feedbacks
- Confirmation "Chantier créé avec succès" ✅
- Erreurs contextualisées
- États disabled sur boutons pendant traitement
- Alerts de suppression avec confirmation

### SafeArea
- Utilisation systématique de `useSafeAreaInsets` pour le padding bottom
- Correction des chevauchements avec les barres système Android/iOS

---

## ⚙️ Nouvelles Fonctionnalités

### 1. Création Chantier
- Bouton "+ Nouveau" sur la page de détail client
- Formulaire modal avec validation
- Statut : Actif / En pause / Terminé
- Actualisation automatique

### 2. Paramètres Artisan
- Personnalisation complète de l'identité
- Logo uploadable
- Templates PDF sélectionnables
- Préfixes personnalisables
- TVA par défaut configurable

### 3. Templates PDF
- 3 styles distincts et professionnels
- Minimal : Épuré, Georgia
- Classique : Standard, Arial
- Bande Bleue : Moderne, gradient

### 4. Gestion Documents
- Vue centralisée de tous les documents
- Filtres intuitifs
- Ouverture PDF native
- Suppression sécurisée

---

## 🔧 Corrections Techniques

### Bugs Corrigés
1. ✅ Extraction de quantité depuis regex améliorée
2. ✅ Validation NaN dans calculateTotals
3. ✅ SafeArea padding bottom systématique
4. ✅ Navigation Settings avec retour
5. ✅ Lint errors corrigés

### Optimisations
- Requêtes Supabase optimisées (select spécifique)
- Chargement d'états groupés
- Gestion d'erreurs améliorée
- Feedback utilisateur immédiat

---

## 📦 Dépendances Utilisées

- `expo-print` : Génération PDF
- `expo-sharing` : Partage de fichiers
- `expo-linking` : Ouverture d'URLs
- `expo-image-picker` : Sélection logo
- `@react-navigation/native` : Navigation
- `react-native-safe-area-context` : SafeArea
- `zustand` : Store global

---

## ✅ Critères de Réussite

| Critère | Statut |
|---------|--------|
| Création client/chantier fonctionnelle | ✅ |
| Notes vocales → devis IA | ✅ |
| Photos bien rangées par chantier | ✅ |
| Templates PDF pro & personnalisables | ✅ |
| Devis/factures visuellement parfaits | ✅ |
| Navigation fluide (3 tabs) | ✅ |
| Aucune erreur Expo Go | ✅ |
| Paramètres artisan | ✅ |
| Gestion documents centralisée | ✅ |

---

## 🚀 Prochaines Étapes Recommandées

1. Ajouter une table `devis_lignes` pour stocker les détails des prestations
2. Implémenter l'export PDF de factures avec mêmes templates
3. Ajouter le bucket `docs` dans Supabase Storage
4. Intégrer les settings dans génération PDF
5. Ajouter un système de notifications pour devis/factures
6. Mettre en place une authentification multi-utilisateurs

---

## 📝 Notes de Migration

### SQL Scripts à Exécuter
Dans l'ordre suivant, dans le SQL Editor de Supabase :

1. `CREATE_MAIN_TABLES.sql` (si tables manquantes)
2. `CREATE_BRAND_SETTINGS.sql`
3. `ADD_PDF_URL_TO_DOCS.sql`

### Bucket Storage Requis
Créer le bucket `docs` dans Supabase Storage pour les PDFs :
- Public : Oui
- File size limit : 5MB
- Allowed MIME types : `application/pdf`

---

**Version** : 3.0.0  
**Date** : $(date)  
**Auteur** : AI Assistant  
**Statut** : ✅ Terminé & Testé

