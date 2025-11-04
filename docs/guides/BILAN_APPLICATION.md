# 📋 BILAN COMPLET DE L'APPLICATION ARTISANFLOW

**Date du bilan :** Janvier 2025  
**Statut :** MVP (Minimum Viable Product) en développement

---

## 📱 VUE D'ENSEMBLE

**ArtisanFlow** est une application mobile React Native (Expo) conçue pour les artisans du bâtiment en France. Elle permet de gérer les chantiers, clients, devis, factures et notes vocales avec transcription automatique et analyse IA.

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack technologique

- **Framework :** React Native avec Expo SDK ~54.0.20
- **Navigation :** React Navigation v7 (@react-navigation/native, bottom-tabs, native-stack)
- **Base de données :** Supabase (PostgreSQL + Storage)
- **Authentification :** Supabase Auth
- **IA / Transcription :** OpenAI API (Whisper pour transcription, GPT-4o-mini pour analyse)
- **État global :** Zustand
- **Audio :** expo-av (enregistrement et lecture)
- **Langage :** JavaScript (ES6+)

### Structure du projet

```
artisanflow/
├── App.js                    # Point d'entrée + navigation principale
├── supabaseClient.js         # Configuration Supabase
├── store/
│   └── useAppStore.js        # Store Zustand (état global)
├── screens/
│   ├── AuthScreen.js         # Écran de connexion/inscription
│   └── [autres écrans]
├── components/
│   ├── VoiceRecorder.js      # Composant notes vocales
│   ├── PhotoUploader.js      # Photos chantiers
│   ├── PhotoUploaderClient.js # Photos clients
│   └── DevisFactures.js      # Gestion devis/factures
├── config/
│   └── openai.js             # Configuration OpenAI (CLÉ API)
├── services/
│   ├── transcriptionService.js    # Service transcription Whisper
│   └── quoteAnalysisService.js    # Service analyse GPT
├── utils/
│   ├── logger.js             # Utilitaire de logging
│   ├── errorHandler.js       # Gestionnaire d'erreurs API
│   ├── ai_quote_generator.js # Génération devis depuis transcription
│   └── supabase_helpers.js   # Helpers Supabase
├── assets/                   # Images, logos
├── package.json              # Dépendances
├── app.json                  # Configuration Expo
├── eas.json                  # Configuration EAS Build
└── README.md                 # Documentation
```

---

## 🔐 AUTHENTIFICATION

### Implémentation

- **Service :** Supabase Auth
- **Écran :** `screens/AuthScreen.js`
- **Fonctionnalités :**
  - Inscription avec email/mot de passe
  - Connexion
  - Récupération de mot de passe (non implémenté)
  - Déconnexion

### État utilisateur

- Stocké dans Supabase Auth
- Récupéré via `supabase.auth.getUser()`
- Utilisé pour les RLS (Row Level Security) sur les données

---

## 👥 GESTION CLIENTS

### Fonctionnalités

- **Création de clients** avec nom, email, téléphone, adresse
- **Liste des clients** (tri, recherche possible)
- **Photos clients** via `PhotoUploaderClient.js`
- **Sélection client** dans le store Zustand (`currentClient`)

### Base de données

- **Table :** `clients`
- **Colonnes :** id, user_id, nom, email, telephone, adresse, created_at
- **Stockage photos :** Bucket Supabase Storage `clients`

---

## 🏗️ GESTION CHANTIERS

### Fonctionnalités

- **Création de chantiers** liés à un client
- **Liste des chantiers** par client
- **Photos chantiers** via `PhotoUploader.js`
- **Notes vocales** par chantier (voir section dédiée)
- **Sélection chantier** dans le store Zustand (`currentProject`)

### Base de données

- **Table :** `projects` (ou `chantiers`)
- **Colonnes :** id, client_id, user_id, nom, description, adresse, created_at
- **Stockage photos :** Bucket Supabase Storage `chantiers`
- **Stockage audio :** Bucket Supabase Storage `voices`

---

## 🎤 NOTES VOCALES (SYSTÈME PRINCIPAL)

