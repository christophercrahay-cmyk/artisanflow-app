# Configuration Supabase pour ArtisanFlow

## Setup Initial

### Étape 1: Créer les Tables

Exécutez d'abord le script `create_tables.sql` dans le **SQL Editor** de Supabase pour créer toutes les tables nécessaires :

```bash
# Les tables à créer :
- clients
- projects  
- client_photos
- project_photos
- notes
```

### Étape 2: Désactiver RLS

L'application utilise `supabase-js` avec la clé `anon` sans authentification utilisateur.
Par défaut, Supabase active RLS sur toutes les tables, ce qui bloque les insertions.

## Solution: Désactiver RLS ou Créer des Politiques

### Option 1: Désactiver RLS (Recommandé pour MVP)

Exécutez ces commandes SQL dans le **SQL Editor** de Supabase :

```sql
-- Désactiver RLS pour les tables principales
ALTER TABLE project_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
```

### Option 2: Activer RLS avec Politique Permissive

Si vous préférez garder RLS activé mais autoriser tous les accès :

```sql
-- Pour project_photos
CREATE POLICY "Allow all operations for anonymous" 
ON project_photos FOR ALL 
USING (true) 
WITH CHECK (true);

-- Pour client_photos
CREATE POLICY "Allow all operations for anonymous" 
ON client_photos FOR ALL 
USING (true) 
WITH CHECK (true);

-- Pour notes
CREATE POLICY "Allow all operations for anonymous" 
ON notes FOR ALL 
USING (true) 
WITH CHECK (true);

-- Pour clients
CREATE POLICY "Allow all operations for anonymous" 
ON clients FOR ALL 
USING (true) 
WITH CHECK (true);

-- Pour projects
CREATE POLICY "Allow all operations for anonymous" 
ON projects FOR ALL 
USING (true) 
WITH CHECK (true);
```

## Vérification

Après avoir exécuté ces commandes, l'application devrait fonctionner correctement.

**Note:** Pour une application de production, implémentez une authentification utilisateur appropriée.

