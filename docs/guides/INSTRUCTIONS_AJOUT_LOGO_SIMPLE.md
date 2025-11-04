# 📝 Instructions Simple : Ajouter le Logo

## 🎯 Ce que tu dois faire

### Option 1 : Dropper l'Image dans Cursor (RECOMMANDÉ)

1. **Ouvre le dossier `assets`** dans l'explorateur de fichiers Cursor (panneau de gauche)

2. **Fais glisser ton image** du logo directement dans le dossier `assets`

3. **Renomme le fichier** en `artisanflow-logo.png`
   - Clic droit sur le fichier → Rename
   - Nouveau nom : `artisanflow-logo.png`

---

### Option 2 : Via l'Explorateur Windows

1. **Ouvre l'explorateur Windows**
   - Appuie sur `Win + E`

2. **Va dans** :
   ```
   C:\Users\Chris\Desktop\MVP_Artisan\artisanflow\assets
   ```

3. **Copie ton image** du logo dans ce dossier

4. **Renomme le fichier** en `artisanflow-logo.png`

---

### Option 3 : Export depuis un Outil (Si besoin)

Si tu as le logo dans un outil de design :

1. **Ouvre** le logo dans ton logiciel (Figma, Photoshop, etc.)

2. **Exporte en PNG** :
   - Dimensions : **180 x 120 pixels** (ou ratio 3:2)
   - Fond : **Transparent** (ou blanc)

3. **Sauvegarde** comme : `artisanflow-logo.png`

4. **Copie** dans le dossier `assets`

---

## ✅ Après avoir ajouté le logo

**Redémarrer Expo** :
```bash
npm start
```

**Appuyer sur** :
- `a` pour Android
- `i` pour iOS (si simulateur)

---

## 🧪 Tester

**Vérifier** :
- ✅ Le logo s'affiche sur l'écran de connexion
- ✅ Bonne taille (pas trop grand/petit)
- ✅ Centré
- ✅ Tagline "Simplifiez vos chantiers."

---

## ⚠️ Si Erreur "Cannot find module"

**Cause** : Fichier pas au bon endroit ou mauvais nom

**Solution** :
1. Vérifier le chemin : `assets/artisanflow-logo.png`
2. Vérifier le nom : EXACTEMENT `artisanflow-logo.png` (sensible à la casse)
3. Redémarrer Expo complètement

---

## 📂 Structure Attendu

```
artisanflow/
├── assets/
│   ├── artisanflow-logo.png  ← TON LOGO ICI
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
└── screens/
    └── AuthScreen.js  ← Déjà modifié ✅
```

---

**C'est tout ! Simple comme bonjour !** 🎉


