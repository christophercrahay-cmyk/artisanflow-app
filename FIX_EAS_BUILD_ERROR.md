# 🔧 FIX EAS BUILD ERROR - ARTISANFLOW

**Erreur** : `Unknown error. See logs of the Install dependencies build phase`  
**Build ID** : `7b9a62fc-c5c6-44db-b141-c195356ef311`  
**Date** : 6 novembre 2025

---

## 🐛 PROBLÈME IDENTIFIÉ

**Cause probable** : Conflits de peer dependencies lors de `npm install` sur le serveur EAS

**Symptômes** :
- ✅ Build démarre correctement
- ❌ Échoue à la phase "Install dependencies"
- ⚠️ Erreur : "Unknown error"

---

## ✅ SOLUTIONS APPLIQUÉES

### 1. **Fichier .npmrc créé**

**Fichier** : `.npmrc` (racine du projet)

```
# Configuration npm pour EAS Build
# Force l'utilisation de --legacy-peer-deps pour résoudre les conflits de peer dependencies

legacy-peer-deps=true
```

**Impact** : EAS utilisera automatiquement `--legacy-peer-deps` lors de `npm install`

---

### 2. **Version Node.js fixée dans eas.json**

**Fichier** : `eas.json`

```json
"production": {
  "node": "20.18.0",  // ✅ Version Node.js fixée
  "android": {
    "buildType": "app-bundle"
  }
}
```

**Impact** : Garantit l'utilisation d'une version Node.js stable et compatible

---

## 🚀 RELANCER LE BUILD

### Commande corrigée :

```bash
npx eas build --platform android --profile production --clear-cache
```

**Flag `--clear-cache`** : Force EAS à ignorer le cache et réinstaller toutes les dépendances

---

## 🔍 VÉRIFICATIONS AVANT DE RELANCER

### 1. Vérifier que les fichiers sont bien modifiés

```bash
# Vérifier .npmrc
cat .npmrc

# Vérifier eas.json
cat eas.json

# Vérifier app.json (version et versionCode)
Get-Content app.json | Select-String -Pattern "version|versionCode"
```

**Résultats attendus** :
```
.npmrc : legacy-peer-deps=true ✅
eas.json : "node": "20.18.0" ✅
app.json : "version": "1.0.1" ✅
app.json : "versionCode": 2 ✅
```

---

### 2. Vérifier que les changements sont commitables (optionnel)

Si tu utilises Git :

```bash
# Voir les fichiers modifiés
git status

# Fichiers qui devraient apparaître :
# - app.json (modifié)
# - eas.json (modifié)
# - .npmrc (nouveau)
# - screens/CaptureHubScreen.js (modifié)
# - screens/ProjectDetailScreen.js (modifié)
# - jest.config.js (modifié)
# - etc.
```

⚠️ **IMPORTANT** : Tu n'es **PAS obligé** de commit. EAS build utilisera les fichiers locaux.

---

## 🎯 WORKFLOW DE BUILD CORRIGÉ

### Option 1 : Build avec clear-cache (RECOMMANDÉ)

```bash
npx eas build --platform android --profile production --clear-cache
```

**Avantages** :
- ✅ Ignore le cache EAS
- ✅ Réinstalle toutes les dépendances
- ✅ Utilise le nouveau `.npmrc`
- ⏱️ Durée : +2-3 minutes (mais plus fiable)

---

### Option 2 : Build standard (si Option 1 échoue)

```bash
npx eas build --platform android --profile production
```

Si ça échoue encore, essaie avec `--non-interactive` :

```bash
npx eas build --platform android --profile production --non-interactive
```

---

## 🔍 SI LE BUILD ÉCHOUE ENCORE

### 1. Voir les logs détaillés en ligne

```
URL : https://expo.dev/accounts/chriskreepz/projects/artisanflow-3rgvrambzo0tk8d1ddx2/builds

1. Clique sur le dernier build
2. Clique sur "View logs"
3. Cherche la section "Install dependencies"
4. Note l'erreur exacte
```

### 2. Erreurs courantes et solutions

#### Erreur : "ERESOLVE unable to resolve dependency tree"

**Solution** : Le `.npmrc` avec `legacy-peer-deps=true` devrait résoudre ça ✅

#### Erreur : "Module not found: whisper.rn"

**Solution** : Normal, c'est un module natif. Ajouter dans `eas.json` :

```json
"production": {
  "env": {
    "EXPO_NO_CAPABILITY_SYNC": "1"
  }
}
```

#### Erreur : "Out of memory"

**Solution** : Ajouter dans `eas.json` :

```json
"production": {
  "resourceClass": "large"
}
```

---

## 🛠️ CONFIGURATION ALTERNATIVE (si problème persiste)

Si le build échoue toujours, essaie un build **local** :

```bash
# Build production en local (requiert Android SDK)
npx eas build --platform android --profile production --local
```

**Prérequis** :
- Android Studio installé
- SDK Android 36
- Java JDK 17+
- Variables d'environnement configurées

---

## 📊 DIAGNOSTIC COMPLET

### État actuel :

```
✅ app.json : version 1.0.1, versionCode 2
✅ eas.json : Node 20.18.0 fixé
✅ .npmrc : legacy-peer-deps activé
✅ Expo doctor : 15/17 checks
✅ Tests : 12/12 passés
✅ Dependencies locales : 970 packages installés
```

### Logs du build échoué :

```
Build ID : 7b9a62fc-c5c6-44db-b141-c195356ef311
Erreur : Install dependencies phase failed
Version utilisée : 1.0.0 (ancienne version, commit 66c5236)
```

**Conclusion** : Le build a utilisé un ancien commit. Relance avec `--clear-cache` pour forcer l'utilisation des nouveaux fichiers.

---

## 🚀 COMMANDE FINALE RECOMMANDÉE

```bash
npx eas build --platform android --profile production --clear-cache
```

**Puis attends 15-20 minutes et vérifie que** :
- ✅ Version affichée : `1.0.1`
- ✅ VersionCode affiché : `2`
- ✅ Phase "Install dependencies" : ✅ Success

---

## 📝 NOTES DE VERSION (rappel)

```
- Amélioration de la stabilité générale
- Correction de l'affichage sur l'écran Capture
- Optimisation de la transcription IA et génération de devis
```

---

## 🎯 PROCHAINES ÉTAPES

1. **Relance le build** avec `--clear-cache`
2. **Surveille les logs** sur EAS Dashboard
3. **Si succès** → Télécharge l'AAB
4. **Upload sur Play Console** avec les notes de version
5. **Attends la validation** Google (1-3 jours)

---

**Fichiers créés pour t'aider** :
- ✅ `.npmrc` - Force legacy-peer-deps pour EAS
- ✅ `FIX_EAS_BUILD_ERROR.md` - Ce guide
- ✅ `BUILD_PLAY_STORE_READY.md` - Guide complet
- ✅ `COMMANDES_BUILD_PLAY_STORE.md` - Commandes détaillées

---

**Relance maintenant avec --clear-cache ! 🚀**

```bash
npx eas build --platform android --profile production --clear-cache
```

