# 🚀 GUIDE DE DÉPLOIEMENT - IA CONVERSATIONNELLE

**Temps estimé** : 15-20 minutes  
**Prérequis** : Compte Supabase, clé OpenAI

---

## ✅ **ÉTAPE 1 : CRÉER LES TABLES SQL** (2 minutes)

### **1.1 Ouvrir Supabase Dashboard**

```
https://supabase.com/dashboard
→ Ton projet ArtisanFlow
→ SQL Editor (menu gauche)
```

### **1.2 Exécuter le script**

```bash
# Copier TOUT le contenu de :
sql/create_ai_devis_tables.sql

# Coller dans SQL Editor
# Cliquer "Run" (ou Ctrl+Enter)
```

### **1.3 Vérifier**

Tu devrais voir :

```
✅ Tables IA conversationnelle créées avec succès !
sessions_table: 1
temp_devis_table: 1
price_stats_table: 1
```

---

## ⚙️ **ÉTAPE 2 : DÉPLOYER L'EDGE FUNCTION** (10 minutes)

### **2.1 Installer Supabase CLI** (si pas déjà fait)

```bash
npm install -g supabase
```

### **2.2 Login Supabase**

```bash
supabase login
```

Une page web s'ouvrira pour te connecter.

### **2.3 Lier le projet**

```bash
# Récupère ton PROJECT_ID dans Supabase Dashboard → Settings → General
supabase link --project-ref <PROJECT_ID>
```

Exemple :
```bash
supabase link --project-ref abc123xyz456
```

### **2.4 Configurer les variables d'environnement**

**Via Dashboard** (recommandé) :

```
Supabase Dashboard
→ Edge Functions
→ Settings
→ Add secret
```

Ajoute ces 3 secrets :

| Nom | Valeur |
|-----|--------|
| `OPENAI_API_KEY` | `sk-proj-...` (ta clé OpenAI) |
| `SUPABASE_URL` | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJ...` (dans Settings → API) |

**OU via CLI** :

```bash
supabase secrets set OPENAI_API_KEY=sk-proj-...
supabase secrets set SUPABASE_URL=https://xxx.supabase.co
supabase secrets set SUPABASE_ANON_KEY=eyJ...
```

### **2.5 Déployer la fonction**

```bash
cd C:\Users\Chris\Desktop\MVP_Artisan\artisanflow

supabase functions deploy ai-devis-conversational
```

Tu devrais voir :

```
✅ Deployed Function ai-devis-conversational
URL: https://xxx.supabase.co/functions/v1/ai-devis-conversational
```

---

## 📱 **ÉTAPE 3 : INTÉGRER DANS L'APP** (5 minutes)

### **3.1 Ajouter la route dans App.js**

<function_calls>
<invoke name="read_file">
<parameter name="target_file">App.js
