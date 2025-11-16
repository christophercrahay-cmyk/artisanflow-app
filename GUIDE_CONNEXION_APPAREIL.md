# 📱 Guide de Connexion d'Appareil - ArtisanFlow

## 🎯 Vue d'ensemble

ArtisanFlow utilise **expo-dev-client**, ce qui signifie que vous avez besoin d'un **build natif** installé sur votre appareil pour tester l'application.

---

## ✅ Option 1 : Appareil avec Dev Client déjà installé

Si vous avez déjà installé l'APK de développement sur votre appareil :

### 📱 Sur Android

1. **Assurez-vous que votre téléphone est connecté** :
   - Via USB avec **débogage USB activé**
   - OU sur le **même réseau WiFi** que votre ordinateur (mode LAN)
   - OU via **tunnel** (fonctionne même sur réseaux différents)

2. **Démarrez Expo en mode tunnel** (déjà lancé) :
   ```bash
   npm run start:tunnel:direct
   ```

3. **Sur votre téléphone** :
   - Ouvrez l'app **ArtisanFlow** (dev client)
   - L'app devrait automatiquement se connecter au serveur Metro
   - Si ce n'est pas le cas, appuyez sur **"Reload"** dans l'app

### 🍎 Sur iOS

1. **Assurez-vous que votre iPhone est connecté** :
   - Via USB avec **Xcode** installé
   - OU sur le **même réseau WiFi** que votre Mac
   - OU via **tunnel**

2. **Démarrez Expo en mode tunnel** :
   ```bash
   npm run start:tunnel:direct
   ```

3. **Sur votre iPhone** :
   - Ouvrez l'app **ArtisanFlow** (dev client)
   - L'app devrait automatiquement se connecter

---

## 🔨 Option 2 : Build et Installation (Première fois)

### Pour Android

#### Étape 1 : Configurer Android SDK (si pas déjà fait)

```powershell
# Configuration rapide des variables d'environnement
.\scripts\fix-android-env.ps1

# OU installation complète
.\scripts\setup-android.ps1
```

#### Étape 2 : Connecter votre téléphone Android

1. **Activer le mode développeur** :
   - Allez dans **Réglages** → **À propos du téléphone**
   - Appuyez **7 fois** sur **"Numéro de build"**
   - Retournez dans **Réglages** → **Système** → **Options développeur**

2. **Activer le débogage USB** :
   - Activez **"Options développeur"**
   - Activez **"Débogage USB"**
   - Connectez votre téléphone en USB
   - Autorisez le débogage USB sur l'écran du téléphone

3. **Vérifier la connexion** :
   ```bash
   adb devices
   ```
   Vous devriez voir votre appareil listé.

#### Étape 3 : Builder et installer l'app

```bash
# Build et installation automatique
npm run android

# OU via le script PowerShell complet
.\scripts\setup-android.ps1
```

Le script va :
- ✅ Vérifier JDK 17
- ✅ Vérifier Android SDK
- ✅ Builder l'app
- ✅ Installer automatiquement sur votre téléphone

### Pour iOS

#### Prérequis
- Mac avec Xcode installé
- iPhone connecté en USB
- Certificat de développement configuré

#### Build et installation

```bash
npm run ios
```

---

## 🌐 Option 3 : Mode Tunnel (Recommandé pour tests distants)

Le mode tunnel permet de connecter votre appareil même s'il n'est pas sur le même réseau.

### Démarrage

```bash
npm run start:tunnel:direct
```

### Avantages
- ✅ Fonctionne même si téléphone et PC sont sur réseaux différents
- ✅ Pas besoin d'être sur le même WiFi
- ✅ Idéal pour tester depuis n'importe où

### Inconvénients
- ⚠️ Plus lent que LAN (dépend de votre connexion internet)
- ⚠️ Nécessite une connexion internet stable

---

## 🔍 Vérification de la Connexion

### Vérifier que Metro Bundler fonctionne

Dans le terminal où Expo tourne, vous devriez voir :
```
Metro waiting on exp://...
```

### Vérifier la connexion de l'appareil

1. **Dans l'app ArtisanFlow** sur votre téléphone
2. Appuyez sur **"Reload"** ou secouez le téléphone
3. Ouvrez le menu développeur (secouer le téléphone)
4. Vérifiez que l'URL Metro est correcte

---

## 🐛 Problèmes Courants

### ❌ "Unable to connect to Metro"

**Solutions** :
1. Vérifiez que le tunnel est bien démarré
2. Vérifiez votre connexion internet
3. Redémarrez Expo :
   ```bash
   npm run kill:port
   npm run start:tunnel:direct
   ```

### ❌ "Device not found" (Android)

**Solutions** :
1. Vérifiez le débogage USB :
   ```bash
   adb devices
   ```
2. Si l'appareil n'apparaît pas :
   - Débranchez et rebranchez le câble USB
   - Réautorisez le débogage USB sur le téléphone
   - Vérifiez que les pilotes USB sont installés

### ❌ "Build failed" (Android)

**Solutions** :
1. Vérifiez Android SDK :
   ```powershell
   .\scripts\fix-android-env.ps1
   ```
2. Nettoyez le build :
   ```bash
   npm run android:clean
   npm run android
   ```

### ❌ L'app ne se recharge pas automatiquement

**Solutions** :
1. Secouez le téléphone pour ouvrir le menu développeur
2. Appuyez sur **"Reload"**
3. OU redémarrez l'app complètement

---

## 📝 Commandes Utiles

```bash
# Démarrer en mode tunnel
npm run start:tunnel:direct

# Démarrer en mode LAN (même réseau)
npm run start:lan

# Vérifier les appareils Android connectés
adb devices

# Redémarrer ADB
adb kill-server
adb start-server

# Installer l'APK manuellement
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🎯 Résumé Rapide

1. ✅ **Tunnel démarré** → `npm run start:tunnel:direct`
2. ✅ **Appareil connecté** → USB (Android) ou même réseau (iOS/Android)
3. ✅ **App installée** → Build natif avec dev client
4. ✅ **Connexion automatique** → L'app se connecte au Metro Bundler

---

**Besoin d'aide ?** Vérifiez les logs dans le terminal Expo pour plus de détails.

