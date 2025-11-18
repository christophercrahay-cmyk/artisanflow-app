# 📊 Comment suivre votre build Expo

## Méthode 1 : Dans le terminal où le build tourne

Le build que vous avez lancé devrait afficher une URL dans le terminal, du type :

```
📱 Build started. You can monitor the build at:
   https://expo.dev/accounts/[votre-compte]/builds/[build-id]
```

**Regardez dans le terminal où vous avez lancé `eas build`** - l'URL devrait être affichée.

---

## Méthode 2 : Sur le site Expo

1. Allez sur **https://expo.dev**
2. Connectez-vous avec votre compte Expo
3. Allez dans **"Builds"** dans le menu
4. Vous verrez tous vos builds en cours et terminés

---

## Méthode 3 : Via la commande (dans un nouveau terminal)

```bash
# Utiliser npx pour contourner le problème de PATH
npx eas-cli build:list --platform android --limit 5
```

Cela affichera les 5 derniers builds avec leurs URLs.

---

## Méthode 4 : URL directe (si vous connaissez votre username)

L'URL suit ce format :
```
https://expo.dev/accounts/[votre-username]/builds
```

Remplacez `[votre-username]` par votre nom d'utilisateur Expo.

---

## ⚡ Solution rapide

**Regardez dans le terminal où le build tourne** - l'URL devrait être affichée au début du build !

Si vous ne la voyez pas, ouvrez un **nouveau terminal** et exécutez :

```bash
npx eas-cli build:list --platform android --limit 1
```

