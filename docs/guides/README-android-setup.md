# 📱 Guide Setup Build Android Local - ArtisanFlow

**Date** : 02/11/2025  
**OS** : Windows 10  
**Cible** : Build Expo en local et installation USB

---

## 🎯 Vue d'ensemble

Ce guide explique comment :
1. Configurer ton environnement Android sur Windows 10
2. Générer un build local de l'app Expo
3. Installer l'APK sur ton téléphone via USB

**Script automatisé** : `setup-android.ps1` fait tout ça pour toi !

---

## 📋 Pré-requis téléphone

### 1. Options développeur

1. **Aller** : `Réglages` → `À propos du téléphone`
2. **Appuyer 7 fois** sur "Numéro de build"
3. **Message** : "Vous êtes maintenant développeur!" ✅

### 2. Débogage USB

1. **Aller** : `Réglages` → `Système` → `Options développeur`
2. **Activer** "Débogage USB" ✅
3. **Activer** "Installer via USB" (si option présente) ✅

### 3. Sources inconnues

1. **Aller** : `Réglages` → `Sécurité`
2. **Activer** "Installer des apps de sources inconnues" ✅

### 4. Connecter le téléphone

1. **Branche le téléphone en USB** à ton PC
2. **Sur le téléphone** : Autoriser le débogage USB quand demandé
3. **Cocher** "Toujours autoriser à partir de cet ordinateur" ✅
4. **Cliquer** "Autoriser"

---

## 🚀 Installation automatisée

### Option 1 : Script PowerShell (Recommandé)

Le script `setup-android.ps1` fait tout automatiquement :

```powershell
powershell -ExecutionPolicy Bypass -File .\setup-android.ps1
```

**Ce que fait le script** :

1. ✅ **Installe JDK 17** (via winget ou instructions manuelles)
2. ✅ **Installe Android Studio** (si nécessaire)
3. ✅ **Configure JAVA_HOME et ANDROID_SDK_ROOT**
4. ✅ **Vérifie la connexion USB**
5. ✅ **Lance prebuild**
6. ✅ **Build l'APK**
7. ✅ **Installe sur le téléphone**

**Temps estimé** : 5-45 minutes (selon ce qui est déjà installé)

---

### Option 2 : Installation manuelle

Si winget n'est pas disponible ou si tu préfères installer manuellement :

#### A. JDK 17

**Télécharger** : https://adoptium.net/temurin/releases/?version=17

**Installer** :
1. Télécharger `.msi` pour Windows x64
2. Double-cliquer → Suivre l'assistant
3. **Important** : Cocher "Set JAVA_HOME variable"
4. Redémarrer le terminal après installation

**Vérifier** :
```powershell
java -version
# Devrait afficher: openjdk version "17.x.x"
```

#### B. Android Studio

**Télécharger** : https://developer.android.com/studio

**Installer** :
1. Télécharger `.exe`
2. Double-cliquer → Suivre l'assistant
3. Installer avec **options par défaut**

**Configurer SDK** :
1. Ouvrir Android Studio
2. Premier lancement → **More Actions** → **SDK Manager**
3. **SDK Platform** :
   - Cocher : **Android 14.0 (API 34)** ✅
   - Cocher : **Android SDK Build-Tools 34.0.0** ✅
4. **SDK Tools** :
   - Cocher : **Android SDK Platform-Tools** ✅
   - Cocher : **Android SDK Command-line Tools (latest)** ✅
5. **Apply** → Attendre téléchargement
6. **Finish**

**Vérifier** :
```powershell
adb version
# Devrait afficher: Android Debug Bridge version x.x.x
```

#### C. winget (optionnel mais recommandé)

**Installer** : https://learn.microsoft.com/en-us/windows/package-manager/winget/

**Vérifier** :
```powershell
winget --version
```

---

## 🔨 Build manuel (sans script)

Si tu préfères faire les étapes manuellement :

```powershell
# 1. Installer dépendances
npm install

# 2. Installer expo-dev-client
npx expo install expo-dev-client

# 3. Générer dossier android/ (prebuild)
npx expo prebuild --platform android

# 4. Build et installer sur téléphone
npx expo run:android
```

**Vérifier que l'appareil est connecté** :
```powershell
adb devices
# Doit afficher:
# List of devices attached
# ABC123XYZ    device
```

---

## 🔧 Scripts NPM disponibles

Après ajout dans `package.json` :

```bash
npm run android:build     # Build et installe
npm run android:clean     # Nettoie Gradle
npm run doctor           # Vérifie configuration Expo
```

---

## 📂 Emplacement de l'APK

**APK debug généré** :
```
android\app\build\outputs\apk\debug\app-debug.apk
```

