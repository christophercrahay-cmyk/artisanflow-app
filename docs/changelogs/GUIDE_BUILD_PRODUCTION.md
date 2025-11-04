# 🚀 GUIDE BUILD PRODUCTION - ArtisanFlow

**Date** : 2024  
**Objectif** : Générer un .aab pour Google Play Store

---

## ✅ VÉRIFICATIONS PRÉ-BUILD

### Configuration `app.json`

- ✅ **name** : `"ArtisanFlow"` (nom affiché)
- ✅ **slug** : `"artisanflow"` (URL)
- ✅ **version** : `"1.0.0"`
- ✅ **android.package** : `"com.artisanflow"`
- ✅ **android.versionCode** : `1` (incrémenter à chaque release)
- ✅ **icon** : `./assets/icon.png` (512×512 px minimum)
- ✅ **adaptiveIcon** : configuré
- ✅ **splash** : configuré
- ✅ **permissions** : CAMERA, RECORD_AUDIO
- ✅ **userInterfaceStyle** : `"dark"` (match ton app)

### Configuration `eas.json`

- ✅ **production profile** : `app-bundle`
- ✅ **projectId** : `ef12de05-654e-4cc5-be14-26fc25571879`

---

## 🚀 COMMANDES BUILD

### Option A : Build Cloud EAS (RECOMMANDÉ)

**Avantages** : Rapide, pas de setup local, Android Studio non requis

```bash
# 1. Installer EAS CLI (si pas déjà fait)
npm install -g eas-cli

# 2. Se connecter
eas login

# 3. Lancer build production Android
eas build --platform android --profile production
```

**Durée** : 10-20 minutes  
**Coût** : Gratuit (Expo offre des crédits gratuits)

---

### Option B : Build Local (si tu as Android Studio)

**Avantages** : Gratuit, contrôlé localement

```bash
# 1. Installer EAS CLI
npm install -g eas-cli

# 2. Lancer build local
eas build --platform android --profile production --local
```

**Durée** : 20-40 minutes  
**Prérequis** : Android Studio installé

---

### Option C : Build Preview (pour tests rapides)

**Si tu veux tester en APK rapidement** :

```bash
eas build --platform android --profile preview
```

**Durée** : 10-15 minutes  
**Output** : `.apk` (pas Play Store compatible)

---

## 📦 OÙ RÉCUPÉRER LE FICHIER .AAB ?

### Après build cloud EAS

1. **Build terminé** → EAS t'envoie un lien email
2. **Ou** → Va sur https://expo.dev
3. Connecte-toi → **Projects** → ArtisanFlow
4. Onglet **"Builds"**
5. Clique sur le build récent
6. **"Download"** → `.aab` téléchargé

**Chemin local** : `~/Downloads/` ou dossier de téléchargement

---

### Après build local

**Chemin exact** :
```
path/to/your/project/.expo/artifacts/android/app-release.aab
```

Ou message terminal indique le chemin exact.

---

## ⚠️ AVANT DE BUILD

### Checklist finale

- [ ] `app.json` vérifié (version, package, permissions)
- [ ] Assets présents (`icon.png`, `adaptive-icon.png`, `splash-icon.png`)
- [ ] Supabase configuré (URL + keys)
- [ ] Auth fonctionnel (testé en dev)
- [ ] Pas d'erreurs Metro (build dev OK)
- [ ] `eas.json` configuré

### Vérification rapide

```bash
# Vérifier app.json
npx expo-doctor

# Si erreurs, corriger
# Sinon, build !
```

---

## 📤 UPLOAD GOOGLE PLAY CONSOLE

### Étapes

1. **Ouvrir** https://play.google.com/console
2. **Sélectionner** ton app ArtisanFlow (ou créer nouvelle app)
3. **Production** → **Testing** → **Closed testing**
4. **"Create new release"**
5. **Upload** ton fichier `.aab`
6. **"Review release"** → **"Start rollout"**

---

## 🔄 VERSIONS FUTURES

### Incrémenter version

**Dans `app.json`** :

```json
{
  "expo": {
    "version": "1.0.1",           // Version utilisateur (semantic)
    "android": {
      "versionCode": 2            // Incrémenter +1 à chaque build
    }
  }
}
```

**Convention** :
- `versionCode` : Toujours augmenter (1, 2, 3, ...)
- `version` : SemVer (1.0.0, 1.0.1, 1.1.0, 2.0.0, ...)

---

## 🐛 DÉPANNAGE

### Erreur "Missing icon"

```bash
# Vérifier fichiers existent
ls assets/icon.png
ls assets/adaptive-icon.png

# Si manquants, les créer ou copier temporaires
```

### Erreur "EAS not logged in"

```bash
eas login
```

### Build échoue "Whisper.rn native module"

**Solution** : Le build cloud gère déjà les modules natifs si bien configurés dans `app.json`.

Si problème :
```bash
# Forcer rebuild avec cache clean
eas build --platform android --profile production --clear-cache
```

### Build lent

**Solution** : Build cloud plus rapide que local pour la première fois.

---

## ✅ CHECKLIST FINALE

- [x] `app.json` configuré
- [x] `eas.json` configuré
- [ ] Assets présents
- [ ] Build exécuté
- [ ] `.aab` récupéré
- [ ] Uploadé Play Console
- [ ] Test fermé créé

---

## 🎯 RÉSUMÉ COMMANDES

```bash
# 1. Installer EAS
npm install -g eas-cli

# 2. Se connecter
eas login

# 3. Build production
eas build --platform android --profile production

# 4. Récupérer .aab depuis expo.dev

# 5. Uploader dans Play Console
```

**Durée totale** : 20-30 minutes

---

**Status** : ✅ **READY TO BUILD**

