# 🚀 Commandes pour Build ArtisanFlow

## ⚡ Étape 1 : Se connecter à EAS

```bash
eas login
```

Entrez vos identifiants Expo (créer un compte gratuit si besoin).

---

## 📦 Option A : Build Cloud (Recommandé - Rapide)

### Preview APK (Test rapide)
```bash
eas build --platform android --profile preview
```
- ✅ Build sur les serveurs Expo (environ 15-20 minutes)
- ✅ Lien de téléchargement fourni
- ✅ Whisper.rn ✅ activé

### Production AAB (Play Store)
```bash
eas build --platform android --profile production
```
- ✅ Build optimisé pour Play Store
- ✅ Whisper.rn ✅ activé

---

## 🔧 Option B : Build Local (Sur votre PC)

### Prérequis
1. Android Studio installé
2. SDK Android configuré
3. Variables d'environnement ANDROID_HOME

### Build local preview
```bash
eas build --platform android --profile preview --local
```
- ⚠️ Requiert configuration Android complète
- ✅ Plus rapide si déjà configuré
- ✅ Whisper.rn ✅ activé

---

## 📱 Installation sur Téléphone

### Méthode 1 : Download direct
1. Après le build, EAS fournit un lien QR code
2. Scannez avec votre téléphone
3. Téléchargez l'APK
4. Installez (autorisez sources inconnues)

### Méthode 2 : USB (si build local)
```bash
adb install android-build/app-debug.apk
```

### Méthode 3 : Expo Go (⚠️ Sans Whisper)
```bash
npx expo start -c
```
- Scannez le QR code avec Expo Go
- ✅ Fonctionne pour test interface
- ❌ Whisper désactivé

---

## 🎯 Résumé : Que tester dans chaque mode ?

| Fonctionnalité | Expo Go | Build Natif |
|----------------|---------|-------------|
| Clients/Chantiers | ✅ | ✅ |
| Photos | ✅ | ✅ |
| Notes vocales (enregistrer) | ✅ | ✅ |
| Notes vocales (lire) | ✅ | ✅ |
| **Notes vocales (transcrire)** | ❌ | ✅ |
| Devis/Factures | ✅ | ✅ |
| **Transcription devis/factures** | ❌ | ✅ |

---

## ⏱️ Temps de build

- **Cloud Preview** : 15-20 minutes
- **Cloud Production** : 20-25 minutes
- **Local** : 5-10 minutes (si configuré)

---

## 🆘 Problèmes courants

### "eas command not found"
```bash
npm install -g eas-cli
```

### Build échoue
Vérifiez `app.json` et `package.json` sont corrects.

### APK ne s'installe pas
Autorisez "Installation depuis sources inconnues" dans paramètres Android.

---

## 📞 Commandes rapides

```bash
# Tester en Expo Go (sans Whisper)
npx expo start -c

# Build preview cloud
eas build --platform android --profile preview

# Build production cloud
eas build --platform android --profile production

# Voir la liste des builds
eas build:list

# Download build spécifique
eas build:download
```

---

**Prochaine étape** : `eas login` puis `eas build --platform android --profile preview` 🚀

