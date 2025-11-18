# Documentation – Système de partage de chantier

Ce document décrit le système complet de partage de chantier dans ArtisanFlow, de la génération de l'URL côté mobile jusqu'à l'affichage côté web.

---

## 📋 Vue d'ensemble

Le système permet aux artisans de partager un lien public avec leurs clients pour qu'ils puissent suivre l'avancement de leur chantier en lecture seule.

**Flux complet** :
1. L'artisan clique sur "Partager avec le client" dans l'app mobile
2. L'app génère ou récupère un `share_token` unique pour le chantier
3. L'app construit une URL : `{BASE_URL}/share/chantier/{token}`
4. L'artisan copie/partage cette URL avec le client
5. Le client ouvre l'URL dans son navigateur
6. Le front web affiche les informations du chantier (photos, devis, factures)

---

## 🔗 Format de l'URL

### Format standard

```
{BASE_URL}/share/chantier/{shareToken}
```

### Exemples

- **Test (Netlify)** : `https://artisanflow-share.netlify.app/share/chantier/abc123-def456-ghi789`
- **Production** : `https://artisanflow.app/share/chantier/abc123-def456-ghi789`

---

## 📱 Côté Mobile (React Native / Expo)

### Fichiers concernés

#### 1. Configuration centralisée

**Fichier** : `config/shareConfig.js`

```javascript
import { buildShareUrl } from '../config/shareConfig';

const url = buildShareUrl(shareToken);
// => 'https://artisanflow-share.netlify.app/share/chantier/abc123'
```

**Fonction** : `buildShareUrl(shareToken)`
- Construit l'URL complète de partage
- Utilise la config centralisée (env + app.config.js)
- Nettoie automatiquement les trailing slashes

#### 2. Service de partage

**Fichier** : `services/projectShareService.js`

**Fonctions principales** :
- `getOrCreateProjectShareLink(projectId)` : Génère ou récupère le lien de partage
- `revokeProjectShareLink(projectId)` : Révoque le lien (met `share_token` à NULL)
- `buildChantierShareUrl(shareToken)` : ⚠️ **DEPRECATED** - Utiliser `buildShareUrl()` de `config/shareConfig.js`

**Utilisation** :
```javascript
import { getOrCreateProjectShareLink } from '../services/projectShareService';

const url = await getOrCreateProjectShareLink(projectId);
// Copie dans le presse-papier et partage
```

#### 3. Écran de détail du projet

**Fichier** : `screens/ProjectDetailScreen.js`

**Bouton "Partager avec le client"** :
- Appelle `getOrCreateProjectShareLink(projectId)`
- Copie l'URL dans le presse-papier
- Propose de partager via SMS/Email/WhatsApp

---

## ⚙️ Configuration

### Variables d'environnement

**Fichier** : `.env` (ou `env.example`)

```env
# Base URL pour les liens de partage de chantier
# Cette URL pointe vers le front web/share/chantier déployé
EXPO_PUBLIC_SHARE_BASE_URL=https://artisanflow-share.netlify.app
```

