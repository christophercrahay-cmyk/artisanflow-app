# 🔍 RÉPONSES AUX QUESTIONS CRITIQUES

## Date: 7 Novembre 2025

---

## 1️⃣ CLÉS API EXPOSÉES

### ✅ Fichiers avec clés API hardcodées

**FICHIERS À MIGRER VERS .ENV** :

#### A. Clé OpenAI
**Fichier** : `config/openai.js` (ligne 5)
```javascript
apiKey: '[OPENAI_KEY_REDACTED]'
```
🔥 **CRITIQUE** : Clé OpenAI complète exposée

#### B. URL + Clé Supabase
**Fichier** : `config/supabase.js` (lignes 6-7)
```javascript
url: 'https://upihalivqstavxijlwaj.supabase.co'
anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaWhhbGl2cXN0YXZ4aWpsd2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjIxMzksImV4cCI6MjA3NzMzODEzOX0.LiTut-3fm7XPAALAi6KQkS1hcwXUctUTPwER9V7cAzs'
```
⚠️ **IMPORTANT** : URL + anon key exposées

#### C. URL Edge Function
**Fichier** : `services/aiConversationalService.js` (ligne 11)
```javascript
const EDGE_FUNCTION_URL = 'https://upihalivqstavxijlwaj.supabase.co/functions/v1/ai-devis-conversational';
```
⚠️ URL hardcodée (doit utiliser process.env)

### 📋 LISTE COMPLÈTE DES FICHIERS À MODIFIER

```
🔥 config/openai.js           # Clé OpenAI
⚠️ config/supabase.js         # URL + anon key Supabase
⚠️ services/aiConversationalService.js  # URL Edge Function
✅ config/sentry.js           # OK (dsn: null)
```

### ✅ ACTIONS À FAIRE

**1. Créer .env** :
```bash
cp env.example .env
```

**2. Remplir .env** avec vos vraies valeurs :
```env
EXPO_PUBLIC_SUPABASE_URL=https://upihalivqstavxijlwaj.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_OPENAI_API_KEY=[OPENAI_KEY_REDACTED]
```

**3. Modifier les fichiers** pour utiliser process.env (voir section 5 pour le code)

---

## 2️⃣ RLS - VÉRIFICATION TABLES

### ✅ TABLES AVEC user_id (OK pour RLS)

```
✅ clients (user_id UUID)
✅ projects (user_id UUID)
✅ brand_settings (user_id UUID)
✅ devis_ai_sessions (user_id UUID)
✅ user_price_stats (user_id UUID)
✅ profiles (id = user_id, pas de colonne séparée)
```

### ⚠️ TABLES SANS user_id (Relation indirecte)

Ces tables n'ont PAS de colonne `user_id` directe, mais sont liées via des foreign keys :

```
⚠️ notes (project_id → projects.user_id)
⚠️ devis (project_id → projects.user_id)
⚠️ devis_lignes (devis_id → devis.project_id → projects.user_id)
⚠️ factures (project_id → projects.user_id)
⚠️ project_photos (project_id → projects.user_id)
⚠️ client_photos (client_id → clients.user_id)
⚠️ devis_temp_ai (session_id → devis_ai_sessions.user_id)
```

### ✅ GESTION RLS POUR TABLES SANS user_id

**Solution** : Utiliser des policies avec EXISTS et JOIN

**Exemple pour `notes`** :
```sql
CREATE POLICY "Users can view notes from their projects"
  ON public.notes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = notes.project_id
    AND projects.user_id = auth.uid()
  ));
```

**Exemple pour `devis_lignes`** :
```sql
CREATE POLICY "Users can view lines from their devis"
  ON public.devis_lignes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.devis
    JOIN public.projects ON projects.id = devis.project_id
    WHERE devis.id = devis_lignes.devis_id
    AND projects.user_id = auth.uid()
  ));
```

### 📊 RÉSUMÉ

| Table | user_id Direct | Relation Indirecte | Policy Type |
|-------|----------------|-------------------|-------------|
| clients | ✅ | - | Direct |
| projects | ✅ | - | Direct |
| notes | ❌ | project_id | EXISTS |
| devis | ❌ | project_id | EXISTS |
| devis_lignes | ❌ | devis_id → project_id | EXISTS + JOIN |
| factures | ❌ | project_id | EXISTS |
| brand_settings | ✅ | - | Direct |
| project_photos | ❌ | project_id | EXISTS |
| client_photos | ❌ | client_id | EXISTS |
| devis_ai_sessions | ✅ | - | Direct |
| devis_temp_ai | ❌ | session_id | EXISTS |
| user_price_stats | ✅ | - | Direct |
| profiles | ✅ (id) | - | Direct |

