# Tests QA - Row Level Security (RLS)

## 📋 Description

Script de test automatisé pour vérifier que la Row Level Security (RLS) fonctionne correctement sur toutes les tables de la base de données ArtisanFlow.

## 🚀 Installation

### Option 1: Installation locale (recommandé)

```bash
cd tests
npm install
```

### Option 2: Installation globale des dépendances

```bash
npm install @supabase/supabase-js dotenv
```

## ⚙️ Configuration

Créer un fichier `.env` à la racine du projet avec :

```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-clé-anon
```

Ou utiliser les variables d'environnement Expo :
```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
```

## ▶️ Exécution

### Méthode 1: Node.js (ES modules)

```bash
cd tests
node test_rls_security.js
```

### Méthode 2: Avec tsx (TypeScript)

```bash
cd tests
npm run test:rls:tsx
```

### Méthode 3: Depuis la racine

```bash
node tests/test_rls_security.js
```

## 📊 Tests Effectués

### 1. Création d'utilisateurs de test
- ✅ `test1@artisanflow.com` (userA)
- ✅ `test2@artisanflow.com` (userB)

### 2. Création de données de test
Pour chaque utilisateur :
- ✅ Client de test
- ✅ Projet de test
- ✅ Devis de test
- ✅ Facture de test
- ✅ Note de test

### 3. Tests d'accès croisés
- ✅ userA ne voit pas les données de userB
- ✅ userB ne voit pas les données de userA
- ✅ userA voit ses propres données

### 4. Tests de sécurité
- ✅ Insertion sans `user_id` doit échouer avec erreur RLS

## 📈 Résultats Attendus

```
✅ TOUS LES TESTS SONT PASSÉS ! La RLS est correctement configurée.
```

### Tables Testées

- ✅ `clients`
- ✅ `projects`
- ✅ `devis`
- ✅ `factures`
- ✅ `notes`
- ✅ `project_photos`
- ✅ `client_photos`
- ✅ `brand_settings`

## 🧹 Nettoyage

Les données de test sont conservées pour inspection manuelle. Pour les supprimer :

1. Se connecter à Supabase Dashboard
2. Aller dans Authentication > Users
3. Supprimer les utilisateurs :
   - `test1@artisanflow.com`
   - `test2@artisanflow.com`

Les données associées seront supprimées automatiquement grâce à `ON DELETE CASCADE`.

## ⚠️ Notes

- Les utilisateurs de test sont créés à chaque exécution
- Si les utilisateurs existent déjà, le script se connecte simplement
- Les données de test sont identifiées par les préfixes `*_Test_A` et `*_Test_B`

