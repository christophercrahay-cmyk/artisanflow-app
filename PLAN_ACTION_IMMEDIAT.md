# 🚀 PLAN D'ACTION IMMÉDIAT - ArtisanFlow
## Quick Wins pour +63% Valorisation en 2.5 Jours

---

## 📋 CHECKLIST COMPLÈTE

### ✅ Action 1: Activer RLS (2h) → +15% Valorisation

**Priorité**: 🔥 CRITIQUE

**Fichier**: `sql/enable_rls_all_tables.sql`

```sql
-- ============================================
-- ACTIVER RLS SUR TOUTES LES TABLES
-- ============================================

-- 1. Activer RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devis_lignes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_photos ENABLE ROW LEVEL SECURITY;

-- 2. Policies pour clients
CREATE POLICY "Users can view their own clients"
  ON public.clients FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own clients"
  ON public.clients FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own clients"
  ON public.clients FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own clients"
  ON public.clients FOR DELETE
  USING (user_id = auth.uid());

-- 3. Policies pour projects
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (user_id = auth.uid());

-- 4. Policies pour devis
CREATE POLICY "Users can view their own devis"
  ON public.devis FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = devis.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own devis"
  ON public.devis FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = devis.project_id
    AND projects.user_id = auth.uid()
  ));

-- Répéter pour toutes les tables...
```

**Commandes**:
```bash
# 1. Copier le script dans Supabase SQL Editor
# 2. Exécuter
# 3. Tester avec 2 users différents
```

---

### ✅ Action 2: Sécuriser Clés API (1h) → +10% Valorisation

**Priorité**: 🔥 CRITIQUE

**Étape 1**: Créer `.env.example`

```bash
# .env.example
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-key-here
EXPO_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
```

**Étape 2**: Créer `.env` (ne PAS committer)

```bash
# Copier .env.example vers .env
cp .env.example .env

# Remplir avec les vraies valeurs
```

**Étape 3**: Supprimer les fichiers sensibles

```bash
# Supprimer du repo
git rm --cached config/openai.js
git rm --cached config/supabase.js
git rm --cached config/sentry.js

# Ajouter au .gitignore
echo "config/openai.js" >> .gitignore
echo "config/supabase.js" >> .gitignore
echo "config/sentry.js" >> .gitignore
```

**Étape 4**: Mettre à jour le code

```javascript
// config/supabase.js (version sécurisée)
export const SUPABASE_CONFIG = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
};
```

---

### ✅ Action 3: ESLint + Prettier (2h) → +5% Valorisation

**Priorité**: ⚠️ HAUTE

**Installation**:
```bash
npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-native
```

**Fichier**: `.eslintrc.js`

```javascript
module.exports = {
  extends: [
    'expo',
    'prettier',
  ],
  plugins: ['react', 'react-native'],
  rules: {
    'react/prop-types': 'off', // TypeScript gère ça
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```

**Fichier**: `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

**Scripts package.json**:
```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\""
  }
}
```

**Commandes**:
```bash
# Linter
npm run lint

# Fix automatique
npm run lint:fix

# Formater
npm run format
```

---

### ✅ Action 4: CHANGELOG.md (1h) → +3% Valorisation

**Priorité**: 💡 MOYENNE

**Fichier**: `CHANGELOG.md`

```markdown
# Changelog

All notable changes to ArtisanFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-11-07

### Added
- ✨ Écran Documents unifié (devis + factures)
- ✨ Gestion des statuts (Brouillon/Envoyé/Signé)
- ✨ Bouton Paramètres dans l'écran Documents
- ✨ Génération PDF depuis la BDD avec vraies lignes
- ✨ IA conversationnelle pour génération devis
- ✨ Questions IA génériques (tous métiers)
- ✨ Bouton "œil" pour afficher/masquer mot de passe

### Changed
- 🔄 Icône FACTURES: 💰 → `file-text` (plus neutre)
- 🔄 Amélioration lisibilité champs (contraste, taille)
- 🔄 Modal PDF corrigée (plein écran, bouton fermer)

### Fixed
- 🐛 Correction emoji FACTURES (affichait "?")
- 🐛 Modal PDF transparente corrigée
- 🐛 Padding double dans DevisAIGenerator

### Security
- 🔒 Clés API migrées vers .env (en cours)
- 🔒 RLS à activer (en cours)

