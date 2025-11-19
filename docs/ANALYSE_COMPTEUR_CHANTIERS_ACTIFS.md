# Analyse du Compteur de Chantiers Actifs

**Date** : 2025-11-19  
**Problème** : Le dashboard affiche "0 Actifs" alors qu'il y a des chantiers actifs

---

## 📍 FICHIERS CONCERNÉS

1. **`screens/CaptureHubScreen2.js`** (ligne 641) - Affiche `stats.activeProjects`
2. **`screens/DashboardScreen2.js`** (ligne 224) - Affiche `stats.activeProjects`
3. **`screens/ProDashboardScreen.js`** (ligne 93) - Affiche `kpis.chantiersActifs`

---

## 🔍 CODE ACTUEL

### 1. CaptureHubScreen2.js (lignes 108-158)

```javascript
const loadStats = async () => {
  // ...
  const { data: projects } = await supabase
    .from('projects')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('archived', false);

  // ❌ PROBLÈME : Ne compte QUE 'in_progress' ou null, PAS 'active'
  const active = projects?.filter((p) => p.status === 'in_progress' || !p.status) || [];
  const completed = projects?.filter((p) => p.status === 'done') || [];

  setStats({
    activeProjects: active.length,  // ← Affiche 0 si les chantiers sont 'active'
    // ...
  });
};
```

**Problème** : Le filtre ne compte pas les chantiers avec `status === 'active'` !

---

### 2. DashboardScreen2.js (lignes 83-166)

```javascript
const loadDashboardData = useCallback(async (isRefresh = false) => {
  // ...
  const { data: projects, error: projErr } = await supabase
    .from('projects')
    .select('id, name, status, client_id, created_at')
    .eq('user_id', user.id)
    .eq('archived', false)
    .order('created_at', { ascending: false })
    .limit(10);  // ⚠️ LIMITE DE 10 ! Peut expliquer pourquoi certains ne sont pas comptés

  // ❌ PROBLÈME : Même filtre incomplet + limite de 10 projets
  const active = projects?.filter((p) => p.status === 'in_progress' || !p.status) || [];
  const completed = projects?.filter((p) => p.status === 'done') || [];

  setStats({
    activeProjects: active.length,  // ← Affiche 0 si les chantiers sont 'active'
    // ...
  });
}, []);
```

**Problèmes** :
1. Le filtre ne compte pas `'active'`
2. **LIMITE DE 10 projets** → Si vous avez plus de 10 projets, seuls les 10 premiers sont comptés !

---

### 3. ProDashboardScreen.js (lignes 78-94)

```javascript
// 4. Chantiers actifs (status = 'active')
const { data: chantiersData, error: chantiersErr } = await supabase
  .from('projects')
  .select('id', { count: 'exact' })
  .eq('user_id', user.id)
  .in('status', ['active', 'paused']); // ⚠️ Utilise 'paused' au lieu de 'pause'

setKpis({
  // ...
  chantiersActifs: chantiersData?.length || 0,
});
```

**Problèmes** :
1. Ne compte que `'active'` et `'paused'`, mais pas `'in_progress'` ni `null`
2. Utilise `'paused'` alors que le schéma indique `'pause'`

---

## 📊 STATUTS POSSIBLES DANS LA BASE

Selon les schémas SQL et TypeScript trouvés :

### Schéma SQL (`docs/sql/CREATE_MAIN_TABLES.sql`)
```sql
status TEXT DEFAULT 'active', -- active, paused, done
```

### Schéma TypeScript (`types/index.d.ts`)
```typescript
status: 'active' | 'pause' | 'completed';
```

### Schéma Validation (`validation/schemas.js`)
```javascript
status: z.enum(['active', 'pause', 'completed']).default('active'),
```

### Code réel utilisé dans ProjectsListScreen (ligne 144)
```javascript
// Considère comme actifs : 'active', 'in_progress', ou null
p.status === 'active' || p.status === 'in_progress' || !p.status
```

---

## ❌ INCOHÉRENCES IDENTIFIÉES

| Fichier | Filtre actuel | Statuts manquants |
|---------|---------------|-------------------|
| **CaptureHubScreen2.js** | `'in_progress' \|\| !status` | ❌ `'active'`, `'pause'` |
| **DashboardScreen2.js** | `'in_progress' \|\| !status` | ❌ `'active'`, `'pause'` + limite 10 |
| **ProDashboardScreen.js** | `['active', 'paused']` | ❌ `'in_progress'`, `null`, `'pause'` (au lieu de 'paused') |
| **ProjectsListScreen.js** | `'active' \|\| 'in_progress' \|\| !status` | ✅ Correct (mais pas utilisé pour le compteur) |

---

## ✅ SOLUTION PROPOSÉE

### Filtre unifié pour "chantiers actifs"

Un chantier est considéré comme **actif** si :
- `status === 'active'` OU
- `status === 'in_progress'` OU
- `status === 'pause'` OU `status === 'paused'` (compatibilité) OU
- `status === null` OU `status === undefined` (chantiers sans statut = actifs par défaut)

### Code corrigé

```javascript
// Filtre unifié pour tous les fichiers
const active = projects?.filter((p) => 
  p.status === 'active' || 
  p.status === 'in_progress' || 
  p.status === 'pause' || 
  p.status === 'paused' ||  // Compatibilité
  !p.status  // null ou undefined = actif par défaut
) || [];
```

### Corrections spécifiques

1. **CaptureHubScreen.js** : Ajouter `'active'` et `'pause'`/`'paused'` au filtre
2. **DashboardScreen2.js** : 
   - Ajouter `'active'` et `'pause'`/`'paused'` au filtre
   - **Retirer la limite `.limit(10)`** pour compter TOUS les projets
3. **ProDashboardScreen.js** : Ajouter `'in_progress'`, `'pause'` (au lieu de 'paused'), et `null`

---

## 📋 RÉSUMÉ

| Problème | Fichier | Ligne | Solution |
|----------|---------|-------|----------|
| Filtre incomplet | CaptureHubScreen2.js | 124 | Ajouter `'active'` et `'pause'` |
| Filtre incomplet + limite | DashboardScreen2.js | 111 | Ajouter `'active'` et `'pause'` + retirer `.limit(10)` |
| Filtre incomplet | ProDashboardScreen.js | 83 | Ajouter `'in_progress'`, `'pause'`, et `null` |

---

**Attente de validation avant correction** ✅

