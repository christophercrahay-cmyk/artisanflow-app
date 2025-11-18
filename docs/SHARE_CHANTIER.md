# 📤 Partage de chantier avec le client (Refonte)

## Vue d'ensemble

Cette fonctionnalité permet à l'artisan de partager un lien public sécurisé avec son client pour qu'il puisse suivre l'avancement de son chantier en lecture seule, **sans exposer les notes internes (texte ou vocales)**.

## Architecture

### 1. Table `projects` : Colonne `share_token`

**Fichier** : `supabase/migrations/add_share_token_to_projects.sql`

- `share_token` : UUID unique généré automatiquement pour chaque projet
- Permet l'accès public en lecture seule via ce token
- Si `share_token = NULL`, le partage est désactivé

### 2. RPC Function : `public_get_chantier_by_share_token`

**Fichier** : `supabase/migrations/create_public_chantier_rpc.sql`

**Fonction** : Récupère UNIQUEMENT les données publiques :
- ✅ Informations du chantier (nom, statut, adresse, dates)
- ✅ Informations client (nom, ville)
- ✅ Photos du chantier
- ✅ Devis avec PDF
- ✅ Factures avec PDF

**N'expose PAS** :
- ❌ Notes texte (table `notes`)
- ❌ Notes vocales (table `notes` avec `type = 'voice'`)
- ❌ Données sensibles (SIRET, emails internes, etc.)

### 3. RLS Policies : Accès public anonyme

Les policies permettent à `anon` (utilisateur non authentifié) de lire :
- Les projets avec `share_token IS NOT NULL`
- Les photos liées à ces projets
- Les devis/factures avec PDF liés à ces projets
- Les clients liés à ces projets

**Important** : Aucune policy pour `anon` sur la table `notes` = accès refusé par défaut.

### 4. Page web publique

**Dossier** : `web/share/chantier/`

**Route** : `/share/chantier/[shareToken]`

**Stack** : Vite + React + TypeScript

**Fonctionnalités** :
- Affiche les informations du chantier
- Galerie de photos (miniatures cliquables)
- Liste des devis avec liens PDF
- Liste des factures avec liens PDF
- **Design system ArtisanFlow** : utilise les mêmes couleurs, typographie et composants que l'app mobile
- Design responsive et moderne (mobile-first)

## Flux utilisateur

### Artisan

1. Ouvrir la fiche d'un chantier
2. Taper sur "Partager avec le client"
3. L'URL est copiée dans le presse-papier
4. Partager via SMS, Email, WhatsApp, etc.

### Client

1. Reçoit le lien (ex: `https://artisanflow.app/share/chantier/a1b2c3d4-...`)
2. Ouvre le lien dans son navigateur
3. Voit la page publique avec :
   - Informations du chantier
   - Photos
   - Devis PDF téléchargeables
   - Factures PDF téléchargeables
4. **Ne voit PAS** les notes internes

## Sécurité

### ✅ Mesures implémentées

1. **Isolation par token** :
   - Chaque chantier a un `share_token` unique
   - Impossible de deviner un autre token
   - Token UUID = 128 bits d'entropie

2. **RLS activé** :
   - Seuls les projets avec `share_token IS NOT NULL` sont accessibles publiquement
   - Les notes ne sont JAMAIS accessibles (pas de policy pour `anon`)

3. **RPC function sécurisée** :
   - Utilise `SECURITY INVOKER` pour respecter les RLS
   - Filtre explicitement les données sensibles
   - Ne retourne que les colonnes autorisées

4. **Données limitées** :
   - Seules les données nécessaires sont exposées
   - Pas de notes (texte ou vocales)
   - Pas d'informations sensibles

### 🔒 Révocation

Pour révoquer un lien :
```sql
UPDATE projects SET share_token = NULL WHERE id = '...';
```

Ou via l'app (fonction `revokeProjectShareLink` dans le service).

## Configuration

### Variables d'environnement

**Mobile app** :
```env
EXPO_PUBLIC_WEB_URL=https://artisanflow.app
```

