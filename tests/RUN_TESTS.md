# 🚀 Guide d'Exécution des Tests RLS

## Méthode 1: Avec Node.js (Recommandé)

### Prérequis
```bash
npm install @supabase/supabase-js dotenv
```

### Configuration
Créez un fichier `.env` à la racine du projet :
```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-clé-anon
```

### Exécution
```bash
node tests/test_rls_security.js
```

## Méthode 2: Directement avec les variables d'environnement

```bash
SUPABASE_URL=https://votre-projet.supabase.co SUPABASE_ANON_KEY=votre-clé node tests/test_rls_security.js
```

## Méthode 3: Utiliser la config React Native existante

Si vous avez déjà configuré `config/supabase.js`, le script l'utilisera automatiquement.

## 📊 Résultats Attendus

Le script affichera :
- ✅ Création des utilisateurs de test
- ✅ Création des données de test
- ✅ Tests d'accès croisés
- ✅ Tests de sécurité (insertion sans user_id)
- 📊 Résumé final avec PASS/FAIL par table

## ✅ Résultat Idéal

```
🎉 TOUS LES TESTS SONT PASSÉS ! La RLS est correctement configurée.
```

## ⚠️ En Cas d'Erreur

Si certains tests échouent :
1. Vérifiez que la migration `migrations_enable_rls_complete.sql` a été exécutée
2. Vérifiez que RLS est activé sur toutes les tables
3. Vérifiez que les politiques RLS sont créées