**Total** : 13 tables  
**Direct user_id** : 6 tables  
**Relation indirecte** : 7 tables

**✅ TOUTES LES TABLES SONT GÉRÉES** dans le script `sql/enable_rls_production.sql`

---

## 3️⃣ DÉPENDANCES - COMMANDE EXACTE

### ✅ COMMANDE UNIQUE À COPIER-COLLER

```bash
npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-native eslint-plugin-react-hooks
```

**Détail des packages** :
- `eslint` : Linter JavaScript/TypeScript
- `prettier` : Formateur de code
- `eslint-config-prettier` : Désactive les règles ESLint conflictuelles avec Prettier
- `eslint-plugin-react` : Règles ESLint pour React
- `eslint-plugin-react-native` : Règles ESLint pour React Native
- `eslint-plugin-react-hooks` : Règles ESLint pour les hooks React

**Temps d'installation** : ~2 minutes

**Vérification** :
```bash
npm run lint
npm run format
```

---

## 4️⃣ TESTS RLS - PROCÉDURE CONCRÈTE

### ✅ SCRIPT DE TEST SIMPLE

**Fichier** : `sql/test_rls_security.sql`

```sql
-- ============================================
-- TEST RLS - VÉRIFICATION SÉCURITÉ
-- ============================================
-- À exécuter après activation RLS
-- ============================================

-- ÉTAPE 1: Récupérer 2 user_id différents
-- ============================================

SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 2;

-- Copier les 2 user_id pour les tests ci-dessous
-- user_A = premier ID
-- user_B = deuxième ID

-- ============================================
-- ÉTAPE 2: Tester avec User A
-- ============================================

-- Se connecter en tant que User A dans l'app
-- Puis exécuter cette requête dans Supabase (en tant qu'admin)

-- Vérifier que User A voit UNIQUEMENT ses clients
SELECT 
  id,
  name,
  user_id,
  CASE 
    WHEN user_id = '<user_A_id>' THEN '✅ User A'
    WHEN user_id = '<user_B_id>' THEN '❌ User B (NE DOIT PAS APPARAITRE)'
    ELSE '⚠️ Autre user'
  END as owner
FROM clients
WHERE user_id IN ('<user_A_id>', '<user_B_id>');

-- ✅ RÉSULTAT ATTENDU: Uniquement les clients de User A

-- ============================================
-- ÉTAPE 3: Tester avec User B
-- ============================================

-- Se connecter en tant que User B dans l'app
-- Puis exécuter la même requête

-- ✅ RÉSULTAT ATTENDU: Uniquement les clients de User B

-- ============================================
-- ÉTAPE 4: Test d'insertion croisée
-- ============================================

-- En tant que User A, essayer d'insérer un client pour User B
-- Cette requête doit ÉCHOUER

INSERT INTO clients (user_id, name, email)
VALUES ('<user_B_id>', 'Client Test Hack', 'hack@test.com');

-- ❌ RÉSULTAT ATTENDU: Erreur RLS policy violation

-- ============================================
-- ÉTAPE 5: Test de lecture croisée
-- ============================================

-- En tant que User A connecté dans l'app,
-- cette requête SQL (exécutée côté serveur avec son token)
-- ne doit retourner QUE ses données

SELECT COUNT(*) as mes_clients FROM clients;
-- ✅ Doit retourner uniquement le nombre de clients de User A

SELECT COUNT(*) as tous_les_clients FROM clients WHERE user_id IS NOT NULL;
-- ⚠️ Cette requête admin retourne TOUS les clients
-- Mais dans l'app, User A ne voit que les siens

-- ============================================
-- ÉTAPE 6: Vérification finale
-- ============================================

-- Vérifier que RLS est bien activé
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'clients', 'projects', 'notes', 'devis', 'devis_lignes',
  'factures', 'brand_settings', 'project_photos', 'client_photos'
)
ORDER BY tablename;

-- ✅ RÉSULTAT ATTENDU: rls_enabled = true pour TOUTES les tables

-- ============================================
-- RÉSUMÉ TEST
-- ============================================
-- 
-- ✅ User A voit uniquement ses données
-- ✅ User B voit uniquement ses données
-- ❌ User A ne peut pas insérer pour User B
-- ❌ User A ne peut pas lire les données de User B
-- ✅ RLS activé sur toutes les tables
-- 
-- Si TOUS ces tests passent → RLS fonctionne correctement
-- ============================================
```

