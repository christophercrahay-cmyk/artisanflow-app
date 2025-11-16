# 🎨 AUDIT COMPLET UI/DESIGN - ARTISANFLOW

**Analyse exhaustive pour refonte graphique "ArtisanFlow 2.0"**

**Date** : 9 novembre 2025  
**Version actuelle** : 1.3.0  
**Objectif** : Fournir toutes les ressources pour une refonte premium (style 2026)

---

## 📁 **PARTIE 1 : FICHIERS IMPLIQUÉS**

### **ÉCRANS PRINCIPAUX (4)**

| Fichier | Chemin | Rôle | Lignes |
|---------|--------|------|--------|
| `DashboardScreen.js` | `screens/` | Écran d'accueil avec stats, chantiers récents, photos | 641 |
| `CaptureHubScreen.js` | `screens/` | Écran de capture (photo/vocal/note) avec sélection chantier | 1105 |
| `ClientsListScreen.js` | `screens/` | Gestion clients (liste + formulaire création) | 486 |
| `DocumentsScreen.js` | `screens/` | Liste devis/factures avec filtres et actions | 604 |

---

### **ÉCRANS SECONDAIRES (11)**

| Fichier | Chemin | Rôle |
|---------|--------|------|
| `AuthScreen.js` | `screens/` | Connexion/inscription |
| `OnboardingScreen.js` | `screens/` | Onboarding initial |
| `ProjectDetailScreen.js` | `screens/` | Détail d'un chantier (notes, photos, devis IA) |
| `ProjectsListScreen.js` | `screens/` | Liste de tous les chantiers |
| `ProjectCreateScreen.tsx` | `screens/` | Création d'un nouveau chantier |
| `ClientDetailScreen.js` | `screens/` | Détail d'un client (chantiers associés) |
| `SettingsScreen.js` | `screens/` | Paramètres entreprise (logo, SIRET, TVA) |
| `PhotoGalleryScreen.js` | `screens/` | Galerie photos plein écran |
| `ProDashboardScreen.js` | `screens/` | Dashboard pro (KPIs, CA) |
| `DebugLogsScreen.js` | `screens/` | Logs de debug (dev only) |
| `QATestRunnerScreen.js` | `screens/` | Tests automatisés (dev only) |

---

### **COMPOSANTS PARTAGÉS (25)**

| Fichier | Chemin | Rôle | Utilisé dans |
|---------|--------|------|--------------|
| **BOUTONS** | | | |
| `PrimaryButton.js` | `components/` | Bouton principal (bleu) | Tous les écrans |
| `SecondaryButton.js` | `components/` | Bouton secondaire (outline) | Formulaires |
| **CARTES** | | | |
| `Card.js` | `components/` | Carte réutilisable | Tous les écrans |
| `EmptyState.js` | `components/` | État vide (picto + texte + bouton) | Dashboard, Clients, Documents |
| **HEADERS** | | | |
| `HomeHeader.tsx` | `components/` | Header premium (heure, date, météo) | Dashboard |
| **SÉLECTEURS** | | | |
| `ActiveProjectSelector.js` | `components/` | Sélecteur chantier actif | Capture |
| `ClientProjectSelector.js` | `components/` | Sélecteur client → chantier (2 étapes) | Capture |
| `CaptureLinkingSheet.tsx` | `components/` | Bottom sheet association capture | Capture |
| `ProjectPickerSheet.tsx` | `components/` | Bottom sheet sélection projet | Capture |
| **IA** | | | |
| `DevisAIGenerator.js` | `components/` | Générateur devis IA (modal + questions) | ProjectDetail |
| `VoiceRecorderSimple.js` | `components/` | Enregistreur vocal simple | DevisAIGenerator |
| **FEEDBACK** | | | |
| `Toast.js` | `components/` | Notifications toast (succès/erreur) | Tous les écrans |
| `LoadingScreen.js` | `components/` | Écran de chargement | App.js |
| `SplashScreen.js` | `components/` | Splash screen animé | App.js |
| `ErrorBoundary.js` | `components/` | Gestion erreurs React | App.js |
| **INDICATEURS** | | | |
| `NetworkStatusBar.js` | `components/` | Barre statut réseau | App.js |
| `OfflineIndicator.js` | `components/` | Indicateur hors-ligne | App.js |
| `WeatherBadge.js` | `components/` | Badge météo | HomeHeader |
| **SKELETONS** | | | |
| `SkeletonCard.js` | `components/skeletons/` | Skeleton de carte | Chargement listes |
| `SkeletonList.js` | `components/skeletons/` | Skeleton de liste | Chargement listes |
| **AUTRES** | | | |
| `Tag.js` | `components/` | Tag/chip réutilisable | Divers |
| `RefreshableList.js` | `components/` | Liste avec pull-to-refresh | Listes |
| `RefreshableScrollView.js` | `components/` | ScrollView avec pull-to-refresh | Écrans |

---

### **THÈME & STYLES (3)**

| Fichier | Chemin | Rôle |
|---------|--------|------|
| `Theme.js` | `theme/` | **Thème global** (couleurs, spacing, typography, shadows) |
| `useSafeTheme.js` | `theme/` | Hook pour accéder au thème |
| `ScreenWrapper.js` | `theme/` | Wrapper d'écran avec SafeAreaView |

---

### **NAVIGATION (1)**

| Fichier | Chemin | Rôle |
|---------|--------|------|
| `AppNavigator.js` | `navigation/` | Navigation principale (Bottom Tab + Stacks) |

---

### **ASSETS (2)**

| Fichier | Chemin | Rôle |
|---------|--------|------|
| `icon.png` | `assets/` | Icône de l'app (1024x1024) |
| `splash-icon.png` | `assets/` | Logo splash screen |

---

## 🧩 **PARTIE 2 : COMPOSANTS UI DÉTAILLÉS**

### **COMPOSANTS DE BASE**

#### **1. PrimaryButton** (`components/PrimaryButton.js`)

**Type** : Bouton principal  
**Utilisé dans** : Tous les écrans (actions principales)

**Props** :
- `title` (string) - Texte du bouton
- `onPress` (function) - Callback au clic
- `disabled` (boolean) - Désactivé ou non
- `loading` (boolean) - Affiche un loader
- `style` (object) - Style personnalisé
- `textStyle` (object) - Style texte personnalisé

**Styles** :
```javascript
{
  backgroundColor: theme.colors.accent, // #1D4ED8 (bleu)
  paddingVertical: 16,
  paddingHorizontal: 24,
  borderRadius: 12,
  minHeight: 56,
  fontSize: 16,
  fontWeight: '700',
  color: '#F9FAFB', // Blanc
}
```

---

#### **2. Card** (`components/Card.js`)

**Type** : Carte réutilisable  
**Utilisé dans** : Dashboard, Clients, Documents

**Props** :
- `children` (ReactNode) - Contenu de la carte
- `style` (object) - Style personnalisé
- `onPress` (function) - Rend la carte cliquable

**Styles** :
```javascript
{
  backgroundColor: theme.colors.surface, // #1A1D22
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: theme.colors.border, // #2A2E35
}
```

---

#### **3. EmptyState** (`components/EmptyState.js`)

**Type** : État vide (aucun élément)  
**Utilisé dans** : Dashboard, Clients, Documents

**Props** :
- `icon` (string) - Nom de l'icône Feather
- `title` (string) - Titre principal
- `subtitle` (string) - Sous-titre
- `buttonText` (string) - Texte du bouton (optionnel)
- `onButtonPress` (function) - Callback bouton
- `iconSize` (number) - Taille de l'icône (défaut: 56)

