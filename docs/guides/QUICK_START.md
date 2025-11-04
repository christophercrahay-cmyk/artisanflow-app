# 🚀 Démarrage Rapide - ArtisanFlow

## Étape 1 : Configurer Supabase (2 minutes)

### 1.1 Aller sur Supabase
- Ouvrez https://upihalivqstavxijlwaj.supabase.co
- Connectez-vous à votre projet

### 1.2 Exécuter le script SQL
- Cliquez sur **"SQL Editor"** dans le menu de gauche
- Cliquez sur **"New Query"**
- **Copiez-collez TOUT le contenu du fichier `INIT_SUPABASE.sql`**
- Cliquez sur **"RUN"** en bas à droite

✅ Vous devriez voir "✅ Initialisation complète ! Tables et Storage configurés."

### 1.3 Vérifier les tables
- Allez dans **"Table Editor"** dans le menu de gauche
- Vous devriez voir ces 7 tables :
  - ✅ clients
  - ✅ projects
  - ✅ client_photos
  - ✅ project_photos
  - ✅ notes
  - ✅ devis
  - ✅ factures

---

## Étape 2 : Lancer l'application (1 minute)

### 2.1 Démarrer Expo
Ouvrez un terminal dans le dossier du projet et tapez :

```bash
npx expo start -c
```

### 2.2 Tester sur votre téléphone
- Installez **Expo Go** depuis le Play Store / App Store
- Scannez le QR code affiché dans le terminal
- L'app se lance sur votre téléphone !

---

## Étape 3 : Tester l'application

### Test simple
1. Ajoutez un **client** (Nom, Téléphone, Email)
2. Ajoutez un **chantier** pour ce client
3. Cliquez sur le chantier
4. Testez l'ajout de **photos** 📷
5. Testez l'enregistrement de **notes vocales** 🎙️

✅ Si tout fonctionne, votre configuration est terminée !

---

## ⚠️ Problèmes courants

### "relation does not exist"
→ Vous n'avez pas exécuté le script SQL. Retournez à l'étape 1.2.

### "row-level security policy"
→ Le script SQL devrait avoir désactivé RLS. Vérifiez que vous avez bien tout copié.

### Expo Go ne scanne pas
→ Assurez-vous que votre téléphone est sur le même WiFi que votre ordinateur.

---

## 🎉 C'est tout !

Votre application ArtisanFlow est maintenant prête à l'emploi.

**Note** : La transcription Whisper nécessite un build natif (voir README.md section "Build Production").

