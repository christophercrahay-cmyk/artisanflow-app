# 🔧 Guide complet pour REBUILD Android

## Problèmes détectés
1. ❌ JAVA_HOME mal configuré
2. ❌ ANDROID_HOME non trouvé
3. ❌ Java pas dans le PATH

## SOLUTION ÉTAPE PAR ÉTAPE

### Étape 1 : Vérifier/Installer Java JDK 17

**Option A : Si Java est déjà installé mais mal configuré**

1. Trouvez où Java est installé :
   - Cherchez dans `C:\Program Files\Eclipse Adoptium\`
   - Ou `C:\Program Files\Java\`
   - Notez le chemin complet (ex: `C:\Program Files\Eclipse Adoptium\jdk-17.0.12`)

**Option B : Si Java n'est pas installé**

1. Téléchargez Eclipse Adoptium JDK 17 :
   - https://adoptium.net/temurin/releases/?version=17
   - Choisissez Windows x64, .msi installer
2. Installez-le (gardez le chemin par défaut)

### Étape 2 : Configurer JAVA_HOME (IMPORTANT)

1. Ouvrez "Variables d'environnement" :
   - Appuyez sur `Win + R`
   - Tapez `sysdm.cpl` et Entrée
   - Onglet "Avancé" → "Variables d'environnement"

2. Dans "Variables système" :
   - Cliquez "Nouveau"
   - Nom : `JAVA_HOME`
   - Valeur : Le chemin vers votre JDK (ex: `C:\Program Files\Eclipse Adoptium\jdk-17.0.12`)
   - ⚠️ **IMPORTANT** : Pas de `\bin` à la fin !

3. Modifier PATH :
   - Sélectionnez "Path" → "Modifier"
   - Ajoutez : `%JAVA_HOME%\bin`
   - Cliquez OK partout

4. **Fermez et rouvrez votre terminal** (obligatoire !)

### Étape 3 : Installer/Configurer Android SDK

**Si Android Studio n'est pas installé :**

1. Téléchargez Android Studio :
   - https://developer.android.com/studio
2. Installez-le
3. À l'ouverture, installez :
   - Android SDK
   - Android SDK Platform-Tools
   - Android SDK Build-Tools

**Configurer ANDROID_HOME :**

1. Trouvez le chemin du SDK (généralement) :
   - `C:\Users\VotreNom\AppData\Local\Android\Sdk`

2. Dans "Variables d'environnement" :
   - Nouvelle variable : `ANDROID_HOME`
   - Valeur : `C:\Users\VotreNom\AppData\Local\Android\Sdk`

3. Modifier PATH :
   - Ajoutez : `%ANDROID_HOME%\platform-tools`
   - Ajoutez : `%ANDROID_HOME%\tools`

4. **Fermez et rouvrez votre terminal**

### Étape 4 : Vérifier la configuration

Dans un **NOUVEAU terminal** :

```powershell
# Vérifier Java
java -version
# Devrait afficher : openjdk version "17.x.x"

# Vérifier JAVA_HOME
echo $env:JAVA_HOME
# Devrait afficher le chemin vers JDK

# Vérifier ANDROID_HOME
echo $env:ANDROID_HOME
# Devrait afficher le chemin vers Android SDK

# Vérifier ADB
adb version
# Devrait afficher la version d'ADB
```

### Étape 5 : REBUILD

Une fois tout configuré :

```bash
# Nettoyer
npm run android:clean

# Rebuild (prend 5-10 minutes)
npm run android:build
```

## SOLUTION RAPIDE (si vous avez déjà tout installé)

Exécutez ce script pour configurer temporairement :

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-android-env.ps1
```

Puis dans le MÊME terminal :

```bash
npm run android:clean
npm run android:build
```

## ⚠️ IMPORTANT

- **Fermez et rouvrez le terminal** après avoir modifié les variables d'environnement
- Le chemin JAVA_HOME ne doit **PAS** contenir `\bin` à la fin
- Le chemin doit exister vraiment (vérifiez dans l'explorateur)

## Si ça ne marche toujours pas

Envoyez-moi :
1. Le résultat de `echo $env:JAVA_HOME`
2. Le résultat de `echo $env:ANDROID_HOME`
3. Le résultat de `java -version`

Et je vous aiderai à corriger !

