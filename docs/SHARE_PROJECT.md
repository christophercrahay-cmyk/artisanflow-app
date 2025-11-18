# 📤 Partage de chantier avec le client

## Vue d'ensemble

Cette fonctionnalité permet à l'artisan de partager un lien public sécurisé avec son client pour qu'il puisse suivre l'avancement de son chantier en lecture seule, sans avoir besoin de créer un compte.

## Architecture

### 1. Table de données : `project_public_links`

**Fichier** : `supabase/migrations/create_project_public_links.sql`

Cette table stocke les liens publics générés pour chaque chantier :

- `id` : UUID unique
- `project_id` : Référence au chantier (FK vers `projects`)
- `token` : Token unique utilisé dans l'URL publique (32 caractères aléatoires)
- `created_at` : Date de création
- `expires_at` : Date d'expiration (NULL = pas d'expiration)
- `is_revoked` : Si true, le lien est révoqué et ne fonctionne plus

**Sécurité** :
- RLS (Row Level Security) activé
- Policy : Seul le propriétaire du projet peut gérer ses liens
- Token unique et non devinable

### 2. Edge Function : `public-project-view`

**Fichier** : `supabase/functions/public-project-view/index.ts`

**Endpoint** : `/functions/v1/public-project-view?token=...`

**Fonctionnalités** :
- Vérifie la validité du token (existe, non révoqué, non expiré)
- Charge les données du chantier (projet, client, photos, devis, factures)
- Génère une page HTML responsive avec :
  - Informations du chantier (nom, client, adresse)
  - Galerie de photos (miniatures cliquables)
  - Liens de téléchargement des devis PDF
  - Liens de téléchargement des factures PDF

**Sécurité** :
- Utilise `SUPABASE_SERVICE_ROLE_KEY` pour bypasser RLS côté serveur
- Vérifie la validité du lien avant d'afficher les données
- Aucune donnée sensible exposée (pas de notes privées, SIRET, etc.)

### 3. Service : `projectShareService.js`

**Fichier** : `services/projectShareService.js`

**Fonctions** :

#### `getOrCreateProjectShareLink(projectId)`
- Cherche un lien existant non révoqué pour le projet
- Si trouvé, réutilise le token existant
- Sinon, crée un nouveau lien avec un token unique
- Retourne l'URL publique complète

#### `revokeProjectShareLink(projectId)`
- Révoque tous les liens actifs pour un projet
- (Fonction prévue pour une future UI de révocation)

**Sécurité** :
- Vérifie que l'utilisateur est authentifié
- Vérifie que le projet appartient à l'utilisateur (isolation multi-tenant)

### 4. UI : Bouton "Partager avec le client"

**Fichier** : `screens/ProjectDetailScreen.js`

**Emplacement** : Menu "Actions du chantier" (bouton vert)

**Fonctionnement** :
1. L'artisan tape sur "Partager avec le client"
2. L'app génère/récupère le lien public
3. Ouvre le menu de partage natif (Share API) avec :
   - Message pré-rempli
   - URL du lien public
   - Titre du chantier

**Design** :
- Bouton vert (`#10B981`)
- Icône `share-2` de Feather
- Spinner pendant la génération du lien

## Flux utilisateur

### Artisan

1. Ouvrir la fiche d'un chantier
2. Taper sur le menu "..." (en haut à droite)
3. Sélectionner "Partager avec le client"
4. Le menu de partage natif s'ouvre avec le lien
5. Choisir le moyen de partage (SMS, Email, WhatsApp, etc.)

### Client

1. Reçoit le lien (SMS, Email, WhatsApp, etc.)
2. Ouvre le lien dans son navigateur
3. Voit la page publique avec :
   - Nom du chantier
   - Informations client
   - Adresse du chantier
   - Photos (miniatures cliquables)
   - Devis PDF téléchargeables
   - Factures PDF téléchargeables

## Sécurité

### ✅ Mesures implémentées

1. **Isolation multi-tenant** :
   - RLS activé sur `project_public_links`
   - Vérification `user_id` dans toutes les requêtes
   - Seul le propriétaire peut créer/gérer ses liens

2. **Token sécurisé** :
   - Token de 32 caractères aléatoires
   - Non devinable (généré avec crypto.randomUUID ou Math.random)
   - Unique dans la base de données

3. **Validation du lien** :
   - Vérifie que le token existe
   - Vérifie que le lien n'est pas révoqué
   - Vérifie que le lien n'est pas expiré (si `expires_at` est défini)

4. **Données limitées** :
   - Seules les données nécessaires sont affichées
   - Pas de notes privées
   - Pas d'informations sensibles (SIRET, etc.)

