# ✅ Correction du Workflow Clients / Chantiers

## 📋 Objectif

Corriger la logique de création et de lien entre clients et chantiers pour garantir :
- ✅ On ne peut pas créer de chantier sans client associé
- ✅ Un client peut avoir plusieurs chantiers (relation 1:N)
- ✅ Le champ `client_id` est obligatoire dans la création d'un chantier
- ✅ Messages clairs si aucun client n'existe
- ✅ Bouton "Nouveau chantier" depuis la fiche client
- ✅ Sélection de client dans la création de chantier

## 🔧 Modifications Effectuées

### 1. `screens/ProjectCreateScreen.tsx`

**Améliorations :**
- ✅ Vérification de l'existence de clients avant création
- ✅ Message d'erreur clair si aucun client n'existe : "Aucun client disponible. Créez d'abord un client avant de créer un chantier."
- ✅ Bouton "Créer un client" qui redirige vers `ClientsList`
- ✅ Sélection automatique du premier client si `clientId` initial fourni
- ✅ Validation renforcée : vérifie `clients.length === 0` avant création
- ✅ Désactivation du bouton "Créer" si aucun client n'existe

**Code clé :**
```typescript
// Vérification avant création
if (clients.length === 0) {
  showError('Créez d\'abord un client avant de créer un chantier');
  return;
}

// Sélection automatique du client initial
if (!selectedClientId && initialClientId) {
  const clientExists = clientsList.some(c => c.id === initialClientId);
  if (clientExists) {
    setSelectedClientId(initialClientId);
  }
}
```

### 2. `screens/ClientDetailScreen.js`

**Améliorations :**
- ✅ Remplacement de la modal de création par une navigation vers `ProjectCreateScreen`
- ✅ Bouton "Nouveau chantier" qui navigue avec `clientId` pré-rempli
- ✅ Suppression du code inutile (modal, états, fonction `createProject`)
- ✅ Nettoyage des imports inutiles

**Code clé :**
```javascript
<TouchableOpacity
  style={styles.addButton}
  onPress={() => {
    // Navigation vers ProjectCreateScreen avec le clientId pré-rempli
    navigation.navigate('ProjectCreate', { clientId: clientId });
  }}
  activeOpacity={0.7}
>
  <Feather name="plus" size={18} color={theme.colors.text} strokeWidth={2.5} />
  <Text style={styles.addButtonText}>Nouveau chantier</Text>
</TouchableOpacity>
```

### 3. `store/useAppStore.js`

**Améliorations :**
- ✅ Validation obligatoire de `client_id` dans `addProject`
- ✅ Message d'erreur clair : "Un client est obligatoire pour créer un chantier"

**Code clé :**
```javascript
addProject: async (projectData) => {
  // Validation : client_id est obligatoire
  if (!projectData.client_id) {
    throw new Error('Un client est obligatoire pour créer un chantier');
  }
  // ... reste du code
}
```

## 📊 Structure Base de Données

### Table `projects`
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,  -- ✅ OBLIGATOIRE (FK)
  name TEXT NOT NULL,
  address TEXT,
  status TEXT DEFAULT 'active',
  -- ...
  CONSTRAINT fk_projects_client FOREIGN KEY (client_id) 
    REFERENCES clients(id) ON DELETE CASCADE
);
```

### Table `clients`
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  -- ...
);
```

## 🎨 Flux Utilisateur

### 1. Création depuis la fiche client
```
ClientDetailScreen
  → Bouton "Nouveau chantier"
    → ProjectCreateScreen (avec clientId pré-rempli)
      → Chantier créé avec client_id
```

### 2. Création depuis Dashboard/Capture
```
Dashboard/CaptureHub
  → ProjectCreateScreen
    → Si aucun client : message + bouton "Créer un client"
    → Si clients existent : sélection du client
      → Chantier créé avec client_id
```

### 3. Validation
```
Tentative de création sans client
  → Erreur : "Créez d'abord un client avant de créer un chantier"
  → Bouton "Créer un client" disponible
```

## ✅ Validation Multi-Niveaux

1. **Niveau UI** : `ProjectCreateScreen` vérifie `clients.length === 0`
2. **Niveau Store** : `useAppStore.addProject()` vérifie `client_id` présent
3. **Niveau DB** : `client_id UUID NOT NULL` + contrainte FK

## 🚫 Ce qui a été préservé

- ✅ Dashboard et météo fonctionnent normalement
- ✅ Modules Capture/Devis/Photos intacts
- ✅ RLS (Row Level Security) toujours actif
- ✅ Navigation existante préservée
- ✅ Logique de création de capture → projet inchangée

## 📝 Points d'Entrée Vérifiés

1. ✅ `ClientDetailScreen` → Bouton "Nouveau chantier"
2. ✅ `ProjectCreateScreen` → Sélection client + validation
3. ✅ `CaptureHubScreen` → Navigation avec `initialCapture`
4. ✅ `DashboardScreen` → Redirection vers ClientsTab (OK car nécessite client)
5. ✅ `store/useAppStore.js` → Validation `client_id` obligatoire

## 🎯 Résultat Final

✅ **Workflow logique** : Client → Chantier → Documents / Journal / Capture
✅ **Validation robuste** : 3 niveaux (UI, Store, DB)
✅ **UX améliorée** : Messages clairs, boutons intuitifs
✅ **Code propre** : Suppression de la modal inutile, navigation unifiée

