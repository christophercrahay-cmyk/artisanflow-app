# ✅ FIX ARCHIVAGE CHANTIERS - ARTISANFLOW

**Date** : 10 Novembre 2025  
**Problème** : Chantier archivé réapparaît après retour sur l'écran client

---

## 🐛 PROBLÈME IDENTIFIÉ

### Symptôme
Quand on archive un chantier et qu'on retourne sur le client :
- Le chantier archivé réapparaît temporairement
- Surtout visible s'il n'y a qu'un seul chantier

### Cause
Le **store Zustand** (`useAppStore`) garde le projet en cache dans `currentProject`, même après archivage.

---

## ✅ CORRECTION APPLIQUÉE

### Fichiers modifiés

#### 1. **`screens/ProjectDetailScreen.js`** (ligne 200-201)

**Avant** :
```javascript
showSuccess('Chantier archivé');
navigation.goBack();
```

**Après** :
```javascript
// ✅ Nettoyer le store pour éviter le cache
useAppStore.getState().clearProject();

showSuccess('Chantier archivé');
navigation.goBack();
```

#### 2. **`screens/ClientDetailScreen.js`** (ligne 102-103)

**Avant** :
```javascript
showSuccess('Chantier archivé');
await loadData();
```

**Après** :
```javascript
// ✅ Nettoyer le store pour éviter le cache
useAppStore.getState().clearProject();

showSuccess('Chantier archivé');
await loadData();
```

---

## 🔄 FLUX D'ARCHIVAGE

### Avant
1. Archiver le projet en DB → `archived: true`
2. `navigation.goBack()`
3. ClientDetailScreen recharge via `useFocusEffect`
4. ❌ Store garde `currentProject` en cache
5. ❌ Projet archivé affiché temporairement

### Après
1. Archiver le projet en DB → `archived: true`
2. **`clearProject()` nettoie le cache du store**
3. `navigation.goBack()`
4. ClientDetailScreen recharge via `useFocusEffect`
5. ✅ Requête avec filtre `archived: false`
6. ✅ Projet archivé n'apparaît plus

---

## 📋 RAPPEL : OÙ VOIR LES CHANTIERS ARCHIVÉS

Les chantiers archivés sont accessibles depuis :

**Navigation** :
1. Onglet **Clients**
2. Bouton **"+"** en haut à droite
3. Écran **"Liste des chantiers"**
4. Filtre **"Archivés"** 📦

**Affichage** :
- Liste de tous les chantiers archivés
- Badge "📦 Archivé"
- Possibilité de les ouvrir (lecture seule)

---

## 🧪 TEST

1. Ouvre un client avec 1 seul chantier
2. Ouvre le chantier
3. Menu (⋮) → Archiver
4. Retour sur l'écran client
5. **Vérification** : Le chantier archivé ne doit plus apparaître
6. Va dans "Liste des chantiers" → Filtre "Archivés"
7. **Vérification** : Le chantier archivé apparaît bien ici

---

**Fin du fix**

