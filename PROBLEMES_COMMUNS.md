# 🔧 Problèmes Communs - Solutions

## Erreur : "row-level security policy"

**Symptôme** : `ERROR: new row violates row-level security policy`

**Solution** : Exécuter `disable_rls.sql` dans Supabase

---

## Erreur : "relation does not exist"

**Symptôme** : `ERROR: 42P01: relation "client_photos" does not exist`

**Solution** : Exécuter `fix_uuid_tables.sql` dans Supabase

---

## Erreur : Types incompatibles UUID/BIGINT

**Symptôme** : `Key columns are of incompatible types: bigint and uuid`

**Solution** : Exécuter `fix_uuid_tables.sql` dans Supabase

---

## Ordre d'exécution des scripts SQL

Si vous avez des problèmes, suivez cet ordre :

1. **`fix_uuid_tables.sql`** - Crée/recrée les tables avec les bons types
2. **`disable_rls.sql`** - Désactive RLS au cas où

---

## Vérifier que tout fonctionne

1. Allez dans **Table Editor** de Supabase
2. Vérifiez que vous avez ces 5 tables :
   - clients
   - projects
   - client_photos
   - project_photos
   - notes

3. Testez l'app : Ajoutez un client et un chantier
4. Si ça marche → ✅ Configuration terminée !

---

## Besoin d'aide ?

Relancez simplement l'app après avoir exécuté les scripts SQL. Le problème devrait être résolu.

