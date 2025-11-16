# 📋 SCRIPTS SQL FINAUX À EXÉCUTER

**Date** : 9 novembre 2025  
**Objectif** : Corriger tous les problèmes et activer toutes les nouvelles fonctionnalités

---

## 🎯 **4 SCRIPTS À EXÉCUTER DANS L'ORDRE**

### **Script 1 : Infos entreprise dans devis/factures**

**Fichier** : `sql/add_company_info_to_devis_factures.sql`

**Ce qu'il fait** :
- Ajoute 6 colonnes à `devis` : nom, SIRET, adresse, **ville**, téléphone, email
- Ajoute 6 colonnes à `factures` : idem

**Pourquoi** :
- Pré-remplissage automatique des formulaires
- Infos entreprise sauvegardées par document

---

### **Script 2 : Fix suppression des données**

**Fichier** : `sql/fix_rls_delete_all_tables.sql`

**Ce qu'il fait** :
- Crée les policies DELETE sur 11 tables
- Permet de supprimer notes, photos, clients, projets, etc.

**Pourquoi** :
- **FIX le bug de suppression des notes vocales** ✅
- **FIX le bug de suppression des photos** ✅

---

### **Script 3 : Fix génération devis IA**

**Fichier** : `sql/fix_devis_ai_sessions_rls.sql` ⭐ **NOUVEAU**

**Ce qu'il fait** :
- Corrige les policies sur `devis_ai_sessions`
- Corrige les policies sur `devis_temp_ai`

**Pourquoi** :
- **FIX l'erreur "new row violates row-level security policy"** ✅
- **Permet de générer des devis IA** ✅

---

### **Script 4 : Profils IA (déjà fait)**

**Fichier** : `sql/create_ai_profiles_table.sql`

**Statut** : ✅ **Déjà exécuté**

---

## 📋 **ORDRE D'EXÉCUTION**

**Dans Supabase SQL Editor** :

```
1. sql/add_company_info_to_devis_factures.sql
   → Exécuter

2. sql/fix_rls_delete_all_tables.sql
   → Exécuter

3. sql/fix_devis_ai_sessions_rls.sql ⭐ IMPORTANT
   → Exécuter

4. (Déjà fait ✅)
```

---

## 🚀 **APRÈS EXÉCUTION**

### **Redémarrer l'app**

```bash
# Arrêter (Ctrl+C)
# Relancer
npx expo start --tunnel
```

---

## 🧪 **TESTS À FAIRE**

### **Test 1 : Génération devis IA** ⭐

1. Ouvrir un chantier avec notes
2. Cliquer "Générer devis IA"
3. **Vérifier** :
   - ✅ Pas d'erreur RLS
   - ✅ Questions de l'IA s'affichent
   - ✅ Devis se crée
   - ✅ Logs d'apprentissage visibles

---

### **Test 2 : Suppression notes**

1. Appui long sur une note
2. Supprimer
3. **Vérifier** :
   - ✅ La note disparaît

---

### **Test 3 : Création devis manuel**

1. Créer un devis manuel
2. **Vérifier** :
   - ✅ Infos entreprise pré-remplies (+ ville)

---

## ✅ **RÉSULTAT ATTENDU**

**Après les 3 scripts** :
- ✅ Génération devis IA fonctionne
- ✅ Suppression notes/photos fonctionne
- ✅ Pré-remplissage infos entreprise fonctionne
- ✅ Apprentissage IA fonctionne

---

**Exécute les 3 scripts et redémarre l'app !** 🚀