## [1.0.0] - 2025-11-03

### Added
- 🎉 Release initiale sur Play Store (accès anticipé)
- ✨ Gestion clients et projets
- ✨ Notes vocales avec transcription Whisper
- ✨ Devis et factures
- ✨ Génération PDF basique
- ✨ Thème sombre moderne

## [Unreleased]

### Planned
- 🔜 RLS activé sur toutes les tables
- 🔜 CI/CD avec GitHub Actions
- 🔜 Tests automatisés (coverage > 70%)
- 🔜 Monitoring production (Sentry + Analytics)
- 🔜 Pagination sur toutes les listes
- 🔜 Compression images avant upload
```

---

### ✅ Action 5: GitHub Actions CI (3h) → +10% Valorisation

**Priorité**: ⚠️ HAUTE

**Fichier**: `.github/workflows/ci.yml`

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check Prettier
        run: npm run format -- --check

  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          fail_ci_if_error: false

  build:
    name: Build Check
    runs-on: ubuntu-latest
    needs: [lint, test]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Check Expo Doctor
        run: npx expo-doctor

      - name: Build (dry-run)
        run: echo "Build check passed"
```

**Setup**:
```bash
# 1. Créer le dossier
mkdir -p .github/workflows

# 2. Créer le fichier ci.yml

# 3. Configurer les secrets GitHub
# - EXPO_TOKEN (depuis expo.dev)
# - CODECOV_TOKEN (depuis codecov.io)

# 4. Commit et push
git add .github/workflows/ci.yml
git commit -m "ci: Add GitHub Actions CI pipeline"
git push
```

---

### ✅ Action 6: Error Boundaries (2h) → +5% Valorisation

**Priorité**: ⚠️ HAUTE

**Fichier**: `components/ErrorBoundary.js`

```javascript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    
    // Envoyer à Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Feather name="alert-triangle" size={64} color="#EF4444" />
          <Text style={styles.title}>Oups ! Une erreur est survenue</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'Erreur inconnue'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1A1D22',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EAEAEA',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ErrorBoundary;
```

**Utilisation dans `App.js`**:

```javascript
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      {/* Votre app */}
    </ErrorBoundary>
  );
}
```

---

### ✅ Action 7: Configurer Sentry (2h) → +5% Valorisation

**Priorité**: ⚠️ HAUTE

**Étape 1**: Créer compte Sentry (sentry.io)

**Étape 2**: Installer SDK

```bash
npm install @sentry/react-native
```

**Étape 3**: Configurer

**Fichier**: `utils/sentryInit.js` (mise à jour)

```javascript
import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: __DEV__ ? 'development' : 'production',
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    tracesSampleRate: 1.0, // 100% en dev, réduire en prod
    beforeSend(event) {
      // Ne pas envoyer en dev
      if (__DEV__) {
        console.log('Sentry event (dev):', event);
        return null;
      }
      return event;
    },
  });
}

export function captureError(error, context = {}) {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
}

export function setUser(user) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
  });
}
```

---

### ✅ Action 8: CONTRIBUTING.md (1h) → +2% Valorisation

**Priorité**: 💡 MOYENNE

**Fichier**: `CONTRIBUTING.md`

```markdown
# Contributing to ArtisanFlow

Merci de contribuer à ArtisanFlow ! 🎉

## 📋 Code of Conduct

Soyez respectueux et professionnel.

## 🚀 Quick Start

1. Fork le repo
2. Clone votre fork
3. Créer une branche: `git checkout -b feature/ma-feature`
4. Installer: `npm install`
5. Lancer: `npm start`

## 📝 Commit Convention

Utilisez [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Ajouter génération PDF
fix: Corriger bug modal
docs: Mettre à jour README
style: Formater code
refactor: Refactoriser service IA
test: Ajouter tests composants
chore: Mettre à jour dépendances
```

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Coverage
npm run test:coverage

# Lint
npm run lint
```

## 📤 Pull Requests

1. Créer une PR vers `develop`
2. Description claire
3. Tests passent
4. Code formaté (Prettier)
5. Pas de conflits

## 🐛 Bug Reports

Utilisez les issues GitHub avec le template bug.

## ✨ Feature Requests

Utilisez les issues GitHub avec le template feature.

## 📞 Contact

- Email: contact@artisanflow.fr
- Discord: [lien]
```