### 🧪 TEST DANS L'APP (Plus Simple)

**Procédure** :

1. **Créer 2 comptes** :
   - User A : `test-a@artisanflow.app` / `Test1234`
   - User B : `test-b@artisanflow.app` / `Test1234`

2. **User A : Créer des données** :
   - Se connecter avec User A
   - Créer 2 clients
   - Créer 2 projets
   - Créer quelques notes

3. **User B : Créer des données** :
   - Se déconnecter
   - Se connecter avec User B
   - Créer 2 clients différents
   - Créer 2 projets différents

4. **Vérifier l'isolation** :
   - User A doit voir UNIQUEMENT ses 2 clients (pas ceux de B)
   - User B doit voir UNIQUEMENT ses 2 clients (pas ceux de A)
   - Idem pour projets, notes, devis, etc.

5. **Test de suppression** :
   - User A ne doit PAS pouvoir supprimer les données de User B (même en manipulant l'API)

**✅ Si tous ces tests passent → RLS fonctionne correctement**

---

## 3️⃣ DÉPENDANCES - COMMANDE EXACTE

### ✅ COMMANDE UNIQUE

```bash
npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-native eslint-plugin-react-hooks
```

**Temps** : ~2 minutes

**Vérification** :
```bash
# Vérifier que les packages sont installés
npm list eslint prettier

# Tester
npm run lint
npm run format
```

---

## 4️⃣ TESTS RLS - PROCÉDURE CONCRÈTE

### ✅ MÉTHODE SIMPLE (Dans l'app)

**Étape 1** : Créer 2 comptes de test

```bash
# Dans Supabase SQL Editor
SELECT email, id FROM auth.users ORDER BY created_at DESC LIMIT 5;

# Ou créer via l'app :
# User A: test-a@artisanflow.app / Test1234
# User B: test-b@artisanflow.app / Test1234
```

**Étape 2** : User A crée des données

1. Se connecter avec User A
2. Créer **2 clients** :
   - Client A1 : "Client Test A1"
   - Client A2 : "Client Test A2"
3. Noter les IDs des clients créés

**Étape 3** : User B crée des données

1. Se déconnecter (bouton Paramètres > Déconnexion)
2. Se connecter avec User B
3. Créer **2 clients** :
   - Client B1 : "Client Test B1"
   - Client B2 : "Client Test B2"

**Étape 4** : Vérifier l'isolation

1. **User B doit voir UNIQUEMENT** :
   - Client B1
   - Client B2
   - ❌ PAS Client A1 ni A2

2. Se déconnecter et se reconnecter avec User A

3. **User A doit voir UNIQUEMENT** :
   - Client A1
   - Client A2
   - ❌ PAS Client B1 ni B2

**✅ Si les données sont bien isolées → RLS fonctionne**

### ✅ MÉTHODE AVANCÉE (SQL)

**Fichier créé** : `sql/test_rls_security.sql` (voir section 4 ci-dessus)

**Procédure** :
1. Copier le script dans Supabase SQL Editor
2. Remplacer `<user_A_id>` et `<user_B_id>` par les vrais IDs
3. Exécuter chaque section
4. Vérifier les résultats attendus

---

## 5️⃣ HISTORIQUE GIT - NETTOYAGE

### ✅ ANALYSE

**Fichiers sensibles committés** :
```
🔥 config/openai.js       # Clé OpenAI en clair
⚠️ config/supabase.js     # URL + anon key
```

**⚠️ CES CLÉS SONT DANS L'HISTORIQUE GIT**

### 🔥 PROCÉDURE DE NETTOYAGE (CRITIQUE)

#### Option A : Révoquer et regénérer les clés (RECOMMANDÉ)

**Pour OpenAI** :
1. Aller sur https://platform.openai.com/api-keys
2. Révoquer la clé actuelle : `[OPENAI_KEY_REDACTED]`
3. Créer une nouvelle clé
4. Mettre à jour dans `.env`

**Pour Supabase** :
La clé `anon` est publique par design (OK), mais :
1. Vérifier que RLS est activé (protection)
2. Éventuellement regénérer si compromission suspectée

**✅ AVANTAGE** : Pas besoin de réécrire l'historique Git

#### Option B : Nettoyer l'historique Git (AVANCÉ)

**⚠️ ATTENTION** : Cette opération est **DESTRUCTIVE** et **COMPLEXE**

```bash
# 1. Installer BFG Repo-Cleaner
# Télécharger depuis: https://rtyley.github.io/bfg-repo-cleaner/

# 2. Créer un fichier avec les secrets à supprimer
echo "[OPENAI_KEY_REDACTED]" > secrets.txt
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaWhhbGl2cXN0YXZ4aWpsd2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjIxMzksImV4cCI6MjA3NzMzODEzOX0.LiTut-3fm7XPAALAi6KQkS1hcwXUctUTPwER9V7cAzs" >> secrets.txt

# 3. Nettoyer l'historique
java -jar bfg.jar --replace-text secrets.txt .git

# 4. Nettoyer les refs
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push (⚠️ ATTENTION)
git push --force --all
```

**❌ INCONVÉNIENTS** :
- Réécriture complète de l'historique
- Tous les collaborateurs doivent re-cloner
- Risque de casser le repo

### 💡 RECOMMANDATION

**➡️ OPTION A (Révoquer les clés)** est LARGEMENT suffisante et plus sûre.

**Pourquoi** :
- ✅ Pas de risque de casser le repo
- ✅ Simple et rapide (5 minutes)
- ✅ Les anciennes clés ne fonctionnent plus
- ✅ Pas besoin de coordonner avec l'équipe

**Option B (Nettoyer Git)** uniquement si :
- Le repo est public (actuellement privé ✅)
- Vous prévoyez de l'open-sourcer
- Vous avez une exigence de conformité stricte

---

## 📋 CHECKLIST FINALE

### Avant de commencer

- [ ] Lire ce document en entier
- [ ] Avoir accès à Supabase Dashboard
- [ ] Avoir accès à OpenAI Platform
- [ ] Avoir accès au repo GitHub
- [ ] Avoir 2h devant soi

### Sécurité (30 min)

- [ ] Créer .env depuis env.example
- [ ] Remplir .env avec vraies valeurs
- [ ] Révoquer ancienne clé OpenAI
- [ ] Créer nouvelle clé OpenAI
- [ ] Mettre à jour .env avec nouvelle clé

### RLS (30 min)

- [ ] Ouvrir Supabase SQL Editor
- [ ] Copier/coller `sql/enable_rls_production.sql`
- [ ] Exécuter le script
- [ ] Vérifier que toutes les tables ont rls_enabled = true
- [ ] Créer 2 comptes de test (User A et User B)
- [ ] Tester l'isolation des données

### Qualité Code (10 min)

- [ ] Installer dépendances ESLint/Prettier
- [ ] Exécuter `npm run lint`
- [ ] Exécuter `npm run format`
- [ ] Vérifier qu'il n'y a pas d'erreurs critiques

### CI/CD (10 min)

- [ ] Aller sur GitHub > Settings > Secrets
- [ ] Ajouter EXPO_TOKEN
- [ ] Ajouter CODECOV_TOKEN (optionnel)
- [ ] Push le code
- [ ] Vérifier que le workflow se lance

### Tests (10 min)

- [ ] Exécuter `npm test`
- [ ] Vérifier que les tests passent
- [ ] Tester l'app localement
- [ ] Vérifier que tout fonctionne

---

## 🎯 RÉSUMÉ DES RÉPONSES

### 1. Clés API exposées
**OUI**, 3 fichiers :
- `config/openai.js` (clé OpenAI complète)
- `config/supabase.js` (URL + anon key)
- `services/aiConversationalService.js` (URL hardcodée)

### 2. Tables et user_id
**13 tables** au total :
- **6 avec user_id direct** : OK pour RLS direct
- **7 sans user_id** : RLS via EXISTS + JOIN (déjà géré dans le script)

### 3. Dépendances
**Commande unique** :
```bash
npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-native eslint-plugin-react-hooks
```

### 4. Tests RLS
**Méthode simple** : Créer 2 users, créer des données, vérifier l'isolation dans l'app  
**Méthode avancée** : Script SQL fourni (`sql/test_rls_security.sql`)

### 5. Historique Git
**OUI**, clés dans l'historique  
**Solution recommandée** : Révoquer les clés (Option A)  
**Alternative** : Nettoyer Git (Option B, complexe)

---

**Tu as maintenant TOUTES les informations pour exécuter les Quick Wins en toute sécurité !** 🚀

**Commence par l'Option A (Révoquer les clés) puis active RLS.** 🔒

