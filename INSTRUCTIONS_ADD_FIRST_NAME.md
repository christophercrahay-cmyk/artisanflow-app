# 📋 Instructions - Ajouter la colonne first_name

## Problème
L'erreur `PGRST204` indique que la colonne `first_name` n'existe pas dans la table `brand_settings`.

## Solution : Exécuter le script SQL

### Étape 1 : Ouvrir Supabase Dashboard
1. Aller sur https://app.supabase.com
2. Sélectionner votre projet ArtisanFlow
3. Cliquer sur **SQL Editor** dans le menu de gauche

### Étape 2 : Exécuter le script
1. Cliquer sur **New Query**
2. Copier-coller le contenu suivant :

```sql
-- Ajouter first_name si elle n'existe pas
ALTER TABLE brand_settings ADD COLUMN IF NOT EXISTS first_name TEXT;
```

3. Cliquer sur **Run** (ou `Ctrl+Enter`)

### Étape 3 : Vérifier
Exécuter cette requête pour vérifier que la colonne existe :

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'brand_settings' 
  AND column_name = 'first_name';
```

**Résultat attendu** : Une ligne avec `first_name | text | YES`

### Étape 4 : Rafraîchir le cache Supabase (optionnel)
Parfois Supabase met en cache le schéma. Si l'erreur persiste après avoir ajouté la colonne :

1. Attendre 1-2 minutes
2. Redémarrer l'app (`npm run start -- --clear`)
3. Réessayer de sauvegarder le prénom dans les paramètres

## Alternative : Script complet
Le fichier `sql/add_first_name_to_brand_settings.sql` contient le script complet avec vérification.

---

**Une fois le script exécuté, retournez dans l'app et réessayez de sauvegarder votre prénom dans les paramètres.**

