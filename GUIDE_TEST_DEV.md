# 🧪 Guide : Tester la version DEV avec l'app stable installée

## 📱 Situation
Vous avez une **version stable** installée et vous voulez tester la **version de développement** en mode Expo.

## ✅ Solution : Deux apps côte à côte

### Option A : Modifier le package identifier pour la version DEV

Pour avoir les deux apps installées en même temps, modifiez le package identifier de la version dev.

**Android** : Modifier dans `app.json` :
```json
"android": {
  "package": "com.anonymous.artisanflow.dev"  // Ajouter .dev
}
```

**iOS** : Modifier dans `app.json` :
```json
"ios": {
  "bundleIdentifier": "com.anonymous.artisanflow.dev"  // Ajouter .dev
}
```

Puis builder :
```bash
npm run android  # ou npm run ios
```

### Option B : Utiliser le même package (remplace l'app stable)

Si vous utilisez le même package identifier, la version dev **remplacera** l'app stable. Vous pourrez réinstaller la stable après.

**Avantage** : Plus simple, pas de modification de config
**Inconvénient** : Remplace l'app stable temporairement

---

## 🚀 Étapes pour tester en mode Expo

### 1. Démarrer le serveur Expo en mode tunnel

```bash
npm run start:tunnel:direct
```

### 2. Sur votre téléphone

- **Si vous avez déjà un dev-client installé** :
  - Ouvrez l'app **ArtisanFlow (dev)** sur votre téléphone
  - L'app devrait automatiquement se connecter au serveur Metro
  - Si ce n'est pas le cas, secouez le téléphone → **"Reload"**

- **Si vous n'avez pas de dev-client** :
  - Builder et installer la version dev :
    ```bash
    npm run android  # Pour Android
    # ou
    npm run ios       # Pour iOS
    ```

### 3. Tester vos modifications

Une fois connecté, chaque modification du code sera automatiquement rechargée dans l'app dev-client.

---

## 🔄 Revenir à la version stable

Après vos tests, vous pouvez :
- Réinstaller la version stable depuis le Play Store / App Store
- OU garder les deux apps si vous avez utilisé un package identifier différent (.dev)

---

## 💡 Astuce

Pour éviter de remplacer l'app stable, utilisez toujours l'**Option A** (package identifier différent) pour la version dev.

