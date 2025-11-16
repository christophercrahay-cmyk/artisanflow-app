# 🔧 AUTH FIXÉ - Instructions d'application

## ❌ Problème rencontré

```
ERROR: 23503: insert or update on table "clients" violates foreign key constraint
Key (user_id)=(00000000-0000-0000-0000-000000000000) is not present in table "users".
```

**Cause** : Les colonnes `user_id` avaient un `DEFAULT '00000000-0000-0000-0000-000000000000'` qui n'existe pas dans `auth.users`.

---

## ✅ Solution appliquée

**Fichier créé** : `ADD_AUTH_RLS_FIXED.sql`

**Changements** :
1. ✅ DROP des anciennes colonnes `user_id` avec CASCADE
2. ✅ Création nouvelles colonnes **NULLABLES** (pas de DEFAULT)
3. ✅ RLS activé + politiques sur toutes les tables
4. ✅ Bucket `artisanflow` créé
5. ⚠️ Storage policies à configurer séparément (permissions)

---

## 🚀 APPLICATION

### **ÉTAPE 1 : Script SQL Principal**

Dans Supabase SQL Editor :

Copier/coller **TOUT** le contenu de :
```
ADD_AUTH_RLS_FIXED.sql
```

Cliquer **RUN**.

**Résultat attendu** :
```
Success. No rows returned
```

---

### **ÉTAPE 2 : Configuration Storage (SÉPARÉE)**

Les politiques Storage nécessitent des permissions spéciales. Deux options :

#### **Option A : Via Interface Supabase (RECOMMANDÉ)**

Voir guide complet : `STORAGE_POLICIES_MANUAL.md`

**Résumé** :
1. Supabase Dashboard → **Storage** → **Policies**
2. Bucket `artisanflow`
3. Créer 4 politiques (SELECT, INSERT, UPDATE, DELETE)
4. Format : `user/{auth.uid()}/projects/...`

#### **Option B : SQL Admin (si tu as service_role)**

Exécuter : `STORAGE_POLICIES_ADMIN.sql`

⚠️ Nécessite permissions admin.

---

### **ÉTAPE 3 : Vérifications**

```sql
-- Colonnes user_id créées et NULLABLES ?
SELECT 
  table_name, 
  column_name, 
  is_nullable, 
  data_type
FROM information_schema.columns 
WHERE column_name = 'user_id' 
AND table_schema = 'public'
ORDER BY table_name;

-- RLS activé ?
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'projects', 'notes')
ORDER BY tablename;

-- Politiques créées ?
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('clients', 'projects', 'notes')
ORDER BY tablename, policyname;
```

---

### **ÉTAPE 4 : Relancer l'app**

```bash
npm start
```

---

### **ÉTAPE 5 : Tests**

1. **Ouvrir app** → Écran Auth s'affiche ✅
2. **Créer compte** : test@example.com + password ✅
3. **Se connecter** → App principale ✅
4. **Créer client** → Devrait fonctionner ✅
5. **Vérifier DB** :
   ```sql
   SELECT id, name, user_id FROM clients LIMIT 5;
   ```
   Devrait afficher ton `user_id` réel ✅

---

## ⚠️ NOTES IMPORTANTES

### Données existantes

Les données sans `user_id` (NULL) :
- Ne seront **pas visibles** par RLS (user_id IS NULL ≠ auth.uid())
- Devront être migrées manuellement si besoin

**Migration optionnelle** :
```sql
-- Si tu veux associer anciennes données à un user
UPDATE clients 
SET user_id = 'TON_USER_ID_ICI'
WHERE user_id IS NULL;
```

---

### Code app

Le code ajoute automatiquement `user_id` :
```javascript
const user = await getCurrentUser();
const clientData = { name: 'Test', user_id: user.id };
await supabase.from('clients').insert([clientData]);
```

**RLS protège** :
- Même si `user_id` oublié, RLS bloque l'insert
- RLS filtre SELECT automatiquement

---

## 🔍 Debug

Si erreurs, vérifier :

1. **RLS activé** sur toutes tables ?
2. **Politiques créées** (4 par table) ?
3. **user_id NULLABLE** ?
4. **Bucket artisanflow** existe ?
5. **Session active** dans app (console logs) ?

---

**Status** : ✅ **READY TO DEPLOY**

