# 🛠️ Configuration Dev Client - ArtisanFlow

## ✅ Configuration terminée

La version DEV d'ArtisanFlow est maintenant configurée pour s'installer en parallèle de la version stable.

---

## 📋 Fichiers modifiés

### 1. `app.config.js` (NOUVEAU)
- ✅ Configuration dynamique selon le profil EAS
- ✅ Détecte automatiquement `EAS_BUILD_PROFILE === 'development'`
- ✅ Applique les identifiants DEV :
  - `name`: "ArtisanFlow Dev"
  - `android.package`: "com.artisanflow.dev"
  - `ios.bundleIdentifier`: "com.artisanflow.dev"
- ✅ Version stable reste inchangée (utilise `app.json` en fallback)

### 2. `eas.json` (MODIFIÉ)
- ✅ Profil `development` mis à jour :
  - `android.buildType`: "development-client"
  - `ios.buildType`: "development-client"
- ✅ Profil `production` non modifié

### 3. `app.json` (CONSERVÉ)
- ✅ Conservé pour la version stable
- ✅ Non modifié (sécurité pour la production)

---

## 🔍 Vérifications

### Identifiants DEV vs STABLE

| Configuration | STABLE | DEV |
|--------------|--------|-----|
| **Nom** | ArtisanFlow | ArtisanFlow Dev |
| **Android Package** | com.anonymous.artisanflow | com.artisanflow.dev |
| **iOS Bundle ID** | com.anonymous.artisanflow | com.artisanflow.dev |
| **Icône** | ./assets/icon.png | ./assets/icon.png (même) |

### Installation parallèle

✅ **Les deux versions peuvent coexister** car :
- Packages Android différents (`com.anonymous.artisanflow` vs `com.artisanflow.dev`)
- Bundle IDs iOS différents (`com.anonymous.artisanflow` vs `com.artisanflow.dev`)
- Noms d'app différents ("ArtisanFlow" vs "ArtisanFlow Dev")

---

## 🚀 Utilisation

### Build Dev Client

```bash
# Build cloud (recommandé)
eas build --profile development --platform android

# Build local (nécessite Android SDK)
eas build --profile development --platform android --local
```

### Après le build

1. **Téléchargez l'APK** depuis le lien EAS
2. **Installez sur votre téléphone** (les deux apps coexisteront)
3. **Démarrez le serveur Expo** :
   ```bash
   npm run start:tunnel:direct
   ```
4. **Ouvrez "ArtisanFlow Dev"** sur votre téléphone
5. L'app se connectera automatiquement au serveur Metro

---

## ⚠️ Notes importantes

### Prebuild automatique
- EAS Build fait automatiquement un `prebuild` avant le build
- Les fichiers natifs (`android/`, `ios/`) seront régénérés avec les bons identifiants
- **Ne modifiez pas manuellement** les fichiers dans `android/app/build.gradle` pour le namespace

### Build local
Si vous faites un build local, vous devrez peut-être faire un prebuild d'abord :
```bash
npx expo prebuild --clean
eas build --profile development --platform android --local
```

### Fichiers générés
Les fichiers natifs (`android/`, `ios/`) sont générés automatiquement par Expo.
- Ne les commitez pas si vous utilisez EAS Build cloud
- Ils seront régénérés à chaque build avec les bons identifiants selon le profil

---

## 🧪 Test de la configuration

Pour vérifier que la configuration fonctionne :

```bash
# Vérifier la config en mode DEV
EAS_BUILD_PROFILE=development npx expo config --type public

# Vérifier la config en mode PRODUCTION (par défaut)
npx expo config --type public
```

Vous devriez voir :
- En DEV : `name: "ArtisanFlow Dev"`, `package: "com.artisanflow.dev"`
- En PROD : `name: "ArtisanFlow"`, `package: "com.anonymous.artisanflow"`

---

## 📝 Résumé

✅ **Version DEV configurée** avec identifiants séparés  
✅ **Version STABLE préservée** (non modifiée)  
✅ **Installation parallèle possible**  
✅ **Prêt pour le build** : `eas build --profile development --platform android`

---

**Prochaine étape** : Lancer le build DEV avec la commande ci-dessus ! 🚀

