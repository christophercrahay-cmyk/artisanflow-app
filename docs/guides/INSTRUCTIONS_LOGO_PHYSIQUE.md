# 📝 Instructions pour utiliser le vrai logo ARTISAN FLOW

**Date** : 03/11/2025  
**Projet** : ArtisanFlow

---

## 🎯 Problème

L'écran de connexion utilise l'icône Feather "hammer" mais tu veux utiliser ton logo graphique.

---

## ✅ Solution

### 1. Placer le logo dans assets/

**Fichier** : `assets/artisanflow-logo.png`

Convertir ton image en PNG :
- Format : PNG transparent (fond transparent)
- Dimensions : 512x512 px ou 1024x1024 px
- Nom : `artisanflow-logo.png`

### 2. Modifier AuthScreen.js

**Remplacement** de l'icône Feather par le logo :

```javascript
// AVANT (ligne 73)
<Feather name="hammer" size={64} color={theme.colors.accent} strokeWidth={2.5} />

// APRÈS
<Image 
  source={require('../assets/artisanflow-logo.png')}
  style={{ 
    width: 120, 
    height: 120, 
    marginBottom: 8,
    resizeMode: 'contain'
  }}
/>
```

**Et ajouter l'import** :
```javascript
import { Image } from 'react-native';
```

### 3. Alternative : Garder l'icône Feather

Si tu veux garder l'icône "hammer" :
- Elle fonctionne déjà correctement
- Le "?" peut venir d'un problème temporaire de rendu
- Vérifier que `<SafeAreaProvider>` est bien dans App.js

---

## 📦 Fichiers à Modifier

### Fichier : `screens/AuthScreen.js`

**Changement nécessaire** :

1. **Ajouter import Image** (ligne 1-2)
2. **Remplacer icône Feather** (ligne 73)
3. **Ajouter style logo** (ou utiliser require() directement)

---

## 🖼️ Code Complet

```javascript
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image, // ✅ Ajouter ici
} from 'react-native';
// ... autres imports

export default function AuthScreen() {
  // ... code existant
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView /* ... */>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            {/* ✅ REMPLACER PAR: */}
            <Image 
              source={require('../assets/artisanflow-logo.png')}
              style={styles.logo}
            />
            <Text style={styles.appName}>ArtisanFlow</Text>
            <Text style={styles.tagline}>Gestion de chantier pro</Text>
          </View>
          
          {/* ... reste du code */}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  // ... styles existants
  
  logo: { // ✅ AJOUTER
    width: 120,
    height: 120,
    marginBottom: 8,
    resizeMode: 'contain',
  },
});
```

---

## ⚠️ Important

Si tu utilises le vrai logo :
1. **Convertir** ton image en PNG transparent
2. **Renommer** : `artisanflow-logo.png`
3. **Placer** dans `assets/`
4. **Modifier** AuthScreen.js (voir code ci-dessus)
5. **Rebuild** l'app

---

**Status** : ⏳ **EN ATTENTE LOGO PNG**

