# 🚀 Commandes Expo - ArtisanFlow

## 📱 Démarrage

### Expo Go (Test Rapide)
```bash
npx expo start
```
- Scanne QR code avec Expo Go
- Refresh auto

### Development Build (Build Natif)
```bash
npx expo start --dev-client
```
- Utilise le build natif installé
- Nécessite APK/AAB installé

### Tunnel (si WiFi ne fonctionne pas)
```bash
npx expo start --tunnel
```
- Plus lent mais fonctionne de partout

---

## 🔧 Build

### Build APK Cloud
```bash
npx eas-cli build --platform android --profile preview
```

### Build AAB Production
```bash
npx eas-cli build --platform android --profile production
```

---

## 📦 Installation APK

### Automatique (Script PowerShell)
```bash
powershell -ExecutionPolicy Bypass -File .\install-artisanflow.ps1
```

### Manuelle (ADB)
```bash
adb install -r C:\Android\ArtisanFlow-preview.apk
```

---

## 🐛 Debug

### Nettoyer le Cache
```bash
npx expo start -c
```

### Voir les Logs
```bash
npx expo start --web
```

---

## ⚡ Raccourcis Clavier

| Touche | Action |
|--------|--------|
| `a` | Ouvrir sur Android |
| `i` | Ouvrir sur iOS |
| `r` | Reload |
| `m` | Toggle menu dev |
| `j` | Ouvrir debugger |

---

## 📚 Plus d'Infos

**Docs** : https://docs.expo.dev  
**Build** : https://expo.dev/accounts/chriskreepz/projects/artisanflow-3rgvrambzo0tk8d1ddx2


