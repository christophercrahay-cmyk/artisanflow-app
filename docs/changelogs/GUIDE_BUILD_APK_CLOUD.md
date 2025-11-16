# 🚀 Guide Build APK via EAS Cloud - ArtisanFlow

**Date** : 03/11/2025  
**Objectif** : Générer un APK sans dépendre de JDK/SDK local

---

## ✅ Status actuel

Tu as déjà :
- ✅ Compte Expo connecté (`chriskreepz`)
- ✅ Projet configuré sur EAS
- ✅ `eas.json` correctement configuré
- ✅ `app.json` avec projectId

**Problème** : Les credentials Android ont besoin d'un **keystore** qui nécessite interaction utilisateur.

---

## 📦 Solutions disponibles

### Solution 1 : Utiliser un build existant ✅

Tu as **déjà 3 builds terminés** :

#### Build Preview (APK) - 02/11/2025
```
URL : https://expo.dev/artifacts/eas/6gpvjCHzpJKTe9fJvhMVyt.apk
ID  : 2aa455ed-5b23-482a-bc04-4b252c9b9477
Date: 02/11/2025 15:45:49
```

#### Build Development (APK) - 02/11/2025
```
URL : https://expo.dev/artifacts/eas/dMmGUCRwdEia5cTBkSmiYC.apk
ID  : 6782e4c7-431e-45e7-8e44-fb2873739098
Date: 02/11/2025 14:08:30
```

#### Build Production (AAB) - 02/11/2025
```
URL : https://expo.dev/artifacts/eas/d3e4SFX9DVEeQFZRLny6bN.aab
ID  : 617d3443-9c44-42cb-8475-4c32c62fd6b6
Date: 02/11/2025 20:37:11
```

**Ces fichiers sont déjà téléchargeables !** 🎉

---

### Solution 2 : Lancer un nouveau build (interactif)

Pour générer un **nouveau** APK :

```bash
npx eas-cli build --platform android --profile preview
```

**Ce qui va se passer** :
1. EAS va détecter que les credentials sont manquants ou invalides
2. Il va te demander : "Generate a new Android Keystore?"
3. Tu réponds **"yes"**
4. Le build démarre (15-20 minutes)
5. Tu reçois un lien de téléchargement

**⚠️ Important** : Cette commande **ne peut pas** être lancée en mode `--non-interactive` car elle nécessite une confirmation pour créer le keystore.

---

### Solution 3 : Utiliser EAS CLI avec profile existant

Si tu as déjà des credentials configurés ailleurs :

```bash
# Lister les credentials existants
npx eas-cli credentials

# Sélectionner Android → existing credentials
# Puis lancer le build
npx eas-cli build --platform android --profile preview
```

---

## 🎯 Commande exacte à lancer

### Pour télécharger un build existant

```bash
npx eas-cli build:download
```

Cette commande va :
1. Lister tes builds
2. Te demander lequel télécharger
3. Le télécharger automatiquement

### Pour lancer un nouveau build

**Ouvre un terminal interactif** (pas via Cursor/automation) :

```bash
cd C:\Users\Chris\Desktop\MVP_Artisan\artisanflow
npx eas-cli build --platform android --profile preview
```

**Répond aux prompts** :
- "Generate a new Android Keystore?" → **Yes**
- Si d'autres choix : accepte les valeurs par défaut

**Attends 15-20 minutes** → Le build sera disponible.

---

## 📊 Builds existants - Détails

### Build ID: 2aa455ed-5b23-482a-bc04-4b252c9b9477

| Propriété | Valeur |
|-----------|--------|
| **Platform** | Android |
| **Status** | ✅ finished |
| **Profile** | preview |
| **Distribution** | internal |
| **SDK Version** | 54.0.0 |
| **App Version** | 1.0.0 |
| **Version Code** | 1 |
| **Started** | 02/11/2025 15:23:42 |
| **Finished** | 02/11/2025 15:45:49 |
| **APK URL** | https://expo.dev/artifacts/eas/6gpvjCHzpJKTe9fJvhMVyt.apk |

**Verdict** : ✅ **PRÊT POUR TÉLÉCHARGEMENT**

---

### Build ID: 6782e4c7-431e-45e7-8e44-fb2873739098

| Propriété | Valeur |
|-----------|--------|
| **Platform** | Android |
| **Status** | ✅ finished |
| **Profile** | development |
| **Distribution** | internal |
| **SDK Version** | 54.0.0 |
| **App Version** | 1.0.0 |
| **Version Code** | 1 |
| **Started** | 02/11/2025 13:48:42 |
| **Finished** | 02/11/2025 14:08:30 |
| **APK URL** | https://expo.dev/artifacts/eas/dMmGUCRwdEia5cTBkSmiYC.apk |

**Verdict** : ✅ **PRÊT POUR TÉLÉCHARGEMENT**

---

### Build ID: 617d3443-9c44-42cb-8475-4c32c62fd6b6

