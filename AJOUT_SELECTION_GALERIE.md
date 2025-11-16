# ✅ AJOUT SÉLECTION GALERIE POUR PHOTOS

## 🎯 DEMANDE

Permettre d'ajouter des photos depuis la galerie de l'appareil en plus de la caméra.

---

## ✅ CORRECTIONS APPLIQUÉES

### 1. **PhotoUploader.js** ✅

**Avant** : Seulement caméra
```javascript
const result = await ImagePicker.launchCameraAsync({...});
```

**Après** : Choix entre Caméra et Galerie
```javascript
Alert.alert(
  'Ajouter une photo',
  'Choisissez la source de la photo',
  [
    { text: 'Caméra', onPress: () => pickFromCamera() },
    { text: 'Galerie', onPress: () => pickFromGallery() },
    { text: 'Annuler', style: 'cancel' },
  ]
);
```

**Nouvelles fonctions** :
- `pickFromCamera()` : Ouvre la caméra
- `pickFromGallery()` : Ouvre la galerie
- `processAndUploadPhoto(uri)` : Traite et upload la photo (utilisée par les deux)

---

### 2. **CaptureHubScreen2.js** ✅

**Avant** : Seulement caméra
```javascript
const result = await ImagePicker.launchCameraAsync({...});
```

**Après** : Choix entre Caméra et Galerie
```javascript
Alert.alert(
  'Ajouter une photo',
  'Choisissez la source de la photo',
  [
    { text: 'Caméra', onPress: () => pickPhotoFromCamera() },
    { text: 'Galerie', onPress: () => pickPhotoFromGallery() },
    { text: 'Annuler', style: 'cancel' },
  ]
);
```

**Nouvelles fonctions** :
- `pickPhotoFromCamera()` : Ouvre la caméra
- `pickPhotoFromGallery()` : Ouvre la galerie
- `processPhotoCapture(uri)` : Traite et upload la photo

---

## 📱 FONCTIONNALITÉS

### ✅ Ce qui fonctionne maintenant :

1. **Choix de la source** :
   - 📷 **Caméra** : Prendre une photo directement
   - 🖼️ **Galerie** : Sélectionner une photo existante

2. **Permissions** :
   - Demande automatique des permissions caméra OU galerie selon le choix
   - Messages d'erreur clairs si permission refusée

3. **Traitement identique** :
   - Compression automatique
   - Upload dans Supabase Storage
   - Géolocalisation (si disponible)
   - Même workflow pour les deux sources

---

## 🧪 TEST

### Dans PhotoUploader (détail chantier) :
1. Va dans un chantier
2. Clique sur le bouton "Ajouter une photo"
3. **Vérifie** : Tu vois un menu avec "Caméra" et "Galerie"
4. Teste les deux options

### Dans CaptureHub :
1. Va dans l'onglet "Capture"
2. Sélectionne un chantier
3. Clique sur le bouton Photo
4. **Vérifie** : Tu vois un menu avec "Caméra" et "Galerie"
5. Teste les deux options

---

## 📝 FICHIERS MODIFIÉS

- ✅ `PhotoUploader.js` : Ajout choix Caméra/Galerie
- ✅ `screens/CaptureHubScreen2.js` : Ajout choix Caméra/Galerie

---

## ✅ RÉSULTAT

**Maintenant tu peux** :
- 📷 Prendre une photo avec la caméra
- 🖼️ Sélectionner une photo depuis la galerie
- Les deux fonctionnent de la même manière (compression, upload, etc.)

**Tout est prêt ! 🎉**

