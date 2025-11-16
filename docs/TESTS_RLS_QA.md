# 🔒 Tests QA - Row Level Security (RLS)

## 📋 Résumé

Script de test automatisé pour vérifier que la Row Level Security (RLS) fonctionne correctement sur toutes les tables de la base de données ArtisanFlow.

## 🎯 Objectifs des Tests

1. ✅ Vérifier que RLS est activée sur toutes les tables
2. ✅ Vérifier que chaque utilisateur ne voit que ses propres données
3. ✅ Vérifier qu'aucun accès croisé n'est possible
4. ✅ Vérifier que l'insertion sans `user_id` échoue

## 📁 Fichiers Créés

### Script Principal
- **`tests/test_rls_security.js`** - Script de test complet

### Documentation
- **`tests/README.md`** - Guide d'utilisation
- **`tests/RUN_TESTS.md`** - Instructions rapides
- **`tests/package.json`** - Dépendances Node.js

## 🚀 Utilisation Rapide

### 1. Installation des dépendances

```bash
npm install @supabase/supabase-js dotenv
```

### 2. Configuration

Créer un fichier `.env` à la racine :
```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-clé-anon
```

### 3. Exécution

```bash
node tests/test_rls_security.js
```

## 📊 Tests Effectués

### Étape 1: Création d'utilisateurs
- ✅ `test1@artisanflow.com` (userA)
- ✅ `test2@artisanflow.com` (userB)

### Étape 2: Création de données de test

Pour chaque utilisateur :
- ✅ Client : `Client_Test_A` / `Client_Test_B`
- ✅ Projet : `Projet_Test_A` / `Projet_Test_B`
- ✅ Devis : `DEVIS-TEST-A-001` / `DEVIS-TEST-B-001`
- ✅ Facture : `FA-TEST-A-001` / `FA-TEST-B-001`
- ✅ Note : Note texte de test

### Étape 3: Tests d'accès croisés

| Test | Table | Résultat Attendu |
|------|-------|------------------|
| userA → clients userB | `clients` | ❌ Vide (`[]`) |
| userB → clients userA | `clients` | ❌ Vide (`[]`) |
| userA → devis userB | `devis` | ❌ Vide (`[]`) |
| userB → devis userA | `devis` | ❌ Vide (`[]`) |
| userA → projets userB | `projects` | ❌ Vide (`[]`) |
| userA → factures userB | `factures` | ❌ Vide (`[]`) |
| userA → notes userB | `notes` | ❌ Vide (`[]`) |
| userA → ses propres données | `clients` | ✅ Données présentes |

### Étape 4: Tests de sécurité

| Test | Table | Résultat Attendu |
|------|-------|------------------|
| Insertion sans `user_id` | `clients` | ❌ Erreur RLS |
| Insertion sans `user_id` | `devis` | ❌ Erreur RLS |

## 📈 Exemple de Résultat

```
🔒 Démarrage des tests RLS pour ArtisanFlow

✅ UserA créé: test1@artisanflow.com (uuid-123)
✅ UserB créé: test2@artisanflow.com (uuid-456)

📝 Création données test pour userA...
✅ Client créé: Client_Test_A
✅ Projet créé: Projet_Test_A
✅ Devis créé: DEVIS-TEST-A-001
✅ Facture créée: FA-TEST-A-001
✅ Note créée

📝 Création données test pour userB...
✅ Client créé: Client_Test_B
✅ Projet créé: Projet_Test_B
✅ Devis créé: DEVIS-TEST-B-001
✅ Facture créée: FA-TEST-B-001
✅ Note créée

🔒 Test des accès croisés...
✅ clients.userA ne voit pas les clients de userB: PASS
✅ clients.userB ne voit pas les clients de userA: PASS
✅ devis.userA ne voit pas les devis de userB: PASS
✅ devis.userB ne voit pas les devis de userA: PASS
✅ projects.userA ne voit pas les projets de userB: PASS
✅ factures.userA ne voit pas les factures de userB: PASS
✅ notes.userA ne voit pas les notes de userB: PASS
✅ clients.userA voit ses propres clients: PASS

🚫 Test insertion sans user_id (doit échouer)...
✅ clients.Insertion sans user_id doit échouer: PASS
✅ devis.Insertion sans user_id doit échouer: PASS

============================================================
📊 RÉSUMÉ DES TESTS RLS
============================================================

✅ CLIENTS
   PASS: 3 | FAIL: 0
   ✅ userA ne voit pas les clients de userB
   ✅ userB ne voit pas les clients de userA
   ✅ userA voit ses propres clients

✅ DEVIS
   PASS: 3 | FAIL: 0
   ✅ userA ne voit pas les devis de userB
   ✅ userB ne voit pas les devis de userA
   ✅ Insertion sans user_id doit échouer

✅ PROJECTS
   PASS: 1 | FAIL: 0
   ✅ userA ne voit pas les projets de userB

✅ FACTURES
   PASS: 1 | FAIL: 0
   ✅ userA ne voit pas les factures de userB

✅ NOTES
   PASS: 1 | FAIL: 0
   ✅ userA ne voit pas les notes de userB

============================================================
📈 TOTAL: 15 PASS | 0 FAIL
============================================================

🎉 TOUS LES TESTS SONT PASSÉS ! La RLS est correctement configurée.
```

## ✅ Tables Testées

- ✅ `clients` - Clients de l'artisan
- ✅ `projects` - Chantiers/projets
- ✅ `devis` - Devis avec numérotation
- ✅ `factures` - Factures liées aux devis
- ✅ `notes` - Notes vocales et textuelles
- ⚠️ `project_photos` - (non testé dans cette version)
- ⚠️ `client_photos` - (non testé dans cette version)
- ⚠️ `brand_settings` - (non testé dans cette version)

## 🧹 Nettoyage

Les données de test sont conservées pour inspection manuelle. Pour les supprimer :

1. Se connecter à Supabase Dashboard
2. Aller dans **Authentication > Users**
3. Supprimer les utilisateurs :
   - `test1@artisanflow.com`
   - `test2@artisanflow.com`

Les données associées seront supprimées automatiquement grâce à `ON DELETE CASCADE`.

## ⚠️ Notes Importantes

1. **Les utilisateurs de test** sont créés à chaque exécution
2. **Si les utilisateurs existent déjà**, le script se connecte simplement
3. **Les données de test** sont identifiées par les préfixes `*_Test_A` et `*_Test_B`
4. **Le script utilise** les variables d'environnement ou la config React Native existante

## 🔍 Dépannage

### Erreur: "SUPABASE_URL et SUPABASE_ANON_KEY doivent être définis"

**Solution:** Créez un fichier `.env` avec vos clés Supabase :
```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-clé-anon
```

### Erreur: "Utilisateur non authentifié"

**Solution:** Vérifiez que les utilisateurs de test peuvent être créés. Si `test1@artisanflow.com` existe déjà, le script se connecte automatiquement.

### Tests échouent avec "row-level security policy"

**Solution:** Vérifiez que la migration `supabase/migrations_enable_rls_complete.sql` a été exécutée dans Supabase.

## 📝 Prochaines Étapes

1. ✅ Exécuter les tests
2. ✅ Vérifier que tous les tests passent
3. ✅ Si des tests échouent, vérifier la configuration RLS
4. ✅ Nettoyer les données de test si nécessaire

