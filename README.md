# ArtisanFlow - Application de Gestion pour Artisans

Application React Native Expo pour gérer clients, chantiers, photos et notes vocales avec transcription.

## 🚀 Installation Rapide

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer Supabase

**IMPORTANT**: Exécutez le script SQL dans Supabase avant de lancer l'app !

1. Ouvrez votre projet Supabase
2. Allez dans **SQL Editor**
3. Exécutez le fichier `create_tables.sql` (copier/coller tout le contenu)
4. Vérifiez que toutes les tables sont créées

Tables créées :
- `clients` - Informations clients
- `projects` - Chantiers/projets
- `client_photos` - Photos par client
- `project_photos` - Photos par chantier
- `notes` - Notes vocales avec transcriptions
- `devis` - Devis avec numérotation automatique
- `factures` - Factures avec lien devis

### 3. Lancer l'application

```bash
# Démarrer avec cache propre
npx expo start -c
```

Scannez le QR code avec **Expo Go** sur votre téléphone.

## 📱 Fonctionnalités

### ✅ Implémenté

- **Clients**: Ajout, consultation, photos
- **Chantiers**: Ajout, consultation, photos, statuts (actif/pause/terminé)
- **Notes vocales**: Enregistrement, upload, transcription locale (Whisper)
- **Photos**: Capture caméra, galerie, suppression (clients + chantiers)
- **Devis**: Création, modification, statuts (brouillon/envoyé/accepté/refusé), transcription vocale
- **Factures**: Création, modification, statuts (brouillon/envoyé/payé/impayée), transcription vocale
- **Navigation**: Stack navigation avec écrans détail
- **Édition transcriptions**: Modification manuelle des transcriptions
- **Numérotation automatique**: DE-YYYY-XXXX (devis), FA-YYYY-XXXX (factures)
- **Calcul automatique**: HT → TTC avec TVA personnalisable

## 🛠️ Technologies

- **React Native** (Expo SDK 54)
- **Supabase** (Backend + Storage)
- **Whisper.rn** (Transcription vocale locale)
- **React Navigation** (Native Stack)
- **Expo Image Picker** (Caméra)
- **Expo AV** (Enregistrement audio)

## 📝 Configuration

### Supabase Client

Le fichier `supabaseClient.js` contient la configuration de connexion.

**Note**: Pour la production, ajoutez l'authentification utilisateur.

### Whisper.rn

- **Mode Expo Go**: Transcription désactivée (module natif)
- **Mode Build natif**: Transcription activée automatiquement
- **Modèle**: `ggml-tiny.en.bin` (anglais, téléchargement automatique)

## 🏗️ Build Production

### EAS Build (Recommandé)

```bash
# Login EAS
eas login

# Build Android
eas build --platform android --profile production
```

Configuration EAS dans `eas.json`.

## 📂 Structure

```
artisanflow/
├── App.js                    # Navigation principale + écrans
├── VoiceRecorder.js          # Notes vocales + Whisper
├── PhotoUploader.js          # Photos chantiers
├── PhotoUploaderClient.js    # Photos clients
├── DevisFactures.js          # Devis + Factures
├── supabaseClient.js         # Configuration Supabase
├── INIT_SUPABASE.sql         # Script complet Supabase
├── QUICK_START.md            # Guide démarrage rapide
├── SUPABASE_SETUP.md         # Documentation setup
├── PROBLEMES_COMMUNS.md      # Troubleshooting
├── README.md                 # Documentation principale
├── app.json                  # Config Expo
├── eas.json                  # Config EAS Build
└── package.json              # Dépendances
```

## 🐛 Troubleshooting

### Erreur RLS (Row Level Security)

Si vous voyez `new row violates row-level security policy` :

1. Exécutez `INIT_SUPABASE.sql` dans Supabase
2. RLS est automatiquement désactivé par le script

### Erreur "Whisper indisponible"

Normal en Expo Go. Les transcriptions ne fonctionnent que dans un build natif.

### Port 8081 occupé

Expo proposera automatiquement le port 8082.

## 📄 Licence

Private - ArtisanFlow

## 👤 Auteur

MVP Artisan

