# ✅ Implémentation : Partage public de chantier (Page web)

## Résumé

La fonctionnalité de partage public de chantier a été implémentée avec le design system ArtisanFlow. Les clients peuvent maintenant accéder à une page web publique pour suivre leur chantier en lecture seule.

## Fichiers modifiés/créés

### 📁 Page web (`web/share/chantier/`)

#### Fichiers modifiés :
- ✅ `src/ShareChantierPage.tsx` - Amélioration du routing et du design
- ✅ `src/styles.css` - Application du design system ArtisanFlow
- ✅ `README.md` - Documentation mise à jour

#### Design system appliqué :
- **Couleurs** :
  - Fond : `#0F1115` (background)
  - Surfaces : `#1A1D22` (cards)
  - Surfaces élevées : `#252A32` (document items)
  - Primary : `#1D4ED8` (boutons, accents)
  - Bordures : `#2A2E35`
  - Textes : `#F9FAFB` (principal), `#D1D5DB` (secondaire), `#9CA3AF` (muted)

- **Composants** :
  - Header avec logo ArtisanFlow
  - Cards avec bordures arrondies (12px)
  - Boutons primary avec hover effects
  - Badges de statut (active, planned, done)
  - Footer avec mention ArtisanFlow

### 📁 Migrations SQL (déjà existantes, vérifiées)

- ✅ `supabase/migrations/add_share_token_to_projects.sql`
  - Ajoute la colonne `share_token` à la table `projects`
  - Génère des tokens pour les projets existants
  - Crée un index pour les recherches rapides

- ✅ `supabase/migrations/create_public_chantier_rpc.sql`
  - Crée la RPC function `public_get_chantier_by_share_token`
  - Crée les RLS policies pour l'accès public anonyme
  - **Sécurité** : N'expose JAMAIS les notes (texte ou vocales)

### 📁 Services mobile (déjà existants, vérifiés)

- ✅ `services/projectShareService.js`
  - `buildChantierShareUrl(shareToken)` - Construit l'URL publique
  - `getOrCreateProjectShareLink(projectId)` - Génère/récupère le lien
  - `revokeProjectShareLink(projectId)` - Révoque le partage

### 📁 Documentation

- ✅ `docs/SHARE_CHANTIER.md` - Documentation complète mise à jour
- ✅ `docs/IMPLEMENTATION_SHARE_CHANTIER_WEB.md` - Ce fichier

## Améliorations apportées

### 1. Design system ArtisanFlow
- ✅ Couleurs alignées avec le thème mobile (`theme/Theme.js`)
- ✅ Typographie cohérente (system fonts, poids 400-700)
- ✅ Espacements et bordures uniformisés
- ✅ Header avec logo ArtisanFlow
- ✅ Footer avec mention "Page générée avec ArtisanFlow"

### 2. Routing amélioré
- ✅ Extraction correcte du `shareToken` depuis l'URL
- ✅ Gestion des erreurs (token manquant, chantier introuvable)
- ✅ Support des routes SPA (via `_redirects` pour Netlify)

### 3. UX améliorée
- ✅ Photos cliquables avec hover effects
- ✅ Boutons avec transitions et shadows
- ✅ Responsive design (mobile-first)
- ✅ Accessibilité (keyboard navigation pour les photos)

## Déploiement

### 1. Migrations SQL

Les migrations sont déjà créées. Si elles n'ont pas été exécutées :

```sql
-- Exécuter dans Supabase SQL Editor (dans l'ordre)
-- 1. add_share_token_to_projects.sql
-- 2. create_public_chantier_rpc.sql
```

### 2. Build et déploiement de la page web

```bash
cd web/share/chantier
npm install
npm run build
```

Le dossier `dist/` contient les fichiers à déployer.

#### Netlify
- Build command : `npm run build`
- Publish directory : `dist`
- Le fichier `public/_redirects` est déjà présent avec `/* /index.html 200`

#### Vercel
- Build command : `npm run build`
- Output directory : `dist`
- Créer `vercel.json` :
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 3. Variables d'environnement

**Page web** (`.env` ou variables d'environnement du déploiement) :
```env
VITE_SUPABASE_URL=https://upihalivqstavxijlwaj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**App mobile** (EAS secrets ou `.env`) :
```env
EXPO_PUBLIC_WEB_URL=https://artisanflow.app
```

## Tests

### Test manuel

1. **Créer un chantier avec données** :
   - Client
   - Photos
   - Devis avec PDF
   - Facture avec PDF
   - Notes texte (ne doivent PAS apparaître)
   - Notes vocales (ne doivent PAS apparaître)

2. **Partager le chantier** :
   - Dans l'app mobile, utiliser le bouton "Partager avec le client"
   - Copier le lien généré

3. **Ouvrir le lien dans un navigateur non connecté** :
   - Vérifier que la page s'affiche avec le design ArtisanFlow
   - Vérifier que les photos sont visibles
   - Vérifier que les devis/factures sont accessibles
   - **Vérifier que les notes ne sont PAS visibles**

4. **Tester la révocation** :
   - Révoquer le lien (mettre `share_token = NULL`)
   - Ouvrir le lien → doit afficher "Ce lien de chantier n'est plus valide"

### Test de développement local

```bash
cd web/share/chantier
npm install
npm run dev
```

Ouvre sur `http://localhost:5175`

Pour tester avec un vrai token :
- Aller sur `http://localhost:5175/share/chantier/{shareToken}`
- Remplacer `{shareToken}` par un token réel d'un chantier

## Sécurité

### ✅ Mesures implémentées

1. **Isolation par token** : UUID unique par chantier (128 bits d'entropie)
2. **RLS activé** : Seuls les projets avec `share_token IS NOT NULL` sont accessibles
3. **RPC function sécurisée** : Filtre explicitement les données sensibles
4. **Pas de notes** : Aucune policy pour `anon` sur la table `notes`

### 🔒 Révocation

Pour révoquer un partage :
- Via l'app : Utiliser `revokeProjectShareLink(projectId)`
- Via SQL : `UPDATE projects SET share_token = NULL WHERE id = '...'`

## Structure de la page

```
/share/chantier/{shareToken}
├── Header (logo ArtisanFlow)
├── Header chantier
│   ├── Nom du chantier
│   ├── Sous-titre
│   └── Badge de statut
├── Section Informations
│   ├── Client
│   ├── Adresse
│   └── Date de création
├── Section Photos
│   └── Grille responsive (cliquable)
├── Section Devis
│   └── Liste avec liens PDF
├── Section Factures
│   └── Liste avec liens PDF
└── Footer
    └── "Page générée avec ArtisanFlow"
```

## Prochaines étapes (optionnel)

- [ ] Ajouter un modal pour afficher les photos en plein écran
- [ ] Ajouter un loader skeleton pendant le chargement
- [ ] Ajouter des métadonnées SEO (Open Graph, Twitter Cards)
- [ ] Ajouter un bouton "Télécharger toutes les photos" (ZIP)
- [ ] Ajouter un filtre par date pour les photos

---

**Version** : 2.1.0  
**Date** : 17 Novembre 2025  
**Statut** : ✅ Implémentation complète avec design system ArtisanFlow

