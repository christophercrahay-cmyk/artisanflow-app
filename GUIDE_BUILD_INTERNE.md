# 📦 Guide : Build de Distribution Interne - ArtisanFlow

## 🎯 Vue d'ensemble

Vous avez **deux profils** configurés pour la distribution interne dans `eas.json` :

1. **`development`** - Dev Client (pour tester avec Expo)
2. **`preview`** - Version standalone (pour tester sans Expo)

---

## 🔧 Profils disponibles

### 1. Development (Dev Client)

**Configuration** :
- `developmentClient: true` → Nécessite Expo dev client
- `distribution: internal` → Distribution interne
- `buildType: apk` → Format APK

**Utilisation** :
- Pour tester en mode développement avec hot reload
- Se connecte au serveur Metro/Expo
- Permet de tester les modifications en temps réel

**Commande** :
```bash
# Build cloud (recommandé)
npm run build:dev

# Build local (nécessite Android SDK configuré)
npm run build:dev:local
```

### 2. Preview (Standalone)

**Configuration** :
- Pas de dev client → Version standalone
- `distribution: internal` → Distribution interne
- `buildType: apk` → Format APK

**Utilisation** :
- Pour tester une version standalone (comme production)
- Ne nécessite pas Expo dev client
- Idéal pour tester avant de publier

**Commande** :
```bash
# Build cloud (recommandé)
npm run build:preview

# Build local (nécessite Android SDK configuré)
npm run build:preview:local
```

---

## 🚀 Étapes pour créer un build interne

### Option 1 : Build Cloud (Recommandé)

**Avantages** :
- ✅ Pas besoin d'Android SDK configuré
- ✅ Build rapide et fiable
- ✅ Gestion automatique des dépendances

**Étapes** :

1. **Login EAS** (si pas déjà fait) :
   ```bash
   eas login
   ```

2. **Build Development** (dev client) :
   ```bash
   npm run build:dev
   ```

   OU

   **Build Preview** (standalone) :
   ```bash
   npm run build:preview
   ```

3. **Suivre les instructions** :
   - EAS va vous demander des informations si nécessaire
   - Le build sera créé dans le cloud
   - Vous recevrez un lien de téléchargement à la fin

4. **Télécharger et installer** :
   - Téléchargez l'APK depuis le lien fourni
   - Installez sur votre téléphone Android
   - Pour dev client : Démarrez ensuite `npm run start:tunnel:direct`

### Option 2 : Build Local

**Avantages** :
- ✅ Plus rapide (pas d'upload)
- ✅ Contrôle total sur le build

**Prérequis** :
- Android SDK configuré (`.\scripts\fix-android-env.ps1`)
- JDK 17 installé

**Étapes** :

1. **Build Development** (dev client) :
   ```bash
   npm run build:dev:local
   ```

   OU

   **Build Preview** (standalone) :
   ```bash
   npm run build:preview:local
   ```

2. **Trouver l'APK** :
   - L'APK sera généré localement
   - Emplacement : Généralement dans un dossier temporaire ou `android/app/build/outputs/apk/`

3. **Installer** :
   ```bash
   adb install -r chemin/vers/app.apk
   ```

---

## 📱 Différences entre les deux profils

| Caractéristique | Development | Preview |
|----------------|-------------|---------|
| Dev Client | ✅ Oui | ❌ Non |
| Hot Reload | ✅ Oui | ❌ Non |
| Serveur Metro | ✅ Requis | ❌ Non |
| Standalone | ❌ Non | ✅ Oui |
| Test production | ❌ Non | ✅ Oui |
| Taille APK | Plus petit | Plus grand |

---

## 💡 Recommandations

### Pour tester en développement :
```bash
npm run build:dev
```
Puis démarrez le serveur Expo :
```bash
npm run start:tunnel:direct
```

### Pour tester avant production :
```bash
npm run build:preview
```
Installez l'APK et testez comme une vraie app.

---

## 🔍 Vérifier les builds existants

```bash
# Lister tous les builds
eas build:list

# Voir les détails d'un build spécifique
eas build:view [BUILD_ID]
```

---

## 📝 Notes importantes

1. **Distribution interne** signifie que l'APK peut être installé directement sans passer par le Play Store
2. Les builds **development** nécessitent le serveur Expo pour fonctionner
3. Les builds **preview** sont autonomes et fonctionnent sans Expo
4. Les deux utilisent le même package identifier (`com.anonymous.artisanflow`)

---

## 🐛 Troubleshooting

### Erreur "EAS CLI not found"
```bash
npm install -g eas-cli
```

### Erreur "Not logged in"
```bash
eas login
```

### Build local échoue
Vérifiez que Android SDK est configuré :
```bash
.\scripts\fix-android-env.ps1
```

---

**Besoin d'aide ?** Consultez la [documentation EAS Build](https://docs.expo.dev/build/introduction/)