**Styles** :
```javascript
{
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surfaceElevated, // #252A32
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  button: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
}
```

---

#### **4. HomeHeader** (`components/HomeHeader.tsx`)

**Type** : Header premium avec horloge  
**Utilisé dans** : Dashboard

**Contenu** :
- Salutation ("Bonjour", "Bon après-midi", "Bonsoir")
- Horloge numérique (HH:mm:ss) avec animation pulse
- Date longue (ex: "Samedi 9 novembre 2025")
- Badge météo (température + ville)

**Styles** :
```javascript
{
  greeting: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  timeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3B82F6', // Bleu dynamique selon l'heure
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  dateText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
}
```

**Animations** :
- Fade-in du bloc timer (400ms)
- Pulse continue de l'icône horloge (2s loop)

---

#### **5. WeatherBadge** (`components/WeatherBadge.js`)

**Type** : Badge météo  
**Utilisé dans** : HomeHeader

**Contenu** :
- Icône météo (Feather)
- Température (°C)
- Ville (optionnel)

**Styles** :
```javascript
{
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tempText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
}
```

---

#### **6. ActiveProjectSelector** (`components/ActiveProjectSelector.js`)

**Type** : Sélecteur de chantier actif  
**Utilisé dans** : Capture

**Contenu** :
- Barre cliquable affichant le chantier sélectionné
- Modal de sélection avec recherche
- Liste des chantiers avec emoji statut (🟢 actif, 🟠 planifié, ⚪ terminé)
- Badge "Dernier" pour le dernier chantier utilisé (⭐)

**Styles** :
```javascript
{
  selector: {
    backgroundColor: theme.colors.surfaceElevated, // #252A32
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  selectorValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  projectItem: {
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
}
```

---

#### **7. Toast** (`components/Toast.js`)

**Type** : Notifications toast  
**Utilisé dans** : Tous les écrans

**Fonctions** :
- `showSuccess(message)` - Toast vert avec ✅
- `showError(message)` - Toast rouge avec ❌
- `showInfo(message)` - Toast bleu avec ℹ️
- `showWarning(message)` - Toast orange avec ⚠️

**Implémentation** :
- Android : `ToastAndroid` natif
- iOS : `Alert` (à remplacer par `react-native-toast-message`)

---

### **COMPOSANTS COMPLEXES**

#### **8. DevisAIGenerator** (`components/DevisAIGenerator.js`)

**Type** : Modal de génération devis IA  
**Utilisé dans** : ProjectDetail

**Contenu** :
- Bouton "Générer devis IA" (violet)
- Modal plein écran avec :
  - Badge statut (vert "Devis prêt" / orange "Questions en attente")
  - Titre + description du devis
  - Liste des lignes (avec **colorisation des prix**)
  - Totaux HT/TVA/TTC
  - Questions de clarification (si nécessaires)
  - Mode texte/vocal pour les réponses
  - Bouton "Créer le devis (brouillon)"

**Styles clés** :
```javascript
{
  generateButton: {
    backgroundColor: '#7C3AED', // Violet (différent du bleu principal)
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
  },
  statusBadge: {
    backgroundColor: '#F59E0B', // Orange (questions)
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  statusBadgeReady: {
    backgroundColor: '#10B981', // Vert (prêt)
  },
  ligneRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  ligneDetails: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  // ✨ Prix unitaires colorisés selon profil IA
  // Vert (#16A34A) : cohérent (±10%)
  // Orange (#F59E0B) : limite (±20%)
  // Rouge (#DC2626) : trop cher (+20%)
  // Bleu (#2563EB) : trop bas (-20%)
}
```

---

### **COMPOSANTS DE NAVIGATION**

#### **9. AppNavigator** (`navigation/AppNavigator.js`)

**Type** : Navigation principale  
**Structure** :

```
Bottom Tab Navigator (3 onglets)
├─ HomeTab (Dashboard)
│  └─ DashboardScreen
│
├─ ClientsTab (Stack)
│  ├─ ClientsListScreen
│  ├─ ClientDetailScreen
│  ├─ ProjectDetailScreen
│  └─ ProjectCreateScreen
│
├─ CaptureTab (Stack)
│  ├─ CaptureHubScreen
│  └─ ProjectCreateScreen
│
└─ ProTab (Stack)
   ├─ DocumentsScreen
   ├─ SettingsScreen
   ├─ QATestRunner (dev only)
   └─ DebugLogs (dev only)
```

**Tab Bar** :
- Icônes : `home`, `users`, `camera`, `briefcase`
- Taille icônes : 24px
- Stroke width : 2.5 (Feather)
- Animation : Scale 1.15 sur tab active

**Styles** :
```javascript
{
  tabBarStyle: {
    backgroundColor: theme.colors.surface, // #1A1D22
    borderTopColor: theme.colors.border, // #2A2E35
    borderTopWidth: 1,
    height: 60 + insets.bottom,
    paddingBottom: 10 + insets.bottom,
    paddingTop: 10,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabBarActiveTintColor: theme.colors.accent, // #1D4ED8
  tabBarInactiveTintColor: theme.colors.textSecondary, // #D1D5DB
}
```

---

## 🎨 **PARTIE 3 : PALETTE DE COULEURS**

### **SYSTÈME DE COULEURS**

**Fichier** : `theme/Theme.js`

---

### **FONDS**

| Nom | Valeur | Usage |
|-----|--------|-------|
| `background` | `#0F1115` | Fond principal de l'app (très sombre) |
| `surface` | `#1A1D22` | Cartes, modals, tab bar |
| `surfaceElevated` | `#252A32` | Inputs, éléments surélevés |

---

### **TEXTES**

| Nom | Valeur | Usage |
|-----|--------|-------|
| `text` | `#F9FAFB` | Texte principal (blanc cassé, meilleur contraste) |
| `textSecondary` | `#D1D5DB` | Texte secondaire (gris clair) |
| `textMuted` | `#9CA3AF` | Texte désactivé (gris moyen) |

---

### **ACCENTS (BLEU PRINCIPAL)**

| Nom | Valeur | Usage |
|-----|--------|-------|
| `accent` | `#1D4ED8` | **Couleur principale** (boutons, icônes actives, liens) |
| `accentLight` | `#60A5FA` | Hover, états actifs |
| `accentDark` | `#1E3A8A` | Boutons pressés |
| `accentHover` | `#2563EB` | Hover (desktop) |

---

### **ÉTATS SÉMANTIQUES**

| Nom | Valeur | Usage |
|-----|--------|-------|
| `success` | `#10B981` | Succès, validation, badge "Devis prêt" |
| `successLight` | `#34D399` | Hover succès |
| `error` | `#EF4444` | Erreurs, suppression |
| `warning` | `#F59E0B` | Avertissements, badge "Questions en attente" |
| `info` | `#3B82F6` | Informations, icône horloge |

---

### **BORDURES**

| Nom | Valeur | Usage |
|-----|--------|-------|
| `border` | `#2A2E35` | Bordures principales (cartes, inputs) |
| `borderLight` | `#1E2126` | Bordures légères |

---

### **OVERLAY**

| Nom | Valeur | Usage |
|-----|--------|-------|
| `overlay` | `rgba(0, 0, 0, 0.75)` | Fond des modals (opaque) |

---

### **PALETTE GRIS (COMPLÈTE)**

