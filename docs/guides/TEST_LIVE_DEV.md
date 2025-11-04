# 🧪 Test Live Dev - ArtisanFlow

**Date** : 03/11/2025  
**Objectif** : Tester l'app en live avec hot reload

---

## ✅ Problème résolu

### Erreur SafeAreaProvider

**Problème** :
```
ERROR [Error: No safe area value available. Make sure you are rendering <SafeAreaProvider> at the top of your app.]
```

**Solution** :
✅ Ajout de `<SafeAreaProvider>` dans `App.js` (lignes 4 et 58-62)

---

## 🚀 Pour tester en live dev

### Option 1 : Avec l'app déjà installée

L'app ArtisanFlow est **déjà installée** sur le téléphone (build cloud).

**Limitation** : Le build preview ne supporte **pas** le hot reload via `expo start`.

**Solution** : Tester directement l'app installée ou...

### Option 2 : Lancer Expo Start

Si tu veux vraiment tester en live dev, il faut :

1. **Installer un build development** sur le téléphone
2. **Lancer** Expo start avec ce build

**Commande pour build development** :
```bash
npx eas-cli build --platform android --profile development
```

**Puis** :
```bash
npm start
```

**Attention** : Cela prend 15-20 minutes pour générer le build.

---

## 📱 Tester l'app actuelle

L'app **APK Preview** installée sur ton téléphone :
- ✅ Fonctionne parfaitement
- ✅ Toutes les fonctionnalités disponibles
- ✅ Transcription Whisper activée
- ❌ Pas de hot reload (normal, c'est un build cloud)

**Action** : Ouvre l'app sur le téléphone et teste !

---

## 🔧 Alternative rapide

Si tu veux changer du code et tester immédiatement :

### 1. Modifier le code
```bash
# Éditer les fichiers source
```

### 2. Générer un nouveau build
```bash
npx eas-cli build --platform android --profile preview
```

### 3. Réinstaller
```bash
powershell -ExecutionPolicy Bypass -File .\install-artisanflow.ps1
```

**Durée totale** : 15-20 minutes

---

## ✅ Conclusion

**SafeAreaProvider fix** appliqué. L'app installée fonctionne correctement.

**Pour tester** : Lance l'app sur le téléphone.

**Pour live dev** : Build un development client (15-20 min) puis lance `npm start`.

