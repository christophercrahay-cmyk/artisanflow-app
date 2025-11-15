# 🔥 AUDIT ISOLATION UTILISATEURS - PROBLÈMES CRITIQUES DÉTECTÉS

## Date: 7 Novembre 2025
## Priorité: 🔴 CRITIQUE

---

## ⚠️ RÉSUMÉ EXÉCUTIF

**RLS est activé ✅** mais **plusieurs requêtes n'ont PAS de filtre explicite `user_id`**.

**Risque** : Bien que RLS protège au niveau base de données, les requêtes sans filtre sont :
- ❌ Moins performantes (scan de toutes les lignes avant filtrage RLS)
- ❌ Moins claires (pas évident que le filtrage se fait)
- ⚠️ Risquées si RLS est désactivé par erreur

**Impact** : 🔥 CRITIQUE - À corriger immédiatement

---

## 🔍 PROBLÈMES IDENTIFIÉS

### 🔥 CRITIQUE : Requêtes sans filtre user_id

#### 1. ClientsListScreen.js (ligne 49-52)

**Problème** :
```javascript
// ❌ PAS de filtre user_id
const { data, error } = await supabase
  .from('clients')
  .select('id,name,phone,email,address,created_at')
  .order('created_at', { ascending: false });
```

**Impact** : Récupère TOUS les clients de TOUS les users (RLS filtre après)

**Correction nécessaire** :
```javascript
// ✅ Avec filtre user_id
const { data: { user } } = await supabase.auth.getUser();
const { data, error } = await supabase
  .from('clients')
  .select('id,name,phone,email,address,created_at')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

---

#### 2. CaptureHubScreen.js (ligne 86-89)

**Problème** :
```javascript
// ❌ PAS de filtre user_id
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .order('name', { ascending: true });
```

**Impact** : Récupère TOUS les clients

**Correction nécessaire** : Ajouter `.eq('user_id', user.id)`

---

#### 3. ProjectsListScreen.js (ligne 42-48)

**Problème** :
```javascript
// ❌ PAS de filtre user_id
const { data, error } = await supabase
  .from('projects')
  .select(`
    id,
    name,
    address,
    status,
    // ...
  `)
```

**Impact** : Récupère TOUS les projets de TOUS les users

**Correction nécessaire** : Ajouter `.eq('user_id', user.id)`

---

#### 4. ProjectCreateScreen.tsx (ligne 65-68)

**Problème** :
```javascript
// ❌ PAS de filtre user_id
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .order('name', { ascending: true });
```

**Impact** : Liste de clients non filtrée

**Correction nécessaire** : Ajouter `.eq('user_id', user.id)`

---

#### 5. DocumentsScreen.js (ligne 46-53 et 60-67)

**Problème** :
```javascript
// ❌ PAS de filtre user_id sur devis
const { data: devis, error: devisError } = await supabase
  .from('devis')
  .select(`
    *,
    projects(id, title),
    clients(id, name)
  `)
  .order('created_at', { ascending: false });

// ❌ PAS de filtre user_id sur factures
const { data: factures, error: facturesError } = await supabase
  .from('factures')
  .select(`
    *,
    projects(id, title),
    clients(id, name)
  `)
  .order('created_at', { ascending: false });
```

**Impact** : Récupère TOUS les devis et factures

**Correction nécessaire** : Filtrer via projects.user_id ou ajouter user_id dans devis/factures

---

#### 6. ProDashboardScreen.js (lignes 33-74)

**Problème** : AUCUN filtre user_id sur :
```javascript
// ❌ Devis en attente
.from('devis').select('id', { count: 'exact' }).eq('statut', 'envoye');

// ❌ Factures impayées
.from('factures').select('id', { count: 'exact' }).eq('statut', 'impayee');

// ❌ CA du mois
.from('factures').select('montant_ttc').eq('statut', 'paye')...

// ❌ Chantiers actifs
.from('projects').select('id', { count: 'exact' }).in('status', ['active', 'paused']);
```

**Impact** : 🔥 CRITIQUE - Dashboard affiche les stats de TOUS les users

---

### ✅ REQUÊTES CORRECTES (Avec filtre)

#### DashboardScreen.js (ligne 128-134)

```javascript
// ✅ BON - Filtre user_id présent
const { data: projects, error: projErr } = await supabase
  .from('projects')
  .select('id, name, status, client_id, created_at')
  .eq('user_id', user.id)
  .eq('archived', false)
  .order('created_at', { ascending: false })
  .limit(10);