### 🔒 Limitations actuelles

- Pas d'expiration automatique par défaut (`expires_at = NULL`)
- Pas d'UI pour révoquer un lien (fonction prévue mais non exposée)
- Pas de limitation du nombre de vues

## Tests manuels

### Cas 1 : Création d'un nouveau lien

1. Créer un chantier de test avec :
   - Client
   - Photos (au moins 2-3)
   - Un devis PDF
   - Une facture PDF (optionnel)

2. Taper sur "Partager avec le client"
3. Vérifier :
   - ✅ Un lien est créé dans `project_public_links`
   - ✅ Le token est unique
   - ✅ L'URL s'ouvre dans le menu de partage

### Cas 2 : Réutilisation d'un lien existant

1. Appuyer une deuxième fois sur "Partager avec le client" pour le même chantier
2. Vérifier :
   - ✅ Aucun nouveau lien n'est créé
   - ✅ Le même token est réutilisé
   - ✅ L'URL est identique

### Cas 3 : Lien révoqué

1. Modifier manuellement `is_revoked = true` dans la DB pour un lien
2. Ouvrir le lien dans le navigateur
3. Vérifier :
   - ✅ La page affiche "Lien expiré ou invalide"

### Cas 4 : Lien expiré

1. Modifier manuellement `expires_at` à une date passée dans la DB
2. Ouvrir le lien dans le navigateur
3. Vérifier :
   - ✅ La page affiche "Lien expiré ou invalide"

### Cas 5 : Isolation utilisateurs

1. Créer 2 comptes test (artisan A et artisan B)
2. Créer un chantier pour artisan A
3. Essayer de créer un lien pour ce chantier depuis artisan B
4. Vérifier :
   - ✅ Erreur "Projet non trouvé ou accès non autorisé"

## Déploiement

### 1. Migration SQL

Exécuter la migration dans Supabase SQL Editor :

```sql
-- Fichier : supabase/migrations/create_project_public_links.sql
```

### 2. Edge Function

Déployer la Edge Function :

```bash
supabase functions deploy public-project-view
```

### 3. Variables d'environnement

Vérifier que les variables suivantes sont configurées dans Supabase :

- `SUPABASE_URL` (automatique)
- `SUPABASE_SERVICE_ROLE_KEY` (automatique)

## Améliorations futures

### Phase 2 (non implémentée)

1. **UI de révocation** :
   - Ajouter un bouton "Révoquer le lien" dans le menu
   - Afficher la liste des liens actifs pour un projet

2. **Expiration automatique** :
   - Option pour définir une durée d'expiration (ex: 90 jours)
   - Notification avant expiration

3. **Statistiques** :
   - Nombre de vues du lien
   - Date de dernière visite
   - IP de dernière visite (optionnel)

4. **Personnalisation** :
   - Message personnalisé sur la page publique
   - Logo de l'entreprise
   - Couleurs personnalisées

5. **Notifications** :
   - Email automatique au client lors de la création du lien
   - Notification quand le client ouvre le lien

## Fichiers modifiés/créés

### Nouveaux fichiers

- `supabase/migrations/create_project_public_links.sql`
- `supabase/functions/public-project-view/index.ts`
- `services/projectShareService.js`
- `docs/SHARE_PROJECT.md`

### Fichiers modifiés

- `screens/ProjectDetailScreen.js` (ajout du bouton de partage)

## Notes techniques

### Génération de token

Le token est généré avec :
- `crypto.randomUUID()` si disponible (React Native)
- Fallback sur `Math.random()` avec caractères alphanumériques

### URL publique

Format : `{SUPABASE_URL}/functions/v1/public-project-view?token={TOKEN}`

Exemple :
```
https://upihalivqstavxijlwaj.supabase.co/functions/v1/public-project-view?token=abc123...
```

### Structure des données affichées

La page publique affiche uniquement :
- ✅ Nom du chantier
- ✅ Client (nom, ville)
- ✅ Adresse du chantier
- ✅ Photos (URLs publiques)
- ✅ Devis PDF (URLs publiques)
- ✅ Factures PDF (URLs publiques)

**Ne pas afficher** :
- ❌ Notes privées
- ❌ SIRET / informations entreprise
- ❌ Données utilisateur (email, téléphone artisan)
- ❌ Autres projets

## Support

En cas de problème :

1. Vérifier les logs de la Edge Function dans Supabase Dashboard
2. Vérifier que la migration SQL a été exécutée
3. Vérifier que la Edge Function est déployée
4. Vérifier que RLS est activé sur `project_public_links`

---

**Version** : 1.0.0  
**Date** : 10 Novembre 2025

