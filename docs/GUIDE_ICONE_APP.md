# 🎨 Guide - Mise à Jour Icône ArtisanFlow

**Date** : 5 novembre 2025

---

## 📋 Configuration Actuelle

### Fichiers à Remplacer

```
assets/
├── icon.png              ← Icône principale (iOS/Android)
├── adaptive-icon.png     ← Icône Android adaptative (foreground)
├── splash-icon.png       ← Icône splash screen
└── favicon.png           ← Icône web
```

### Configuration `app.json`

```json
{
  "expo": {
    "icon": "./assets/icon.png",              // Icône principale
    "splash": {
      "image": "./assets/splash-icon.png",    // Splash
      "backgroundColor": "#0F1115"             // Fond sombre
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",  // Android
        "backgroundColor": "#ffffff"                       // ⚠️ À changer
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"       // Web
    }
  }
}
```

---

## 🎨 Design Recommandé (Thème ArtisanFlow)

### Spécifications Icône

**Dimensions** :
- `icon.png` : **1024x1024px** (obligatoire)
- `adaptive-icon.png` : **1024x1024px** (Android)
- `splash-icon.png` : **1024x1024px** (cohérence)
- `favicon.png` : **48x48px** ou **192x192px** (web)

**Design** :
```
┌────────────────────────┐
│                        │
│   Fond : #0F1115       │ ← Gris très sombre (thème app)
│   ou #1A1D22           │ ← Gris surface
│                        │
│       🔧               │ ← Icône outil (Feather "tool")
│    ou 🏗️              │ ← ou icône construction
│                        │
│   Couleur : #3B82F6    │ ← Bleu électrique (accent)
│   Style : Minimaliste  │ ← Lignes épurées
│   Stroke : 2.5         │ ← Trait légèrement épais
│                        │
└────────────────────────┘
```

**Variantes possibles** :
1. **Icône "tool" Feather** (clé + marteau)
2. **Icône "briefcase" Feather** (mallette pro)
3. **Icône "home" + "tool"** (maison + outil)
4. **Logo texte "AF"** (initiales stylisées)

---

## 🔧 Étapes de Mise à Jour

### 1. Créer les Icônes

#### Option A : Design sur Figma/Illustrator
```
1. Créer fichier 1024x1024px
2. Fond : #0F1115 (ou #1A1D22)
3. Icône centrée : #3B82F6 (bleu)
4. Style minimaliste
5. Exporter en PNG
```

#### Option B : Générateur en Ligne
```
1. Utiliser https://easyappicon.com/
2. Upload votre design 1024x1024
3. Télécharger le pack complet
4. Extraire icon.png, adaptive-icon.png
```

#### Option C : Code SVG → PNG
```javascript
// Utiliser un outil comme react-native-svg
// Convertir SVG en PNG 1024x1024
```

---

### 2. Remplacer les Fichiers

```bash
# Sauvegarder les anciennes icônes (au cas où)
mkdir assets/old-icons
cp assets/icon.png assets/old-icons/
cp assets/adaptive-icon.png assets/old-icons/
cp assets/splash-icon.png assets/old-icons/

# Remplacer par les nouvelles
# Copier votre nouvelle icône 1024x1024 :
# - icon.png (icône principale)
# - adaptive-icon.png (Android foreground)
# - splash-icon.png (écran de démarrage)
```

---

### 3. Mettre à Jour `app.json`

**Modification Android adaptive-icon** :

```json
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#0F1115"  // ← Changer de #ffffff à #0F1115 (cohérent)
  }
}
```

**Raison** : Fond blanc incohérent avec thème dark de l'app

---

### 4. Nettoyer Cache & Rebuild

```bash
# Nettoyer cache Expo
npx expo start --clear

# OU

# Rebuild Android (EAS)
eas build --platform android --profile development --local

# OU

# Rebuild Android (direct)
cd android && ./gradlew clean && cd ..
npx expo run:android
```

---

## ✅ Validation

### Vérification après Build

```
1. Installer APK sur device
2. Vérifier icône sur launcher Android
   → ✅ Fond sombre (#0F1115)
   → ✅ Icône bleue (#3B82F6)
   → ✅ Nette et centrée
   → ✅ Pas de bords blancs

3. Vérifier splash screen
   → ✅ Icône cohérente
   → ✅ Fond sombre (#0F1115)

4. Vérifier favicon web
   → ✅ Cohérent (si utilisé)
```

