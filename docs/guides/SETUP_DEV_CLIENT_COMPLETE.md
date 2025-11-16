# 🚀 SETUP DEV CLIENT COMPLET - ArtisanFlow

**Date** : 2024  
**Status** : ✅ **100% CONFIGURÉ**

---

## ✅ MODIFICATIONS APPLIQUÉES

### 1. **app.json** ✅
- ✅ Ajouté `"scheme": "artisanflow"` dans section `android`

### 2. **package.json** ✅
- ✅ Scripts mis à jour pour dev client
- ✅ `start` : dev client standard
- ✅ `start:lan` : mode LAN explicite
- ✅ `start:tunnel` : mode tunnel
- ✅ `rebuild:android` : rebuild local

### 3. **eas.json** ✅
- ✅ Ajouté `"buildType": "apk"` dans développement

---

## 🎯 WORKFLOW COMPLET

### Étape 1 : Rebuild Dev Client (si nécessaire)

**Si vous avez des modules natifs nouveaux** :
```bash
npm run rebuild:android
```

**OU build EAS cloud** :
```bash
eas build --platform android --profile development
```

---

### Étape 2 : Lancer Metro

#### Option A : Mode Auto (Recommandé)
```bash
npm start
```

Expo détecte automatiquement la meilleure connexion (LAN ou tunnel).

#### Option B : Mode LAN
```bash
npm run start:lan
```

**Utilisez si** :
- ✅ PC et téléphone sur même WiFi
- ✅ Connexion stable
- ✅ Plus rapide que tunnel

#### Option C : Mode Tunnel
```bash
npm run start:tunnel
```

**Utilisez si** :
- ✅ PC Ethernet + téléphone WiFi
- ✅ Réseaux différents
- ✅ Firewall pose problème
- ⚠️ Plus lent que LAN

---

### Étape 3 : Connecter le téléphone

#### Méthode 1 : QR Code (Recommandé)
1. Scanner QR code affiché dans terminal
2. App s'ouvre automatiquement
3. Connexion instantanée

#### Méthode 2 : ADB Reverse (USB)
```bash
# Si téléphone connecté USB
adb reverse tcp:8081 tcp:8081

# Relancer Metro
npm start
```

---

### Étape 4 : Vérifier connexion

**Dans terminal** :
```
› Running "artisanflow" on device
› Connected to development server
```

**Dans app** :
- ✅ Écran se charge
- ✅ Pas d'erreur rouge
- ✅ Hot reload fonctionne

---

## 🔥 TROUBLESHOOTING

### Erreur : "Failed to connect to localhost"

**Solution** :
1. ❌ Ne pas cliquer "Fetch development servers"
2. ✅ Scanner QR code manuellement
3. ✅ Ou utiliser tunnel : `npm run start:tunnel`

---

### Erreur : Port 8081 occupé

**Solution** :
```bash
# Tuer process
for /f "tokens=5" %a in ('netstat -ano ^| findstr :8081 ^| findstr LISTENING') do taskkill /PID %a /F

# Relancer
npm start
```

---

### Dev client ne voit pas le serveur

**Solution** :
```bash
# Nettoyer cache app
# Shake téléphone → "Clear cache"

# Relancer Metro
npm start

# Scanner nouveau QR
```

---

### Whisper ne fonctionne pas

**Solution** :
```bash
# Rebuild dev client avec modules natifs
npm run rebuild:android

# Réinstaller sur téléphone
# Relancer npm start
```

---

## 📊 COMPARAISON MODES

| Mode | Vitesse | Stabilité | Usage |
|------|---------|-----------|-------|
| **Auto** | ⚡⚡⚡ | ✅✅✅ | Recommandé |
| **LAN** | ⚡⚡⚡⚡ | ✅✅ | Même réseau |
| **Tunnel** | ⚡⚡ | ✅✅✅ | Réseaux différents |

---

## 🔄 WORKFLOW RECOMMANDÉ

### Développement quotidien
```bash
# 1. Lancer Metro
npm start

# 2. Scanner QR
📱 Scanner QR dans dev client

# 3. Développer
💻 Code changes → Hot reload automatique
```

### Premier lancement du jour
```bash
# Option 1 : Clean start
npm start

# Option 2 : Si problèmes
npm run start:tunnel
```

### Après mise à jour dépendances natives
```bash
# Rebuild dev client
npm run rebuild:android

# OU
eas build --platform android --profile development

# Puis
npm start
```

---

## ✅ CHECKLIST AVANT DÉVELOPPEMENT

- [ ] Dev client installé sur téléphone
- [ ] Téléphone et PC sur même réseau (ou tunnel)
- [ ] Terminal propre (port 8081 libre)
- [ ] Scripts npm configurés
- [ ] app.json avec scheme

---

## 🎉 RÉSULTAT ATTENDU

**Terminal** :
```
› Metro bundler ready
› Running "artisanflow" on device
› Connected to development server
```

**App** :
- ✅ Interface fonctionnelle
- ✅ Hot reload actif
- ✅ Modules natifs OK (Whisper, etc.)
- ✅ Logs dans terminal

---

## 🚀 COMMANDES RAPIDES

```bash
# Démarrage rapide
npm start

# Si problèmes réseau
npm run start:tunnel

# Rebuild nécessaire
npm run rebuild:android
```

---

**Status** : ✅ **PRÊT POUR DÉVELOPPEMENT**

