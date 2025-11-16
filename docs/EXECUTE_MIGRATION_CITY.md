# 🚀 Migration : Ajouter company_city à brand_settings

## ⚠️ Erreur Actuelle

```
Could not find the 'company_city' column of 'brand_settings' in the schema cache
```

## ✅ Solution

Exécutez la migration SQL suivante dans Supabase :

### Dans Supabase Dashboard :

1. Allez dans **SQL Editor**
2. Copiez-collez le contenu de `supabase/migrations_add_company_city.sql`
3. Cliquez sur **RUN**

### Migration SQL :

```sql
-- Migration : Ajout de la colonne company_city pour la météo par utilisateur
-- Date : 2025-11-04

-- Ajouter la colonne company_city si elle n'existe pas
ALTER TABLE public.brand_settings 
ADD COLUMN IF NOT EXISTS company_city TEXT;

-- Commentaire pour documentation
COMMENT ON COLUMN public.brand_settings.company_city IS 'Ville de l''entreprise (utilisée pour la météo par utilisateur)';

-- Message de confirmation
SELECT '✅ Migration terminée: colonne company_city ajoutée à brand_settings' as status;
```

## ✅ Après la Migration

Une fois la migration exécutée :
- ✅ La colonne `company_city` sera disponible
- ✅ Vous pourrez configurer votre ville dans Paramètres
- ✅ La météo s'affichera automatiquement dans le header

## 📝 Note

Si vous avez déjà des données dans `brand_settings`, la colonne sera ajoutée avec la valeur `NULL`. Vous devrez ensuite configurer votre ville dans les Paramètres de l'app.

