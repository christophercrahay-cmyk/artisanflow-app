# 🚀 DÉMARRAGE RAPIDE - DESIGN SYSTEM 2.0

**Erreur actuelle** : `Property 'PrimaryButton' doesn't exist`

**Cause** : Le package `expo-haptics` n'est pas encore chargé dans l'app.

---

## ✅ **SOLUTION (3 ÉTAPES)**

### **1️⃣ Arrêter l'app**

Dans le terminal où tourne `expo start`, appuie sur :

```
Ctrl + C
```

---

### **2️⃣ Installer les dépendances**

```bash
npx expo install expo-haptics
```

**Attends que l'installation se termine** (10-20 secondes).

---

### **3️⃣ Relancer l'app**

```bash
npx expo start --tunnel --clear
```

**Important** : Le flag `--clear` efface le cache Metro.

---

### **4️⃣ Sur ton téléphone**

Quand le QR code s'affiche :
1. Ouvre l'app **Expo Go**
2. Scanne le QR code
3. **Attends 30-60 secondes** (rechargement complet)

---

## 🎯 **RÉSULTAT ATTENDU**

L'app devrait se lancer avec le **nouveau design** :

✅ Bleu électrique (#2563EB)  
✅ Glow bleu sur les éléments actifs  
✅ Animations fluides  
✅ Vibrations au toucher  

---

## ❌ **SI ÇA NE MARCHE TOUJOURS PAS**

### **Option A : Clear cache complet**

```bash
# Arrêter l'app
Ctrl + C

# Supprimer le cache
npx expo start --clear

# Ou plus radical :
rm -rf node_modules/.cache
npx expo start --tunnel
```

---

### **Option B : Rebuild complet**

```bash
# Arrêter l'app
Ctrl + C

# Supprimer node_modules
rm -rf node_modules

# Réinstaller
npm install

# Relancer
npx expo start --tunnel --clear
```

---

### **Option C : Vérifier les imports**

Si l'erreur persiste, vérifie que ces fichiers existent :

```bash
# Vérifier les composants UI
dir components\ui

# Tu dois voir :
# - AppCard.js
# - PrimaryButton.js
# - StatusBadge.js
# - SegmentedControl.js
# - ScreenContainer.js
# - SectionTitle.js
# - index.js
```

Si un fichier manque, **dis-le moi** !

---

## 📱 **TESTER LE NOUVEAU DESIGN**

Une fois l'app lancée, teste les **4 écrans** :

1. **🏠 Accueil** → Blocs visuels + glow bleu
2. **👥 Clients** → Formulaire premium + bouton flottant
3. **🎤 Capture** → Sélecteur pill + bandes colorées
4. **📑 Documents** → SegmentedControl + empty state

**Chaque interaction devrait vibrer !** 📳

---

## 🆘 **BESOIN D'AIDE ?**

Si l'erreur persiste après ces étapes, **copie-colle l'erreur complète** et je t'aiderai !