**Priorité de configuration** :
1. `EXPO_PUBLIC_SHARE_BASE_URL` (variable d'environnement) - **Priorité la plus haute**
2. `extra.shareBaseUrl` (dans `app.config.js`)
3. Fallback par défaut : `https://artisanflow-share.netlify.app`

### Configuration Expo

**Fichier** : `app.config.js`

```javascript
extra: {
  // Base URL pour les liens de partage de chantier
  shareBaseUrl: process.env.EXPO_PUBLIC_SHARE_BASE_URL || 'https://artisanflow-share.netlify.app',
}
```

---

## 🌐 Côté Web (Front Vite/React)

### Fichiers concernés

#### 1. Page principale

**Fichier** : `web/share/chantier/src/ShareChantierPage.tsx`

**Fonctionnalités** :
- Extrait le `shareToken` de l'URL : `/share/chantier/{token}`
- Appelle la RPC function Supabase : `public_get_chantier_by_share_token`
- Affiche les informations du chantier (photos, devis, factures)

**Routing** :
- Pas de React Router
- Extraction directe du `pathname` : `window.location.pathname.split('/')`
- Format attendu : `/share/chantier/{shareToken}`

#### 2. Point d'entrée

**Fichier** : `web/share/chantier/src/main.tsx`

Rend simplement le composant `ShareChantierPage`.

#### 3. Configuration Vite

**Fichier** : `web/share/chantier/vite.config.ts`

- Port de dev : `5175`
- Output : `dist/`

### Variables d'environnement (Front Web)

**Fichier** : `web/share/chantier/.env`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Important** : Utiliser la clé **ANON** (publique), pas la service role. La sécurité est assurée par les RLS policies.

---

## 🗄️ Côté Supabase

### Base de données

#### Table `projects`

**Colonne** : `share_token` (UUID, nullable)

- **NULL** = partage désactivé
- **UUID** = token unique pour le partage
- Généré automatiquement lors de la première demande de partage

#### RPC Function

**Fonction** : `public_get_chantier_by_share_token(p_share_token UUID)`

**Fichier** : `supabase/migrations/create_public_chantier_rpc.sql`

**Fonctionnalités** :
- Vérifie que le `share_token` existe
- Récupère les données publiques du chantier (sans les notes)
- Retourne : chantier, photos, devis, factures
- Sécurisé par RLS (pas besoin d'authentification)

**Utilisation** :
```sql
SELECT * FROM public_get_chantier_by_share_token('abc123-def456-ghi789');
```

---

## 🔄 Flux complet

### 1. Génération du lien (Mobile)

```
Artisan clique "Partager"
  ↓
getOrCreateProjectShareLink(projectId)
  ↓
Vérifie si share_token existe
  ├─ OUI → buildShareUrl(share_token)
  └─ NON → Génère UUID → Met à jour DB → buildShareUrl(new_token)
  ↓
URL copiée dans presse-papier
  ↓
Artisan partage via SMS/Email/WhatsApp
```

### 2. Affichage du chantier (Web)

```
Client ouvre l'URL
  ↓
ShareChantierPage extrait le token de l'URL
  ↓
Appelle public_get_chantier_by_share_token(token)
  ↓
Supabase vérifie RLS + retourne données
  ↓
Page affiche : infos, photos, devis, factures
```

---

## 🔧 Changer la base URL

### Pour passer de Netlify à artisanflow.app

#### 1. Mettre à jour la variable d'environnement

**Fichier** : `.env`

```env
EXPO_PUBLIC_SHARE_BASE_URL=https://artisanflow.app
```

#### 2. Rebuild l'app mobile

```bash
# Pour EAS Build
eas build --profile production

# Pour développement local
npx expo start --clear
```

#### 3. Vérifier le déploiement du front web

Assurez-vous que le front `web/share/chantier` est bien déployé sur `https://artisanflow.app` et que la route `/share/chantier/:token` fonctionne.

#### 4. Tester

1. Générer un lien de partage dans l'app mobile
2. Vérifier que l'URL commence par `https://artisanflow.app/share/chantier/`
3. Ouvrir l'URL dans un navigateur
4. Vérifier que le chantier s'affiche correctement

---

## 🐛 Dépannage

### Problème : 404 sur mobile

**Symptôme** : Quand on ouvre le lien sur mobile, on obtient une 404 générique.

**Causes possibles** :
1. La base URL pointe vers un mauvais domaine
2. Le front web n'est pas déployé ou mal configuré
3. Le routing du front web ne matche pas le chemin

**Solutions** :
1. Vérifier `EXPO_PUBLIC_SHARE_BASE_URL` dans `.env`
2. Vérifier que le front est bien déployé
3. Vérifier les redirects/rewrites (Netlify `_redirects`, Vercel `vercel.json`)

### Problème : Token invalide

**Symptôme** : "Ce lien de chantier n'est plus valide"

**Causes possibles** :
1. Le `share_token` a été révoqué (mis à NULL)
2. Le token n'existe pas dans la base
3. Problème de RLS (rare, mais possible)

**Solutions** :
1. Vérifier dans Supabase que le `share_token` existe pour ce projet
2. Régénérer un nouveau lien de partage
3. Vérifier les policies RLS sur la table `projects`

### Problème : URL mal formée

**Symptôme** : L'URL générée a des doubles slashes ou un format incorrect

**Solution** : La fonction `buildShareUrl()` nettoie automatiquement les trailing slashes. Vérifier que la base URL dans `.env` n'a pas de slash final.

---

## 📝 Checklist de déploiement

### Avant de déployer en production

- [ ] Variable `EXPO_PUBLIC_SHARE_BASE_URL` configurée avec l'URL de production
- [ ] Front web `web/share/chantier` déployé et accessible
- [ ] Routing du front web configuré (`/share/chantier/:token`)
- [ ] Variables d'environnement Supabase configurées dans le front web
- [ ] RLS policies vérifiées sur la table `projects`
- [ ] RPC function `public_get_chantier_by_share_token` déployée
- [ ] Test de bout en bout : générer un lien → ouvrir dans navigateur → vérifier l'affichage

---

## 📚 Références

- **Config centralisée** : `config/shareConfig.js`
- **Service mobile** : `services/projectShareService.js`
- **Front web** : `web/share/chantier/`
- **RPC Supabase** : `supabase/migrations/create_public_chantier_rpc.sql`
- **README front web** : `web/share/chantier/README.md`

---

**Dernière mise à jour** : Novembre 2025