---

### ✅ Action 9: Pagination (3h) → +5% Valorisation

**Priorité**: 💡 MOYENNE

**Fichier**: `hooks/usePagination.js`

```javascript
import { useState, useCallback } from 'react';

export function usePagination(fetchFunction, pageSize = 20) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newData = await fetchFunction(page, pageSize);
      
      if (newData.length < pageSize) {
        setHasMore(false);
      }

      setData(prev => [...prev, ...newData]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Pagination error:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchFunction, pageSize]);

  const refresh = useCallback(async () => {
    setData([]);
    setPage(0);
    setHasMore(true);
    await loadMore();
  }, [loadMore]);

  return { data, loading, hasMore, loadMore, refresh };
}
```

**Utilisation**:

```javascript
// Dans DocumentsScreen.js
const fetchDocuments = async (page, pageSize) => {
  const { data } = await supabase
    .from('devis')
    .select('*')
    .range(page * pageSize, (page + 1) * pageSize - 1)
    .order('created_at', { ascending: false });
  
  return data || [];
};

const { data, loading, hasMore, loadMore, refresh } = usePagination(fetchDocuments);
```

---

### ✅ Action 10: Compresser Images (2h) → +3% Valorisation

**Priorité**: 💡 MOYENNE

**Fichier**: `utils/imageCompression.js`

```javascript
import * as ImageManipulator from 'expo-image-manipulator';

export async function compressImage(uri, options = {}) {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.7,
  } = options;

  try {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth, height: maxHeight } }],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return manipulated.uri;
  } catch (error) {
    console.error('Image compression error:', error);
    return uri; // Fallback: retourner l'image originale
  }
}
```

**Utilisation dans `PhotoUploader.js`**:

```javascript
import { compressImage } from './utils/imageCompression';

// Avant upload
const compressedUri = await compressImage(result.assets[0].uri);
// Puis upload compressedUri au lieu de uri
```

---

## 📊 RÉCAPITULATIF

| Action | Temps | Impact | Priorité |
|--------|-------|--------|----------|
| 1. RLS | 2h | +15% | 🔥 |
| 2. Clés API | 1h | +10% | 🔥 |
| 3. ESLint | 2h | +5% | ⚠️ |
| 4. CHANGELOG | 1h | +3% | 💡 |
| 5. CI/CD | 3h | +10% | ⚠️ |
| 6. Error Boundaries | 2h | +5% | ⚠️ |
| 7. Sentry | 2h | +5% | ⚠️ |
| 8. CONTRIBUTING | 1h | +2% | 💡 |
| 9. Pagination | 3h | +5% | 💡 |
| 10. Images | 2h | +3% | 💡 |

**Total**: 19h = 2.5 jours  
**Impact Total**: +63% valorisation  
**ROI**: 🔥 Exceptionnel

---

## 🎯 ORDRE D'EXÉCUTION RECOMMANDÉ

### Jour 1 (8h)
1. ✅ Clés API (1h) - CRITIQUE
2. ✅ RLS (2h) - CRITIQUE
3. ✅ ESLint + Prettier (2h)
4. ✅ Error Boundaries (2h)
5. ✅ CHANGELOG (1h)

**Impact Jour 1**: +35%

### Jour 2 (8h)
6. ✅ CI/CD GitHub Actions (3h)
7. ✅ Sentry (2h)
8. ✅ Pagination (3h)

**Impact Jour 2**: +20%

### Jour 3 (3h)
9. ✅ CONTRIBUTING (1h)
10. ✅ Compression Images (2h)

**Impact Jour 3**: +8%

**Total 2.5 jours**: +63% valorisation

---

## ✅ VALIDATION

Après chaque action, vérifier :

1. **RLS**: Tester avec 2 users différents
2. **Clés API**: Vérifier que l'app fonctionne avec .env
3. **ESLint**: `npm run lint` sans erreurs
4. **CI/CD**: PR de test passe
5. **Error Boundaries**: Déclencher une erreur volontaire
6. **Sentry**: Vérifier les events dans dashboard
7. **Pagination**: Tester avec 100+ items
8. **Images**: Vérifier taille avant/après

---

**Prêt à commencer ? Exécute les actions dans l'ordre recommandé !** 🚀

