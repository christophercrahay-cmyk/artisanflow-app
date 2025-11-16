# 🔥 FIX URGENT - GÉNÉRATION DEVIS IA

**Erreur** : `new row violates row-level security policy for table "devis_ai_sessions"`

**Cause** : L'Edge Function utilise la clé ANON qui est soumise à RLS

---

## ✅ **SOLUTION IMMÉDIATE**

### **Exécute ce script** : `sql/fix_devis_ai_sessions_rls.sql`

**Dans Supabase SQL Editor** :
1. Copier/coller le contenu
2. Exécuter
3. Vérifier : 4 policies par table (SELECT, INSERT, UPDATE, DELETE)

---

## 🚀 **APRÈS**

**Redémarre l'app** et réessaye de générer un devis IA.

**Si ça ne marche toujours pas**, il faudra modifier l'Edge Function pour utiliser la **Service Role Key** au lieu de la clé ANON.

---

## 📋 **SCRIPTS À EXÉCUTER (ORDRE)**

1. **`sql/fix_devis_ai_sessions_rls.sql`** ⭐ **URGENT**
2. **`sql/add_company_info_to_devis_factures.sql`**
3. **`sql/fix_rls_delete_all_tables.sql`**

---

**Exécute le script 1 maintenant !** 🚀