| Propriété | Valeur |
|-----------|--------|
| **Platform** | Android |
| **Status** | ✅ finished |
| **Profile** | production |
| **Distribution** | store |
| **SDK Version** | 54.0.0 |
| **App Version** | 1.0.0 |
| **Version Code** | 1 |
| **Started** | 02/11/2025 20:15:49 |
| **Finished** | 02/11/2025 20:37:11 |
| **AAB URL** | https://expo.dev/artifacts/eas/d3e4SFX9DVEeQFZRLny6bN.aab |

**Verdict** : ✅ **PRÊT POUR TÉLÉCHARGEMENT (Play Store)**

---

## 🔗 Liens directs

### APK Preview (Tester l'app)
```
https://expo.dev/artifacts/eas/6gpvjCHzpJKTe9fJvhMVyt.apk
```

### APK Development (Debug)
```
https://expo.dev/artifacts/eas/dMmGUCRwdEia5cTBkSmiYC.apk
```

### AAB Production (Play Store)
```
https://expo.dev/artifacts/eas/d3e4SFX9DVEeQFZRLny6bN.aab
```

---

## 📥 Téléchargement et Installation

### Méthode 1 : Navigateur

1. **Cliquer** sur l'URL APK ci-dessus
2. **Télécharger** le fichier
3. **Sur le téléphone** : Activer "Sources inconnues"
4. **Installer** l'APK

### Méthode 2 : Commande CLI

```bash
# Télécharger le dernier build preview
npx eas-cli build:download --latest --platform android --profile preview

# Ou un build spécifique par ID
npx eas-cli build:download 2aa455ed-5b23-482a-bc04-4b252c9b9477
```

### Méthode 3 : QR Code (Expo Dashboard)

1. Aller sur : https://expo.dev/accounts/chriskreepz/projects/artisanflow-3rgvrambzo0tk8d1ddx2/builds
2. Cliquer sur un build
3. Scanner le QR code avec le téléphone
4. Télécharger automatiquement

---

## 🆕 Lancer un nouveau build

### Pourquoi ?

Tu as déjà 3 builds, donc un nouveau n'est **pas nécessaire** à moins que :
- Tu aies changé du code depuis le 02/11/2025
- Tu veuilles forcer une nouvelle compilation
- Les builds existants sont trop anciens

### Commandes

```bash
# Nouveau build preview
npx eas-cli build --platform android --profile preview

# Nouveau build production
npx eas-cli build --platform android --profile production

# Voir les builds en cours
npx eas-cli build:list --platform android --limit 10
```

**⚠️ Note** : Un nouveau build nécessite de répondre interactivement aux prompts pour créer le keystore. Impossible via `--non-interactive`.

---

## 🔑 Gestion des credentials

### Voir les credentials actuels

```bash
npx eas-cli credentials
# Sélectionner Android
```

### Générer un nouveau keystore

```bash
npx eas-cli credentials
# Sélectionner Android → Add credentials → Keystore → Generate new
```

### Utiliser credentials existants

Si tu as déjà des credentials configurés :

```bash
# EAS utilisera automatiquement les credentials du projet
npx eas-cli build --platform android --profile preview
```

---

## 📊 Vérification du projet

### Configuration actuelle

**eas.json** ✅
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

**app.json** ✅
- name: ArtisanFlow
- slug: artisanflow-3rgvrambzo0tk8d1ddx2
- version: 1.0.0
- package: com.artisanflow
- projectId: ef12de05-654e-4cc5-be14-26fc25571879

**eas-cli** ✅
- Version: 16.26.0
- Connecté: chriskreepz

---

## ✅ Résumé

### Ce qui fonctionne MAINTENANT

1. **Télécharger builds existants** :
   ```bash
   npx eas-cli build:download
   ```

2. **Voir liste des builds** :
   ```bash
   npx eas-cli build:list --platform android
   ```

3. **Utiliser liens directs** :
   - Preview APK : https://expo.dev/artifacts/eas/6gpvjCHzpJKTe9fJvhMVyt.apk
   - Dev APK : https://expo.dev/artifacts/eas/dMmGUCRwdEia5cTBkSmiYC.apk
   - Production AAB : https://expo.dev/artifacts/eas/d3e4SFX9DVEeQFZRLny6bN.aab

### Pour lancer un NOUVEAU build

**Commande** (dans terminal interactif) :
```bash
npx eas-cli build --platform android --profile preview
```

**Répondre** :
- "Generate a new Android Keystore?" → **Yes**

**Attendre** : 15-20 minutes

---

## 🎉 Conclusion

**Tu as déjà 2 APK téléchargeables !** Aucun nouveau build nécessaire sauf si tu as modifié le code.

**APK Preview** : https://expo.dev/artifacts/eas/6gpvjCHzpJKTe9fJvhMVyt.apk

---

**Status** : ✅ **BUILDS DISPONIBLES**

