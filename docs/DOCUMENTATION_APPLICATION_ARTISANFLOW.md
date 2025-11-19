# Documentation Complète de l'Application Mobile ArtisanFlow

**Dernière mise à jour :** 13 novembre 2025  
**Version :** 1.0.1  
**Statut :** ✅ Application fonctionnelle, prête pour tests finaux

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture et Structure](#architecture-et-structure)
3. [Fonctionnalités Principales](#fonctionnalités-principales)
4. [Aspects Techniques](#aspects-techniques)
5. [Design et UX](#design-et-ux)
6. [Sécurité et Multi-tenant](#sécurité-et-multi-tenant)
7. [Services et Intégrations](#services-et-intégrations)
8. [Navigation et Parcours Utilisateur](#navigation-et-parcours-utilisateur)
9. [State Management](#state-management)
10. [Mode Hors Ligne](#mode-hors-ligne)
11. [Intelligence Artificielle](#intelligence-artificielle)
12. [Configuration et Déploiement](#configuration-et-déploiement)
13. [Tests et Qualité](#tests-et-qualité)
14. [Évolutions Prévues](#évolutions-prévues)

---

## 1. Vue d'ensemble

### 1.1 Concept

**ArtisanFlow** est une application mobile React Native (iOS + Android) conçue pour les artisans du bâtiment. Elle permet de :

- 📸 **Capturer** des photos de chantier avec géolocalisation
- 🎤 **Enregistrer** des notes vocales avec transcription automatique (Whisper)
- 🤖 **Générer** des devis professionnels via IA (GPT-4o-mini)
- 📄 **Créer** des devis et factures PDF conformes légalement
- 👥 **Gérer** clients, chantiers, documents
- 📱 **Fonctionner** en mode hors ligne complet
- 🔗 **Partager** des chantiers avec les clients (lien web sécurisé)

### 1.2 Modèle Économique

- **Abonnement** : Modalités à préciser lors de la mise en service
- **Essai gratuit** : 14 jours (à activer)
- **Paiement** : Apple App Store / Google Play Store (via RevenueCat)
- **Sans engagement** : Résiliation à tout moment

### 1.3 Stack Technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| **Framework** | React Native + Expo | SDK 54 |
| **Backend** | Supabase | v2.79.0 |
| **IA Transcription** | OpenAI Whisper | API |
| **IA Génération** | OpenAI GPT-4o-mini | API |
| **Paiements** | RevenueCat | v9.6.6 |
| **Navigation** | React Navigation | v7.x |
| **State** | Zustand | v5.0.8 |
| **Monitoring** | Sentry | v7.2.0 |
| **Validation** | Zod | v3.25.76 |
| **Formulaires** | React Hook Form | v7.53.0 |

### 1.4 Plateformes Supportées

- **iOS** : 15.1+ (iPhone, iPad)
- **Android** : API 24+ (Android 7.0+)
- **Développement** : Expo Dev Client

---

## 2. Architecture et Structure

### 2.1 Structure des Dossiers

```
artisanflow/
├── App.js                    # Point d'entrée + Auth + Splash
├── app.config.js            # Configuration Expo dynamique
├── navigation/              # Navigation React Navigation
│   └── AppNavigator.js      # Bottom tabs + Stacks
├── screens/                 # 19 écrans principaux
│   ├── AuthScreen.js
│   ├── OnboardingScreen.js
│   ├── DashboardScreen2.js
│   ├── ClientsListScreen2.js
│   ├── ClientDetailScreen.js
│   ├── ProjectsListScreen.js
│   ├── ProjectDetailScreen.js
│   ├── ProjectCreateScreen.tsx
│   ├── CaptureHubScreen2.js
│   ├── DocumentsScreen2.js
│   ├── EditDevisScreen.js
│   ├── SettingsScreen.js
│   ├── TemplatesScreen.js
│   ├── PhotoGalleryScreen.js
│   ├── PaywallScreen.tsx
│   ├── OnboardingPaywallScreen.tsx
│   ├── SignDevisScreen.js
│   ├── SignDevisSuccessScreen.js
│   ├── ImportDataScreen.tsx
│   ├── ProDashboardScreen.js
│   ├── DebugLogsScreen.js (dev only)
│   └── QATestRunnerScreen.js (dev only)
├── components/              # Composants réutilisables
│   ├── ui/                  # Design system
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   └── ...
│   ├── home/                # Composants spécifiques
│   ├── share/               # Composants partage client
│   ├── VoiceRecorderSimple.js
│   ├── DevisAIGenerator2.js
│   ├── PhotoUploader.js
│   └── ...
├── services/                # Services métier
│   ├── transcriptionService.js
│   ├── quoteAnalysisService.js
│   ├── aiConversationalService.js
│   ├── aiLearningService.js
│   ├── devis/
│   │   ├── devisService.js
│   │   └── signatureService.js
│   ├── payments/
│   │   └── revenuecat.ts
│   ├── shareService.js
│   ├── projectShareService.js
│   ├── syncService.ts
│   ├── offlineCacheService.ts
│   ├── offlineQueueService.ts
│   └── ...
├── store/                   # State management
│   └── useAppStore.js       # Store Zustand centralisé
├── utils/                    # Utilitaires
│   ├── auth.js
│   ├── logger.js
│   ├── offlineManager.js
│   ├── networkManager.js
│   ├── pdf.js
│   ├── openaiUsageTracker.js
│   └── ...
├── theme/                    # Thème et design
│   ├── Theme.js
│   ├── colors.js
│   └── useSafeTheme.js
├── contexts/                # Contextes React
│   ├── ToastContext.tsx
│   └── NetworkStatusContext.tsx
├── hooks/                   # Hooks personnalisés
├── validation/              # Schémas Zod
├── sql/                     # Scripts SQL Supabase
│   ├── create_*.sql
│   ├── enable_rls_*.sql
│   └── ...
├── supabase/                # Edge Functions
│   └── functions/
│       ├── transcribe-audio/
│       ├── ai-devis-conversational/
│       ├── sign-devis/
│       ├── public-project-view/
│       └── ...
├── config/                  # Configuration
│   └── supabase.js
└── docs/                    # Documentation (50+ fichiers)
```

### 2.2 Flux d'Authentification

```
App.js
  ├─ SplashScreen (animation logo)
  ├─ getCurrentSession() → vérifie session Supabase
  ├─ Si non connecté → AuthScreen
  ├─ Si connecté → OnboardingScreen (première fois)
  └─ Si connecté + onboarding fait → AppNavigator
```

**Détails :**
- Vérification session au démarrage (une seule fois)
- Écoute des changements d'authentification
- Initialisation RevenueCat après connexion (non-bloquant)
- Traitement automatique de la queue offline au démarrage

### 2.3 Flux de Navigation

```
Bottom Tabs (3 onglets)
├─ Accueil (HomeStackNavigator)
│   ├─ CaptureHubScreen2
│   └─ ProjectCreateScreen
├─ Clients (ClientsStackNavigator)
│   ├─ ClientsListScreen2
│   ├─ ClientDetailScreen
│   ├─ ProjectDetailScreen
│   ├─ ProjectCreateScreen
│   └─ ImportDataScreen
└─ Documents (ProStackNavigator)
    ├─ DocumentsScreen2
    ├─ SettingsScreen
    ├─ TemplatesScreen
    ├─ PaywallScreen
    ├─ OnboardingPaywallScreen
    ├─ EditDevisScreen
    ├─ ImportDataScreen
    ├─ QATestRunnerScreen (dev only)
    └─ DebugLogsScreen (dev only)

RootStack (modales globales)
├─ PhotoGalleryScreen
├─ ProjectsListScreen
├─ ProjectDetailScreen
├─ SignDevisScreen (public)
└─ SignDevisSuccessScreen (public)
```

**Caractéristiques :**
- Transitions fade douces
- Icônes animées dans la tab bar
- Safe area insets gérés automatiquement
- Navigation conditionnelle selon l'état de l'app

---

## 3. Fonctionnalités Principales

### 3.1 Gestion Clients ✅

**Écran :** `ClientsListScreen2.js`

**Fonctionnalités :**
- ✅ Liste clients avec recherche en temps réel
- ✅ Création client (nom, téléphone, email, adresse)
- ✅ Édition client
- ✅ Suppression client
- ✅ Détail client (infos + projets liés)
- ✅ Photos par client
- ✅ Import multi-format (CSV, Excel, contacts, scan carte visite)
- ✅ Isolation multi-tenant (RLS) - chaque artisan voit uniquement ses clients

**Données stockées :**
- Table `clients` (Supabase)
- Champs : `id`, `user_id`, `name`, `phone`, `email`, `address`, `created_at`, `updated_at`

### 3.2 Gestion Chantiers ✅

**Écrans :** `ProjectsListScreen.js`, `ProjectDetailScreen.js`, `ProjectCreateScreen.tsx`

**Fonctionnalités :**
- ✅ Liste chantiers avec filtres (actif/pause/terminé)
- ✅ Création chantier (nom, adresse, client, statut)
- ✅ Édition chantier
- ✅ Suppression chantier
- ✅ Détail chantier (infos + photos + notes + devis)
- ✅ Statuts : `actif`, `pause`, `terminé`
- ✅ Sélection chantier actif (dropdown global)
- ✅ Liaison automatique client ↔ chantier
- ✅ Isolation multi-tenant (RLS)

**Données stockées :**
- Table `projects` (Supabase)
- Champs : `id`, `user_id`, `client_id`, `name`, `address`, `status`, `created_at`, `updated_at`

### 3.3 Capture Photos ✅

**Écran :** `CaptureHubScreen2.js`, `PhotoGalleryScreen.js`

**Fonctionnalités :**
- ✅ Capture caméra (Expo Image Picker)
- ✅ Sélection galerie (multi-sélection)
- ✅ Compression automatique (`imageCompression.js`)
- ✅ Géolocalisation automatique (Expo Location)
- ✅ Reverse geocoding (ville depuis coordonnées)
- ✅ Upload Supabase Storage (bucket `photos`)
- ✅ Dossiers par chantier (`project_photos/{project_id}/`)
- ✅ Affichage galerie (grille 3 colonnes)
- ✅ Suppression photos (appui long)
- ✅ Mode offline (queue d'upload)
- ✅ Métadonnées : date, géolocalisation, taille

**Données stockées :**
- Table `project_photos` (Supabase)
- Storage : `photos/{user_id}/{project_id}/{filename}`
- Champs : `id`, `user_id`, `project_id`, `url`, `latitude`, `longitude`, `city`, `created_at`

### 3.4 Notes Vocales ✅

**Composant :** `VoiceRecorderSimple.js`

**Fonctionnalités :**
- ✅ Enregistrement audio (Expo AV)
- ✅ Format : M4A
- ✅ Durée minimale : 2 secondes
- ✅ Upload Supabase Storage (bucket `voices`)
- ✅ Transcription Whisper (OpenAI API via Edge Function)
- ✅ Correction orthographique (GPT-4o-mini)
- ✅ Feedback visuel (`TranscriptionFeedback.tsx`)
- ✅ Édition transcription manuelle
- ✅ Analyse IA (`quoteAnalysisService.js`)
  - Détection type : `prestation`, `client_info`, `note_perso`
  - Extraction : catégorie, description, quantité, unité
- ✅ Sauvegarde dans table `notes`
- ✅ Lecture audio
- ✅ Liste historique
- ✅ Suppression notes
- ✅ Mode offline (queue d'upload)

**Workflow complet :**
1. Enregistrement audio → Upload Storage
2. Transcription Whisper (Edge Function `transcribe-audio`)
3. Correction orthographique (Edge Function `correct-text`)
4. Analyse sémantique (Edge Function `analyze-note`)
5. Stockage dans `notes` avec `transcription` et `analysis_data`

**Données stockées :**
- Table `notes` (Supabase)
- Storage : `voices/{user_id}/{project_id}/rec_{timestamp}.m4a`
- Champs : `id`, `user_id`, `project_id`, `audio_url`, `transcription`, `analysis_data`, `created_at`

### 3.5 Devis & Factures ✅

**Écran :** `DocumentsScreen2.js`, `EditDevisScreen.js`

**Fonctionnalités :**
- ✅ Création manuelle devis/facture
- ✅ Création depuis note vocale (IA)
- ✅ Numérotation automatique :
  - Devis : `DE-YYYY-XXXX`
  - Factures : `FA-YYYY-XXXX`
- ✅ Statuts devis : `brouillon`, `envoyé`, `accepté`, `refusé`
- ✅ Statuts factures : `brouillon`, `envoyé`, `payé`, `impayée`
- ✅ Calcul HT → TTC automatique
- ✅ TVA personnalisable (5.5%, 10%, 20%)
- ✅ Lignes de devis (table `devis_lignes`)
- ✅ Génération PDF (3 templates)
- ✅ Mentions légales complètes :
  - SIRET, TVA intracommunautaire
  - Assurances (RCP, décennale)
  - CGV
  - Conditions de paiement
- ✅ Partage email / WhatsApp
- ✅ Signature électronique (lien public)
- ✅ Export comptable (CSV)

**Données stockées :**
- Table `devis` (Supabase)
- Table `devis_lignes` (Supabase)
- Champs devis : `id`, `user_id`, `project_id`, `client_id`, `numero`, `type`, `status`, `total_ht`, `tva_pourcent`, `total_ttc`, `created_at`

### 3.6 IA - Génération Devis ✅

**Composant :** `DevisAIGenerator2.js`

**Fonctionnalités :**
- ✅ Transcription vocale → texte (Whisper)
- ✅ Analyse transcription (détection type, extraction données)
- ✅ Génération devis structuré (GPT-4o-mini)
- ✅ Mode conversationnel (questions/réponses)
- ✅ Apprentissage des prix (historique utilisateur)
- ✅ Templates personnalisables par métier
- ✅ Validation avant création
- ✅ Édition manuelle après génération

**Workflow IA :**
1. Note vocale → Transcription Whisper
2. Analyse sémantique → Type + données extraites
3. Si type = "prestation" → Génération devis IA
4. Mode conversationnel (si infos manquantes)
5. Création devis avec lignes pré-remplies
6. Validation utilisateur → Création définitive

**Edge Functions utilisées :**
- `transcribe-audio` : Transcription Whisper
- `ai-devis-conversational` : Génération devis conversationnel
- `analyze-note` : Analyse sémantique

### 3.7 Partage Client ✅

**Service :** `projectShareService.js`, `shareService.js`

**Fonctionnalités :**
- ✅ Génération lien unique sécurisé (token)
- ✅ Vue client web (`/share/chantier/[token]`)
- ✅ Le client voit :
  - Nom et adresse du chantier
  - Photos (galerie)
  - Devis (liste + PDF)
  - Factures (liste + PDF)
- ✅ Pas d'app à installer côté client
- ✅ Mis à jour en temps réel
- ✅ Révocable à tout moment
- ✅ Statistiques de consultation
- ✅ Mode public (pas de login requis)

**Sécurité :**
- Token unique par chantier
- Validation côté serveur (Edge Function `public-project-view`)
- RLS Supabase pour protection données
- Token révocable

**Données stockées :**
- Table `project_shares` (Supabase)
- Champs : `id`, `project_id`, `token`, `is_active`, `created_at`, `last_accessed_at`

### 3.8 Signature Électronique ✅

**Écran :** `SignDevisScreen.js` (public)

**Fonctionnalités :**
- ✅ Lien public sécurisé pour signature
- ✅ Affichage devis PDF
- ✅ Formulaire signature (nom, prénom, email)
- ✅ Signature manuscrite (canvas)
- ✅ Validation et sauvegarde
- ✅ Confirmation email
- ✅ Mise à jour statut devis (`accepté`)

**Edge Function :** `sign-devis`

### 3.9 Mode Hors Ligne ✅

**Services :** `offlineManager.js`, `syncService.ts`, `offlineQueueService.ts`

**Fonctionnalités :**
- ✅ Détection réseau (Expo Network)
- ✅ Cache local (AsyncStorage)
- ✅ Queue d'upload (photos, notes, clients, chantiers)
- ✅ Synchronisation automatique au retour du réseau
- ✅ Indicateurs visuels (banner offline)
- ✅ Consultation données en cache
- ✅ Zéro perte de données
- ✅ Retry automatique (max 3 tentatives)

**Données mises en cache :**
- Clients
- Chantiers
- Photos (URLs)
- Notes
- Devis/Factures

**Queue d'upload :**
- Type : `photo`, `note`, `client`, `project`
- Retry : 3 tentatives max
- Sauvegarde : AsyncStorage (`@upload_queue`)

### 3.10 Paramètres ✅

**Écran :** `SettingsScreen.js`

**Fonctionnalités :**
- ✅ Informations entreprise :
  - Nom, SIRET, TVA intracommunautaire
  - Adresse, téléphone, email
  - Logo (upload image)
  - Assurances (RCP, décennale)
- ✅ Templates devis/factures
- ✅ Préférences utilisateur
- ✅ Gestion compte
- ✅ Suppression compte
- ✅ Déconnexion

**Données stockées :**
- Table `brand_settings` (Supabase)
- Champs : `user_id`, `company_name`, `siret`, `tva_number`, `address`, `phone`, `email`, `logo_url`, `rcp_insurance`, `decennial_insurance`

### 3.11 Import de Données ✅

**Écran :** `ImportDataScreen.tsx`

**Fonctionnalités :**
- ✅ Import CSV
- ✅ Import Excel
- ✅ Import contacts (annuaire téléphone)
- ✅ Scan carte visite (OCR via IA)
- ✅ Mapping automatique des colonnes
- ✅ Validation des données
- ✅ Prévisualisation avant import
- ✅ Import en lot

**Services :**
- `aiImportService.ts` : Analyse et mapping IA
- `documentImport.ts` : Traitement fichiers
- Edge Functions : `ai-import-analyze`, `ai-import-process`

---

## 4. Aspects Techniques

### 4.1 Stack Technique Détaillée

#### Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| React Native | 0.81.5 | Framework mobile |
| Expo | 54.0.22 | SDK et outils |
| React | 19.1.0 | Bibliothèque UI |
| React Navigation | v7.x | Navigation |
| Zustand | 5.0.8 | State management |
| React Hook Form | 7.53.0 | Formulaires |
| Zod | 3.25.76 | Validation |
| Framer Motion | 11.5.0 | Animations |

#### Backend

| Technologie | Version | Usage |
|-------------|---------|-------|
| Supabase | 2.79.0 | Backend as a Service |
| PostgreSQL | (Supabase) | Base de données |
| Supabase Storage | (Supabase) | Stockage fichiers |
| Edge Functions | (Supabase) | Serverless functions |

#### Intégrations

| Service | Usage |
|---------|-------|
| OpenAI Whisper | Transcription vocale |
| OpenAI GPT-4o-mini | Génération devis, analyse |
| RevenueCat | Gestion abonnements |
| Sentry | Monitoring erreurs |

### 4.2 Architecture Backend

#### Supabase

**Base de données :**
- PostgreSQL avec Row Level Security (RLS)
- 12+ tables principales
- Policies RLS pour isolation multi-tenant
- Indexes pour performance

**Tables principales :**
- `profiles` : Profils utilisateurs
- `clients` : Clients
- `projects` : Chantiers
- `project_photos` : Photos
- `notes` : Notes vocales
- `devis` : Devis
- `devis_lignes` : Lignes de devis
- `factures` : Factures
- `brand_settings` : Paramètres entreprise
- `project_shares` : Partages chantiers
- `devis_ai_sessions` : Sessions IA conversationnelles
- `user_price_stats` : Statistiques prix utilisateur

**Storage :**
- Bucket `photos` : Photos de chantiers
- Bucket `voices` : Enregistrements vocaux
- Bucket `logos` : Logos entreprises
- Policies RLS sur storage

**Edge Functions :**
- `transcribe-audio` : Transcription Whisper
- `ai-devis-conversational` : Génération devis IA
- `sign-devis` : Signature électronique
- `public-project-view` : Vue publique chantier
- `correct-text` : Correction orthographique
- `analyze-note` : Analyse sémantique
- `ai-import-analyze` : Analyse import
- `ai-import-process` : Traitement import

### 4.3 Performance et Optimisation

#### Optimisations Implémentées

1. **Images**
   - Compression automatique avant upload
   - Lazy loading dans les galeries
   - Cache local des URLs

2. **Réseau**
   - Queue d'upload offline
   - Retry automatique
   - Batch uploads quand possible

3. **Base de données**
   - Indexes sur colonnes fréquemment requêtées
   - Pagination des listes
   - Filtres côté serveur (RLS)

4. **State Management**
   - Zustand avec persistence AsyncStorage
   - Cache local des données
   - Refresh manuel disponible

5. **Code Splitting**
   - Lazy loading des écrans
   - Composants conditionnels (dev only)

### 4.4 Gestion des Erreurs

**Stratégie :**
- ErrorBoundary global (`ErrorBoundary.js`)
- Try/catch dans tous les services
- Logging centralisé (`logger.js`)
- Sentry pour tracking production
- Messages d'erreur utilisateur-friendly

**Types d'erreurs gérées :**
- Erreurs réseau (timeout, offline)
- Erreurs authentification
- Erreurs upload
- Erreurs API (OpenAI, Supabase)
- Erreurs validation (Zod)

---

## 5. Design et UX

### 5.1 Identité Visuelle

#### Couleurs

**Palette principale :**
- **Bleu principal** : `#1D4ED8` (accent, CTAs)
- **Bleu clair** : `#60A5FA` (hover, états actifs)
- **Bleu foncé** : `#1E3A8A` (boutons pressés)
- **Fond** : `#0F1115` (background principal)
- **Surface** : `#1A1D22` (cartes, inputs)
- **Surface élevée** : `#252A32` (modales)
- **Bordure** : `#2A2E35` (séparateurs)
- **Texte** : `#F9FAFB` (texte principal)
- **Texte secondaire** : `#D1D5DB` (texte secondaire)
- **Texte muted** : `#9CA3AF` (texte désactivé)

**États sémantiques :**
- **Succès** : `#10B981` (vert)
- **Erreur** : `#EF4444` (rouge)
- **Avertissement** : `#F59E0B` (orange)
- **Info** : `#3B82F6` (bleu info)

**Justification :**
- Design sombre optimisé pour usage terrain (plein soleil)
- Meilleur contraste pour lisibilité
- Cohérence avec le site web

#### Typographie

**Hiérarchie :**
- **H1** : 32px, weight 800
- **H2** : 28px, weight 700
- **H3** : 24px, weight 700
- **H4** : 20px, weight 600
- **Body** : 16px, weight 400
- **Body Small** : 14px, weight 400
- **Caption** : 12px, weight 500, uppercase

**Font :** System (Poppins/Inter via expo-font si disponible)

#### Espacements

- **xs** : 4px
- **sm** : 8px
- **md** : 12px
- **lg** : 16px
- **xl** : 24px
- **xxl** : 32px
- **xxxl** : 48px

#### Rayons de Bordure

- **sm** : 4px
- **md** : 8px
- **lg** : 12px
- **xl** : 16px
- **round** : 999px

### 5.2 Composants UI

#### Design System

**Composants principaux :**
- `Button.tsx` : Boutons (primary, secondary, outline)
- `Card.tsx` : Cartes avec ombre
- `Input.tsx` : Champs de saisie
- `Textarea.tsx` : Zones de texte
- `Badge.tsx` : Badges (statuts, tags)
- `Spinner.tsx` : Indicateurs de chargement
- `Toast.tsx` : Notifications toast

**Caractéristiques :**
- Cohérence visuelle
- Accessibilité (contraste, tailles)
- Animations fluides
- États (hover, press, disabled)

### 5.3 Navigation et Interactions

#### Navigation

- **Bottom Tabs** : 3 onglets principaux
- **Stacks** : Navigation hiérarchique
- **Modales** : Écrans modaux (galerie, signature)
- **Transitions** : Fade douces

#### Interactions

- **Haptics** : Feedback tactile (Expo Haptics)
- **Animations** : Transitions fluides (Framer Motion)
- **Gestures** : Swipe, long press
- **Pull to refresh** : Rafraîchissement manuel

### 5.4 Accessibilité

**Implémentations :**
- Contraste suffisant (WCAG AA)
- Tailles de touche minimales (44x44px)
- Labels accessibles
- Support lecteurs d'écran (iOS VoiceOver, Android TalkBack)

**À améliorer :**
- Tests avec lecteurs d'écran
- Navigation au clavier (Android TV)
- Support daltonisme

---

## 6. Sécurité et Multi-tenant

### 6.1 Isolation Multi-tenant

**Principe :** Chaque artisan ne voit QUE ses propres données.

#### Row Level Security (RLS)

**Activé sur toutes les tables :**
- `profiles`
- `brand_settings`
- `clients`
- `projects`
- `devis`
- `devis_lignes`
- `factures`
- `notes`
- `project_photos`
- `client_photos`
- `devis_ai_sessions`
- `devis_temp_ai`
- `user_price_stats`

**Policies RLS :**
- Filtrage automatique par `user_id = auth.uid()`
- SELECT : Lecture uniquement de ses données
- INSERT : Ajout automatique de `user_id`
- UPDATE : Modification uniquement de ses données
- DELETE : Suppression uniquement de ses données

**Exemple de policy :**
```sql
CREATE POLICY "Users can only see their own clients"
ON clients FOR SELECT
USING (user_id = auth.uid());
```

#### Vérifications Côté Client

**Toutes les requêtes filtrent par `user_id` :**
```javascript
const { data } = await supabase
  .from('clients')
  .select('*')
  .eq('user_id', userId); // ✅ Filtre obligatoire
```

**Store Zustand :**
- Vérification `user_id` avant chaque requête
- Ajout automatique de `user_id` à la création

### 6.2 Authentification

**Supabase Auth :**
- Email/password
- Session persistante (AsyncStorage)
- Auto-refresh token
- Détection session au démarrage

**Sécurité :**
- Mots de passe hashés (Supabase)
- Tokens JWT sécurisés
- Expiration session
- Déconnexion automatique si token invalide

### 6.3 Stockage Fichiers

**Supabase Storage :**
- Buckets séparés par type (`photos`, `voices`, `logos`)
- Policies RLS sur storage
- URLs signées pour accès temporaire
- Upload sécurisé (vérification `user_id`)

**Structure :**
```
photos/
  └── {user_id}/
      └── {project_id}/
          └── {filename}

voices/
  └── {user_id}/
      └── {project_id}/
          └── rec_{timestamp}.m4a
```

### 6.4 API Keys et Secrets

**Clés côté client (OK) :**
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**Clés sensibles (Edge Functions) :**
- `OPENAI_API_KEY` : Stockée dans secrets Supabase
- `REVENUECAT_API_KEY` : Stockée dans secrets Supabase

**⚠️ Important :** Les clés OpenAI ne sont JAMAIS exposées côté client. Tous les appels passent par les Edge Functions.

---

## 7. Services et Intégrations

### 7.1 Services Principaux

#### Transcription Vocale

**Service :** `transcriptionService.js`  
**Edge Function :** `transcribe-audio`

**Workflow :**
1. Upload audio → Supabase Storage
2. Appel Edge Function avec `filePath`
3. Edge Function télécharge depuis Storage
4. Appel OpenAI Whisper API
5. Retour transcription texte

**Sécurité :** Clé OpenAI dans secrets Supabase (pas côté client)

#### Génération Devis IA

**Service :** `aiConversationalService.js`  
**Edge Function :** `ai-devis-conversational`

**Workflow :**
1. Transcription → Analyse sémantique
2. Si type = "prestation" → Génération devis
3. Mode conversationnel (questions/réponses)
4. Création devis structuré avec lignes
5. Validation utilisateur

**Fonctionnalités :**
- Questions de clarification (max 5)
- Apprentissage prix utilisateur
- Templates par métier
- Validation avant création

#### Partage Client

**Service :** `projectShareService.js`  
**Edge Function :** `public-project-view`

**Workflow :**
1. Génération token unique
2. Création entrée `project_shares`
3. Lien public : `https://artisanflow.fr/share/chantier/{token}`
4. Validation token côté serveur
5. Récupération données projet (RLS)
6. Affichage vue client

#### Signature Électronique

**Service :** `signatureService.js`  
**Edge Function :** `sign-devis`

**Workflow :**
1. Lien public : `https://artisanflow.fr/sign/{token}`
2. Affichage devis PDF
3. Formulaire signature (nom, prénom, email)
4. Signature manuscrite (canvas)
5. Validation et sauvegarde
6. Mise à jour statut devis

### 7.2 Intégrations Externes

#### OpenAI

**Services utilisés :**
- **Whisper** : Transcription vocale
- **GPT-4o-mini** : Génération devis, analyse, correction

**Sécurité :**
- Clés API dans Edge Functions uniquement
- Pas d'exposition côté client
- Tracking usage (`openaiUsageTracker.js`)

#### RevenueCat

**Service :** `services/payments/revenuecat.ts`

**Fonctionnalités :**
- Vérification abonnement
- Gestion essai gratuit
- Synchronisation avec App Store / Play Store
- Callbacks webhooks

**État actuel :** Intégré, en attente activation système d'abonnement

#### Sentry

**Service :** `utils/sentryInit.js`

**Fonctionnalités :**
- Tracking erreurs production
- Stack traces
- Context utilisateur
- Performance monitoring

---

## 8. Navigation et Parcours Utilisateur

### 8.1 Parcours Typique

#### Premier Lancement

1. **SplashScreen** → Animation logo
2. **AuthScreen** → Inscription/Connexion
3. **OnboardingScreen** → Présentation fonctionnalités
4. **OnboardingPaywallScreen** → Essai gratuit (si activé)
5. **DashboardScreen** → Accueil

#### Utilisation Quotidienne

1. **DashboardScreen** → Vue d'ensemble
2. **CaptureHubScreen** → Capture photo/vocal
3. **ClientsListScreen** → Gestion clients
4. **ProjectDetailScreen** → Détail chantier
5. **DocumentsScreen** → Devis/Factures

### 8.2 Points d'Entrée Principaux

#### Capture Rapide

**Écran :** `CaptureHubScreen2.js`

**Actions possibles :**
- Photo (caméra/galerie)
- Note vocale
- Note texte
- Sélection chantier

#### Gestion Clients

**Écran :** `ClientsListScreen2.js`

**Actions possibles :**
- Créer client
- Rechercher client
- Voir détail client
- Créer chantier pour client

#### Documents

**Écran :** `DocumentsScreen2.js`

**Actions possibles :**
- Créer devis/facture
- Filtrer par statut
- Partager document
- Signer devis

### 8.3 Flux Critiques

#### Création Devis depuis Note Vocale

1. **CaptureHubScreen** → Enregistrer note vocale
2. Transcription automatique (Whisper)
3. Analyse sémantique (GPT-4o-mini)
4. Si type = "prestation" → Génération devis IA
5. Mode conversationnel (si besoin)
6. Validation → Création devis
7. Édition manuelle (optionnel)
8. Partage/Signature

#### Partage Chantier avec Client

1. **ProjectDetailScreen** → Bouton "Partager"
2. Génération lien unique
3. Copie lien / Partage direct
4. Client ouvre lien web
5. Vue client (photos, devis, factures)
6. Révocation possible à tout moment

---

## 9. State Management

### 9.1 Zustand Store

**Fichier :** `store/useAppStore.js`

**Structure :**

```javascript
{
  // Sélection actuelle
  currentClient: null,
  currentProject: null,
  
  // Données
  clients: [],
  projects: [],
  photos: [],
  notes: [],
  devis: [],
  factures: [],
  
  // Loading states
  loadingClients: false,
  loadingProjects: false,
  // ...
  
  // Errors
  error: null,
  
  // User
  user: null,
  
  // Actions
  loadClients: async () => {},
  addClient: async (data) => {},
  // ...
}
```

**Caractéristiques :**
- Persistence AsyncStorage
- Isolation multi-tenant (vérification `user_id`)
- Loading states pour chaque ressource
- Gestion erreurs centralisée

### 9.2 Actions Principales

#### Clients

- `loadClients()` : Charger tous les clients
- `addClient(data)` : Créer client
- `updateClient(id, updates)` : Modifier client
- `deleteClient(id)` : Supprimer client
- `setCurrentClient(client)` : Sélectionner client

#### Chantiers

- `loadProjects()` : Charger tous les chantiers
- `addProject(data)` : Créer chantier
- `updateProject(id, updates)` : Modifier chantier
- `deleteProject(id)` : Supprimer chantier
- `setCurrentProject(project)` : Sélectionner chantier

#### Photos

- `loadPhotos(projectId)` : Charger photos d'un chantier
- `addPhoto(photo)` : Ajouter photo (local)
- `deletePhoto(id)` : Supprimer photo

#### Notes

- `loadNotes(projectId)` : Charger notes d'un chantier
- `addNote(note)` : Ajouter note
- `updateNote(id, updates)` : Modifier note
- `deleteNote(id)` : Supprimer note

### 9.3 Synchronisation

**Stratégie :**
- Refresh manuel (pull to refresh)
- Refresh automatique après actions (create/update/delete)
- Cache local (AsyncStorage)
- Queue offline pour synchronisation différée

---

## 10. Mode Hors Ligne

### 10.1 Détection Réseau

**Service :** `utils/offlineManager.js`

**Fonctionnalités :**
- Détection réseau (Expo Network)
- Vérification périodique (toutes les 10 secondes)
- Indicateurs visuels (banner offline)
- Gestion automatique de la queue

### 10.2 Queue d'Upload

**Service :** `services/offlineQueueService.ts`

**Structure :**
```typescript
interface OfflineQueueItem {
  id: string;
  type: 'photo' | 'note' | 'client' | 'project';
  data: any;
  retries: number;
  synced: boolean;
  createdAt: number;
}
```

**Fonctionnalités :**
- Ajout automatique en queue si offline
- Sauvegarde AsyncStorage (`@upload_queue`)
- Retry automatique (max 3 tentatives)
- Traitement au retour du réseau
- Suppression après succès

### 10.3 Cache Local

**Données mises en cache :**
- Clients (AsyncStorage)
- Chantiers (AsyncStorage)
- Photos (URLs + métadonnées)
- Notes (transcriptions)
- Devis/Factures (liste)

**Stratégie :**
- Cache au chargement initial
- Refresh manuel disponible
- Invalidation après actions (create/update/delete)

### 10.4 Synchronisation Automatique

**Service :** `services/syncService.ts`

**Workflow :**
1. Détection retour réseau
2. Chargement queue depuis AsyncStorage
3. Traitement chaque élément (upload)
4. Retry si échec (max 3)
5. Suppression après succès
6. Notification utilisateur

**Fréquence :**
- Vérification toutes les 10 secondes
- Traitement immédiat au retour réseau
- Traitement au démarrage app (si connecté)

---

## 11. Intelligence Artificielle

### 11.1 Transcription Vocale

**Service :** OpenAI Whisper  
**Edge Function :** `transcribe-audio`

**Workflow :**
1. Enregistrement audio (M4A)
2. Upload Supabase Storage
3. Appel Edge Function avec `filePath`
4. Edge Function télécharge depuis Storage
5. Appel OpenAI Whisper API
6. Retour transcription texte

**Paramètres :**
- Modèle : `whisper-1`
- Langue : `fr` (français)
- Format : JSON

**Sécurité :**
- Clé API dans secrets Supabase
- Pas d'exposition côté client

### 11.2 Correction Orthographique

**Service :** OpenAI GPT-4o-mini  
**Edge Function :** `correct-text`

**Workflow :**
1. Transcription brute (Whisper)
2. Appel Edge Function avec texte
3. Appel GPT-4o-mini avec prompt correcteur
4. Retour texte corrigé

**Prompt système :**
```
Tu es un correcteur orthographique strict.
Corrige uniquement l'orthographe et la grammaire.
Ne change pas le sens, ne reformule pas.
```

### 11.3 Analyse Sémantique

**Service :** OpenAI GPT-4o-mini  
**Edge Function :** `analyze-note`

**Workflow :**
1. Transcription corrigée
2. Appel Edge Function avec texte
3. Appel GPT-4o-mini avec prompt analyseur
4. Retour JSON structuré

**Types détectés :**
- `prestation` : Travaux à réaliser
- `client_info` : Informations client
- `note_perso` : Notes personnelles

**Données extraites (si prestation) :**
- Catégorie (ex: peinture, électricité)
- Description
- Quantité
- Unité (m², m, h, pièce, unité)
- Détails

### 11.4 Génération Devis IA

**Service :** OpenAI GPT-4o-mini  
**Edge Function :** `ai-devis-conversational`

**Workflow :**
1. Analyse sémantique → Type = "prestation"
2. Appel Edge Function avec transcription + contexte
3. Mode conversationnel (questions/réponses)
4. Génération devis structuré (JSON)
5. Validation utilisateur
6. Création devis avec lignes

**Fonctionnalités :**
- Questions de clarification (max 5)
- Apprentissage prix utilisateur (historique)
- Templates par métier
- Génération prix réalistes (tarifs français 2025)

**Format sortie :**
```json
{
  "titre": "Titre du devis",
  "description": "Description détaillée",
  "lignes": [
    {
      "description": "Prestation",
      "quantite": 1,
      "unite": "m²",
      "prix_unitaire": 45.00,
      "prix_total": 45.00
    }
  ],
  "total_ht": 0,
  "tva_pourcent": 20.0,
  "tva_montant": 0,
  "total_ttc": 0,
  "questions_clarification": []
}
```

### 11.5 Apprentissage des Prix

**Service :** `services/aiLearningService.js`

**Fonctionnalités :**
- Analyse historique prix utilisateur
- Table `user_price_stats` (moyennes par catégorie)
- Suggestion prix basée sur historique
- Amélioration précision génération

**Données collectées :**
- Catégorie prestation
- Prix unitaire
- Quantité
- Unité
- Date

---

## 12. Configuration et Déploiement

### 12.1 Configuration Expo

**Fichier :** `app.config.js`

**Caractéristiques :**
- Configuration dynamique (DEV vs PROD)
- Bundle identifiers différents (DEV : `com.artisanflow.dev`)
- Versions : 1.0.1
- Build numbers : iOS 2, Android 2

**Permissions :**
- iOS : Microphone, Camera, Location, Photo Library
- Android : RECORD_AUDIO, CAMERA, ACCESS_FINE_LOCATION, READ/WRITE_EXTERNAL_STORAGE

### 12.2 Variables d'Environnement

**Côté client (OK) :**
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
EXPO_PUBLIC_SHARE_BASE_URL=https://artisanflow.fr
```

**Edge Functions (secrets Supabase) :**
```env
OPENAI_API_KEY=sk-xxx
REVENUECAT_API_KEY=xxx
```

### 12.3 Build et Déploiement

#### Développement

```bash
# Démarrer dev client
npm run start

# Build Android (local)
npm run rebuild:android

# Build iOS (local)
npm run ios
```

#### Production

**EAS Build :**
```bash
# Build Android
eas build --platform android --profile production

# Build iOS
eas build --platform ios --profile production
```

**Profiles (eas.json) :**
- `development` : Build dev client
- `preview` : Build preview (test)
- `production` : Build production (stores)

### 12.4 Stores

#### Google Play Store

**État :** ✅ Publié
- Package : `com.acontrecourant.artisanflow`
- Version : 1.0.1
- Version Code : 2

#### Apple App Store

**État :** En attente
- Bundle ID : `com.acontrecourant.artisanflow`
- Version : 1.0.1
- Build Number : 2

### 12.5 Mises à Jour

**Expo Updates :**
- OTA updates (Over-The-Air)
- Pas de rebuild nécessaire pour changements JS
- Runtime version : `appVersion`

**Workflow :**
1. Modification code
2. `eas update --branch production`
3. Déploiement automatique
4. Utilisateurs reçoivent update au prochain lancement

---

## 13. Tests et Qualité

### 13.1 Tests Actuels

**Tests manuels :**
- Parcours utilisateur complet
- Tests fonctionnels par écran
- Tests offline/online
- Tests multi-tenant (isolation)

**Tests automatisés :**
- `QATestRunnerScreen.js` (dev only)
- Tests RLS (isolation utilisateurs)
- Tests services (mocks)

### 13.2 Qualité du Code

**Linting :**
- ESLint configuré
- Règles strictes
- Formatage automatique

**TypeScript :**
- Migration progressive
- Types pour nouveaux fichiers
- Validation Zod

### 13.3 Monitoring

**Sentry :**
- Tracking erreurs production
- Stack traces
- Context utilisateur
- Performance monitoring

**Logs :**
- Logger centralisé (`logger.js`)
- Niveaux : info, warn, error, success
- Console en dev, Sentry en prod

### 13.4 Checklist Qualité

**Avant chaque release :**
- [ ] Tests manuels parcours complet
- [ ] Vérification isolation multi-tenant
- [ ] Tests offline/online
- [ ] Vérification permissions (iOS/Android)
- [ ] Tests sur device réel
- [ ] Vérification performance
- [ ] Review code
- [ ] Documentation à jour

---

## 14. Évolutions Prévues

### 14.1 Court Terme

1. **Système d'abonnement**
   - Activation RevenueCat
   - Essai gratuit 14 jours
   - Paywall fonctionnel

2. **Améliorations IA**
   - Meilleure précision transcription
   - Génération devis plus rapide
   - Apprentissage prix amélioré

3. **UX**
   - Onboarding amélioré
   - Tutoriels interactifs
   - Feedback utilisateur

### 14.2 Moyen Terme

1. **Nouvelles fonctionnalités**
   - Planning/Calendrier
   - Rappels automatiques
   - Export comptable avancé
   - Statistiques avancées

2. **Intégrations**
   - Comptabilité (Sage, Ciel)
   - CRM (HubSpot, Pipedrive)
   - Email marketing

3. **Performance**
   - Optimisation images
   - Cache amélioré
   - Lazy loading avancé

### 14.3 Long Terme

1. **Multi-plateforme**
   - Version web (PWA)
   - Version desktop (Electron)

2. **Collaboration**
   - Équipes multi-utilisateurs
   - Partage entre artisans
   - Marketplace templates

3. **IA Avancée**
   - Reconnaissance images (matériaux, travaux)
   - Prédiction prix automatique
   - Suggestions intelligentes

---

## 15. Annexes

### 15.1 Commandes Utiles

```bash
# Développement
npm run start              # Démarrer dev client
npm run android            # Lancer Android
npm run ios                # Lancer iOS

# Build
npm run rebuild:android    # Rebuild Android (local)
eas build --platform android --profile production

# Tests
npm test                   # Lancer tests
npm run lint               # Vérifier code

# Déploiement
eas update --branch production  # OTA update
eas submit --platform android   # Soumettre Play Store
```

### 15.2 Structure Base de Données

**Tables principales :**
- `profiles` : Profils utilisateurs
- `brand_settings` : Paramètres entreprise
- `clients` : Clients
- `projects` : Chantiers
- `project_photos` : Photos chantiers
- `client_photos` : Photos clients
- `notes` : Notes vocales
- `devis` : Devis
- `devis_lignes` : Lignes de devis
- `factures` : Factures
- `project_shares` : Partages chantiers
- `devis_ai_sessions` : Sessions IA
- `user_price_stats` : Statistiques prix

### 15.3 Edge Functions

**Liste complète :**
- `transcribe-audio` : Transcription Whisper
- `correct-text` : Correction orthographique
- `analyze-note` : Analyse sémantique
- `ai-devis-conversational` : Génération devis IA
- `sign-devis` : Signature électronique
- `public-project-view` : Vue publique chantier
- `ai-import-analyze` : Analyse import
- `ai-import-process` : Traitement import

### 15.4 Ressources

**Documentation :**
- 50+ fichiers dans `/docs`
- Guides détaillés par fonctionnalité
- Changelogs complets
- Audits techniques

**Support :**
- Email : acontrecourant25@gmail.com
- Documentation : `/docs`
- Issues : GitHub (si repo public)

---

**Fin de la documentation**

*Pour toute question ou mise à jour, contacter : acontrecourant25@gmail.com*

**Version :** 1.0.1  
**Dernière mise à jour :** 13 novembre 2025