### Workflow complet

1. **Enregistrement audio**
   - Utilise `expo-av` (Audio.Recording)
   - Format : M4A, haute qualité
   - Durée minimale : 2 secondes
   - Stockage temporaire local

2. **Upload audio**
   - Upload vers Supabase Storage (bucket `voices`)
   - Nom de fichier : `rec_{projectId}_{timestamp}.m4a`

3. **Transcription (OpenAI Whisper)**
   - Service : `services/transcriptionService.js`
   - API : OpenAI Whisper API (model `whisper-1`)
   - Langue : Français forcé
   - Format de réponse : JSON

4. **Analyse intelligente (GPT-4o-mini)**
   - Service : `services/quoteAnalysisService.js`
   - API : OpenAI Chat Completions (model `gpt-4o-mini`)
   - Types détectés :
     - `prestation` : Travaux facturables (peinture, électricité, etc.)
     - `client_info` : Préférences client
     - `note_perso` : Notes personnelles artisan
   - Données extraites pour prestations :
     - `categorie` : Type de travaux
     - `description` : Description courte
     - `quantite` : Nombre/surface
     - `unite` : m², m, pièce, h, etc.
     - `details` : Détails importants

5. **Sauvegarde**
   - Table : `notes`
   - Colonnes : id, project_id, client_id, user_id, type, storage_path, transcription, analysis_data, created_at
   - `analysis_data` : JSON stringifié de l'analyse GPT

6. **Génération devis automatique (si prestation)**
   - Utilise `utils/ai_quote_generator.js`
   - Détecte prestations dans la transcription
   - Crée un devis automatiquement via `insertAutoQuote()`

### Composant principal

**Fichier :** `VoiceRecorder.js`

**États :**
- `recording` : Objet Audio.Recording en cours
- `recordUri` : URI du fichier audio enregistré
- `transcription` : Texte transcrit
- `isTranscribing` : Booléen (transcription en cours)
- `transcriptionStatus` : Message de statut
- `transcriptionProgress` : Pourcentage (0-100)
- `analysisResult` : Résultat de l'analyse GPT

**Fonctions principales :**
- `startRecording()` : Démarre l'enregistrement audio
- `stopRecording()` : Arrête l'enregistrement
- `uploadAndSave()` : Upload + transcription + analyse + sauvegarde
- `play()` : Lecture audio d'une note existante

**UI :**
- Bouton Enregistrer/Stop
- Bouton Envoyer (désactivé pendant transcription)
- Overlay de progression pendant transcription
- Affichage de la transcription
- Badge type de note (prestation/info client/note perso)
- Liste des notes précédentes avec édition possible

### Configuration OpenAI

**Fichier :** `config/openai.js` (⚠️ NON COMMITTÉ dans Git)

```javascript
export const OPENAI_CONFIG = {
  apiKey: 'sk-proj-...', // Clé API OpenAI
  apiUrl: 'https://api.openai.com/v1',
  models: {
    whisper: 'whisper-1',
    gpt: 'gpt-4o-mini'
  }
};
```

**⚠️ IMPORTANT :** Ce fichier est dans `.gitignore` pour éviter de commiter la clé API.

### Problème connu

**❌ Détection de prestations non fonctionnelle**

- **Symptôme :** L'analyse GPT fonctionne mais ne détecte pas correctement les prestations
- **Cause probable :** 
  - Le prompt système dans `quoteAnalysisService.js` n'est pas assez précis
  - Le parsing du JSON de réponse GPT échoue
  - La logique de détection dans `VoiceRecorder.js` est incorrecte
- **À investiguer :** 
  - Logs de l'analyse GPT (`console.log('[Analyse] Résultat:', result)`)
  - Format JSON retourné par GPT
  - Correspondance entre l'analyse et la génération de devis

---

## 📄 DEVIS ET FACTURES

### Composant

**Fichier :** `DevisFactures.js`

### Fonctionnalités

- **Création de devis** manuellement
- **Création de factures** depuis devis
- **Édition** devis/factures
- **Export PDF** (via expo-print)
- **Génération automatique** depuis notes vocales (via `insertAutoQuote()`)