```

#### DashboardScreen.js (ligne 157-162)

```javascript
// ✅ BON - Filtre user_id présent
const { data: devis, error: devisErr } = await supabase
  .from('devis')
  .select('id')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(100);
```

---

## 📊 RÉSUMÉ DES PROBLÈMES

| Fichier | Table | Ligne | Filtre user_id | Criticité |
|---------|-------|-------|----------------|-----------|
| ClientsListScreen.js | clients | 49-52 | ❌ NON | 🔥 |
| CaptureHubScreen.js | clients | 86-89 | ❌ NON | 🔥 |
| CaptureHubScreen.js | projects | 104-109 | ❌ NON | 🔥 |
| ProjectsListScreen.js | projects | 42-55 | ❌ NON | 🔥 |
| ProjectCreateScreen.tsx | clients | 65-68 | ❌ NON | 🔥 |
| DocumentsScreen.js | devis | 46-53 | ❌ NON | 🔥 |
| DocumentsScreen.js | factures | 60-67 | ❌ NON | 🔥 |
| ProDashboardScreen.js | devis | 33-36 | ❌ NON | 🔥 |
| ProDashboardScreen.js | factures | 43-46 | ❌ NON | 🔥 |
| ProDashboardScreen.js | factures | 57-62 | ❌ NON | 🔥 |
| ProDashboardScreen.js | projects | 71-74 | ❌ NON | 🔥 |
| DashboardScreen.js | projects | 128-134 | ✅ OUI | ✅ |
| DashboardScreen.js | devis | 157-162 | ✅ OUI | ✅ |

**Total** : 11 requêtes sans filtre ❌ / 2 requêtes correctes ✅

---

## 🛡️ PROTECTION ACTUELLE

**RLS est activé** ✅ donc les données sont protégées au niveau base de données.

**MAIS** :
- ⚠️ Performance dégradée (scan inutile de toutes les lignes)
- ⚠️ Code pas clair (pas évident que le filtrage se fait)
- 🔥 Risque si RLS désactivé par erreur

---

## ✅ CORRECTIONS À APPLIQUER

### Fichiers à corriger (11)

1. `screens/ClientsListScreen.js`
2. `screens/CaptureHubScreen.js` (2 requêtes)
3. `screens/ProjectsListScreen.js`
4. `screens/ProjectCreateScreen.tsx`
5. `screens/DocumentsScreen.js` (2 requêtes)
6. `screens/ProDashboardScreen.js` (4 requêtes)

### Pattern de correction

**Pour tables avec user_id direct** (clients, projects) :
```javascript
// Récupérer l'utilisateur
const { data: { user } } = await supabase.auth.getUser();

// Ajouter le filtre
.eq('user_id', user.id)
```

**Pour tables sans user_id direct** (devis, factures) :
```javascript
// Option 1: Filtrer via JOIN
.from('devis')
.select('*, projects!inner(id, title, user_id)')
.eq('projects.user_id', user.id)

// Option 2: Si devis a user_id, filtrer direct
.from('devis')
.eq('user_id', user.id)
```

---

## 🧪 SCÉNARIO DE TEST

### Avant correction

1. Créer User A avec 2 clients
2. Créer User B avec 2 clients
3. Se connecter avec User B
4. **Vérifier dans les logs réseau** : La requête récupère 4 clients (A+B)
5. **Mais l'app affiche** : 2 clients (RLS filtre)

### Après correction

1. Se connecter avec User B
2. **Vérifier dans les logs réseau** : La requête récupère 2 clients (B uniquement)
3. **L'app affiche** : 2 clients (cohérent)

**✅ Performance améliorée + Code plus clair**

---

## 🎯 RECOMMANDATION

**CORRIGER IMMÉDIATEMENT** ces 11 requêtes pour :
1. 🚀 Améliorer les performances
2. 📖 Rendre le code plus clair
3. 🛡️ Renforcer la sécurité (défense en profondeur)
4. ✅ Respecter les règles `.cursorrules`

**Veux-tu que j'applique les corrections maintenant ?**

---

**Rapport complet prêt. Attente de validation pour corrections.** ⏸️

