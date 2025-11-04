# 🔧 FIX FINAL : DEV CLIENT CONNEXION

**Date** : 2024  
**Problème** : Dev client essaie toujours localhost

---

## 🔍 DIAGNOSTIC

Votre dev client cherche **automatiquement** `localhost:8081` au démarrage.

**Cela arrive quand** :
- Dev client n'a **jamais** été connecté avec QR code
- Cache dev client pointé vers localhost
- Build development mal configuré

---

## ✅ SOLUTION DÉFINITIVE

### Étape 1 : Nettoyer cache dev client

**Sur téléphone** :
1. Shake téléphone (ouvrir menu dev)
2. Appuyer **"Clear cache"**
3. Fermer app complètement
4. Relancer app

---

### Étape 2 : Lancer Metro proprement

**Dans terminal** :
```bash
# Arrêter tout (Ctrl+C si serveur actif)

# Nettoyer cache Metro
npx expo start -c --dev-client --lan
```

**OU** avec tunnel :
```bash
npx expo start -c --dev-client --tunnel
```

---

### Étape 3 : Scanner QR immédiatement

**IMPORTANT** :
1. ❌ **NE PAS** cliquer "Fetch development servers"
2. ❌ **NE PAS** attendre erreur localhost
3. ✅ Scanner QR code **IMMÉDIATEMENT** au démarrage

---

### Étape 4 : Si QR ne fonctionne pas

**Forcer URL manuelle** :

Dans terminal, cherchez ligne :
```
Metro waiting on exp://192.168.X.X:8081
```

OU (tunnel) :
```
Metro waiting on exp://XXX-XXX.tunnel.exp.direct:8081
```

**Dans dev client** :
1. Appuyer "Enter URL manually"
2. Coller URL complète
3. Appuyer Connect

---

## 🔥 SOLUTION RADICALE

### Rebuild dev client complet

**Problème** : Build development configuré avec localhost par défaut

**Solution** : Rebuilder avec bonne config

```bash
# 1. Nettoyer tout
rm -rf android ios .expo

# 2. Rebuild proprement
eas build --platform android --profile development

# 3. Installer APK généré

# 4. Relancer Metro
npm start

# 5. Scanner QR
```

---

## 🎯 VÉRIFICATION SETUP ACTUEL

Exécuter :
```bash
npx expo-doctor
```

**Si warning** :
```
"The /android project does not contain any URI schemes"
```

**C'est normal** : Le scheme est dans app.json, prebuild synchronisera.

---

## 📱 ACTION IMMÉDIATE

**Sur téléphone** :
1. ✅ Shake → Clear cache
2. ✅ Fermer app
3. ✅ Relancer app
4. ✅ **Scanner QR** immédiatement (ne pas attendre)
5. ✅ Ne pas cliquer "Fetch"

**Dans terminal** :
```bash
npx expo start -c --dev-client --tunnel
```

---

## 🔍 DIAGNOSTIC AVANCÉ

**Si toujours localhost** :

Le dev client sur votre téléphone est probablement un **vieil APK** configuré avec localhost.

**Solution** :
```bash
# Désinstaller app
adb uninstall com.artisanflow

# Builder nouveau
eas build --platform android --profile development

# Installer nouveau APK

# Relancer Metro
npm start

# Scanner QR
```

---

**ACTION** : Clear cache dev client + Scanner QR immédiatement !

