# 🔧 FIX SUPABASE - PLAY STORE "Network request failed"

**Date** : 7 novembre 2025  
**Problème** : Création de compte échoue sur Play Store  
**Cause** : Variables d'environnement vides en production  
**Solution** : Hardcoder les valeurs Supabase

---

## 🚨 **PROBLÈME IDENTIFIÉ**

### **Erreur**
```
"Network request failed"
```

### **Cause racine**

Le fichier `config/supabase.js` utilisait :

```javascript
export const SUPABASE_CONFIG = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
};
```

**Problème** :
- `process.env.EXPO_PUBLIC_SUPABASE_URL` est **vide** en production EAS Build
- Les variables d'environnement ne sont **pas définies** dans `app.json`
- L'app essaie de se connecter à `https://your-project.supabase.co` (URL invalide)
- Résultat : **Network request failed**

---

## ✅ **SOLUTION APPLIQUÉE**

### **Fichier corrigé : `config/supabase.js`**

```javascript
// Configuration Supabase
// Ces valeurs sont utilisées par supabaseClient.js
// ⚠️ HARDCODÉES pour éviter les problèmes en production Play Store

export const SUPABASE_CONFIG = {
  url: 'https://upihalivqstavxijlwaj.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaWhhbGl2cXN0YXZ4aWpsd2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjIxMzksImV4cCI6MjA3NzMzODEzOX0.LiTut-3fm7XPAALAi6KQkS1hcwXUctUTPwER9V7cAzs'
};
```

**Changements** :
- ✅ URL hardcodée : `https://upihalivqstavxijlwaj.supabase.co`
- ✅ Clé anon hardcodée (valide jusqu'en 2077)
- ✅ Plus de dépendance aux variables d'environnement

---

## 🔍 **DIAGNOSTIC AJOUTÉ DANS APP.JS**

```javascript
// 🔍 DIAGNOSTIC SUPABASE (à retirer après tests)
console.log('🔍 === DIAGNOSTIC SUPABASE ===');
console.log('Supabase URL:', supabase.supabaseUrl);
console.log('Supabase Key (10 premiers chars):', supabase.supabaseKey?.substring(0, 10) + '...');
console.log('=================================');
```

**Ce diagnostic affichera dans la console** :
```
🔍 === DIAGNOSTIC SUPABASE ===
Supabase URL: https://upihalivqstavxijlwaj.supabase.co
Supabase Key (10 premiers chars): eyJhbGciOi...
=================================
```

---

## 🧪 **TESTS À EFFECTUER**

### **Test 1 : En développement (local)**

```bash
npm run start:safe
```

1. Ouvre l'app sur ton téléphone
2. Vérifie la console : l'URL doit être `https://upihalivqstavxijlwaj.supabase.co`
3. Essaie de créer un compte
4. ✅ Doit fonctionner

### **Test 2 : Build EAS (production)**

```bash
# Commit les changements
git add config/supabase.js App.js
git commit -m "Fix: Hardcode Supabase config for Play Store"

# Rebuild
npx eas build --platform android --profile production --clear-cache
```

**Attendre ~15 minutes**, puis :

1. Télécharge le nouvel AAB
2. Upload sur Play Store (version interne ou alpha)
3. Installe sur un device
4. Essaie de créer un compte
5. ✅ Doit fonctionner

---

## 📱 **VÉRIFICATION SUR DEVICE ANDROID**

### **Méthode 1 : Via logcat (si device connecté)**

```bash
adb logcat | grep -i "DIAGNOSTIC SUPABASE"
```

Tu devrais voir :
```
🔍 === DIAGNOSTIC SUPABASE ===
Supabase URL: https://upihalivqstavxijlwaj.supabase.co
```

### **Méthode 2 : Via React Native Debugger**

1. Secoue le téléphone
2. Menu → Debug
3. Ouvre Chrome DevTools
4. Console → Cherche "DIAGNOSTIC SUPABASE"

---

## 🔒 **SÉCURITÉ**

### **Q : Est-ce sécurisé de hardcoder la clé anon ?**

**R : OUI**, car :
- ✅ La clé `anon` est **publique** par design
- ✅ Elle est **visible dans le code frontend** de toute façon
- ✅ La sécurité est assurée par **Row Level Security (RLS)** côté Supabase
- ✅ La clé expire en 2077 (pas de problème d'expiration)

### **Q : Faut-il activer RLS ?**

**R : OUI, en production** :
- ⚠️ Actuellement, RLS est **désactivé** (MVP)
- 🔒 À activer avant le lancement public
- 📄 Voir `sql/setup_rls.sql` (à créer)

---

## 🚀 **PROCHAINES ÉTAPES**

### **Immédiat** :

1. ✅ Commit les changements
2. ✅ Rebuild l'app pour Play Store
3. ✅ Tester la création de compte
4. ✅ Retirer le diagnostic si tout fonctionne

### **Après validation** :

1. 🔒 Activer RLS sur Supabase
2. 📊 Ajouter des politiques de sécurité
3. 🧪 Tester avec plusieurs utilisateurs

---

## 📝 **COMMANDES EXACTES**

### **1. Commit**

```bash
git add config/supabase.js App.js
git commit -m "Fix: Hardcode Supabase config for Play Store

- Hardcode URL and anon key in config/supabase.js
- Add diagnostic logs in App.js
- Fix 'Network request failed' error on Play Store"
```

### **2. Rebuild**

```bash
npx eas build --platform android --profile production --clear-cache
```

### **3. Vérifier le build**

```bash
npx eas build:list --limit 1
```

### **4. Télécharger l'AAB**

L'URL sera affichée dans la console, ou via :
```
https://expo.dev/accounts/chriskreepz/projects/artisanflow-3rgvrambzo0tk8d1ddx2/builds
```

---

## 🐛 **DÉPANNAGE**

### **Erreur persiste après rebuild**

1. Vérifier que le commit est bien inclus :
   ```bash
   git log --oneline -1
   ```

2. Vérifier que le cache est bien vidé :
   ```bash
   npx eas build --platform android --profile production --clear-cache --no-wait
   ```

3. Vérifier la config dans le build :
   - Dashboard EAS → Build → Logs
   - Chercher "supabase" dans les logs

### **"Invalid API key"**

- Vérifier que la clé anon est correcte
- Aller sur Supabase Dashboard → Settings → API
- Copier la clé `anon public` et la remplacer dans `config/supabase.js`

### **"CORS error"**

- Vérifier que l'URL est bien `https://` (pas `http://`)
- Vérifier qu'il n'y a pas d'espace ou de caractère invisible

---

## ✅ **CHECKLIST FINALE**

- [x] `config/supabase.js` hardcodé avec vraies valeurs
- [x] Diagnostic ajouté dans `App.js`
- [ ] Commit créé
- [ ] Build EAS lancé
- [ ] AAB téléchargé
- [ ] Uploadé sur Play Store
- [ ] Testé sur device
- [ ] Création de compte fonctionne ✅
- [ ] Diagnostic retiré de `App.js`

---

## 🎊 **RÉSULTAT ATTENDU**

Après le rebuild et l'upload sur Play Store :

```
✅ Création de compte fonctionne
✅ Connexion fonctionne
✅ Toutes les fonctionnalités Supabase fonctionnent
✅ Pas d'erreur "Network request failed"
```

---

**Besoin d'aide ?** Vérifie les logs EAS ou contacte le support Supabase ! 📚