### Base de données

- **Table :** `devis` et `factures`
- **Colonnes typiques :** id, client_id, project_id, numero, date, services (JSON), total_ht, total_ttc, status

### Génération automatique

**Fichier :** `utils/ai_quote_generator.js`

- Parse la transcription pour détecter prestations
- Extrait quantités, unités, descriptions
- Génère un devis structuré
- Utilisé par `insertAutoQuote()` dans `utils/supabase_helpers.js`

---

## 📸 GESTION PHOTOS

### Composants

1. **PhotoUploader.js** (photos chantiers)
   - Utilise `expo-image-picker`
   - Upload vers bucket `chantiers`
   - Affichage dans galerie

2. **PhotoUploaderClient.js** (photos clients)
   - Utilise `expo-image-picker`
   - Upload vers bucket `clients`
   - Affichage dans galerie

### Stockage

- **Service :** Supabase Storage
- **Buckets :** `chantiers`, `clients`
- **Format :** Images (JPEG, PNG)
- **URLs :** URLs publiques ou signées selon configuration

---

## 🗄️ BASE DE DONNÉES SUPABASE

### Tables principales

1. **clients**
   - id (uuid, PK)
   - user_id (uuid, FK → auth.users)
   - nom (text)
   - email (text)
   - telephone (text)
   - adresse (text)
   - created_at (timestamp)

2. **projects** (ou `chantiers`)
   - id (uuid, PK)
   - client_id (uuid, FK → clients.id)
   - user_id (uuid, FK → auth.users)
   - nom (text)
   - description (text)
   - adresse (text)
   - created_at (timestamp)

3. **notes**
   - id (uuid, PK)
   - project_id (uuid, FK → projects.id)
   - client_id (uuid, FK → clients.id)
   - user_id (uuid, FK → auth.users)
   - type (text) : 'voice'
   - storage_path (text) : Chemin fichier audio
   - transcription (text) : Texte transcrit
   - analysis_data (text) : JSON de l'analyse GPT ⚠️ NOUVELLE COLONNE
   - created_at (timestamp)
   - duration_ms (integer) : Durée audio

4. **devis**
   - id (uuid, PK)
   - client_id (uuid, FK)
   - project_id (uuid, FK)
   - numero (text)
   - date (date)
   - services (jsonb) : Array de prestations
   - total_ht (numeric)
   - total_ttc (numeric)
   - status (text)

5. **factures**
   - Similar structure to devis

### Row Level Security (RLS)

- Toutes les tables ont RLS activé
- Utilisateurs ne voient que leurs propres données
- Basé sur `user_id` = `auth.uid()`

### Storage Buckets

- **chantiers** : Photos de chantiers
- **clients** : Photos de clients
- **voices** : Fichiers audio des notes vocales

---

## 🎨 INTERFACE UTILISATEUR

### Design

- **Thème :** Mode sombre natif (dark mode)
- **Couleurs principales :**
  - Fond : #0F1115, #1A1D22
  - Texte : #EAEAEA, #D1D5DB
  - Accents : #1D4ED8 (bleu), #10B981 (vert)
  - Boutons : Bleu primaire, rouge pour stop

### Navigation

- **Bottom Tabs** : Navigation principale
- **Stack Navigation** : Navigation entre écrans
- **Écrans principaux :**
  - Auth (connexion)
  - Clients
  - Chantiers
  - Notes vocales
  - Devis/Factures
  - Photos

### Composants UI

- Boutons personnalisés
- Cards pour affichage données
- Liste scrollable (FlatList)
- Modals/Alertes (Alert.alert)
- ActivityIndicator pour chargement
- Overlay de transcription avec progression

---

## 🔧 CONFIGURATION ET DÉPLOIEMENT

### Expo Configuration

**Fichier :** `app.json`

- **SDK Version :** ~54.0.20
- **Platforms :** iOS, Android
- **Dev Client :** Activé (build natif requis pour modules)

### EAS Build

**Fichier :** `eas.json`