| Nom | Valeur | Usage |
|-----|--------|-------|
| `gray50` | `#F9FAFB` | - |
| `gray100` | `#F3F4F6` | - |
| `gray200` | `#E5E7EB` | - |
| `gray300` | `#D1D5DB` | Texte secondaire |
| `gray400` | `#9CA3AF` | Texte muted |
| `gray500` | `#6B7280` | - |
| `gray600` | `#4B5563` | Boutons désactivés |
| `gray700` | `#374151` | - |
| `gray800` | `#1F2937` | - |
| `gray900` | `#111827` | Fond éléments de liste |

---

### **COULEURS SPÉCIALES (HORS THÈME)**

| Valeur | Usage | Fichier |
|--------|-------|---------|
| `#1E293B` | Cartes premium (Dashboard, Clients) | `DashboardScreen.js`, `ClientsListScreen.js` |
| `#334155` | Bordures premium | `DashboardScreen.js`, `ClientsListScreen.js` |
| `#7C3AED` | Bouton "Générer devis IA" (violet) | `DevisAIGenerator.js` |
| `#16A34A` | Prix cohérent (vert) | `DevisAIGenerator.js` |
| `#DC2626` | Prix trop cher (rouge) | `DevisAIGenerator.js` |
| `#2563EB` | Prix trop bas (bleu) | `DevisAIGenerator.js` |

---

## 📐 **PARTIE 4 : TYPOGRAPHIE**

### **SYSTÈME TYPOGRAPHIQUE**

**Fichier** : `theme/Theme.js` → `typography`

**Police** : `System` (par défaut) ou `Poppins/Inter` (si chargée via expo-font)

---

### **HIÉRARCHIE DE TITRES**

| Niveau | fontSize | fontWeight | color | Usage |
|--------|----------|------------|-------|-------|
| **h1** | 32px | 800 (Extra Bold) | #F9FAFB | Titres principaux (rares) |
| **h2** | 28px | 700 (Bold) | #F9FAFB | Titres d'écran |
| **h3** | 24px | 700 (Bold) | #F9FAFB | Sous-titres |
| **h4** | 20px | 600 (Semi-Bold) | #F9FAFB | Titres de section |

---

### **CORPS DE TEXTE**

| Niveau | fontSize | fontWeight | color | Usage |
|--------|----------|------------|-------|-------|
| **body** | 16px | 400 (Regular) | #F9FAFB | Texte principal |
| **bodySmall** | 14px | 400 (Regular) | #D1D5DB | Texte secondaire |
| **caption** | 12px | 500 (Medium) | #D1D5DB | Labels, petits textes |

---

### **PARTICULARITÉS**

- **letterSpacing** : -0.5 (h1), -0.3 (h2), -0.2 (h3), 0.5 (caption)
- **lineHeight** : 40 (h1), 36 (h2), 32 (h3), 28 (h4), 24 (body), 20 (bodySmall), 16 (caption)
- **textTransform** : uppercase (caption uniquement)

---

### **TAILLES UTILISÉES DANS L'APP**

| fontSize | Usage | Fichiers |
|----------|-------|----------|
| **32px** | Titres principaux, valeurs stats | `DashboardScreen.js` |
| **30px** | Salutation HomeHeader | `HomeHeader.tsx` |
| **28px** | Titres d'écran | `DocumentsScreen.js` |
| **24px** | Sous-titres | `EmptyState.js` |
| **22px** | Horloge numérique | `HomeHeader.tsx` |
| **20px** | Titres de section | `DashboardScreen.js` |
| **18px** | Numéros de devis | `DocumentsScreen.js` |
| **16px** | Texte principal, inputs, boutons | Tous |
| **15px** | Texte météo, labels | `WeatherBadge.js`, `ActiveProjectSelector.js` |
| **14px** | Texte secondaire, filtres | `DocumentsScreen.js` |
| **12px** | Captions, petits textes | `DashboardScreen.js` |
| **11px** | Très petits labels | `ActiveProjectSelector.js` |
| **10px** | Status badges | `DashboardScreen.js` |

---

## 📏 **PARTIE 5 : SPACING / RADIUS / SHADOWS**

### **SPACING (SYSTÈME)**

**Fichier** : `theme/Theme.js` → `spacing`

| Nom | Valeur | Usage |
|-----|--------|-------|
| `xs` | 4px | Très petit espacement (gap entre icône et texte) |
| `sm` | 8px | Petit espacement (marges internes) |
| `md` | 12px | Espacement moyen (padding cartes) |
| `lg` | 16px | Espacement large (padding écrans) |
| `xl` | 24px | Espacement très large (sections) |
| `xxl` | 32px | Espacement extra large (séparations importantes) |
| `xxxl` | 48px | Espacement maximum (EmptyState) |

---

### **BORDER RADIUS (SYSTÈME)**

**Fichier** : `theme/Theme.js` → `borderRadius`

| Nom | Valeur | Usage |
|-----|--------|-------|
| `sm` | 4px | Petits badges |
| `md` | 8px | Inputs, badges météo |
| `lg` | 12px | **Cartes, boutons** (le plus utilisé) |
| `xl` | 16px | Cartes premium (Dashboard, Clients) |
| `round` | 999px | Éléments circulaires |

**Valeurs réelles utilisées** :
- **12px** : Cartes standard, boutons, inputs (80% des cas)
- **16px** : Cartes premium (Dashboard, Clients)
- **20px** : Boutons d'action Capture, modals
- **50px** : Icônes circulaires (EmptyState)
- **60px** : Boutons circulaires (enregistrement vocal)

---

### **SHADOWS (SYSTÈME)**

**Fichier** : `theme/Theme.js` → `shadows`

#### **Small (sm)**
```javascript
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2, // Android
}
```
**Usage** : Petits éléments (badges, tags)

---

#### **Medium (md)**
```javascript
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 4,
}
```
**Usage** : Cartes standard, boutons

---

#### **Large (lg)**
```javascript
{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 8,
}
```
**Usage** : Cartes premium, modals, éléments flottants

---

### **OMBRES SPÉCIALES**

