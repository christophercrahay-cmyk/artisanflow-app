# Contributing to ArtisanFlow

Merci de contribuer à ArtisanFlow ! 🎉

Ce guide vous aidera à contribuer efficacement au projet.

---

## 📋 Code of Conduct

En contribuant à ce projet, vous acceptez de :
- Être respectueux et professionnel
- Accepter les critiques constructives
- Collaborer dans l'intérêt du projet

---

## 🚀 Quick Start

### 1. Fork & Clone

```bash
# Fork le repo sur GitHub
# Puis clone votre fork
git clone https://github.com/VOTRE-USERNAME/artisanflow.git
cd artisanflow
```

### 2. Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp env.example .env

# Remplir .env avec vos clés (Supabase, OpenAI)
```

### 3. Lancer l'app

```bash
# Démarrer le serveur Expo
npm start

# Ou avec tunnel (si problèmes réseau)
npm run start:tunnel
```

---

## 🌿 Workflow Git

### Branches

- `main` : Production (protégée)
- `develop` : Développement (branche par défaut)
- `feature/*` : Nouvelles fonctionnalités
- `fix/*` : Corrections de bugs
- `refactor/*` : Refactoring
- `docs/*` : Documentation

### Créer une branche

```bash
# Depuis develop
git checkout develop
git pull origin develop

# Créer votre branche
git checkout -b feature/ma-nouvelle-feature
```

---

## 📝 Commit Convention

Utilisez [Conventional Commits](https://www.conventionalcommits.org/) :

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (pas de changement de code)
- `refactor`: Refactoring
- `test`: Ajout/modification de tests
- `chore`: Maintenance (dépendances, config, etc.)
- `perf`: Amélioration de performance
- `ci`: CI/CD

### Exemples

```bash
feat(devis): Ajouter génération PDF automatique
fix(auth): Corriger bug connexion Play Store
docs(readme): Mettre à jour guide installation
style(components): Formater avec Prettier
refactor(services): Extraire logique IA dans service dédié
test(utils): Ajouter tests pour pdf.js
chore(deps): Mettre à jour Expo SDK 54 → 55
perf(lists): Ajouter pagination sur DocumentsScreen
ci(github): Ajouter workflow tests automatiques
```

### Scope (optionnel)

Exemples de scopes :
- `auth`, `devis`, `factures`, `clients`, `projects`
- `ui`, `api`, `database`, `storage`
- `ios`, `android`, `web`

---

## 🧪 Tests

### Lancer les tests

```bash
# Tous les tests
npm test

# Mode watch (développement)
npm run test:watch

# Avec coverage
npm run test:coverage
```

### Écrire des tests

**Exemple test composant** :

```javascript
// components/__tests__/StatusBadge.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StatusBadge from '../StatusBadge';

describe('StatusBadge', () => {
  it('affiche le statut correctement', () => {
    const { getByText } = render(
      <StatusBadge status="brouillon" onPress={() => {}} />
    );
    expect(getByText('Brouillon')).toBeTruthy();
  });

  it('appelle onPress au clic', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <StatusBadge status="brouillon" onPress={onPress} />
    );
    fireEvent.press(getByText('Brouillon'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Coverage Minimum

- Services : 80%+
- Utils : 80%+
- Composants critiques : 70%+
- Screens : 50%+

---

## 🎨 Style Guide

### Code Style

```bash
# Formater avec Prettier (quand configuré)
npm run format

# Linter (quand configuré)
npm run lint
npm run lint:fix
```

### Conventions

**JavaScript/TypeScript** :
- `camelCase` pour variables et fonctions
- `PascalCase` pour composants React
- `UPPER_SNAKE_CASE` pour constantes
- Préférer `const` à `let`
- Pas de `var`

**React Native** :
- Composants fonctionnels (pas de classes sauf ErrorBoundary)
- Hooks pour la logique
- PropTypes ou TypeScript pour les props
- Extraire les styles dans `StyleSheet.create()`

**Naming** :
- Fichiers composants : `PascalCase.js`
- Fichiers utils : `camelCase.js`
- Fichiers screens : `ScreenName.js`
- Fichiers services : `serviceName.js`

---

## 📤 Pull Requests

### Checklist avant PR

- [ ] Code fonctionne localement
- [ ] Tests ajoutés/mis à jour
- [ ] Tests passent (`npm test`)
- [ ] Code formaté (Prettier)
- [ ] Pas de console.log inutiles
- [ ] Documentation mise à jour si nécessaire
- [ ] CHANGELOG.md mis à jour
- [ ] Pas de conflits avec `develop`

### Créer une PR

1. **Push votre branche**
   ```bash
   git push origin feature/ma-feature
   ```

2. **Ouvrir une PR sur GitHub**
   - Base : `develop`
   - Compare : `feature/ma-feature`

3. **Description claire**
   ```markdown
   ## Description
   Ajout de la fonctionnalité X qui permet de Y.

   ## Type de changement
   - [x] Nouvelle fonctionnalité
   - [ ] Correction de bug
   - [ ] Breaking change

   ## Tests
   - [x] Tests unitaires ajoutés
   - [x] Tests manuels effectués
   - [x] Screenshots/vidéos (si UI)

   ## Checklist
   - [x] Code fonctionne localement
   - [x] Tests passent
   - [x] Documentation mise à jour
   - [x] CHANGELOG mis à jour
   ```

4. **Review**
   - Attendre la review d'un mainteneur
   - Effectuer les modifications demandées
   - Merge après approbation

---

## 🐛 Signaler un Bug

### Utiliser les Issues GitHub

**Template Bug Report** :

```markdown
## Description
Description claire du bug

## Reproduction
1. Aller sur l'écran X
2. Cliquer sur Y
3. Observer Z

## Comportement attendu
Ce qui devrait se passer

## Comportement actuel
Ce qui se passe réellement

## Screenshots
Si applicable

## Environnement
- OS: [Android 13 / iOS 17]
- Version app: [1.0.1]
- Device: [Samsung Galaxy S23 / iPhone 14]

## Logs
```
Copier les logs pertinents
```
```

---

## ✨ Proposer une Feature

### Utiliser les Issues GitHub

**Template Feature Request** :

```markdown
## Problème
Quel problème cette feature résout-elle ?

## Solution proposée
Description de la solution

## Alternatives considérées
Autres solutions envisagées

## Informations additionnelles
Mockups, exemples, etc.
```

---

## 📚 Documentation

### Où documenter

- **README.md** : Vue d'ensemble, installation, quick start
- **CHANGELOG.md** : Historique des versions
- **docs/** : Documentation détaillée par feature
- **Code comments** : Pour logique complexe
- **JSDoc** : Pour fonctions publiques

### Exemple JSDoc

```javascript
/**
 * Génère un PDF de devis à partir de la base de données
 * @param {string} devisId - UUID du devis
 * @returns {Promise<{pdfUrl: string, number: string, localUri: string}>}
 * @throws {Error} Si le devis n'existe pas ou n'a pas de lignes
 */
