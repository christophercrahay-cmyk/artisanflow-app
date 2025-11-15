# 🚀 COMMANDES REBUILD - PLAY STORE

**Objectif** : Rebuilder l'app avec le fix Supabase  
**Temps estimé** : 20 minutes

---

## ✅ **ÉTAPE 1 : COMMIT LES CHANGEMENTS**

```bash
git add config/supabase.js App.js test_supabase_connection.js FIX_SUPABASE_PLAY_STORE.md RESUME_FIX_PLAY_STORE.md
git commit -m "Fix: Hardcode Supabase config for Play Store

- Hardcode URL and anon key in config/supabase.js
- Add diagnostic logs in App.js
- Add test script test_supabase_connection.js
- Fix 'Network request failed' error on Play Store

Tested locally: ✅ Connection OK, ✅ Account creation OK"
```

---

## 🏗️ **ÉTAPE 2 : REBUILD L'APP**

```bash
npx eas build --platform android --profile production --clear-cache
```

**Attendre ~15-20 minutes...**

---

## 📊 **ÉTAPE 3 : VÉRIFIER LE BUILD**

```bash
npx eas build:list --limit 1
```

Tu devrais voir :

```
Status: finished
Version: 1.0.1
Version code: 2
```

---

## 📥 **ÉTAPE 4 : TÉLÉCHARGER L'AAB**

### **Option 1 : Via commande**

```bash
# L'URL sera affichée dans la console
# Copie-colle l'URL dans ton navigateur
```

### **Option 2 : Via Dashboard**

```
https://expo.dev/accounts/chriskreepz/projects/artisanflow-3rgvrambzo0tk8d1ddx2/builds
```

Clique sur le dernier build → **Download**

---

## 📤 **ÉTAPE 5 : UPLOAD SUR PLAY STORE**

### **5.1 Aller sur Play Console**

```
https://play.google.com/console
→ ArtisanFlow
→ Test → Test interne (ou Test fermé)
```

### **5.2 Créer une nouvelle version**

1. Clique **"Créer une version"**
2. Upload le nouvel AAB
3. **Notes de version** :

```
- Correction de la connexion Supabase
- Fix de l'erreur "Network request failed"
- Amélioration de la stabilité de l'authentification
```

4. **Enregistrer** → **Vérifier** → **Déployer**

---

## 🧪 **ÉTAPE 6 : TESTER SUR DEVICE**

### **6.1 Installer depuis Play Store**

1. Attendre que Google valide (1-3 heures pour test interne)
2. Installer sur ton téléphone
3. Ouvrir l'app

### **6.2 Vérifier les logs (optionnel)**

```bash
# Si device connecté en USB
adb logcat | grep -i "DIAGNOSTIC SUPABASE"
```

Tu devrais voir :

```
🔍 === DIAGNOSTIC SUPABASE ===
Supabase URL: https://upihalivqstavxijlwaj.supabase.co
Supabase Key (10 premiers chars): eyJhbGciOi...
```

### **6.3 Tester la création de compte**

1. Clique **"Créer un compte"**
2. Email : `test-playstore@artisanflow.app`
3. Mot de passe : `Test1234`
4. ✅ **Doit fonctionner sans erreur !**

---

## 🎊 **ÉTAPE 7 : FINALISER**

### **7.1 Si tout fonctionne**

Retirer le diagnostic de `App.js` :

```bash
# Ouvrir App.js
# Supprimer les lignes 23-27 (diagnostic)
git add App.js
git commit -m "Remove Supabase diagnostic logs"
```

Puis rebuilder une dernière fois (optionnel).

### **7.2 Si ça ne fonctionne pas**

1. Vérifier les logs EAS :
   ```
   https://expo.dev/accounts/chriskreepz/projects/artisanflow-3rgvrambzo0tk8d1ddx2/builds
   ```

2. Vérifier que le commit est bien inclus :
   ```bash
   git log --oneline -3
   ```

3. Vérifier la config Supabase :
   ```bash
   node test_supabase_connection.js
   ```

---

## 📝 **COMMANDES RAPIDES**

```bash
# Tout en une fois
git add config/supabase.js App.js test_supabase_connection.js FIX_SUPABASE_PLAY_STORE.md RESUME_FIX_PLAY_STORE.md && \
git commit -m "Fix: Hardcode Supabase config for Play Store" && \
npx eas build --platform android --profile production --clear-cache
```

---

## ✅ **CHECKLIST**

- [ ] Commit créé
- [ ] Build EAS lancé
- [ ] Build terminé (status: finished)
- [ ] AAB téléchargé
- [ ] Uploadé sur Play Store
- [ ] Google a validé (1-3h)
- [ ] App installée sur device
- [ ] Création de compte testée ✅
- [ ] Diagnostic retiré (optionnel)

---

**Bonne chance pour le rebuild !** 🚀

