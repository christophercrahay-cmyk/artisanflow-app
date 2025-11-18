# 🔨 Rebuild en mode Development Client (pas Expo Go)

## Objectif
Créer un APK "development build" qui peut se connecter à Metro.

## ⚡ SOLUTION RAPIDE : EAS Build (RECOMMANDÉ)

### Avantages
- ✅ Pas besoin de configurer JAVA_HOME/ANDROID_HOME
- ✅ Pas besoin d'Android Studio
- ✅ Fonctionne sur n'importe quel PC
- ✅ Build dans le cloud (ou local)

### Étapes

```bash
# 1. Installer EAS CLI (une seule fois)
npm install -g eas-cli

# 2. Se connecter à Expo (compte gratuit)
eas login

# 3. Build en mode development (local)
eas build --platform android --profile development --local

# OU build dans le cloud (plus rapide, mais nécessite compte Expo)
eas build --platform android --profile development
```

**C'est tout !** Une fois le build terminé, installez l'APK sur votre appareil.

---

## 🔧 SOLUTION ALTERNATIVE : expo run:android

**Nécessite** : Android Studio + JAVA_HOME + ANDROID_HOME configurés

### Si vous avez déjà tout configuré :

```bash
# Nettoyer
npm run android:clean

# Build
npm run android:build
# ou
npx expo run:android
```

### Si vous devez configurer l'environnement :

Consultez `GUIDE_REBUILD_ANDROID.md` pour configurer :
- JAVA_HOME
- ANDROID_HOME
- PATH

---

## 🚀 Script automatique

J'ai créé un script qui fait tout automatiquement :

```powershell
powershell -ExecutionPolicy Bypass -File scripts/rebuild-dev-android.ps1
```

Le script va :
1. Détecter si EAS CLI est installé
2. Vous proposer EAS Build (recommandé) ou expo run:android
3. Lancer le build automatiquement

---

## 📱 Après le build

1. **Installer l'APK** sur votre appareil
2. **Démarrer Metro** :
   ```bash
   npm start
   ```
3. **Dans l'app**, appuyer sur "Reload"

---

## ⚠️ Important

- Le build prend **5-15 minutes** selon votre PC
- Avec EAS Build local, vous devez avoir Android SDK installé
- Avec EAS Build cloud, vous n'avez besoin de rien (mais nécessite compte Expo)

---

## 🎯 Recommandation

**Utilisez EAS Build** - C'est le plus simple et le plus fiable !

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile development --local
```

