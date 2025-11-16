# 🎯 GUIDE UPLOAD GOOGLE PLAY STORE

**Date** : 02/11/2025  
**App** : ArtisanFlow  
**Version** : 1.0.0

---

## 📦 ÉTAPE 1 : TÉLÉCHARGER LE FICHIER .AAB

### Option A : Direct Download

1. **Ouvrir ce lien** dans ton navigateur :
   ```
   https://expo.dev/artifacts/eas/d3e4SFX9DVEeQFZRLny6bN.aab
   ```

2. **Fichier téléchargé** → `app-release.aab` (dans Downloads)

### Option B : Via Expo Dashboard

1. **Aller** : https://expo.dev/accounts/chriskreepz/projects/artisanflow-3rgvrambzo0tk8d1ddx2/builds
2. **Cliquer** sur le build "finished"
3. **Bouton Download** → Fichier `.aab`

✅ **Vérifier** : Fichier présent sur ton PC

---

## 🚀 ÉTAPE 2 : GOOGLE PLAY CONSOLE

### 2.1 Connexion

1. **Aller** : https://play.google.com/console
2. **Se connecter** avec ton compte Google
3. **Accepter** conditions développeur (25$ une fois)

### 2.2 Créer l'App (si première fois)

**Si tu n'as JAMAIS créé l'app** :

1. **Cliquer** "Create app" (ou "Ajouter une application")

2. **Remplir** :
   - **App name** : `ArtisanFlow`
   - **Default language** : `Français (France)`
   - **App or game** : `App`
   - **Free or paid** : `Free`
   - **Developer Program Policies** : ✅ Cocher
   - **Cliquer** "Create app"

3. **Attendre** 30 secondes → App créée

**Si l'app existe déjà** : Skip cette étape

---

## 📤 ÉTAPE 3 : UPLOADER LE .AAB

### 3.1 Préparation

1. **Dans Play Console** → Sélectionner **ArtisanFlow**

2. **Sidebar gauche** :
   - Aller dans **"Production"** ou **"Testing"**
   - Cliquer **"Closed testing"** (ou "Internal testing")

3. **Cliquer** **"Create new release"**

### 3.2 Upload

1. **Section "Android App Bundles and APKs"** :
   - **Cliquer** "Drag and drop to add files"
   - **Ou** "Choose files"

2. **Sélectionner** ton fichier `app-release.aab` téléchargé

3. **Attendre** upload (1-2 min)

4. **Google vérifie** le fichier automatiquement

✅ **Si OK** → Tu vois "App bundle uploaded successfully"

---

## 📝 ÉTAPE 4 : COMPLÉTER LES INFOS

### 4.1 Informations de version (obligatoire)

**Release name** (optionnel) :
```
1.0.0
```

**Release notes** (optionnel mais recommandé) :
```
Version 1.0.0 - Lancement initial

✅ Gestion clients et chantiers
✅ Photos et notes vocales
✅ Devis et factures
✅ Transcription automatique IA
✅ Thème sombre professionnel
```

### 4.2 Comment cette version devrait-elle être disponible ?

**Sélectionner** : **"Closed testing"** (Test fermé)

**Commentaire** : Cette version est pour les testeurs sélectionnés

---

## 👥 ÉTAPE 5 : CRÉER LA LISTE DE TESTEURS

### 5.1 Créer une liste

1. **Dans "Closed testing"** → **"Testers"**

2. **Cliquer** "Create email list"

3. **Nom** : `Testeurs initiaux`

4. **Emails** (1 par ligne) :
   ```
   testeur1@example.com
   testeur2@example.com
   ```

5. **Sauvegarder**

### 5.2 Activer la liste

1. **Revenir** dans "Releases"
2. **Sélectionner** la liste "Testeurs initiaux"
3. **Appliquer**

---

## 🎯 ÉTAPE 6 : PUBLICATIONS

### 6.1 Faire un "Review"

Avant de lancer, Google va vérifier :

1. **"Review release"** → Google scan automatique

2. **Attendre** 5-10 min (automatique)

### 6.2 Lancer le rollout

1. **"Start rollout to Closed testing"**

2. **Confirmer**

✅ **App envoyée aux testeurs !**

---

## ⚠️ PROBLÈMES POSSIBLES

### Erreur "Missing App Content"

**Si Google demande** :
- Politique de confidentialité
- Description complète
- Captures d'écran

**Solution** :
1. **Aller** dans "App content" (gauche)
2. **Compléter** les sections manquantes

### Erreur "Missing privacy policy"

**Solution rapide** :

Créer un fichier `privacy.txt` hébergé quelque part (GitHub, Netlify, etc.) :
```
ArtisanFlow Privacy Policy

1. Données collectées : Clients, chantiers, photos, notes
2. Stockage : Supabase (France)
3. Partage : Aucun
4. Retention : Jusqu'à suppression compte
5. Contact : contact@artisanflow.fr
```

**Ajouter URL dans Play Console** :
- "App content" → "Privacy policy" → "Add URL"

### Erreur "Missing screenshot"

**Solution** :
1. **Prendre** 2-3 screenshots de l'app
2. **App content** → "Screenshots" → Uploader

---

## ✅ CHECKLIST FINALE

### Avant de lancer

- [ ] Fichier .aab téléchargé
- [ ] App créée dans Play Console
- [ ] .aab uploadé
- [ ] Release notes complétés
- [ ] Liste de testeurs créée
- [ ] Review OK
- [ ] Rollout lancé

### Infos app (optionnel mais recommandé)

- [ ] Politique de confidentialité (URL)
- [ ] Description courte (80 chars min)
- [ ] Description longue (4000 chars)
- [ ] 2-4 screenshots
- [ ] Icono haute résolution
- [ ] Contact email visible

---

## 📊 TIMELINE ATTENDUE

| Étape | Durée |
|-------|-------|
| Upload .aab | 2 min |
| Review Google | 5-10 min |
| Rollout | Instantané |
| Disponibilité testeurs | 10-15 min |
| **Total** | **~30 min** |

---

## 🎉 APRÈS LE LANCEMENT

### Pour les testeurs

1. **Recevoir** email d'invitation Google
2. **Cliquer** "Devenir testeur"
3. **Accepter** conditions
4. **Télécharger** depuis Play Store (ou lien fourni)

### Pour toi

1. **Dashboard** → Voir statistiques
2. **Crash reports** (s'il y en a)
3. **Feedback** utilisateurs
4. **Prepare** version 1.0.1 si bugs

---

## 🔄 VERSIONS FUTURES

### Pour 1.0.1

```bash
# 1. Modifier app.json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}

# 2. Rebuild
eas build --platform android --profile production

# 3. Uploader nouveau .aab
# (même process)
```

---

## 🆘 AIDE

### Documentation officielle
- https://support.google.com/googleplay/android-developer

### Support Expo EAS
- https://docs.expo.dev/build/introduction/

---

**Status** : ✅ **PRÊT POUR UPLOAD**

**Lien .aab** : https://expo.dev/artifacts/eas/d3e4SFX9DVEeQFZRLny6bN.aab


