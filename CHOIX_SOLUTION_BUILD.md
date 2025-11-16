# 🔧 PROBLÈME BUILD IDENTIFIÉ - ARTISANFLOW

**Cause racine** : Le dossier `android/` contient des fichiers natifs avec des versions hardcodées qui **overrident** `app.json`

---

## 🎯 PROBLÈME EXACT

### Fichier `android/app/build.gradle` (lignes 90-96)

```gradle
namespace 'com.artisanflow'           // ❌ Ancien bundle ID
defaultConfig {
    applicationId 'com.artisanflow'   // ❌ Ancien bundle ID
    versionCode 1                     // ❌ Devrait être 2
    versionName "1.0.0"              // ❌ Devrait être "1.0.1"
}
```

**Résultat** : EAS lit ces valeurs au lieu de `app.json` !

---

## 🚀 SOLUTION A : SUPPRIMER android/ et ios/ (RECOMMANDÉ)

### Avantages
- ✅ EAS utilisera Prebuild (génération automatique)
- ✅ `app.json` sera la source unique de vérité
- ✅ Plus simple à maintenir
- ✅ Pas de conflits de versions

### Inconvénients
- ⚠️ Perte des modifications natives personnalisées (si tu en as)
- ⚠️ Dev client devra être rebuild

### Commandes

```bash
# 1. Sauvegarder android/ (au cas où)
Copy-Item -Recurse android android_backup

# 2. Supprimer android/ et ios/
Remove-Item -Recurse -Force android, ios

# 3. Vérifier .gitignore (déjà fait)
cat .gitignore  # Doit contenir android/ et ios/

# 4. Commit
git add -A
git commit -m "v1.0.1 - Remove native folders for Prebuild"

# 5. Build (EAS générera android/ automatiquement)
npx eas build --platform android --profile production --clear-cache
```

---

## 🔧 SOLUTION B : MODIFIER build.gradle MANUELLEMENT

### Avantages
- ✅ Garde les dossiers natifs
- ✅ Garde les modifications personnalisées

### Inconvénients
- ⚠️ Doit synchroniser manuellement app.json ↔ build.gradle
- ⚠️ Plus complexe à maintenir

### Commandes

```bash
# Modifier android/app/build.gradle
# Lignes à changer :

namespace 'com.anonymous.artisanflow'        # Ligne 90
applicationId 'com.anonymous.artisanflow'    # Ligne 92
versionCode 2                                # Ligne 95
versionName "1.0.1"                          # Ligne 96
```

Puis :

```bash
git add android/app/build.gradle
git commit --amend --no-edit
npx eas build --platform android --profile production --clear-cache
```

---

## 🎯 RECOMMANDATION

### ⭐ **SOLUTION A (Supprimer android/ios/) - FORTEMENT RECOMMANDÉE**

**Pourquoi ?**
1. ✅ Plus simple et plus propre
2. ✅ EAS gère tout automatiquement
3. ✅ Pas de désynchronisation app.json ↔ build.gradle
4. ✅ Facilite les mises à jour futures
5. ✅ C'est la méthode recommandée par Expo pour les projets avec dev client

**Note** : EAS Build régénérera `android/` automatiquement avec les bonnes valeurs depuis `app.json`

---

## ⚠️ VÉRIFICATION AVANT SUPPRESSION

### Si tu as des modifications natives personnalisées :

```bash
# Vérifier les modifications dans android/
git diff HEAD~10 android/

# Si tu vois des modifications importantes (configurations custom, 
# bibliothèques natives spéciales, etc.), utilise SOLUTION B
```

### Si android/ est standard (généré par Expo) :

→ Utilise **SOLUTION A** (supprimer)

---

## 🎊 QUELLE SOLUTION VEUX-TU ?

**Réponds** :
- **A** = Supprimer android/ et ios/ (recommandé)
- **B** = Modifier build.gradle manuellement

---

**En attente de ta décision... 🤔**

