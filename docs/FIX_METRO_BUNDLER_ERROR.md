# 🔧 Guide de résolution : Erreur Metro Bundler "Unable to load script"

## Problème
L'application affiche : `java.lang.RuntimeException: Unable to load script.`

## Solutions rapides (dans l'ordre)

### 1. Vérifier que Metro est en cours d'exécution

```bash
# Arrêter tous les processus Metro existants
npm run kill:port

# Redémarrer Metro avec cache vidé
npm start
# ou
npm run start:safe
```

### 2. Si vous êtes sur un appareil physique Android (USB)

```bash
# Configurer le port forwarding ADB
adb reverse tcp:8081 tcp:8081

# Vérifier que le port est bien forwardé
adb reverse --list
```

### 3. Si vous êtes sur un appareil physique (Wi-Fi)

```bash
# Démarrer Metro en mode tunnel (nécessite Expo account)
npm run start:tunnel

# OU en mode LAN
npm run start:lan
```

### 4. Nettoyer complètement le cache

```bash
# Nettoyer le cache Metro
npx expo start --clear

# Nettoyer le cache npm/node_modules (si nécessaire)
rm -rf node_modules
npm install

# Nettoyer le cache Android
cd android
./gradlew clean
cd ..
```

### 5. Vérifier la connexion réseau

- **USB** : Vérifier que le câble USB est bien connecté et que le mode débogage USB est activé
- **Wi-Fi** : Vérifier que l'appareil et l'ordinateur sont sur le même réseau Wi-Fi
- **Tunnel** : Nécessite un compte Expo (gratuit)

### 6. Vérifier le port 8081

```bash
# Windows (PowerShell)
netstat -ano | findstr :8081

# Si le port est occupé, tuer le processus
npm run kill:port
```

### 7. Redémarrer l'application sur l'appareil

- Appuyer sur "Reload" dans l'écran d'erreur
- OU fermer complètement l'app et la rouvrir
- OU redémarrer l'appareil

## Solution recommandée (workflow complet)

```bash
# 1. Arrêter tous les processus
npm run kill:port

# 2. Nettoyer le cache
npx expo start --clear

# 3. Si appareil physique USB
adb reverse tcp:8081 tcp:8081

# 4. Démarrer Metro
npm start

# 5. Dans l'app, appuyer sur "Reload"
```

## Vérifications supplémentaires

### Vérifier que le dev client est installé
- L'app doit être un **development build** (pas une version production)
- Si vous avez installé une version production, réinstallez un dev build :
  ```bash
  npm run android:build
  # ou
  eas build --platform android --profile development
  ```

### Vérifier les variables d'environnement
- Vérifier que `.env` existe et contient les bonnes valeurs
- Vérifier que `EXPO_PUBLIC_*` variables sont bien définies

### Vérifier la configuration Metro
- Le fichier `metro.config.js` doit être présent
- Vérifier qu'il n'y a pas d'erreurs de syntaxe

## Si rien ne fonctionne

1. **Redémarrer complètement** :
   - Fermer tous les terminaux
   - Redémarrer l'ordinateur
   - Redémarrer l'appareil
   - Relancer `npm start`

2. **Vérifier les logs Metro** :
   - Regarder la console Metro pour des erreurs spécifiques
   - Vérifier les logs Android : `adb logcat | grep ReactNativeJS`

3. **Rebuild l'app** :
   ```bash
   npm run android:clean
   npm run android:build
   ```

## Notes importantes

- **Development build** : L'app doit être compilée en mode développement
- **Port 8081** : Doit être libre et accessible
- **Réseau** : USB ou Wi-Fi/Tunnel, pas les deux en même temps
- **Cache** : Toujours essayer `--clear` en premier

