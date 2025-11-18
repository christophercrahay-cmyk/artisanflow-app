# 🚨 SOLUTION RAPIDE - Erreur Metro "Unable to load script"

## Le problème
Votre appareil ne peut pas se connecter à Metro. C'est souvent parce que :
1. L'app installée n'est PAS un development build
2. L'app a été compilée avec une ancienne configuration

## SOLUTION IMMÉDIATE (3 options)

### Option 1 : REBUILD l'app en mode développement (RECOMMANDÉ)

```bash
# 1. Nettoyer complètement
npm run android:clean

# 2. Rebuild l'app en mode dev
npm run android:build

# 3. Une fois l'app installée, démarrer Metro
npm start
```

### Option 2 : Utiliser EAS Build (si vous avez un compte Expo)

```bash
# Build un nouveau dev client
eas build --platform android --profile development

# Une fois le build terminé, installer l'APK sur votre appareil
# Puis démarrer Metro
npm start
```

### Option 3 : Utiliser Expo Go (TEMPORAIRE - pour tester)

```bash
# Démarrer en mode Expo Go (sans dev-client)
npx expo start

# Scannez le QR code avec Expo Go
# ⚠️ ATTENTION : Certaines fonctionnalités natives ne fonctionneront pas
```

## VÉRIFICATION IMPORTANTE

**L'app installée sur votre appareil DOIT être un "development build"**

Pour vérifier :
- Le nom de l'app devrait être "ArtisanFlow Dev" (pas juste "ArtisanFlow")
- Ou l'app devrait avoir été installée via `npm run android:build` ou `eas build --profile development`

## Si vous avez une version PRODUCTION installée

**C'est ça le problème !** Une app production ne peut PAS se connecter à Metro.

**Solution :**
1. Désinstallez l'app actuelle de votre appareil
2. Rebuild en mode dev : `npm run android:build`
3. Installez la nouvelle app
4. Démarrez Metro : `npm start`
5. Dans l'app, appuyez sur "Reload"

## Commandes complètes (copier-coller)

```bash
# Arrêter tout
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Nettoyer
npm run android:clean

# Rebuild
npm run android:build

# Une fois l'app installée sur l'appareil
npm start
```