---

## 🎨 Recommandation Design

### Icône Minimaliste "Tool"

**Concept** :
```
Fond sombre (#0F1115)
Icône Feather "tool" (#3B82F6)
Stroke 2.5
Taille : 70% du canvas (marge 15% de chaque côté)
```

**Exemple visuel** :
```
┌─────────────────┐
│                 │
│     🔧         │  ← Bleu électrique
│                 │
│   ArtisanFlow   │  ← Optionnel : texte en bas
│                 │
└─────────────────┘
Fond : #0F1115
```

### Adaptive Icon Android

**Pourquoi c'est important** :
- Android utilise des icônes "adaptatives" (foreground + background)
- Le système peut appliquer différentes formes (rond, carré, squircle)
- Il faut une zone safe (80% central)

**Configuration** :
```json
"adaptiveIcon": {
  "foregroundImage": "./assets/adaptive-icon.png",  // Icône centrée
  "backgroundColor": "#0F1115"                       // Fond sombre cohérent
}
```

---

## 🚫 Erreurs à Éviter

### ❌ Fond Blanc sur Adaptive Icon
```json
"backgroundColor": "#ffffff"  // ❌ Incohérent avec thème dark
```

### ❌ Icône Trop Grande
```
Icône occupe 100% du canvas
→ Android crop l'icône selon la forme
→ Parties coupées
```

**Solution** : Zone safe 80% (marge 10% de chaque côté)

### ❌ Détails Trop Fins
```
Stroke < 2px
→ Invisible sur petites tailles (launcher)
```

**Solution** : Stroke ≥ 2.5px

---

## 📊 Checklist Finale

### Fichiers à Créer/Remplacer

- [ ] `assets/icon.png` (1024x1024, fond sombre, icône bleue)
- [ ] `assets/adaptive-icon.png` (1024x1024, icône centrée)
- [ ] `assets/splash-icon.png` (1024x1024, même design)
- [ ] `assets/favicon.png` (192x192, web)

### Configuration

- [ ] `app.json` → `android.adaptiveIcon.backgroundColor` : "#0F1115"
- [ ] Vérifier `icon` : "./assets/icon.png"
- [ ] Vérifier `splash.image` : "./assets/splash-icon.png"

### Build

- [ ] `npx expo prebuild --clean` (si EAS)
- [ ] `eas build --platform android --profile development`
- [ ] Installer APK et vérifier

---

## 🎯 Résultat Attendu

**Icône launcher Android** :
```
Forme : Adaptative (rond/carré selon launcher)
Fond : #0F1115 (gris sombre)
Icône : #3B82F6 (bleu électrique)
Style : Minimaliste, professionnel
Netteté : Parfaite (1024x1024 source)
```

**Cohérence** :
- ✅ Même palette que l'app (dark theme)
- ✅ Même accent bleu (#3B82F6)
- ✅ Style épuré (Feather icons)

---

## 🛠️ Commandes Utiles

```bash
# Nettoyer et rebuild
npx expo prebuild --clean

# Build development
eas build --platform android --profile development --local

# Build production
eas build --platform android --profile production

# Vérifier config
npx expo config

# Tester icône sans rebuild
# (changement app.json seulement)
npx expo start --clear
```

---

## 📝 Notes

### Android Adaptive Icon
- **Foreground** : Icône (transparent background)
- **Background** : Couleur unie (#0F1115)
- **Safe zone** : 80% central (marge 10%)

### iOS Icon
- **Icône carrée** : 1024x1024 (obligatoire)
- **Pas de transparence** : Fond opaque requis
- **Coins arrondis** : Appliqués par iOS automatiquement

### Splash Screen
- **Même design** que l'icône (cohérence)
- **Fond** : #0F1115 (même que app.json)
- **Mode** : "contain" (image centrée, pas étirée)

---

## ✅ Validation Finale

Après remplacement et rebuild :
```
✅ Icône launcher : fond sombre + bleu électrique
✅ Splash screen : cohérent
✅ Pas de bords blancs
✅ Nette sur tous les devices
✅ Style professionnel et minimaliste
```

**ArtisanFlow - Icône Production Ready** 🚀

