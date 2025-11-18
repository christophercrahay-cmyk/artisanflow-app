# 🔧 BUILD POUR EXPO-CLIPBOARD

## ❌ Problème

Le SDK Android n'est pas installé localement, donc `npx expo run:android` ne peut pas fonctionner.

## ✅ Solution : Build avec EAS + QR Code (recommandé)

Avec EAS Build, vous pouvez utiliser un **QR code** pour le développement, comme Expo Go, mais avec les modules natifs (expo-clipboard).

### **📱 Workflow complet**

#### **Étape 1 : Builder l'APK (une seule fois)**

```bash
# Installer EAS CLI (une seule fois)
npm install -g eas-cli

# Se connecter à Expo
eas login

# Lancer le build cloud
eas build --platform android --profile development
```

**Résultat** : Vous obtenez un **lien de téléchargement** pour l'APK.

#### **Étape 2 : Installer l'APK sur votre téléphone (une seule fois)**

- Téléchargez l'APK depuis le lien fourni par EAS
- Installez-le sur votre téléphone Android
- Ouvrez l'app **ArtisanFlow** (dev client)

#### **Étape 3 : Utiliser le QR code (à chaque session de dev)**

```bash
# Démarrer le serveur de développement
npm start
# OU
expo start --dev-client
```

**Résultat** : Un **QR code** s'affiche dans le terminal.

#### **Étape 4 : Scanner le QR code**

- Ouvrez l'app **ArtisanFlow** (dev client) sur votre téléphone
- Scannez le QR code affiché dans le terminal
- L'app se connecte et charge le JavaScript en temps réel

---

## 🎯 Avantages

✅ **QR code** : Comme Expo Go, mais avec modules natifs  
✅ **Hot reload** : Modifications JavaScript en temps réel  
✅ **Pas de SDK local** : Build dans le cloud  
✅ **Une seule installation** : L'APK reste sur le téléphone

---

## 🔄 Alternative : Installer Android Studio (plus long)

Si vous préférez builder localement :

1. **Installer Android Studio** : https://developer.android.com/studio
2. **Ouvrir Android Studio** → SDK Manager
3. **Installer** :
   - Android SDK Platform 36
   - Android SDK Build-Tools
   - Android Emulator (optionnel)
4. **Configurer ANDROID_HOME** :
   ```powershell
   # Dans PowerShell (session actuelle)
   $env:ANDROID_HOME = "C:\Users\Chris\AppData\Local\Android\Sdk"
   $env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
   ```
5. **Relancer le build** :
   ```bash
   npx expo run:android
   ```

---

## 📝 Résumé

1. **Build une fois** : `eas build --platform android --profile development`
2. **Installez l'APK** sur votre téléphone
3. **Utilisez le QR code** : `npm start` → scanner → développement en temps réel

**C'est comme Expo Go, mais avec les modules natifs !** 🎉