**Installation manuelle** :
```powershell
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

---

## ❌ Problèmes courants

### "ADB: device unauthorized"

**Solution** :
1. Sur le téléphone : Autoriser le débogage USB
2. Cocher "Toujours autoriser"
3. Cliquer "Autoriser"

```powershell
adb kill-server
adb start-server
adb devices
```

---

### "Execution failed for task ':app:mergeDebugNativeLibs'"

**Solution** : Nettoyer et rebuilder

```powershell
cd android
.\gradlew.bat clean
cd ..
npx expo run:android
```

---

### "INSTALL_FAILED_UPDATE_INCOMPATIBLE"

**Solution** : Signature différente. Désinstaller l'ancienne version

```powershell
adb uninstall com.artisanflow
npx expo run:android
```

---

### "No devices found"

**Solution** :
1. Vérifier que le câble USB est bien connecté
2. Tester avec un autre câble (data, pas uniquement charge)
3. Sur le téléphone : Réactiver "Débogage USB"
4. Redémarrer `adb` :

```powershell
adb kill-server
adb start-server
adb devices
```

---

### "JAVA_HOME not set"

**Solution** :
1. Trouver où Java est installé :

```powershell
where java
# Output: C:\Program Files\Eclipse Adoptium\jdk-17.0.x\bin\java.exe
```

2. Définir JAVA_HOME :

```powershell
# Temporaire (session courante)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.x"

# Permanent (utilisateur)
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.0.x", "User")
```

3. Redémarrer le terminal

---

### "ANDROID_SDK_ROOT not set"

**Solution** :

```powershell
# Définir ANDROID_SDK_ROOT
[Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", "C:\Users\Chris\AppData\Local\Android\Sdk", "User")

# Ajouter platform-tools au PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$currentPath;C:\Users\Chris\AppData\Local\Android\Sdk\platform-tools", "User")
```

Redémarrer le terminal.

---

### Gradle build failed (NDK)

**Solution** : Si erreur liée au NDK, vérifier `app.json` :

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "ndkVersion": "24.0.8215888"
          }
        }
      ]
    ]
  }
}
```

---

### "ERR_CLEARTEXT_NOT_PERMITTED"

**Solution** : HTTP bloqué. Configurer `android/app/src/main/AndroidManifest.xml` :

```xml
<application
  android:usesCleartextTraffic="true">
```

---

### "Module not found: Can't resolve './...'"

**Solution** : Nettoyer cache Expo

```powershell
# Supprimer cache
Remove-Item -Recurse -Force .expo
Remove-Item -Recurse -Force node_modules

# Réinstaller
npm install
npx expo prebuild --clean
```

---

## 🎯 Après un build réussi

### Lancer l'app

1. **App installée automatiquement** sur le téléphone
2. **Icône** "ArtisanFlow" devrait apparaître
3. **Lancer l'app** pour tester

### Hot reload / Debug

```powershell
# Terminal 1: Metro bundler
npm start

# Terminal 2: Build install (si tu changes du code natif)
npm run android:build
```

---

## 📊 Checklist complète

### Avant de commencer

- [ ] Options développeur activées (téléphone)
- [ ] Débogage USB activé
- [ ] Sources inconnues autorisées
- [ ] Téléphone branché en USB
- [ ] winget installé (ou installer manuellement)

### Installation

- [ ] JDK 17 installé
- [ ] JAVA_HOME défini
- [ ] Android Studio installé
- [ ] SDK configuré (API 34)
- [ ] ANDROID_SDK_ROOT défini
- [ ] ADB fonctionne (`adb version`)

### Build

- [ ] Dépendances installées (`npm install`)
- [ ] expo-dev-client installé
- [ ] Dossier `android/` généré
- [ ] Appareil détecté (`adb devices`)
- [ ] Build réussi
- [ ] App installée sur téléphone

---

## 🔄 Workflow quotidien

### Build développement rapide

```powershell
# Une seule commande
npm run android:build
```

### Après changement de code

```powershell
# Code JS/React : Hot reload automatique
# Code natif : Rebuild nécessaire
npx expo run:android
```

### Nettoyage complet

```powershell
# Nettoyer Gradle
npm run android:clean

# Nettoyer Expo
npx expo prebuild --clean

# Tout réinstaller
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .expo
Remove-Item -Recurse -Force android
npm install
npx expo prebuild --platform android
```

---

## 🆘 Support

### Documentation officielle

- **Expo Run** : https://docs.expo.dev/build-reference/development-builds/
- **Android Studio** : https://developer.android.com/studio
- **ADB** : https://developer.android.com/tools/adb

### Commandes utiles

```powershell
# Vérifier config Expo
npm run doctor

# Lister devices
adb devices -l

# Logs en temps réel
adb logcat | Select-String "ArtisanFlow"

# Logcat filtré React Native
adb logcat *:S ReactNative:V ReactNativeJS:V

# Shell sur le device
adb shell

# Screenshot
adb exec-out screencap -p > screenshot.png

# Installer APK
adb install app-debug.apk

# Désinstaller app
adb uninstall com.artisanflow
```

---

## ✅ Résumé

**Commande magique** :
```powershell
powershell -ExecutionPolicy Bypass -File .\setup-android.ps1
```

**Si tout est déjà installé** :
```powershell
npm run android:build
```

**Fichiers générés** :
- APK : `android\app\build\outputs\apk\debug\app-debug.apk`
- AAB : `android\app\build\outputs\bundle\debug\app-debug.aab`

---

**Status** : ✅ Script prêt à l'emploi  
**Version** : 1.0  
**Date** : 02/11/2025

