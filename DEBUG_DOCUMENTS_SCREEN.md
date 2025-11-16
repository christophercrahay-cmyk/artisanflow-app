# 🔍 DEBUG DOCUMENTS SCREEN

## Problème signalé
Tous les boutons (TOUS, DEVIS, FACTURES) affichent "Aucun document"

## Vérifications à faire

### 1. Vérifier qu'il y a des données en base

**Dans Supabase** :
- Va dans la table `devis`
- Vérifie qu'il y a au moins 1 devis
- Va dans la table `factures`
- Vérifie qu'il y a au moins 1 facture

### 2. Vérifier le chargement

Le code charge correctement :
```javascript
// Ligne 53-57
const { data: devis } = await supabase
  .from('devis')
  .select(`*, projects!inner(id, name, user_id), clients(id, name)`)
  .eq('projects.user_id', user.id)

// Ligne 63-67
const { data: factures } = await supabase
  .from('factures')
  .select(`*, projects!inner(id, name, user_id), clients(id, name)`)
  .eq('projects.user_id', user.id)
```

### 3. Vérifier le mapping

```javascript
// Ligne 74-82
devis → type: 'devis'
factures → type: 'facture'
```

### 4. Vérifier le filtrage

```javascript
// Ligne 129-138
if (filter === 'tous') return documents;
const typeMap = {
  'devis': 'devis',     // ✅ Correct
  'factures': 'facture' // ✅ Correct (enlève le 's')
};
```

## Test manuel

1. **Dans l'app, ajoute un devis** :
   - Va dans un chantier
   - Section "Devis IA"
   - Crée un devis

2. **Retourne dans Documents** :
   - Le devis devrait apparaître
   - Clique sur "DEVIS" → Le devis doit s'afficher
   - Clique sur "FACTURES" → Rien (normal si pas de facture)

## Console logs

Ajoute temporairement dans `loadDocuments()` :
```javascript
console.log('Devis chargés:', devis?.length || 0);
console.log('Factures chargées:', factures?.length || 0);
console.log('Documents totaux:', allDocuments.length);
```

Puis vérifie la console Expo pour voir ce qui est chargé.

