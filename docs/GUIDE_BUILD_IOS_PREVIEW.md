# 📱 Guide Build iOS Preview - Test Utilisateur

**Date** : 13 novembre 2025  
**Bundle ID** : `com.acontrecourant.artisanflow`  
**Profil** : `preview` (distribution interne)

---

## 🎯 Objectif

Créer un build iOS que ta sœur peut installer et tester sur son iPhone.

---

## ✅ Prérequis

1. **Compte Apple Developer** actif (99€/an)
   - Si tu n'as pas encore de compte, crée-le sur [developer.apple.com](https://developer.apple.com)

2. **EAS CLI installé et connecté**
   ```bash
   npm install -g eas-cli
   eas login
   ```

3. **Certificats iOS configurés**
   - EAS peut les générer automatiquement au premier build
   - Ou tu peux les configurer manuellement : `eas credentials`

---

## 🚀 Étapes de Build

### 1. Vérifier la configuration

```bash
# Vérifier que le Bundle ID est correct
npx expo config --type public | grep bundleIdentifier
# Doit afficher: com.acontrecourant.artisanflow
```

### 2. Lancer le build iOS Preview

```bash
eas build --platform ios --profile preview
```

**Options disponibles** :
- `--non-interactive` : Mode non-interactif (si tout est déjà configuré)
- `--local` : Build local (nécessite macOS + Xcode)

### 3. Suivre le build

EAS va :
1. ✅ Vérifier ta configuration
2. ✅ Générer/créer les certificats iOS si nécessaire
3. ✅ Builder l'app sur leurs serveurs macOS
4. ✅ Te donner un lien de téléchargement

**Temps estimé** : 15-30 minutes

---

## 📲 Distribution à ta sœur

### Option A : TestFlight (Recommandé) ✅

**Avantages** :
- ✅ Installation facile via l'app TestFlight
- ✅ Mises à jour automatiques
- ✅ Jusqu'à 10 000 testeurs
- ✅ Feedback intégré

**Étapes** :

1. **Soumettre à TestFlight** (après le build) :
   ```bash
   eas submit --platform ios --profile preview
   ```
   
   Ou manuellement :
   - Va sur [expo.dev](https://expo.dev)
   - Télécharge le fichier `.ipa` du build
   - Upload sur [App Store Connect](https://appstoreconnect.apple.com)
   - Ajoute ta sœur comme testeur interne/externe

2. **Inviter ta sœur** :
   - Dans App Store Connect → TestFlight → Testeurs internes
   - Ajoute son email Apple ID
   - Elle recevra une invitation par email
   - Elle installe l'app TestFlight depuis l'App Store
   - Elle accepte l'invitation et installe ArtisanFlow

### Option B : Distribution Ad-Hoc (Alternative)

**Avantages** :
- ✅ Pas besoin de TestFlight
- ✅ Installation directe via lien

**Limitations** :
- ⚠️ Maximum 100 appareils
- ⚠️ Nécessite d'enregistrer l'UDID de l'iPhone de ta sœur

**Étapes** :

1. **Récupérer l'UDID de l'iPhone de ta sœur** :
   - Sur iPhone : Réglages → Général → Informations → Identifiant
   - Ou via iTunes/Finder (connecté)

2. **Ajouter l'UDID dans EAS** :
   ```bash
   eas device:create
   ```
   - Suis les instructions pour ajouter l'UDID

3. **Rebuild avec l'UDID** :
   ```bash
   eas build --platform ios --profile preview
   ```
   - EAS va automatiquement inclure l'UDID dans le profil de provisioning

4. **Partager le lien** :
   - Après le build, EAS te donne un lien de téléchargement
   - Envoie ce lien à ta sœur
   - Sur iPhone : Safari → Ouvrir le lien → Installer

---

## 🔍 Vérifications après Build

### Vérifier le build

```bash
# Lister les builds récents
eas build:list --platform ios --limit 5

# Voir les détails d'un build
eas build:view [BUILD_ID]
```

### Tester l'installation

1. ✅ Télécharge le `.ipa` depuis le dashboard EAS
2. ✅ Installe sur ton iPhone (si tu en as un)
3. ✅ Vérifie que l'app démarre correctement
4. ✅ Teste les fonctionnalités principales

---

## ⚠️ Problèmes courants

### Erreur : "No Apple Team ID configured"

**Solution** :
```bash
eas credentials
# Sélectionne iOS → Configure Apple Team ID
```

### Erreur : "Certificate expired"

**Solution** :
```bash
eas credentials
# Sélectionne iOS → Regenerate certificates
```

### Erreur : "Bundle ID already exists"

**Solution** :
- Vérifie que le Bundle ID `com.acontrecourant.artisanflow` est bien disponible
- Si déjà utilisé, change-le dans `app.json` et `app.config.js`

### Build échoue avec erreur de code signing

**Solution** :
```bash
# Nettoyer les credentials et recommencer
eas credentials
# Sélectionne iOS → Clear all credentials
# Puis relance le build
```

---

## 📋 Checklist avant Build

- [ ] Bundle ID configuré : `com.acontrecourant.artisanflow`
- [ ] `eas.json` mis à jour avec config iOS preview
- [ ] `eas login` effectué
- [ ] Compte Apple Developer actif
- [ ] Version app : `1.0.1` (vérifier dans `app.json`)
- [ ] Build number : `2` (vérifier dans `app.json`)

---

## 🎉 Après le Build

Une fois le build terminé :

1. ✅ **Télécharge le `.ipa`** depuis le dashboard EAS
2. ✅ **Soumet à TestFlight** (option A) ou partage le lien (option B)
3. ✅ **Invite ta sœur** comme testeur
4. ✅ **Donne-lui les instructions** :
   - Installer TestFlight (si option A)
   - Accepter l'invitation
   - Installer ArtisanFlow
   - Tester les fonctionnalités principales

---

## 📞 Support

Si tu rencontres des problèmes :

1. **Logs du build** : `eas build:view [BUILD_ID]`
2. **Documentation EAS** : [docs.expo.dev/build/introduction](https://docs.expo.dev/build/introduction/)
3. **Support Expo** : [forums.expo.dev](https://forums.expo.dev)

---

**Bon build ! 🚀**








