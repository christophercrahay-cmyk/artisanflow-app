# 🔥 DÉPLOIEMENT EDGE FUNCTION - URGENT

**Problème corrigé** : L'Edge Function n'utilisait pas le token d'authentification de l'utilisateur

**Fichier modifié** : `supabase/functions/ai-devis-conversational/index.ts`

---

## ✅ **CORRECTIONS APPLIQUÉES**

### **1. Edge Function** (ligne 68-83)
- Récupère le token d'authentification depuis les headers
- Passe le token au client Supabase
- **Résultat** : RLS fonctionne correctement

### **2. DocumentsScreen** (ligne 58, 73, 92, 101)
- Remplacé `projects.title` par `projects.name`
- **Résultat** : Plus d'erreur de colonne manquante

---

## 🚀 **DÉPLOIEMENT**

### **Commande à exécuter** :

```bash
cd C:\Users\Chris\Desktop\MVP_Artisan\artisanflow
npx supabase functions deploy ai-devis-conversational
```

**Si tu n'as pas Supabase CLI installé** :
```bash
npm install -g supabase
supabase login
```

---

## 📋 **ALTERNATIVE : DÉPLOIEMENT VIA DASHBOARD**

**Si la CLI ne fonctionne pas** :

1. **Ouvrir Supabase Dashboard** → Edge Functions
2. **Sélectionner** `ai-devis-conversational`
3. **Cliquer sur "Edit"**
4. **Copier/coller** le contenu de `supabase/functions/ai-devis-conversational/index.ts`
5. **Deploy**

---

## 🎯 **APRÈS DÉPLOIEMENT**

**Redémarre l'app** et teste la génération de devis IA.

**Ça devrait fonctionner !** ✅

---

**Déploie l'Edge Function maintenant !** 🚀

