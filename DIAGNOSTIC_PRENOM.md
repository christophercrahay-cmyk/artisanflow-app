# 🔍 Diagnostic - Prénom dans l'accueil

## Problème
Le prénom ne s'affiche pas dans l'accueil après avoir été configuré dans les paramètres.

## Étapes de diagnostic

### 1. Vérifier que la colonne existe dans Supabase

1. Ouvrir Supabase Dashboard → SQL Editor
2. Exécuter cette requête :

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'brand_settings' 
  AND column_name = 'first_name';
```

**Résultat attendu** : Une ligne avec `first_name | text | YES`

**Si aucune ligne** : La colonne n'existe pas → Exécuter le script `sql/add_first_name_to_brand_settings.sql`

### 2. Vérifier que le prénom est bien sauvegardé

Dans Supabase SQL Editor :

```sql
SELECT id, user_id, first_name, company_name
FROM brand_settings
WHERE user_id = auth.uid();
```

**Résultat attendu** : Une ligne avec votre `first_name` rempli

### 3. Vérifier les logs de l'application

1. Ouvrir l'app en mode développement
2. Ouvrir les DevTools / Console
3. Aller dans Paramètres → Entrer un prénom → Sauvegarder
4. Vérifier les messages dans la console :
   - `[Settings] Paramètres sauvegardés avec succès` ✅
   - `[Settings] Erreur sauvegarde settings` ❌

### 4. Vérifier le chargement dans HomeHeader

1. Aller sur l'écran d'accueil
2. Vérifier les logs dans la console :
   - `[HomeHeader] Erreur chargement prénom` ❌
   - Pas d'erreur = chargement OK ✅

### 5. Test manuel

1. **Paramètres** :
   - Ouvrir Paramètres
   - Section "Préférences"
   - Entrer un prénom (ex: "Jean")
   - Cliquer sur "Sauvegarder"
   - Vérifier le message "✅ Succès"

2. **Accueil** :
   - Retourner à l'écran d'accueil
   - Le message devrait afficher "Bonjour, Jean" (ou "Bon après-midi, Jean" selon l'heure)

## Solutions possibles

### Solution 1 : Colonne manquante
**Symptôme** : Erreur `PGRST116` ou "Colonne manquante"

**Action** :
1. Ouvrir Supabase → SQL Editor
2. Copier-coller le contenu de `sql/add_first_name_to_brand_settings.sql`
3. Exécuter le script
4. Vérifier avec la requête de l'étape 1

### Solution 2 : Prénom non sauvegardé
**Symptôme** : Erreur lors de la sauvegarde

**Action** :
1. Vérifier les logs dans la console
2. Vérifier que `user_id` est bien présent dans `brand_settings`
3. Vérifier les règles RLS (Row Level Security) sur `brand_settings`

### Solution 3 : Prénom non chargé
**Symptôme** : Prénom sauvegardé mais pas affiché

**Action** :
1. Vérifier que `HomeHeader` se rafraîchit bien (utilise `useFocusEffect`)
2. Vérifier les logs `[HomeHeader]`
3. Redémarrer l'app si nécessaire

### Solution 4 : Cache de l'app
**Symptôme** : Aucune erreur mais rien ne change

**Action** :
1. Fermer complètement l'app
2. Relancer l'app
3. Si toujours rien, vider le cache : `npm run start -- --clear`

## Vérification finale

Après avoir suivi toutes les étapes, le résultat attendu est :

- ✅ Colonne `first_name` existe dans `brand_settings`
- ✅ Prénom sauvegardé dans la base de données
- ✅ Prénom affiché dans l'accueil : "Bonjour, [prénom]"
- ✅ Prénom mis à jour automatiquement après modification dans les paramètres