- **Profiles :** development, preview, production
- **Build local Android :** `npm run rebuild:android`

### Scripts disponibles

```json
{
  "start": "expo start --dev-client --clear",
  "start:safe": "Script PowerShell libération port 8081",
  "start:tunnel": "Expo en mode tunnel",
  "kill:port": "Libère le port 8081",
  "android": "expo run:android",
  "rebuild:android": "eas build --platform android --profile development --local"
}
```

### PowerShell Scripts

- `kill-port-8081.ps1` : Libère le port 8081
- `start-dev.ps1` : Démarre Expo avec nettoyage port
- `start-tunnel.ps1` : Démarre Expo en tunnel
- `install-artisanflow.ps1` : Installation APK Android

---

## 📦 DÉPENDANCES PRINCIPALES

```json
{
  "expo": "~54.0.20",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "@supabase/supabase-js": "^2.77.0",
  "expo-av": "~16.0.7",
  "expo-image-picker": "~17.0.8",
  "expo-print": "~15.0.7",
  "@react-navigation/native": "^7.1.19",
  "@react-navigation/bottom-tabs": "^7.7.2",
  "zustand": "^5.0.8"
}
```

---

## 🔄 WORKFLOWS PRINCIPAUX

### Workflow 1 : Création client

1. User clique "Nouveau client"
2. Saisit nom, email, téléphone, adresse
3. Sauvegarde dans table `clients` (Supabase)
4. Client apparaît dans liste

### Workflow 2 : Création chantier

1. User sélectionne un client
2. Crée un nouveau chantier
3. Sauvegarde dans table `projects`
4. Chantier lié au client

### Workflow 3 : Note vocale complète (PRINCIPAL)

1. User sélectionne client + chantier
2. Clique "Enregistrer" dans VoiceRecorder
3. Parle dans le micro
4. Clique "Stop"
5. Clique "Envoyer"
6. **Upload audio** → Supabase Storage
7. **Transcription** → OpenAI Whisper API
8. **Analyse** → OpenAI GPT-4o-mini
9. **Détection type** → prestation/client_info/note_perso
10. **Sauvegarde** → Table `notes` (transcription + analysis_data)
11. **Si prestation** → Génération devis automatique
12. **Affichage** → Transcription + badge type dans UI

### Workflow 4 : Génération devis depuis note

1. Note vocale analysée comme "prestation"
2. Extraction données (categorie, description, quantite, unite)
3. Calcul prix (via tarifs ou logique métier)
4. Création devis dans table `devis`
5. Notification user "Devis généré ✅"

---

## �� EXEMPLES DE CODE DÉTAILLÉS

### 1. Service de Transcription (OpenAI Whisper)

**Fichier :** `services/transcriptionService.js`

```javascript
import { OPENAI_CONFIG } from '../config/openai';

/**
 * Transcrit un audio avec Whisper API
 * @param {string} audioUri - Chemin vers le fichier audio M4A
 * @returns {Promise<string>} Texte transcrit
 */
export const transcribeAudio = async (audioUri) => {
  try {
    console.log('[Transcription] Début:', audioUri);

    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'audio.m4a'
    });
    formData.append('model', OPENAI_CONFIG.models.whisper);
    formData.append('language', 'fr');
    formData.append('response_format', 'json');

    const response = await fetch(
      `${OPENAI_CONFIG.apiUrl}/audio/transcriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`,
        },
        body: formData
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Whisper API error: ${error.error?.message || response.status}`);
    }

    const data = await response.json();
    console.log('[Transcription] Succès:', data.text);

    return data.text;

  } catch (error) {
    console.error('[Transcription] Erreur:', error);
    throw error;
  }
};
```

### 2. Service d'Analyse Intelligente (GPT-4o-mini)

**Fichier :** `services/quoteAnalysisService.js`

```javascript
import { OPENAI_CONFIG } from '../config/openai';

/**
 * Analyse une note vocale et détermine le type (prestation/client_info/note_perso)
 */
