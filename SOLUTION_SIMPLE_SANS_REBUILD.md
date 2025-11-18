# ✅ SOLUTION SIMPLE - Sans rebuild, sans ADB, sans config

## Le vrai problème
Votre app ne peut pas se connecter à Metro. Mais on peut contourner ça !

## SOLUTION ULTRA SIMPLE (2 minutes)

### Option 1 : Utiliser Expo Go (le plus rapide)

```bash
# 1. Arrêter Metro actuel (Ctrl+C dans le terminal Metro)

# 2. Démarrer en mode Expo Go
npx expo start

# 3. Scannez le QR code avec l'app "Expo Go" sur votre téléphone
#    (Téléchargez-la depuis le Play Store si vous ne l'avez pas)
```

**C'est tout !** Expo Go se connectera automatiquement.

⚠️ **Limitation** : Certaines fonctionnalités natives ne fonctionneront pas, mais vous pourrez tester l'app.

---

### Option 2 : Si vous avez déjà un development build installé

Le problème est juste la connexion. Essayez :

```bash
# 1. Arrêter tout
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Démarrer Metro en mode tunnel
npx expo start --dev-client --tunnel --clear

# 3. Attendre le QR code
# 4. Dans l'app, appuyer sur "Reload"
```

---

## Si vous VOULEZ vraiment rebuild (mais c'est long)

Il faut d'abord configurer l'environnement :

1. **Installer Android Studio** (si pas déjà fait)
2. **Configurer JAVA_HOME** :
   - Trouver où Java est installé
   - Ajouter dans les variables d'environnement Windows
3. **Configurer ANDROID_HOME** :
   - Chemin : `C:\Users\VotreNom\AppData\Local\Android\Sdk`
   - Ou là où Android SDK est installé

**Mais franchement, utilisez Expo Go pour l'instant !**