**Page web** :
```env
VITE_SUPABASE_URL=https://upihalivqstavxijlwaj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Déploiement

### 1. Migrations SQL

Exécuter dans Supabase SQL Editor (dans l'ordre) :

1. `supabase/migrations/add_share_token_to_projects.sql`
2. `supabase/migrations/create_public_chantier_rpc.sql`

### 2. Page web

Build et déployer la page web :

```bash
cd web/share/chantier
npm install
npm run build
# Déployer le dossier dist/ sur votre hébergeur (Netlify, Vercel, etc.)
```

**Configuration du routing** :
- Netlify : Créer `public/_redirects` avec `/* /index.html 200`
- Vercel : Créer `vercel.json` avec les rewrites

### 3. Variables d'environnement

Configurer `EXPO_PUBLIC_WEB_URL` dans l'app mobile (EAS secrets ou .env).

## Tests

### Cas 1 : Partage d'un chantier

1. Créer un chantier avec :
   - Client
   - Photos
   - Devis avec PDF
   - Facture avec PDF
   - Notes texte
   - Notes vocales

2. Taper sur "Partager avec le client"
3. Ouvrir le lien dans le navigateur
4. Vérifier :
   - ✅ Photos visibles
   - ✅ Devis/factures visibles
   - ❌ Notes NON visibles

### Cas 2 : Révocation

1. Révoquer le lien (mettre `share_token = NULL`)
2. Ouvrir le lien dans le navigateur
3. Vérifier :
   - ✅ Message "Ce lien de chantier n'est plus valide"

### Cas 3 : Isolation

1. Créer 2 chantiers (artisan A et artisan B)
2. Partager le chantier A
3. Essayer d'accéder au chantier B avec le token de A
4. Vérifier :
   - ✅ Erreur "Chantier non trouvé"

## Fichiers modifiés/créés

### Migrations SQL

- `supabase/migrations/add_share_token_to_projects.sql`
- `supabase/migrations/create_public_chantier_rpc.sql`

### Services

- `services/projectShareService.js` (refactorisé pour utiliser `share_token`)

### Page web

- `web/share/chantier/package.json`
- `web/share/chantier/vite.config.ts`
- `web/share/chantier/index.html`
- `web/share/chantier/src/main.tsx`
- `web/share/chantier/src/ShareChantierPage.tsx`
- `web/share/chantier/src/styles.css`
- `web/share/chantier/tsconfig.json`

### Documentation

- `docs/SHARE_CHANTIER.md`

## Notes techniques

### Génération de share_token

Le `share_token` est généré automatiquement par la base de données :
- `DEFAULT gen_random_uuid()` pour les nouveaux projets
- Généré côté client si nécessaire (fallback)

### URL publique

Format : `{APP_PUBLIC_URL}/share/chantier/{shareToken}`

Exemple :
```
https://artisanflow.app/share/chantier/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Structure des données retournées

La RPC function retourne :
```json
{
  "chantier": {
    "id": "...",
    "name": "...",
    "status": "...",
    "address": "...",
    "created_at": "...",
    "client": { "name": "...", "city": "..." }
  },
  "photos": [...],
  "devis": [...],
  "factures": [...]
}
```

**Ne retourne JAMAIS** :
- `notes` (table notes)
- `transcription` (dans notes)
- `analysis_data` (dans notes)
- `storage_path` (dans notes)

## Support

En cas de problème :

1. Vérifier que les migrations SQL ont été exécutées
2. Vérifier que RLS est activé sur toutes les tables
3. Vérifier que la RPC function est accessible par `anon`
4. Vérifier les logs de la page web (console navigateur)
5. Vérifier que `EXPO_PUBLIC_WEB_URL` est configuré

---

**Version** : 2.1.0  
**Date** : 17 Novembre 2025  
**Refonte** : Migration de `project_public_links` vers `share_token` sur `projects`  
**Design** : Intégration du design system ArtisanFlow (couleurs #0F1115, #1A1D22, #1D4ED8, etc.)

