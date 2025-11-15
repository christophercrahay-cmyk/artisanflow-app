# 🚀 DÉPLOIEMENT MANUEL EDGE FUNCTION

**Fichier modifié** : `supabase/functions/ai-devis-conversational/index.ts`

**Modification** : Utilisation du token d'authentification de l'utilisateur pour RLS

---

## 📋 **ÉTAPES DE DÉPLOIEMENT**

### **1. Ouvrir Supabase Dashboard**

1. Aller sur https://supabase.com/dashboard
2. Sélectionner ton projet **Artisanflow**
3. Cliquer sur **Edge Functions** (menu gauche)

---

### **2. Sélectionner la fonction**

1. Cliquer sur **`ai-devis-conversational`**
2. Cliquer sur **"Edit"** ou **"Deploy"**

---

### **3. Copier le nouveau code**

1. **Ouvrir le fichier** : `supabase/functions/ai-devis-conversational/index.ts`
2. **Copier TOUT le contenu** (Ctrl+A puis Ctrl+C)
3. **Coller dans l'éditeur** du Dashboard Supabase
4. **Cliquer sur "Deploy"**

---

### **4. Vérifier le déploiement**

**Tu devrais voir** :
- ✅ "Function deployed successfully"
- ✅ Nouvelle version visible

---

## 🎯 **APRÈS DÉPLOIEMENT**

### **Redémarre l'app**

```bash
# Arrêter (Ctrl+C)
# Relancer
npx expo start --tunnel
```

---

### **Teste la génération de devis IA**

1. Ouvrir "chez moi"
2. Cliquer "Générer devis IA"
3. **Vérifier** :
   - ✅ Pas d'erreur RLS
   - ✅ Questions de l'IA s'affichent

---

## ✅ **RÉSULTAT ATTENDU**

**Logs** :
```
📝 5 notes trouvées
🚀 Démarrage session IA conversationnelle...
✅ Session démarrée: xxx-xxx-xxx
📊 Status: questions, Questions: 3
```

**Plus d'erreur !** ✅

---

**Déploie via le Dashboard et teste !** 🚀