export async function generateDevisPDFFromDB(devisId) {
  // ...
}
```

---

## 🔧 Outils Recommandés

### Éditeurs
- **VS Code** (recommandé)
- Extensions :
  - ESLint
  - Prettier
  - React Native Tools
  - GitLens

### Debugging
- **React Native Debugger**
- **Flipper**
- **Expo Dev Tools**

---

## 📞 Contact & Support

### Questions

- **Issues GitHub** : Pour bugs et features
- **Discussions GitHub** : Pour questions générales
- **Email** : contact@artisanflow.fr

### Mainteneurs

- **Chris** - Lead Developer
- Temps de réponse moyen : 24-48h

---

## 🎯 Priorités Actuelles

### High Priority 🔥
- Activer RLS (sécurité)
- Augmenter coverage tests (> 70%)
- Implémenter CI/CD

### Medium Priority ⚠️
- Optimisations performance
- Monitoring production
- Documentation API

### Low Priority 💡
- Nouvelles features
- UI polish
- Refactoring non critique

---

## 📜 Licence

Ce projet est privé. Toute contribution devient propriété d'ArtisanFlow.

---

## 🙏 Remerciements

Merci de contribuer à ArtisanFlow et d'aider à créer le meilleur outil pour les artisans ! 🛠️

---

**Dernière mise à jour** : 7 novembre 2025

