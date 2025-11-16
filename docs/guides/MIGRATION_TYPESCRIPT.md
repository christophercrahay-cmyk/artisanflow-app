# 📝 Guide de Migration TypeScript

Ce guide vous aide à migrer progressivement ArtisanFlow vers TypeScript.

## 🎯 Stratégie de Migration

### Phase 1 : Configuration (✅ FAIT)
- [x] Installer TypeScript et les types
- [x] Créer `tsconfig.json`
- [x] Créer les types globaux dans `types/index.d.ts`

### Phase 2 : Migration par couches

#### Ordre recommandé :
1. **Utils et Services** (pas de dépendances React)
2. **Stores** (Zustand)
3. **Hooks personnalisés**
4. **Components réutilisables**
5. **Screens**

### Phase 3 : Activation du mode strict
Une fois tout migré, activer le mode strict progressivement.

---

## 🔧 Comment Migrer un Fichier

### 1. Renommer le fichier
```bash
mv MonFichier.js MonFichier.tsx  # Pour les composants React
mv monFichier.js monFichier.ts   # Pour les utilitaires
```

### 2. Ajouter les types d'import
```typescript
import { Client, Project } from '../types';
```

### 3. Typer les props
```typescript
// Avant (JS)
export default function ClientCard({ client, onPress }) {
  // ...
}

// Après (TS)
interface ClientCardProps {
  client: Client;
  onPress: (client: Client) => void;
}

export default function ClientCard({ client, onPress }: ClientCardProps) {
  // ...
}
```

### 4. Typer les états
```typescript
// Avant (JS)
const [clients, setClients] = useState([]);

// Après (TS)
const [clients, setClients] = useState<Client[]>([]);
```

### 5. Typer les fonctions
```typescript
// Avant (JS)
async function loadClients() {
  const { data } = await supabase.from('clients').select();
  return data;
}

// Après (TS)
async function loadClients(): Promise<Client[]> {
  const { data } = await supabase.from('clients').select();
  return data || [];
}
```

---

## 📦 Exemples de Migration

### Exemple 1 : Store Zustand

```typescript
// store/useAppStore.ts
import { create } from 'zustand';
import { AppStore } from '../types';

export const useAppStore = create<AppStore>((set, get) => ({
  // State
  currentClient: null,
  clients: [],
  loadingClients: false,
  
  // Actions
  setCurrentClient: (client) => set({ currentClient: client }),
  
  loadClients: async () => {
    set({ loadingClients: true });
    // ... logique
    set({ loadingClients: false });
  },
}));
```

### Exemple 2 : Composant React

```typescript
// components/ClientCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Client } from '../types';

interface ClientCardProps {
  client: Client;
  onPress: (client: Client) => void;
  onDelete?: (id: string) => void;
}

export default function ClientCard({ 
  client, 
  onPress, 
  onDelete 
}: ClientCardProps) {
  return (
    <TouchableOpacity onPress={() => onPress(client)}>
      <View style={styles.card}>
        <Text style={styles.name}>{client.name}</Text>
        {client.address && (
          <Text style={styles.address}>{client.address}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16 },
  name: { fontSize: 18, fontWeight: 'bold' },
  address: { fontSize: 14, color: '#666' },
});
```

### Exemple 3 : Service/Utilitaire

```typescript
// utils/supabaseQueries.ts
import { supabase } from '../supabaseClient';
import { Client, Project, SupabaseResponse } from '../types';

export async function fetchClients(): Promise<Client[]> {
  const { data, error }: SupabaseResponse<Client[]> = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data || [];
}

export async function createClient(
  clientData: Partial<Client>
): Promise<Client> {
  const { data, error }: SupabaseResponse<Client> = await supabase
    .from('clients')
    .insert([clientData])
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  if (!data) {
    throw new Error('No data returned');
  }
  
  return data;
}
```

### Exemple 4 : Hook personnalisé

```typescript
// hooks/useClients.ts
import { useState, useEffect } from 'react';
import { Client } from '../types';
import { fetchClients } from '../utils/supabaseQueries';

interface UseClientsReturn {
  clients: Client[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await fetchClients();
      setClients(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  return {
    clients,
    loading,
    error,
    refresh: loadClients,
  };
}
```

---

## ⚠️ Pièges Courants

### 1. Types Supabase
```typescript
// ❌ Mauvais
const { data } = await supabase.from('clients').select();
// Type: any

// ✅ Bon
const { data }: { data: Client[] | null } = await supabase
  .from('clients')
  .select();
```

### 2. Optional Chaining
```typescript
// ❌ Mauvais
const name = client.name;  // Erreur si client est null

// ✅ Bon
const name = client?.name;
```

### 3. Type Guards
```typescript
// ❌ Mauvais
if (data) {
  setClients(data);  // Peut être null
}

// ✅ Bon
if (data && Array.isArray(data)) {
  setClients(data);
}
```

---

## 🚀 Migration Progressive

### Étape 1 : Autoriser JS/TS mixte
Dans `tsconfig.json` :
```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false
  }
}
```

### Étape 2 : Migrer fichier par fichier
- Commencer par les fichiers sans dépendances
- Tester après chaque migration
- Commiter régulièrement

### Étape 3 : Activer le mode strict
Une fois tous les fichiers migrés :
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}
```

---

## 📊 Progression

Suivez votre progression :

```bash
# Compter les fichiers .js
find . -name "*.js" -not -path "./node_modules/*" | wc -l

# Compter les fichiers .ts/.tsx
find . -name "*.ts" -o -name "*.tsx" -not -path "./node_modules/*" | wc -l
```

---

## 🎓 Ressources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Expo TypeScript](https://docs.expo.dev/guides/typescript/)

---

## ✅ Checklist Migration

- [ ] Utils migrés
- [ ] Services migrés
- [ ] Stores migrés
- [ ] Hooks migrés
- [ ] Components migrés
- [ ] Screens migrés
- [ ] Tests migrés
- [ ] Mode strict activé