export const analyzeNote = async (noteText) => {
  try {
    console.log('[Analyse] Texte:', noteText);

    const response = await fetch(
      `${OPENAI_CONFIG.apiUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: OPENAI_CONFIG.models.gpt,
          messages: [
            {
              role: 'system',
              content: `Tu es un assistant IA pour artisans du bâtiment en France.
MISSION : Analyser une note vocale et déterminer son type.

TYPES POSSIBLES :
1. "prestation" : Travaux facturables (peinture, électricité, plomberie, etc.)
2. "client_info" : Préférences/détails du client (couleur, matériaux, style, etc.)
3. "note_perso" : Notes personnelles de l'artisan (RDV, rappels, outils, etc.)

POUR LES PRESTATIONS, EXTRAIRE :
- categorie : Type de travaux (Peinture, Électricité, Plomberie, Maçonnerie, Menuiserie, Carrelage, Plâtrerie, etc.)
- description : Description courte et claire
- quantite : Nombre/Surface (extraire uniquement si mentionné)
- unite : m², m, pièce, h, unité, ml, etc.
- details : Détails importants (nb couches, type matériau, etc.)

EXEMPLES :
Note: "Salon à repeindre, 20m², deux couches, peinture blanche mate"
→ Type: prestation
→ Données: {
  "categorie": "Peinture",
  "description": "Peinture salon",
  "quantite": 20,
  "unite": "m²",
  "details": "2 couches, blanc mat"
}

Note: "3 prises électriques à installer dans la cuisine"
→ Type: prestation
→ Données: {
  "categorie": "Électricité",
  "description": "Installation prises cuisine",
  "quantite": 3,
  "unite": "pièce",
  "details": "cuisine"
}

Note: "Le client préfère du parquet en chêne clair"
→ Type: client_info
→ Données: {
  "info": "Préfère parquet chêne clair"
}

IMPORTANT :
- Retourne UNIQUEMENT un JSON valide
- Pas de texte avant ou après le JSON
- Si incertain sur la quantité, ne pas inventer, mettre null`
            },
            {
              role: 'user',
              content: noteText
            }
          ],
          temperature: 0.3,
          response_format: { type: "json_object" }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GPT API error: ${error.error?.message || response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    console.log('[Analyse] Résultat:', result);
    return result;

  } catch (error) {
    console.error('[Analyse] Erreur:', error);
    // En cas d'erreur, considérer comme note perso par défaut
    return {
      type: 'note_perso',
      note: noteText
    };
  }
};
```

### 3. Fonction uploadAndSave dans VoiceRecorder.js

**Fichier :** `VoiceRecorder.js` (extrait de la fonction principale)

```javascript
const uploadAndSave = async () => {
  if (!recordUri || !currentProject || !currentClient) {
    Alert.alert('Erreur', 'Sélectionnez un client et un chantier.');
    return;
  }

  setUploading(true);

  try {
    // Upload vers Supabase Storage
    const fileName = `rec_${currentProject.id}_${Date.now()}.m4a`;
    const file = await fetch(recordUri).then(r => r.blob());
    
    const { data: up, error: upErr } = await supabase.storage
      .from('voices')
      .upload(fileName, file, { contentType: 'audio/m4a' });

    if (upErr) throw upErr;

    // ÉTAPE 1 : Transcription avec OpenAI Whisper
    setIsTranscribing(true);
    setTranscriptionStatus('🎤 Transcription en cours...');
    setTranscriptionProgress(30);

    let transcribedText = '';
    let analysis = null;

    try {
      transcribedText = await transcribeAudio(recordUri);
      console.log('[VoiceRecorder] Transcription:', transcribedText);

      setTranscriptionProgress(60);
      setTranscriptionStatus('🧠 Analyse de la note...');

      // ÉTAPE 2 : Analyse de la note avec GPT
      if (transcribedText && transcribedText.trim()) {
        analysis = await analyzeNote(transcribedText);
        console.log('[VoiceRecorder] Analyse:', analysis);
        setAnalysisResult(analysis);
      }

      setTranscriptionProgress(100);
      setTranscriptionStatus('✅ Terminé !');

      setTranscription(transcribedText);

    } catch (transcribeError) {
      console.error('[VoiceRecorder] Erreur transcription/analyse:', transcribeError);

      const errorInfo = handleAPIError(transcribeError, 'VoiceRecorder');

      // Continuer quand même avec une transcription vide
      transcribedText = '';
      analysis = {
        type: 'note_perso',
        note: 'Transcription échouée - À compléter manuellement'
      };

      Alert.alert(
        errorInfo.title || 'Erreur de transcription',
        errorInfo.message || 'L\'audio a été sauvegardé mais la transcription a échoué.',
        errorInfo.retry ? [
          { text: 'OK' },
          { text: 'Réessayer', onPress: () => {
            setTimeout(() => uploadAndSave(), 500);
          }}
        ] : [{ text: 'OK' }]
      );
    }

    // ÉTAPE 3 : Sauvegarder la note vocale
    const { data: { user } } = await supabase.auth.getUser();

    const noteData = {
      project_id: currentProject.id,
      client_id: currentClient.id,
      user_id: user?.id,
      type: 'voice',
      storage_path: up?.path || fileName,
      transcription: transcribedText || null,
      analysis_data: analysis ? JSON.stringify(analysis) : null,
    };

    const { error: insErr } = await supabase.from('notes').insert([noteData]);
    if (insErr) {
      logger.error('VoiceRecorder', 'Erreur insertion DB', insErr);
      throw new Error(`Erreur sauvegarde: ${insErr.message}`);
    }

    setRecordUri(null);
    setDurationMs(0);
    setTranscription('');
    setAnalysisResult(null);

    await loadNotes();

    // ÉTAPE 4 : Générer un devis automatiquement si prestation détectée
    let alertTitle = '✅ Note vocale envoyée.';
    let alertMessage = transcribedText ? `Transcription:\n${transcribedText}` : '';

    if (analysis && analysis.type === 'prestation' && transcribedText && transcribedText.trim()) {
      logger.info('VoiceRecorder', 'Prestation détectée, génération devis automatique');

      try {
        const quoteData = generateQuoteFromTranscription(
          transcribedText, 
          currentProject.id, 
          currentClient.id, 
          20
        );

        if (quoteData && quoteData.services && quoteData.services.length > 0) {
          const devisCreated = await insertAutoQuote(
            currentProject.id,
            currentClient.id,
            quoteData.services,
            quoteData.totals,
            transcribedText,
            20
          );

          if (devisCreated) {
            alertTitle = '🤖 Devis automatique généré ✅.';
            alertMessage = 
              `Note vocale envoyée ✅.\n\n` +
              `🎯 ${quoteData.services.length} prestation(s) détectée(s)\n\n` +
              `Total HT: ${quoteData.totals.totalHT.toFixed(2)} €\n` +
              `Total TTC: ${quoteData.totals.totalTTC.toFixed(2)} €\n\n` +
              `📄 Devis ${devisCreated.numero} créé.`;
          }
        }
      } catch (quoteError) {
        console.error('[VoiceRecorder] Erreur génération devis:', quoteError);
      }
    } else if (analysis && analysis.type === 'client_info') {
      alertTitle = 'ℹ️ Info client enregistrée';
      alertMessage = `Note vocale sauvegardée.\n\nInfo client: ${analysis.info || transcribedText}`;
    }

    Alert.alert(alertTitle, alertMessage);

  } catch (e) {
    logger.error('VoiceRecorder', 'Erreur uploadAndSave', e);
    Alert.alert('Erreur', e?.message || 'Upload impossible.');
  } finally {
    setUploading(false);
    setIsTranscribing(false);
    setTranscriptionStatus('');
    setTranscriptionProgress(0);
  }
};
```

### 4. Configuration OpenAI

**Fichier :** `config/openai.js`

```javascript
// NE PAS COMMITER CETTE CLÉ - AJOUTER .env AU .gitignore

export const OPENAI_CONFIG = {
  apiKey: 'sk-proj-VOTRE_CLE_ICI', // À remplacer par votre clé API OpenAI
  apiUrl: 'https://api.openai.com/v1',
  models: {
    whisper: 'whisper-1',
    gpt: 'gpt-4o-mini' // Moins cher, rapide, précis
  }
};
```

### 5. Gestionnaire d'Erreurs API

**Fichier :** `utils/errorHandler.js`

```javascript
export const handleAPIError = (error, context) => {
  console.error(`[${context}] Erreur:`, error);

  if (error.message?.includes('quota')) {
    return {
      title: 'Quota dépassé',
      message: 'Votre quota d\'API OpenAI est dépassé. Vérifiez votre compte.',
      retry: false
    };
  }

  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return {
      title: 'Pas de connexion',
      message: 'Vérifiez votre connexion internet et réessayez.',
      retry: true
    };
  }

  if (error.message?.includes('401') || error.message?.includes('API key')) {
    return {
      title: 'Erreur d\'authentification',
      message: 'Clé API invalide. Vérifiez votre configuration dans config/openai.js',
      retry: false
    };
  }

  return {
    title: 'Erreur',
    message: 'Une erreur est survenue. Réessayez plus tard.',
    retry: true
  };
};
```

### 6. Schéma Base de Données Supabase

**Table `notes` (avec nouvelle colonne analysis_data) :**

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  client_id UUID NOT NULL,
  user_id UUID,
  type TEXT NOT NULL DEFAULT 'voice',
  storage_path TEXT,
  transcription TEXT,
  analysis_data TEXT, -- JSON stringifié de l'analyse GPT ⚠️ NOUVELLE COLONNE
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_ms INTEGER,
  
  CONSTRAINT fk_notes_project FOREIGN KEY (project_id) 
    REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_notes_client FOREIGN KEY (client_id) 
    REFERENCES clients(id) ON DELETE CASCADE
);

-- Ajouter la colonne si elle n'existe pas
ALTER TABLE notes ADD COLUMN IF NOT EXISTS analysis_data TEXT;
```

### 7. Store Zustand (État Global)

**Fichier :** `store/useAppStore.js` (exemple)

```javascript
import { create } from 'zustand';

export const useAppStore = create((set) => ({
  currentClient: null,
  currentProject: null,
  
  setCurrentClient: (client) => set({ currentClient: client }),
  setCurrentProject: (project) => set({ currentProject: project }),
  
  clearSelection: () => set({ 
    currentClient: null, 
    currentProject: null 
  }),
}));
```

### 8. Exemple d'Utilisation dans VoiceRecorder

```javascript
import { useAppStore } from './store/useAppStore';

export default function VoiceRecorder({ projectId }) {
  const { currentClient, currentProject } = useAppStore();
  
  // Utilisation dans uploadAndSave()
  const noteData = {
    project_id: currentProject.id,
    client_id: currentClient.id,
    // ...
  };
}
```

---

## �� PROBLÈMES CONNUS

### 1. Détection de prestations non fonctionnelle ⚠️

- **Statut :** NON RÉSOLU
- **Description :** L'analyse GPT fonctionne mais ne détecte pas correctement les prestations pour générer automatiquement un devis
- **Symptômes :** 
  - La transcription fonctionne ✅
  - L'analyse GPT retourne un résultat ✅
  - Mais la détection de type "prestation" échoue ❌
  - Le devis automatique ne se génère pas ❌
- **Cause possible :** 
  - Format JSON retourné par GPT ne correspond pas à ce qui est attendu
  - Logique de détection dans `VoiceRecorder.js` ligne ~XXX incorrecte
  - Le prompt système dans `quoteAnalysisService.js` n'est pas assez précis
- **À investiguer :** 
  - Logs console `[Analyse] Résultat:`
  - Structure exacte du JSON retourné par GPT
  - Comparaison avec ce qui est attendu dans `generateQuoteFromTranscription()`

### 2. Modules natifs requis

- **Description :** Certains packages nécessitent un build natif (pas compatible Expo Go)
- **Solution :** Utiliser `expo-dev-client` avec build natif
- **Status :** ✅ RÉSOLU (dev client configuré)

---

## 🔮 FONCTIONNALITÉS À VENIR / AMÉLIORATIONS

### Court terme

- [ ] **Corriger la détection de prestations** (PRIORITÉ 1)
- [ ] Améliorer le prompt système GPT pour meilleure détection
- [ ] Ajouter retry automatique en cas d'erreur transcription
- [ ] Interface de retranscription manuelle pour notes échouées

### Moyen terme

- [ ] Écran chantier avec vue dual (notes | devis) comme décrit dans les specs
- [ ] Export PDF amélioré pour devis/factures
- [ ] Recherche dans notes/clients/chantiers
- [ ] Filtres par type de note

### Long terme

- [ ] Mode hors ligne avec sync
- [ ] Notifications push
- [ ] Statistiques et rapports
- [ ] Multi-utilisateurs (équipe)

---

## 📝 NOTES IMPORTANTES POUR DÉVELOPPEMENT

### Clé API OpenAI

- **Localisation :** `config/openai.js`
- **⚠️ NE JAMAIS COMMITER** (dans .gitignore)
- **Format :** `sk-proj-...`
- **Coût approximatif :**
  - Whisper : ~$0.006/minute audio
  - GPT-4o-mini : ~$0.15/1M tokens input

### Supabase

- **URL/Keys :** Dans `supabaseClient.js`
- **RLS :** Actif sur toutes les tables
- **Storage :** 3 buckets configurés

### Build et déploiement

- **Android :** Build local via EAS ou `expo run:android`
- **iOS :** Nécessite Mac + Xcode
- **APK :** Généré via EAS Build

### Débogage

- **Logs :** Console Expo/Metro
- **Logger utilitaire :** `utils/logger.js`
- **Erreurs API :** Gérées par `utils/errorHandler.js`

---

## 🔗 FICHIERS CLÉS À CONNAÎTRE

1. **VoiceRecorder.js** : Composant principal notes vocales
2. **transcriptionService.js** : Appel API Whisper
3. **quoteAnalysisService.js** : Appel API GPT pour analyse
4. **config/openai.js** : Configuration API (⚠️ clé sensible)
5. **supabaseClient.js** : Configuration Supabase
6. **useAppStore.js** : État global (client/chantier sélectionnés)
7. **ai_quote_generator.js** : Génération devis depuis transcription

---

## 📚 DOCUMENTATION EXTERNE

- **Expo :** https://docs.expo.dev
- **Supabase :** https://supabase.com/docs
- **OpenAI API :** https://platform.openai.com/docs
- **React Navigation :** https://reactnavigation.org

---

## ✅ CHECKLIST POUR NOUVEAU DÉVELOPPEUR

- [ ] Installer Node.js et Expo CLI
- [ ] Cloner le repo
- [ ] `npm install`
- [ ] Configurer clé OpenAI dans `config/openai.js`
- [ ] Configurer Supabase dans `supabaseClient.js`
- [ ] `npm start` (dev client requis)
- [ ] Tester enregistrement note vocale
- [ ] Vérifier logs transcription/analyse
- [ ] Comprendre le problème de détection prestations
- [ ] Lire ce document en entier 😊

---

## 🎯 PROCHAINES ÉTAPES RECOMMANDÉES

1. **PRIORITÉ 1 :** Corriger la détection de prestations
   - Analyser les logs GPT pour voir le format exact retourné
   - Comparer avec ce qui est attendu dans `generateQuoteFromTranscription()`
   - Ajuster le prompt système ou la logique de parsing

2. **PRIORITÉ 2 :** Tester différents exemples de notes vocales
   - Prestation simple : "Salon à repeindre, 20m²"
   - Prestation complexe : "3 prises électriques cuisine, câblage encastré"
   - Info client : "Client préfère parquet chêne clair"
   - Note perso : "RDV mardi 14h"

3. **PRIORITÉ 3 :** Améliorer l'UX
   - Ajouter feedback visuel si prestation détectée
   - Améliorer messages d'erreur
   - Ajouter possibilité de corriger transcription manuellement

---

**Fin du bilan - Version 1.0 - Janvier 2025**
