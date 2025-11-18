# ArtisanFlow Website

Site web officiel d'ArtisanFlow - L'application mobile qui fait gagner 2h par jour aux artisans.

## Stack Technique

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Supabase**
- **Vercel** (hébergement)

## Démarrage

### Prérequis

- Node.js 18+ installé
- Compte Supabase (pour la page de suivi client)

### Installation

1. Clonez le repository

2. Installez les dépendances :

```bash
npm install
```

3. Créez le fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Lancez le serveur de développement :

```bash
npm run dev
```

5. Ouvrez [http://localhost:3000](http://localhost:3000)

## Structure du Projet

- `/app` - Pages Next.js 14 app router
- `/components` - Composants React
- `/lib` - Utilitaires, appels API, constantes
- `/types` - Définitions de types TypeScript
- `/public` - Assets statiques

## Déploiement sur Vercel

### Étape 1 : Push sur GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin VOTRE_REPO_GITHUB
git push -u origin main
```

### Étape 2 : Importer dans Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur "New Project"
3. Importez votre repository GitHub
4. Configurez :
   - Framework : Next.js (auto-détecté)
   - Root directory : ./
   - Build command : `npm run build`
   - Output directory : `.next`

### Étape 3 : Ajouter les Variables d'Environnement

Dans les paramètres du projet Vercel, ajoutez :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (votre URL de production)

### Étape 4 : Déployer

Cliquez sur "Deploy" - Vercel construira et déploiera automatiquement.

## Configuration du Domaine Personnalisé (artisanflow.app)

### Étape 1 : Dans Vercel Dashboard

1. Allez dans Project Settings → Domains
2. Cliquez sur "Add Domain"
3. Entrez : artisanflow.app
4. Vercel fournira les enregistrements DNS

### Étape 2 : Dans Votre Registrar (Namecheap, etc.)

Ajoutez les enregistrements DNS suivants :

**Enregistrement A :**
- Type : A
- Host : @
- Value : 76.76.21.21 (IP Vercel)
- TTL : Automatique

**Enregistrement CNAME (www) :**
- Type : CNAME
- Host : www
- Value : cname.vercel-dns.com
- TTL : Automatique

### Étape 3 : Attendre la Propagation

- Propagation DNS : 5 minutes à 48 heures (généralement 30 minutes)
- Certificat SSL : Automatique via Vercel (Let's Encrypt)
- Vérifiez le statut dans le dashboard Vercel

## Fonctionnalités

- ✅ Homepage avec copy optimisé pour la conversion
- ✅ Page fonctionnalités avec détail complet
- ✅ Page tarifs avec FAQ
- ✅ Page à propos avec histoire du fondateur
- ✅ Page contact avec formulaire
- ✅ Pages légales (mentions légales, confidentialité)
- ✅ Page de suivi client publique (`/share/chantier/[token]`)
- ✅ Entièrement responsive (mobile-first)
- ✅ Optimisé SEO
- ✅ Animations fluides (Framer Motion)
- ✅ Mode sombre pour la page de suivi client

## Page de Suivi Client

URL format : `/share/chantier/[token]`

### Comment ça fonctionne :

1. L'utilisateur génère un lien de partage dans l'app mobile
2. Le lien contient un token unique sécurisé
3. Le client ouvre le lien dans le navigateur (pas besoin d'app)
4. Le serveur valide le token et récupère les données du projet
5. Le client voit : infos projet, photos, devis, factures

### Sécurité :

- Token validé côté serveur via Supabase RPC
- Aucune donnée sensible dans l'URL sauf le token
- Token peut être révoqué à tout moment
- Les politiques RLS protègent l'accès aux données

## Contact

Pour le support : contact@artisanflow.app

## Licence

Copyright © 2025 ArtisanFlow. Tous droits réservés.
