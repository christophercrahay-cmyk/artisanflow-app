# 📋 SCRIPTS SQL À EXÉCUTER - ORDRE ET DÉTAILS

**Date** : 9 novembre 2025  
**Objectif** : Corriger tous les problèmes en cours

---

## 🎯 **3 SCRIPTS À EXÉCUTER DANS L'ORDRE**

### **Script 1 : Infos entreprise dans devis/factures** ⭐

**Fichier** : `sql/add_company_info_to_devis_factures.sql`

**Ce qu'il fait** :
- Ajoute 5 colonnes à la table `devis` :
  - `company_name`
  - `company_siret`
  - `company_address`
  - `company_phone`
  - `company_email`
- Ajoute les mêmes 5 colonnes à la table `factures`

**Pourquoi** :
- Permet de pré-remplir les infos entreprise dans les formulaires de devis/factures
- Permet de modifier ces infos pour un document spécifique

**Résultat attendu** :
- 2 tableaux listant les nouvelles colonnes

---

### **Script 2 : Colonne analysis_data pour notes** ⭐

**Fichier** : `sql/add_analysis_data_to_notes.sql`

**Ce qu'il fait** :
- Ajoute la colonne `analysis_data` (JSONB) à la table `notes`

**Pourquoi** :
- **FIX le bug de sauvegarde des notes vocales** ✅
- Permet de stocker l'analyse GPT des notes

**Résultat attendu** :
- 2 tableaux :
  - Colonne `analysis_data` ajoutée
  - Structure complète de la table `notes`

---

### **Script 3 : Fix suppression des notes** ⭐

**Fichier** : `sql/fix_notes_rls_delete.sql`

**Ce qu'il fait** :
- Supprime les anciennes policies DELETE (si elles existent)
- Crée une nouvelle policy DELETE correcte
- Permet aux users de supprimer leurs propres notes

**Pourquoi** :
- **FIX le bug de suppression des notes vocales** ✅
- Garantit que chaque user peut supprimer ses notes

**Résultat attendu** :
- 3 tableaux :
  - RLS activé sur `notes`
  - Liste des policies (SELECT, INSERT, UPDATE, DELETE)
  - Message de confirmation

---

## 📋 **ORDRE D'EXÉCUTION**

```bash
# Dans Supabase SQL Editor

# 1. Copier/coller sql/add_company_info_to_devis_factures.sql
#    → Exécuter
#    → Vérifier : 2 tableaux avec les nouvelles colonnes

# 2. Copier/coller sql/add_analysis_data_to_notes.sql
#    → Exécuter
#    → Vérifier : Colonne analysis_data ajoutée

# 3. Copier/coller sql/fix_notes_rls_delete.sql
#    → Exécuter
#    → Vérifier : Policy DELETE créée
```

---

## ✅ **APRÈS EXÉCUTION**

### **Redémarrer l'app**

```bash
# Arrêter l'app (Ctrl+C)
# Relancer
npx expo start --tunnel
```

---

## 🧪 **TESTS À FAIRE**

### **Test 1 : Sauvegarde des notes vocales**

1. **Ouvrir un chantier**
2. **Enregistrer une note vocale**
3. **Cliquer sur "Envoyer"**
4. **Vérifier** :
   - ✅ "Note envoyée avec succès"
   - ✅ La note apparaît dans la liste
   - ✅ Le texte est corrigé

---

### **Test 2 : Suppression des notes vocales**

1. **Appui long** sur une note
2. **Confirmer la suppression**
3. **Vérifier** :
   - ✅ La note disparaît de la liste
   - ✅ Pas d'erreur dans les logs

---

### **Test 3 : Création de devis manuel**

1. **Aller dans Paramètres** → Configurer les infos entreprise
2. **Créer un devis manuel**
3. **Vérifier** :
   - ✅ Les champs entreprise sont pré-remplis

---

## 📊 **RÉSUMÉ DES BUGS CORRIGÉS**

| Bug | Script SQL | Statut |
|-----|------------|--------|
| Notes vocales ne se sauvegardent pas | `add_analysis_data_to_notes.sql` | ✅ Prêt |
| Notes vocales ne se suppriment pas | `fix_notes_rls_delete.sql` | ✅ Prêt |
| Infos entreprise non pré-remplies | `add_company_info_to_devis_factures.sql` | ✅ Prêt |

---

## 🚀 **ACTIONS IMMÉDIATES**

1. **Exécuter les 3 scripts SQL** (dans l'ordre)
2. **Redémarrer l'app**
3. **Tester** :
   - Enregistrer une note vocale
   - Supprimer une note vocale
   - Créer un devis manuel

---

**Tout est prêt ! Exécute les scripts et tout fonctionnera !** 🎉

