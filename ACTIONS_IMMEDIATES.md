# ✅ ACTIONS IMMÉDIATES - ARTISANFLOW

**Date** : 7 novembre 2025  
**Temps estimé** : 30 minutes

---

## 🎯 **CE QUI A ÉTÉ FAIT (NETTOYAGE)**

1. ✅ **Supprimé** `screens/DevisAIConversationalScreen.js` (doublon inutilisé)
2. ✅ **Supprimé** bouton test Dashboard (inutile)
3. ✅ **Créé** `components/VoiceRecorderSimple.js` (mode vocal questions)
4. ✅ **Corrigé** `DevisAIGenerator.js` (utilise VoiceRecorderSimple)
5. ✅ **Corrigé** `createDevisFromAI` (création lignes de devis)
6. ✅ **Créé** `sql/create_devis_lignes_table.sql` (table lignes)

---

## 📋 **CE QU'IL TE RESTE À FAIRE**

### **Action 1 : Créer la table devis_lignes** (2 min)

**Supabase Dashboard → SQL Editor** :

```sql
-- Copie-colle le contenu de sql/create_devis_lignes_table.sql
```

**OU directement** :

```sql
CREATE TABLE IF NOT EXISTS public.devis_lignes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_id UUID NOT NULL REFERENCES public.devis(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantite DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unite TEXT DEFAULT 'unité',
  prix_unitaire DECIMAL(10, 2) NOT NULL,
  prix_total DECIMAL(10, 2) NOT NULL,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devis_lignes_devis_id ON public.devis_lignes(devis_id);
ALTER TABLE public.devis_lignes DISABLE ROW LEVEL SECURITY;
```

---

### **Action 2 : Désactiver RLS** (1 min)

**Supabase Dashboard → SQL Editor** :

```sql
ALTER TABLE public.devis DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.factures DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis_lignes DISABLE ROW LEVEL SECURITY;
```

---

### **Action 3 : Redéployer l'Edge Function** (2 min)

**Supabase Dashboard → Edge Functions → ai-devis-conversational → Code** :

1. **Copie** tout le contenu de `supabase/functions/ai-devis-conversational/index.ts`
2. **Colle** dans l'éditeur
3. **Clique "Deploy function"**

---

## 🧪 **ENSUITE : TESTER**

### **Test complet du workflow** :

1. **Ouvre l'app** sur ton téléphone
2. **Va sur un chantier** (ProjectDetailScreen)
3. **Enregistre 2-3 notes vocales** :
   - "Installation de 8 prises dans le salon"
   - "Ajout de 3 interrupteurs"
   - "Mise aux normes du tableau"
4. **Scroll** jusqu'à "Devis IA"
5. **Clique "Générer devis IA"**
6. **Attends 3-5 secondes**
7. **Tu verras** :
   - Le devis généré depuis tes 3 notes
   - Les questions de l'IA (si besoin)
   - Boutons "Texte" / "Vocal"

### **Test mode TEXTE** :

1. Clique sur "Texte"
2. Tape ta réponse
3. Clique "Envoyer"
4. L'IA met à jour le devis

### **Test mode VOCAL** :

1. Clique sur "Vocal"
2. Clique "Appuyez pour répondre"
3. Parle (ex: "Encastré")
4. L'IA transcrit avec Whisper
5. Clique "Valider"
6. Clique "Envoyer"
7. L'IA met à jour le devis

### **Test validation** :

1. Quand status = "ready"
2. Clique "Créer le devis (brouillon)"
3. Vérifie que le devis est créé dans la section "Devis & Factures"

---

## 📊 **RÉSULTAT ATTENDU**

```
✅ Devis créé : DE-2025-XXXX
✅ Lignes créées : 3 lignes
✅ Total TTC : 540€ (ou selon tes notes)
✅ Statut : brouillon
✅ Modifiable dans DevisFactures
```

---

## 🚀 **APRÈS LES TESTS**

### **Si tout fonctionne** ✅

1. **Commit** tous les fichiers
2. **Rebuild** pour Play Store
3. **Upload** et tester en prod

### **Si bugs** 🐛

1. **Note** les erreurs
2. **On corrige** ensemble
3. **Reteste**

---

## 📁 **FICHIERS MODIFIÉS (À COMMITER)**

```
M  navigation/AppNavigator.js
M  screens/DashboardScreen.js
M  screens/ProjectDetailScreen.js
M  services/aiConversationalService.js
M  supabase/functions/ai-devis-conversational/index.ts
A  components/DevisAIGenerator.js
A  components/VoiceRecorderSimple.js
A  sql/create_devis_lignes_table.sql
A  sql/disable_rls_all_tables.sql
D  screens/DevisAIConversationalScreen.js
```

---

## 🎯 **ORDRE D'EXÉCUTION**

```
1. SQL : create_devis_lignes_table.sql    (2 min)
2. SQL : disable_rls_all_tables.sql       (1 min)
3. Redéployer Edge Function               (2 min)
4. Tester dans l'app                      (10 min)
5. Commit si OK                           (2 min)
```

**Total : ~15-20 minutes**

---

**Commence par les 3 actions SQL/Edge Function, puis teste !** 🚀

