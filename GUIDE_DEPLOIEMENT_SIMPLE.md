# 🎯 GUIDE ULTRA-SIMPLE - DÉPLOIEMENT IA

**Pour** : Chris  
**Temps** : 5 minutes  
**Méthode** : Dashboard Supabase (pas besoin de CLI)

---

## ✅ **ÉTAPE 1 : TABLES SQL** (DÉJÀ FAIT ✅)

Tu as déjà exécuté `create_ai_devis_tables.sql` → Parfait !

---

## 🚀 **ÉTAPE 2 : DÉPLOYER L'EDGE FUNCTION**

### **1. Ouvre Supabase Dashboard**

```
https://supabase.com/dashboard
```

### **2. Va dans Edge Functions**

```
Menu gauche → Edge Functions
```

### **3. Crée une nouvelle fonction**

- Clique **"Create a new function"**
- **Nom** : `ai-devis-conversational`
- Clique **"Create function"**

### **4. Copie-colle le code**

1. **Ouvre** : `supabase/functions/ai-devis-conversational/index.ts`
2. **Sélectionne tout** : Ctrl+A
3. **Copie** : Ctrl+C
4. **Retourne dans Supabase Dashboard**
5. **Colle** dans l'éditeur : Ctrl+V
6. **Clique "Deploy"** (bouton vert en haut à droite)

### **5. Configure les secrets**

```
Edge Functions → Settings → Secrets → Add secret
```

**Ajoute ces 3 secrets** :

| Nom | Valeur | Où la trouver |
|-----|--------|---------------|
| `OPENAI_API_KEY` | `sk-proj-...` | `config/openai.js` (ligne 2) |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | `eyJ...` | Settings → API → anon public |

---

## 🧪 **ÉTAPE 3 : TESTER**

### **Dans SQL Editor** :

```sql
-- Vérifier que les tables existent
SELECT COUNT(*) FROM devis_ai_sessions;
SELECT COUNT(*) FROM devis_temp_ai;
```

Tu devrais voir `0` (normal, aucune session créée encore).

---

## 📱 **ÉTAPE 4 : TESTER DANS L'APP**

**Problème** : Le bouton pour accéder à l'IA n'est pas encore intégré dans l'app.

**Solution temporaire** : Je vais créer un bouton de test dans `DashboardScreen`.

**Veux-tu que je fasse ça maintenant ?** 🤔

---

## 🎊 **C'EST PRESQUE FINI !**

Une fois l'Edge Function déployée, il ne reste plus qu'à :
1. ✅ Ajouter un bouton dans l'app pour y accéder
2. 🧪 Tester le workflow complet

**Dis-moi quand l'Edge Function est déployée !** 🚀