**Boutons primaires** (avec couleur d'accent) :
```javascript
{
  shadowColor: '#1D4ED8', // Bleu principal
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 4,
}
```

---

## 🖼️ **PARTIE 6 : ICÔNES & ASSETS**

### **LIBRAIRIE D'ICÔNES**

**Librairie utilisée** : `@expo/vector-icons` → **Feather**

**Pourquoi Feather** :
- Style minimaliste et professionnel
- Stroke width personnalisable (2.5 par défaut)
- Cohérence visuelle parfaite

---

### **ICÔNES UTILISÉES PAR ÉCRAN**

#### **Dashboard (Accueil)**

| Icône | Usage | Couleur |
|-------|-------|---------|
| `clock` | Horloge (HomeHeader) | Bleu dynamique (#3B82F6 jour / #2563EB nuit) |
| `folder` | Chantiers actifs (stat + liste) | Accent (#1D4ED8) |
| `check-circle` | Chantiers terminés (stat) | Succès (#10B981) |
| `camera` | Photos (stat) | Info (#3B82F6) |
| `file-text` | Documents (stat) | Warning (#F59E0B) |
| `play-circle` | Statut "En cours" | Accent |
| `image` | Section photos récentes | Accent |
| `chevron-right` | Boutons "Voir tout" | Accent |

---

#### **Capture**

| Icône | Usage | Couleur |
|-------|-------|---------|
| `camera` | Bouton capture photo | Accent (#1D4ED8) |
| `mic` | Bouton capture vocale | Accent |
| `edit-3` | Bouton note texte | Accent |
| `folder` | Sélecteur chantier actif | Accent |
| `chevron-down` | Sélecteur chantier (fermé) | Text secondary |
| `x` | Fermer modal | Text |
| `square` | Arrêter enregistrement | Error (#EF4444) |

---

#### **Clients**

| Icône | Usage | Couleur |
|-------|-------|---------|
| `users` | Titre section | Accent |
| `user-plus` | Formulaire nouveau client | Accent |
| `user` | Icône client (carte) | Accent |
| `map-pin` | Adresse client | Text secondary |
| `phone` | Téléphone client | Text secondary |
| `mail` | Email client | Text secondary |
| `search` | Barre de recherche | Text secondary |
| `trash-2` | Supprimer client | Error (#EF4444) |
| `check` | Bouton ajouter | Text |

---

#### **Documents**

| Icône | Usage | Couleur |
|-------|-------|---------|
| `file` | Icône devis | Text secondary |
| `file-text` | Icône facture | Text secondary |
| `settings` | Bouton paramètres | Text |
| `eye` | Voir PDF | #E5E5E5 |
| `trash-2` | Supprimer document | Error (#D9534F) |
| `inbox` | État vide | #555 |

---

### **ICÔNES MÉTÉO**

**Mapping** : `services/weatherService.js` → `getWeatherIcon()`

| Code API | Icône Feather | Usage |
|----------|---------------|-------|
| `01d`, `01n` | `sun` | Ensoleillé |
| `02d`, `02n` | `cloud` | Peu nuageux |
| `03d`, `03n` | `cloud` | Nuageux |
| `04d`, `04n` | `cloud` | Très nuageux |
| `09d`, `09n` | `cloud-drizzle` | Pluie légère |
| `10d`, `10n` | `cloud-rain` | Pluie |
| `11d`, `11n` | `cloud-lightning` | Orage |
| `13d`, `13n` | `cloud-snow` | Neige |
| `50d`, `50n` | `wind` | Brouillard |

---

### **ASSETS GRAPHIQUES**

| Fichier | Chemin | Taille | Usage |
|---------|--------|--------|-------|
| `icon.png` | `assets/` | 1024x1024 | Icône de l'app (Play Store, App Store) |
| `splash-icon.png` | `assets/` | - | Logo splash screen |

**Note** : Pas de logo entreprise dans les assets (stocké en base via `brand_settings.logo_url`)

---

## 🏗️ **PARTIE 7 : STRUCTURE PAR ÉCRAN**

### **ÉCRAN 1 : DASHBOARD (ACCUEIL)**

**Fichier** : `screens/DashboardScreen.js`

#### **Layout global**
```
SafeAreaView (edges: top)
└─ ScrollView
   ├─ HomeHeader (salutation, heure, date, météo)
   ├─ Stats Cards (grid 2x2)
   │  ├─ Chantiers actifs
   │  ├─ Terminés
   │  ├─ Photos
   │  └─ Documents
   ├─ Section "Chantiers en cours"
   │  ├─ Header (icône + titre + "Voir tout")
   │  └─ FlatList horizontal (cartes chantiers)
   └─ Section "Photos récentes" (si > 0)
      ├─ Header (icône + titre + "Voir tout")
      └─ FlatList horizontal (miniatures photos)
```

---

#### **Sections détaillées**

**1. HomeHeader** (composant)
- Salutation dynamique (Bonjour/Bon après-midi/Bonsoir)
- Horloge numérique (HH:mm:ss) avec animation pulse
- Date longue française
- Badge météo

**2. Stats Cards** (grid 2x2)
- 4 cartes avec :
  - Icône colorée dans un cercle
  - Valeur (nombre) en gros
  - Label en petit
  - Bordure gauche colorée (4px)
  - Animation fade-in + slide-up avec stagger (80ms entre chaque)
  - Animation scale au press (0.97)
  - Désactivées visuellement si valeur = 0

**3. Chantiers en cours** (horizontal scroll)
- Cartes 200px de large
- Icône folder + badge statut (🟢/🟠/⚪)
- Nom du chantier (2 lignes max)
- Cliquable → Ouvre le détail du chantier

**4. Photos récentes** (horizontal scroll)
- Miniatures 120x120px
- Bordure 2px (#334155)
- Cliquable → Ouvre le chantier associé

---

#### **Hiérarchie visuelle**

1. **Primaire** : Stats cards (gros chiffres, couleurs vives)
2. **Secondaire** : Chantiers en cours (cartes moyennes)
3. **Tertiaire** : Photos récentes (petites miniatures)

---

#### **Couleurs utilisées**

- Fond : `#0F1115` (background)
- Cartes stats : `#1E293B` (premium dark gray)
- Cartes chantiers : `#1E293B`
- Bordures : `#334155` (premium)
- Texte principal : `#F9FAFB`
- Texte secondaire : `#D1D5DB`
- Accent : `#1D4ED8` (bleu)
- Succès : `#10B981` (vert)
- Warning : `#F59E0B` (orange)
- Info : `#3B82F6` (bleu clair)

---

### **ÉCRAN 2 : CAPTURE**

**Fichier** : `screens/CaptureHubScreen.js`

#### **Layout global**
```
SafeAreaView (edges: top)
└─ View (contentWrapper, centré verticalement)
   ├─ Header
   │  ├─ Titre "Capture"
   │  └─ Sous-titre "Capturez instantanément..."
   ├─ ActiveProjectSelector (sélecteur chantier actif)
   └─ Actions Container (3 boutons en ligne)
      ├─ Photo (icône camera)
      ├─ Vocal (icône mic)
      └─ Note (icône edit-3)
```

---

#### **Sections détaillées**

**1. Header**
- Titre : 32px, bold
- Sous-titre : 14px, secondary

**2. ActiveProjectSelector** (composant)
- Barre cliquable avec :
  - Icône folder
  - Label "Chantier actif"
  - Nom du chantier sélectionné (ou placeholder)
  - Nom du client (si disponible)
  - Icône chevron-down
- Modal de sélection :
  - Recherche (input)
  - Liste chantiers avec emoji statut
  - Badge "Dernier" pour le dernier utilisé (⭐)

**3. Boutons d'action** (3)
- Dimensions : 110px large × 190px haut
- Fond : `#1E293B` (premium dark gray)
- Bordure : 2px `rgba(29, 78, 216, 0.4)` (bleu transparent)
- Border radius : 20px
- Contenu :
  - Icône circulaire (76x76px) avec fond bleu transparent
  - Label (16px, bold)
  - Sous-titre (12px, muted)
- Animations :
  - Fade-in + scale avec stagger (100ms entre chaque)
  - Scale 0.95 au press

---

#### **Modals**

**Modal enregistrement vocal** :
- Bouton circulaire 120x120px
- Bleu (mic) → Rouge (stop)
- Timer affiché (MM:SS)
- Texte "Enregistrement en cours..."

**Modal note texte** :
- TextInput multiline (150-300px haut)
- 2 boutons : "Continuer" (bleu) + "Annuler" (outline)

---

#### **Hiérarchie visuelle**

1. **Primaire** : Sélecteur chantier actif (en haut, visible)
2. **Secondaire** : 3 boutons d'action (centrés, gros)
3. **Tertiaire** : Modals (overlay)

---

#### **Couleurs utilisées**

- Fond : `#0F1115`
- Boutons action : `#1E293B`
- Bordures : `rgba(29, 78, 216, 0.4)` (bleu transparent)
- Icônes : `#1D4ED8` (accent)
- Texte : `#F9FAFB`
- Texte secondaire : `#9CA3AF`
- Overlay : `rgba(0, 0, 0, 0.7)`

---

### **ÉCRAN 3 : CLIENTS**

**Fichier** : `screens/ClientsListScreen.js`

#### **Layout global**
```
SafeAreaView (edges: top, bottom)
├─ Header fixe
│  ├─ Titre "Clients"
│  └─ Sous-titre "Gestion de votre base client"
└─ KeyboardAvoidingView
   └─ ScrollView
      ├─ Barre de recherche
      ├─ Formulaire "Nouveau client"
      │  ├─ Champs (nom, téléphone, email, adresse, CP, ville)
      │  └─ Bouton "AJOUTER"
      ├─ Séparateur
      └─ Liste clients
         └─ Cartes client (nom, adresse, téléphone, email)
```

---

#### **Sections détaillées**

**1. Header fixe**
- Titre : 28px, bold
- Sous-titre : 14px, secondary
- Bordure bas : 1px (#2A2E35)

**2. Barre de recherche**
- Fond : `#1A1D22` (surface)
- Icône search + input
- Hauteur : 56px
- Border radius : 8px

**3. Formulaire "Nouveau client"**
- Fond : `#1E293B` (premium)
- Border radius : 16px
- Padding : 16px
- Bordure : 1px `#334155`
- Ombre : large
- Champs :
  - Fond : `#252A32` (surfaceElevated)
  - Bordure : 1px `#2A2E35`
  - Border radius : 12px
  - Padding : 16px
  - Min height : 56px
  - Font size : 16px
  - Color : `#EAEAEA`

**4. Cartes client**
- Fond : `#1E293B`
- Border radius : 16px
- Padding : 16px
- Bordure : 1px `#334155`
- Ombre : medium
- Contenu :
  - Icône user + nom (18px, bold)
  - Adresse (14px, secondary) avec icône map-pin
  - Téléphone (14px, secondary) avec icône phone
  - Email (14px, secondary) avec icône mail
  - Bouton trash-2 (rouge) en haut à droite

---

#### **Hiérarchie visuelle**

1. **Primaire** : Formulaire nouveau client (en haut, visible)
2. **Secondaire** : Liste clients (cartes)
3. **Tertiaire** : Barre de recherche

---

#### **Couleurs utilisées**

- Fond : `#0F1115`
- Cartes : `#1E293B`
- Inputs : `#252A32`
- Bordures : `#334155` (premium) et `#2A2E35` (standard)
- Texte : `#F9FAFB`
- Texte secondaire : `#D1D5DB`
- Accent : `#1D4ED8`
- Error : `#EF4444`

---

### **ÉCRAN 4 : DOCUMENTS**

**Fichier** : `screens/DocumentsScreen.js`

#### **Layout global**
```
SafeAreaView (edges: top)
├─ Header
│  ├─ Titre "Documents"
│  └─ Bouton settings (engrenage)
├─ Filtres (3 boutons)
│  ├─ TOUS
│  ├─ 📋 DEVIS
│  └─ 📄 FACTURES
└─ FlatList
   └─ Cartes document
      ├─ Header (type + numéro + montant)
      ├─ Body (client + projet)
      └─ Footer (badge statut + actions)
```

---

#### **Sections détaillées**

**1. Header**
- Titre : 28px, bold
- Bouton settings : 24px, icône settings
- Bordure bas : 1px

**2. Filtres** (3 boutons)
- Flex row, gap 8px
- Bouton inactif :
  - Fond : `#1A1D22` (surface)
  - Bordure : 1px `#2A2E35`
  - Texte : `#D1D5DB` (secondary)
- Bouton actif :
  - Fond : `theme.colors.primary` (bleu)
  - Bordure : 1px bleu
  - Texte : `#fff`
- Font size : 14px, bold
- Padding : 8px vertical, 12px horizontal
- Border radius : 8px

**3. Cartes document**
- Fond : `theme.colors.card` (#1A1D22)
- Border radius : 12px
- Padding : 16px
- Bordure : 1px `#2A2E35`
- Contenu :
  - **Header** :
    - Type (DEVIS/FACTURE) : 12px, bold, secondary
    - Numéro : 18px, bold, text
    - Montant : 20px, bold, success (#10B981)
  - **Body** :
    - Client : 15px, semi-bold, text
    - Projet : 14px, secondary
  - **Footer** :
    - Badge statut :
      - Brouillon : `#444` (gris)
      - Envoyé : `#1E88E5` (bleu)
      - Signé : `#2E7D32` (vert)
    - Boutons actions :
      - Voir (eye) : `#E5E5E5`
      - Supprimer (trash-2) : `#D9534F` (rouge)

---

#### **Hiérarchie visuelle**

1. **Primaire** : Montant TTC (gros, vert)
2. **Secondaire** : Numéro de document
3. **Tertiaire** : Client, projet, statut

---

#### **Couleurs utilisées**

- Fond : `#0F1115`
- Cartes : `#1A1D22`
- Bordures : `#2A2E35`
- Texte : `#F9FAFB`
- Texte secondaire : `#D1D5DB`
- Accent : `#1D4ED8`
- Succès : `#10B981` (montants)
- Statut envoyé : `#1E88E5`
- Statut signé : `#2E7D32`
- Statut brouillon : `#444`
- Error : `#D9534F`

---

## 📦 **PARTIE 8 : LIBRAIRIES UI**

### **LIBRAIRIES INSTALLÉES**

| Librairie | Version | Usage |
|-----------|---------|-------|
| `@expo/vector-icons` | - | **Icônes Feather** (toute l'app) |
| `react-native-safe-area-context` | - | SafeAreaView, useSafeAreaInsets (tous les écrans) |
| `@react-navigation/native` | - | Navigation (Bottom Tab + Stack) |
| `@react-navigation/bottom-tabs` | - | Tab bar (4 onglets) |
| `@react-navigation/native-stack` | - | Stack navigation |
| `expo-image-picker` | - | Capture photo/caméra |
| `expo-av` | - | Enregistrement audio |
| `expo-sharing` | - | Partage de fichiers (PDF) |
| `react-native-image-viewing` | - | Visualiseur d'images plein écran |

---

### **LIBRAIRIES NON UTILISÉES (OPPORTUNITÉS)**

**Pour une refonte premium, considérer** :
- ❌ `react-native-paper` - Pas utilisé (Material Design)
- ❌ `react-native-elements` - Pas utilisé
- ❌ `nativebase` - Pas utilisé
- ❌ `react-native-reanimated` - Pas utilisé (animations avancées)
- ❌ `react-native-gesture-handler` - Utilisé mais sous-exploité
- ❌ `react-native-toast-message` - Pas utilisé (toast iOS)
- ❌ `lottie-react-native` - Pas utilisé (animations Lottie)

---

## 🧠 **PARTIE 9 : SYNTHÈSE DESIGN (10 POINTS CLÉS)**

### **✅ FORCES**

#### **1. Système de design cohérent**
- ✅ Thème centralisé (`Theme.js`)
- ✅ Couleurs unifiées (bleu principal partout)
- ✅ Spacing systématique (4, 8, 12, 16, 24, 32, 48)
- ✅ Border radius cohérent (8, 12, 16, 20)

#### **2. Thème sombre optimisé terrain**
- ✅ Contraste élevé (texte blanc sur fond très sombre)
- ✅ Lisible en plein soleil
- ✅ Pas de blanc pur (fatigue visuelle réduite)

#### **3. Icônes professionnelles**
- ✅ Feather (minimaliste, cohérent)
- ✅ Stroke width uniforme (2.5)
- ✅ Tailles cohérentes (16, 20, 24, 32, 48)

#### **4. Animations subtiles**
- ✅ Fade-in + slide-up (stats cards)
- ✅ Scale au press (boutons, cartes)
- ✅ Stagger (apparition progressive)
- ✅ Pulse (horloge)

#### **5. Feedback visuel**
- ✅ Toast pour les actions (succès/erreur)
- ✅ Loading states (ActivityIndicator)
- ✅ Empty states (picto + texte + bouton)
- ✅ Colorisation des prix (IA)

---

### **⚠️ FAIBLESSES / INCOHÉRENCES**

#### **6. Couleurs premium mélangées**
- ⚠️ `#1E293B` utilisé directement dans les écrans (pas dans le thème)
- ⚠️ `#334155` utilisé directement (pas dans le thème)
- ⚠️ Devrait être ajouté au thème : `surfacePremium`, `borderPremium`

#### **7. Typographie non uniforme**
- ⚠️ Font sizes variées : 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 30, 32
- ⚠️ Devrait être réduit à 6-8 tailles max (échelle harmonique)
- ⚠️ Pas de police custom (System par défaut)

#### **8. Spacing non systématique**
- ⚠️ Certains écrans utilisent des valeurs hors système (10, 14, 18, 22)
- ⚠️ Devrait utiliser uniquement les valeurs du thème (4, 8, 12, 16, 24, 32, 48)

#### **9. Ombres sous-utilisées**
- ⚠️ Shadows définies dans le thème mais peu utilisées
- ⚠️ Certains écrans recréent les ombres manuellement
- ⚠️ Manque de profondeur visuelle (effet "flat")

#### **10. Animations basiques**
- ⚠️ Animations présentes mais limitées (fade, scale, slide)
- ⚠️ Pas d'animations de transition entre écrans (fade uniquement)
- ⚠️ Pas de micro-interactions (haptic feedback, ripple effect)
- ⚠️ Pas d'animations Lottie (splash, loading, success)

---

## 🔍 **PARTIE 10 : INCOHÉRENCES DÉTECTÉES**

### **Couleurs**

| Incohérence | Fichiers concernés | Recommandation |
|-------------|-------------------|----------------|
| `#1E293B` hardcodé | `DashboardScreen.js`, `ClientsListScreen.js`, `CaptureHubScreen.js` | Ajouter `surfacePremium: '#1E293B'` au thème |
| `#334155` hardcodé | Idem | Ajouter `borderPremium: '#334155'` au thème |
| `#7C3AED` (violet) | `DevisAIGenerator.js` | Ajouter `accentSecondary: '#7C3AED'` au thème |
| `#EAEAEA` (input color) | `Theme.js` | Devrait être `#E5E5E5` (plus cohérent) |

---

### **Typographie**

| Incohérence | Fichiers concernés | Recommandation |
|-------------|-------------------|----------------|
| 13 tailles différentes | Tous | Réduire à 6-8 tailles (échelle harmonique) |
| Font weights variés | Tous | Standardiser : 400, 600, 700, 800 uniquement |
| Pas de police custom | Tous | Charger Poppins ou Inter via expo-font |

---

### **Spacing**

| Incohérence | Fichiers concernés | Recommandation |
|-------------|-------------------|----------------|
| Valeurs hors système (10, 14, 18, 22) | `CaptureHubScreen.js`, `DocumentsScreen.js` | Utiliser uniquement les valeurs du thème |
| Gap non uniforme | Tous | Standardiser les gaps (4, 8, 12, 16) |

---

### **Border Radius**

| Incohérence | Fichiers concernés | Recommandation |
|-------------|-------------------|----------------|
| 20px utilisé | `CaptureHubScreen.js` | Ajouter `xxl: 20` au thème |
| 50px, 60px utilisés | `EmptyState.js`, `CaptureHubScreen.js` | OK pour éléments circulaires |

---

### **Ombres**

| Incohérence | Fichiers concernés | Recommandation |
|-------------|-------------------|----------------|
| Ombres recréées manuellement | `DashboardScreen.js`, `ClientsListScreen.js` | Utiliser `theme.shadows.lg` systématiquement |
| Pas d'ombre sur certaines cartes | `DocumentsScreen.js` | Ajouter `theme.shadows.md` |

---

## 📊 **PARTIE 11 : EXTRACTION RESSOURCES DESIGN**

### **A. PALETTE ACTUELLE (COMPLÈTE)**

#### **FONDS**

```javascript
background: '#0F1115'          // Fond principal (très sombre, presque noir)
surface: '#1A1D22'             // Cartes, modals, tab bar (gris très foncé)
surfaceElevated: '#252A32'     // Inputs, éléments surélevés (gris foncé)
surfacePremium: '#1E293B'      // Cartes premium (gris ardoise) [NON DANS THÈME]
```

---

#### **TEXTES**

```javascript
text: '#F9FAFB'                // Texte principal (blanc cassé, excellent contraste)
textSecondary: '#D1D5DB'       // Texte secondaire (gris clair)
textMuted: '#9CA3AF'           // Texte désactivé (gris moyen)
```

---

#### **ACCENTS (BLEU PRINCIPAL)**

```javascript
accent: '#1D4ED8'              // Bleu principal (boutons, icônes actives, liens)
accentLight: '#60A5FA'         // Bleu clair (hover, états actifs)
accentDark: '#1E3A8A'          // Bleu foncé (boutons pressés)
accentHover: '#2563EB'         // Bleu hover (desktop)
accentSecondary: '#7C3AED'     // Violet (bouton devis IA) [NON DANS THÈME]
```

---

#### **ÉTATS SÉMANTIQUES**

```javascript
success: '#10B981'             // Vert (succès, validation, montants, badge "Devis prêt")
successLight: '#34D399'        // Vert clair (hover)
error: '#EF4444'               // Rouge (erreurs, suppression)
warning: '#F59E0B'             // Orange (avertissements, badge "Questions")
info: '#3B82F6'                // Bleu info (icône horloge, stat photos)
```

---

#### **BORDURES**

```javascript
border: '#2A2E35'              // Bordures principales (cartes, inputs, tab bar)
borderLight: '#1E2126'         // Bordures légères (rarement utilisé)
borderPremium: '#334155'       // Bordures premium (cartes Dashboard/Clients) [NON DANS THÈME]
```

---

#### **OVERLAY**

```javascript
overlay: 'rgba(0, 0, 0, 0.75)' // Fond des modals (opaque, bon contraste)
```

---

#### **PALETTE GRIS COMPLÈTE (TAILWIND)**

```javascript
gray50: '#F9FAFB'              // Presque blanc
gray100: '#F3F4F6'             // Gris très clair
gray200: '#E5E7EB'             // Gris clair
gray300: '#D1D5DB'             // Texte secondaire
gray400: '#9CA3AF'             // Texte muted
gray500: '#6B7280'             // Gris moyen
gray600: '#4B5563'             // Boutons désactivés
gray700: '#374151'             // Gris foncé
gray800: '#1F2937'             // Très foncé
gray900: '#111827'             // Presque noir (éléments de liste)
```

---

#### **COULEURS SPÉCIALES (IA)**

```javascript
// Colorisation des prix (DevisAIGenerator)
priceCoherent: '#16A34A'       // Vert (prix cohérent ±10%)
priceLimit: '#F59E0B'          // Orange (prix limite ±20%)
priceTooHigh: '#DC2626'        // Rouge (prix trop cher +20%)
priceTooLow: '#2563EB'         // Bleu (prix trop bas -20%)
```

---

### **B. TYPOGRAPHIE (COMPLÈTE)**

#### **POLICE**

```javascript
fontFamily: 'System' // Police système par défaut
// Poppins ou Inter peuvent être chargées via expo-font (non fait actuellement)
```

---

#### **HIÉRARCHIE DE TITRES**

```javascript
h1: {
  fontSize: 32,
  fontWeight: '800', // Extra Bold
  color: '#F9FAFB',
  letterSpacing: -0.5,
  lineHeight: 40,
}

h2: {
  fontSize: 28,
  fontWeight: '700', // Bold
  color: '#F9FAFB',
  letterSpacing: -0.3,
  lineHeight: 36,
}

h3: {
  fontSize: 24,
  fontWeight: '700', // Bold
  color: '#F9FAFB',
  letterSpacing: -0.2,
  lineHeight: 32,
}

h4: {
  fontSize: 20,
  fontWeight: '600', // Semi-Bold
  color: '#F9FAFB',
  lineHeight: 28,
}
```

---

#### **CORPS DE TEXTE**

```javascript
body: {
  fontSize: 16,
  fontWeight: '400', // Regular
  color: '#F9FAFB',
  lineHeight: 24,
}

bodySmall: {
  fontSize: 14,
  fontWeight: '400', // Regular
  color: '#D1D5DB',
  lineHeight: 20,
}

caption: {
  fontSize: 12,
  fontWeight: '500', // Medium
  color: '#D1D5DB',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  lineHeight: 16,
}
```

---

#### **TAILLES RÉELLEMENT UTILISÉES (13)**

```
10px → Status badges (très petit)
11px → Labels "Dernier" (ActiveProjectSelector)
12px → Captions, petits textes, détails lignes devis
13px → Client name (ActiveProjectSelector)
14px → Texte secondaire, filtres, sous-titres
15px → Météo, labels, client name (cartes)
16px → Texte principal, inputs, boutons (LE PLUS UTILISÉ)
18px → Numéros de devis, icônes client
20px → Montants TTC, titres de section
22px → Horloge numérique
24px → Sous-titres, titres modals
28px → Titres d'écran
30px → Salutation (HomeHeader)
32px → Valeurs stats (Dashboard)
```

**Recommandation** : Réduire à **8 tailles** (échelle harmonique)

---

### **C. SPACING / RADIUS / SHADOW**

#### **SPACING (SYSTÈME)**

```javascript
xs: 4       // Gap icône-texte, padding badges
sm: 8       // Padding petits éléments, gap boutons
md: 12      // Padding cartes, margin bottom
lg: 16      // Padding écrans, padding cartes
xl: 24      // Margin sections
xxl: 32     // Séparations importantes
xxxl: 48    // EmptyState padding
```

**Valeurs hors système détectées** : 10, 14, 18, 22 (à corriger)

---

#### **BORDER RADIUS (SYSTÈME)**

```javascript
sm: 4       // Petits badges
md: 8       // Inputs, badges météo, filtres
lg: 12      // Cartes, boutons (LE PLUS UTILISÉ)
xl: 16      // Cartes premium
round: 999  // Éléments circulaires
```

**Valeurs hors système détectées** : 20 (boutons Capture), 50, 60 (circulaires)

**Recommandation** : Ajouter `xxl: 20` au thème

---

#### **SHADOWS (SYSTÈME)**

```javascript
sm: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
}

md: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 4,
}

lg: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 8,
}
```

**Ombre spéciale (boutons primaires)** :
```javascript
{
  shadowColor: '#1D4ED8', // Couleur d'accent (effet glow)
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 4,
}
```

---

### **D. ICÔNES & ASSETS**

#### **LIBRAIRIE D'ICÔNES**

**Librairie** : `@expo/vector-icons` → **Feather**

**Configuration** :
- Taille par défaut : 24px
- Stroke width : 2.5 (plus épais que défaut 2.0)
- Couleurs : accent, textSecondary, success, error, warning, info

---

#### **ICÔNES PAR CATÉGORIE (50+)**

**Navigation** :
- `home`, `users`, `camera`, `briefcase` (tab bar)
- `chevron-right`, `chevron-down`, `chevron-left` (navigation)

**Actions** :
- `camera`, `mic`, `edit-3` (capture)
- `plus-circle`, `user-plus`, `folder-plus` (création)
- `check`, `check-circle` (validation)
- `x`, `trash-2` (suppression)
- `eye` (visualisation)
- `settings` (paramètres)

**Statut** :
- `clock` (horloge, planifié)
- `play-circle` (en cours)
- `check-circle` (terminé)
- `folder`, `folder-x` (chantiers)

**Informations** :
- `user`, `users` (clients)
- `map-pin`, `phone`, `mail` (coordonnées)
- `file`, `file-text` (documents)
- `image`, `inbox` (médias)

**Météo** :
- `sun`, `cloud`, `cloud-drizzle`, `cloud-rain`, `cloud-lightning`, `cloud-snow`, `wind`

**Autres** :
- `search` (recherche)
- `help-circle` (questions IA)
- `type` (mode texte)

---

#### **ASSETS GRAPHIQUES**

| Asset | Chemin | Format | Taille | Usage |
|-------|--------|--------|--------|-------|
| Icône app | `assets/icon.png` | PNG | 1024x1024 | Play Store, App Store |
| Splash logo | `assets/splash-icon.png` | PNG | - | Splash screen |

**Note** : Pas de logo entreprise dans les assets (stocké en base)

---

## 📱 **PARTIE 12 : ANALYSE PAR ÉCRAN (DÉTAILLÉE)**

### **DASHBOARD (ACCUEIL)**

#### **Hiérarchie visuelle**

```
1. HomeHeader (salutation + horloge) ────────── Primaire
   ├─ Salutation (30px, bold)
   ├─ Horloge (22px, monospace, bleu)
   ├─ Date (15px, secondary)
   └─ Météo (badge)

2. Stats Cards (grid 2x2) ────────────────────── Primaire
   ├─ Chantiers actifs (bleu)
   ├─ Terminés (vert)
   ├─ Photos (bleu clair)
   └─ Documents (orange)

3. Chantiers en cours (horizontal scroll) ───── Secondaire
   └─ Cartes 200px (icône + statut + nom)

4. Photos récentes (horizontal scroll) ───────── Tertiaire
   └─ Miniatures 120x120px
```

#### **Couleurs dominantes**

- Fond : `#0F1115` (très sombre)
- Cartes : `#1E293B` (gris ardoise premium)
- Bordures : `#334155` (gris moyen premium)
- Accent : `#1D4ED8` (bleu)
- Succès : `#10B981` (vert)
- Warning : `#F59E0B` (orange)
- Info : `#3B82F6` (bleu clair)

#### **Animations**

- Stats cards : Fade-in + slide-up avec stagger (80ms)
- Stats cards : Scale 0.97 au press
- Horloge : Pulse continue (2s loop)

---

### **CAPTURE**

#### **Hiérarchie visuelle**

```
1. Header (titre + sous-titre) ────────────────── Primaire
   ├─ "Capture" (32px, bold)
   └─ "Capturez instantanément..." (14px, secondary)

2. ActiveProjectSelector ───────────────────────── Primaire
   └─ Barre cliquable (chantier actif)

3. Boutons d'action (3) ────────────────────────── Primaire
   ├─ Photo (camera)
   ├─ Vocal (mic)
   └─ Note (edit-3)
```

#### **Couleurs dominantes**

- Fond : `#0F1115`
- Boutons action : `#1E293B`
- Bordures boutons : `rgba(29, 78, 216, 0.4)` (bleu transparent)
- Icônes : `#1D4ED8` (accent)
- Overlay : `rgba(0, 0, 0, 0.7)`

#### **Animations**

- Boutons action : Fade-in + scale avec stagger (100ms)
- Boutons action : Scale 0.95 au press
- Bouton vocal : Bleu → Rouge (recording)

---

### **CLIENTS**

#### **Hiérarchie visuelle**

```
1. Header fixe (titre + sous-titre) ───────────── Primaire
2. Barre de recherche ──────────────────────────── Secondaire
3. Formulaire "Nouveau client" ─────────────────── Primaire
   └─ 6 champs + bouton "AJOUTER"
4. Séparateur (1px)
5. Liste clients ────────────────────────────────── Secondaire
   └─ Cartes client (nom + coordonnées + trash)
```

#### **Couleurs dominantes**

- Fond : `#0F1115`
- Formulaire : `#1E293B` (premium)
- Cartes client : `#1E293B`
- Inputs : `#252A32`
- Bordures : `#334155` (premium)
- Accent : `#1D4ED8`
- Error : `#EF4444`

---

### **DOCUMENTS**

#### **Hiérarchie visuelle**

```
1. Header (titre + settings) ──────────────────── Primaire
2. Filtres (3 boutons) ─────────────────────────── Secondaire
   ├─ TOUS
   ├─ 📋 DEVIS
   └─ 📄 FACTURES
3. Liste documents ──────────────────────────────── Primaire
   └─ Cartes document
      ├─ Type + Numéro + Montant (gros, vert)
      ├─ Client + Projet
      └─ Badge statut + Actions (eye, trash)
```

#### **Couleurs dominantes**

- Fond : `#0F1115`
- Cartes : `#1A1D22`
- Bordures : `#2A2E35`
- Montants : `#10B981` (vert)
- Statut brouillon : `#444`
- Statut envoyé : `#1E88E5`
- Statut signé : `#2E7D32`
- Error : `#D9534F`

---

## 🎯 **PARTIE 13 : RECOMMANDATIONS POUR REFONTE**

### **1. Ajouter au thème**

```javascript
// Couleurs manquantes
surfacePremium: '#1E293B',
borderPremium: '#334155',
accentSecondary: '#7C3AED', // Violet
priceCoherent: '#16A34A',
priceLimit: '#F59E0B',
priceTooHigh: '#DC2626',
priceTooLow: '#2563EB',

// Border radius manquant
borderRadius: {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20, // AJOUTER
  round: 999,
}
```

---

### **2. Standardiser la typographie**

**Échelle harmonique recommandée (8 tailles)** :
```
12px → Captions, très petits textes
14px → Texte secondaire, labels
16px → Texte principal, inputs, boutons
18px → Sous-titres
20px → Titres de section
24px → Titres modals
28px → Titres d'écran
32px → Gros titres, valeurs stats
```

**Supprimer** : 10, 11, 13, 15, 22, 30 (trop de variations)

---

### **3. Charger une police custom**

**Recommandation** : **Inter** ou **Poppins**

```javascript
import * as Font from 'expo-font';

await Font.loadAsync({
  'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
  'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
  'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
  'Inter-ExtraBold': require('./assets/fonts/Inter-ExtraBold.ttf'),
});

// Puis dans le thème
fontFamily: 'Inter-Regular',
```

---

### **4. Améliorer les animations**

**Ajouter** :
- Transitions entre écrans (slide, fade, scale)
- Micro-interactions (haptic feedback)
- Ripple effect sur les boutons (Android)
- Animations Lottie (splash, loading, success)
- Skeleton screens (au lieu de loaders)

---

### **5. Ajouter des micro-interactions**

```javascript
import * as Haptics from 'expo-haptics';

// Au press d'un bouton
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Au succès
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// À l'erreur
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```

---

### **6. Améliorer les ombres**

**Utiliser systématiquement** :
- `theme.shadows.sm` → Badges, tags
- `theme.shadows.md` → Cartes standard
- `theme.shadows.lg` → Cartes premium, modals

**Ajouter effet glow** sur les boutons primaires :
```javascript
shadowColor: theme.colors.accent, // Au lieu de '#000'
shadowOpacity: 0.3,
```

---

### **7. Améliorer les états vides**

**Ajouter** :
- Illustrations (Lottie ou SVG)
- Animations d'apparition
- Boutons d'action plus visibles

---

### **8. Améliorer les toasts (iOS)**

**Remplacer** `Alert` par `react-native-toast-message` :
```javascript
import Toast from 'react-native-toast-message';

Toast.show({
  type: 'success',
  text1: 'Succès',
  text2: 'Client ajouté avec succès',
  position: 'top',
  visibilityTime: 3000,
});
```

---

### **9. Ajouter des skeletons**

**Remplacer** les `ActivityIndicator` par des skeletons :
- Skeleton cards (Dashboard, Clients, Documents)
- Skeleton lists (chargement initial)

---

### **10. Améliorer la navigation**

**Ajouter** :
- Transitions personnalisées (slide, fade, scale)
- Gestures (swipe back)
- Tab bar animée (indicateur de tab active)

---

## 📊 **RÉCAPITULATIF FINAL**

### **STATISTIQUES**

- **Écrans** : 15 (4 principaux + 11 secondaires)
- **Composants** : 25 (boutons, cartes, headers, sélecteurs, etc.)
- **Couleurs** : 30+ (palette complète)
- **Tailles de police** : 13 (à réduire à 8)
- **Icônes** : 50+ (Feather)
- **Animations** : 10+ (fade, scale, slide, pulse, stagger)

---

### **SCORE DESIGN ACTUEL**

| Catégorie | Score | Détails |
|-----------|-------|---------|
| **Cohérence** | 85/100 | Thème centralisé, mais quelques valeurs hardcodées |
| **Lisibilité** | 95/100 | Excellent contraste, optimisé terrain |
| **Modernité** | 70/100 | Design sobre mais daté (2023), manque de polish |
| **Animations** | 75/100 | Présentes mais basiques, manque de micro-interactions |
| **Accessibilité** | 90/100 | Bonnes tailles de police, bon contraste |

**SCORE GLOBAL DESIGN : 83/100**

---

### **OPPORTUNITÉS POUR REFONTE 2.0**

1. 🎨 **Moderniser la palette** : Ajouter des dégradés subtils
2. 🔤 **Charger une police premium** : Inter ou Poppins
3. ✨ **Améliorer les animations** : Lottie, micro-interactions, haptics
4. 🎭 **Ajouter des illustrations** : États vides, onboarding
5. 🌈 **Améliorer la profondeur** : Ombres plus prononcées, effet glow
6. 📐 **Standardiser les tailles** : Échelle harmonique (8 tailles max)
7. 🎬 **Transitions fluides** : Entre écrans, entre états
8. 🎨 **Ajouter des accents secondaires** : Violet déjà utilisé, pourquoi pas orange/vert
9. 📱 **Améliorer les toasts iOS** : react-native-toast-message
10. 🎯 **Ajouter des skeletons** : Au lieu des loaders

---

**Audit UI/Design terminé !** 🎨

**Document prêt pour designer IA (GPT-5)** ✅

