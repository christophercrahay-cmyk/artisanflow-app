# Documentation Complète du Site ArtisanFlow.fr

**Dernière mise à jour :** 13 novembre 2025  
**Version :** 1.0.0

---

## Table des matières

1. [Structure et Contenu](#structure-et-contenu)
2. [Fonctionnalités du Site](#fonctionnalités-du-site)
3. [Aspects Techniques](#aspects-techniques)
4. [Branding et Design](#branding-et-design)
5. [Stratégie Marketing](#stratégie-marketing)
6. [Administratif et Légal](#administratif-et-légal)

---

## 1. Structure et Contenu

### 1.1 Architecture des Pages

Le site ArtisanFlow.fr est construit avec **Next.js 14** (App Router) et comprend les pages suivantes :

#### Pages principales

| Page | Route | Description | Priorité SEO |
|------|-------|-------------|--------------|
| **Accueil** | `/` | Page principale avec hero, fonctionnalités, témoignages, FAQ | 1.0 |
| **Fonctionnalités** | `/fonctionnalites` | Détail complet des 6 fonctionnalités principales | 0.8 |
| **Tarifs** | `/tarifs` | Plan unique "Artisan", comparaison avec concurrents, FAQ | 0.9 |
| **À propos** | `/a-propos` | Histoire du fondateur, mission, valeurs | 0.7 |
| **Contact** | `/contact` | Formulaire de contact avec sélection de métier | 0.7 |
| **Essai gratuit** | `/essai-gratuit` | Page d'inscription (bientôt disponible) | 0.6 |

#### Pages légales

| Page | Route | Description | Priorité SEO |
|------|-------|-------------|--------------|
| **CGU** | `/cgu` | Conditions Générales d'Utilisation complètes | 0.3 |
| **Mentions légales** | `/mentions-legales` | Informations légales, copyright, marque déposée | 0.3 |
| **Confidentialité** | `/confidentialite` | Politique de confidentialité RGPD | 0.3 |
| **Suppression compte** | `/suppression-compte` | Procédure de suppression de compte | 0.2 |

#### Pages dynamiques

| Page | Route | Description |
|------|-------|-------------|
| **Partage chantier** | `/share/chantier/[token]` | Vue client pour suivre un chantier (lien sécurisé) |

### 1.2 Navigation et Parcours Utilisateur

#### Navigation principale (Header)

- **Logo** : ArtisanFlow (cliquable vers `/`)
- **Menu desktop** : Fonctionnalités | Tarifs | À propos | Contact
- **CTA principal** : "Essai gratuit" (lien vers `/tarifs`)
- **Menu mobile** : Hamburger avec navigation complète

#### Footer

Organisé en 4 colonnes :
1. **Logo + Tagline** : "L'app qui fait gagner 2h/jour aux artisans"
2. **Navigation** : Liens vers toutes les pages principales
3. **Légal** : CGU, Mentions légales, Confidentialité, Suppression compte
4. **Contact** : Email (acontrecourant25@gmail.com)

#### Parcours utilisateur typique

1. **Arrivée** → Page d'accueil (`/`)
2. **Découverte** → Scroll pour voir fonctionnalités, témoignages, FAQ
3. **Intérêt** → Clic sur "Fonctionnalités" ou "Tarifs"
4. **Décision** → Consultation de la page tarifs
5. **Action** → Clic sur "Essai gratuit 14 jours" → `/essai-gratuit`
6. **Alternative** → Formulaire de contact si questions

### 1.3 Contenu de Chaque Section

#### Page d'accueil (`/`)

**Sections dans l'ordre :**

1. **Hero** (`Hero.tsx`)
   - Titre : "Générez vos devis en **20 secondes** avec l'IA"
   - Sous-titre : "L'application mobile qui fait gagner 2h par jour aux artisans du bâtiment"
   - Badges : 🇫🇷 Fabriqué en France | ✅ Sans engagement | 📱 iOS & Android
   - CTA principal : "Essai gratuit 14 jours"
   - Trust elements : Données hébergées en France | Conforme RGPD
   - Image : Aperçu de l'application mobile

2. **Problème** (`ProblemSection.tsx`)
   - Met en avant les frustrations des artisans
   - Temps perdu sur la paperasse

3. **Solution** (`SolutionFeatures.tsx`)
   - Présentation des fonctionnalités clés
   - 6 fonctionnalités principales

4. **Comment ça marche** (`HowItWorks.tsx`)
   - Processus simplifié en étapes

5. **Bénéfices** (`Benefits.tsx`)
   - Avantages concrets pour l'artisan

6. **Statistiques** (`Stats.tsx`)
   - Chiffres clés et preuve sociale

7. **Témoignages** (`Testimonials.tsx`)
   - Avis clients (à compléter)

8. **FAQ** (`FAQ.tsx`)
   - 5 questions fréquentes avec réponses

9. **CTA Final** (`FinalCTA.tsx`)
   - Dernier appel à l'action

#### Page Fonctionnalités (`/fonctionnalites`)

**6 fonctionnalités détaillées :**

1. **Génération Devis IA**
   - Transcription vocale en temps réel
   - Reconnaissance automatique des prestations
   - Calcul automatique des montants
   - Génération PDF professionnelle
   - Mentions légales conformes
   - Signature électronique
   - Envoi automatique
   - Templates personnalisables

2. **Gestion Chantiers**
   - Création rapide (1 minute)
   - Liaison automatique client ↔ chantier
   - Photos horodatées géolocalisées
   - Notes vocales converties en texte
   - Journal de bord automatique
   - Suivi progression
   - Historique complet

3. **Partage Client**
   - Lien unique sécurisé
   - Vue client (nom, adresse, photos, devis, factures)
   - Pas d'app à installer
   - Temps réel
   - Révocable
   - Statistiques de consultation

4. **Mode Hors Ligne**
   - Consultation en cache
   - Prise de photos offline
   - Création notes offline
   - Indicateurs visuels
   - Synchronisation automatique
   - Zéro perte de données

5. **Gestion Clients**
   - Import multi-format (CSV, Excel, contacts, scan)
   - Fiche client complète
   - Recherche rapide
   - Tri par critères
   - Historique interactions

6. **Facturation**
   - Génération factures conformes
   - Numérotation automatique
   - Mentions légales incluses
   - Export comptable
   - Suivi paiements

#### Page Tarifs (`/tarifs`)

**Contenu :**

- **Hero** : "Un tarif simple, tout inclus"
- **Plan unique** : "Plan Artisan"
  - Badge : "Le plus populaire"
  - Note : Modalités d'abonnement à préciser lors de la mise en service
  - 14 fonctionnalités incluses listées
  - CTA : "Essayer 14 jours gratuits"
- **Tableau comparatif** : ArtisanFlow vs Autres apps
  - Devis IA : ✅ vs ❌
  - Mode offline : ✅ vs ❌
  - Partage client : ✅ vs ❌
- **FAQ** : 6 questions sur les tarifs
- **Garantie** : Section finale avec CTA

#### Page À propos (`/a-propos`)

**Contenu :**

- **Hero** : "Créé par un artisan. Pour les artisans."
- **Histoire du fondateur** :
  - Chris, électricien depuis 2013 (Pontarlier)
  - Frustration quotidienne avec la paperasse
  - Décision de créer l'outil idéal
  - Photo du fondateur
- **Mission** : "Redonner aux artisans du temps pour ce qui compte vraiment"
- **Valeurs** : 3 valeurs (Simplicité, Fiabilité, Honnêteté)
- **CTA** : "Envie de rejoindre l'aventure ?"

#### Page Contact (`/contact`)

**Formulaire avec champs :**

- Prénom et nom (obligatoire)
- Email (obligatoire)
- Téléphone (optionnel)
- Métier (obligatoire, sélection) :
  - Électricien
  - Plombier
  - Maçon
  - Peintre
  - Menuisier
  - Carreleur
  - Couvreur
  - Autre
- Message (obligatoire, min 10 caractères)

**Validation :**
- Zod schema avec messages d'erreur en français
- Affichage des erreurs en temps réel
- Messages de succès/erreur après soumission

**Alternative :**
- Email direct : acontrecourant25@gmail.com

### 1.4 Messages Clés et Storytelling

#### Messages clés

1. **Vitesse** : "Devis en 20 secondes"
2. **Gain de temps** : "Fait gagner 2h par jour"
3. **Simplicité** : "Simple, rapide, puissant"
4. **IA** : "Génération automatique avec l'IA"
5. **Offline** : "Fonctionne même sans internet"
6. **Transparence** : "Sans engagement, sans frais cachés"
7. **Sécurité** : "Données hébergées en France, conforme RGPD"
8. **Authenticité** : "Créé par un artisan, pour les artisans"

#### Storytelling

**Narratif principal :**
- **Problème** : Artisans perdent 2h/jour sur la paperasse
- **Solution** : ArtisanFlow automatise tout avec l'IA
- **Preuve** : Créé par un artisan qui a vécu le problème
- **Bénéfice** : Plus de temps pour le métier, les clients, la famille

**Ton de communication :**
- Direct, sans bullshit marketing
- Authentique, proche du terrain
- Technique mais accessible
- Empathique (comprend les frustrations)

---

## 2. Fonctionnalités du Site

### 2.1 Formulaires

#### Formulaire de Contact (`/contact`)

**Technologie :**
- React Hook Form
- Zod (validation)
- Client-side validation

**Champs :**
- Prénom et nom (min 2 caractères)
- Email (format valide)
- Téléphone (optionnel)
- Métier (sélection obligatoire)
- Message (min 10 caractères)

**Traitement :**
- Route API : `/api/contact` (POST)
- **État actuel** : Log console uniquement (TODO: intégrer service email)
- Réponse JSON : `{ success: true/false, message: string }`

**À implémenter :**
- Service email (Resend, SendGrid, etc.)
- Notification au propriétaire
- Confirmation à l'utilisateur

#### Formulaire Essai Gratuit (`/essai-gratuit`)

**État actuel :**
- Page d'information uniquement
- Message : "Essai gratuit bientôt disponible"
- Pas de formulaire actif
- Contact email pour questions

**À implémenter :**
- Formulaire d'inscription
- Intégration avec système d'abonnement
- Redirection vers app stores

### 2.2 Call-to-Action et Conversions

#### CTAs Principaux

1. **Hero** : "Essai gratuit 14 jours" → `/essai-gratuit`
2. **Header** : "Essai gratuit" → `/tarifs`
3. **Fonctionnalités** : "Commencer l'essai" → `/tarifs`
4. **Tarifs** : "Essayer 14 jours gratuits" → `/essai-gratuit`
5. **À propos** : "Me prévenir dès l'ouverture" → `/essai-gratuit`
6. **FAQ** : Liens vers `/tarifs`

#### Stratégie de Conversion

- **Multiples points d'entrée** : CTAs sur toutes les pages
- **Urgence** : "14 jours gratuits" (limité)
- **Sans risque** : "Sans engagement", "Sans carte bancaire"
- **Preuve sociale** : Témoignages, statistiques
- **Transparence** : Tarif unique, pas de frais cachés

### 2.3 Démonstrations ou Vidéos

**État actuel :**
- Image statique dans le Hero : `/aperçu devis généré.jpg`
- Pas de vidéo de démonstration
- Pas de GIF animé

**Recommandations :**
- Ajouter une vidéo de démonstration (2-3 min)
- GIF animé montrant le processus de création de devis
- Screenshots de l'app dans différentes sections

### 2.4 Témoignages et Preuve Sociale

**Composant `Testimonials.tsx` :**
- Section présente sur la page d'accueil
- **État actuel** : À compléter avec de vrais témoignages

**Éléments de preuve sociale :**
- Badges : "Fabriqué en France", "Sans engagement", "iOS & Android"
- Statistiques (composant `Stats.tsx`)
- Tableau comparatif avec concurrents
- Mentions légales et conformité RGPD

### 2.5 FAQ et Support

#### FAQ Page d'Accueil

**5 questions :**
1. "Combien ça coûte ?" → 29,90€/mois, 14 jours gratuits
2. "Ça marche sur Android et iOS ?" → Oui, les deux
3. "Mes données sont-elles sécurisées ?" → Oui, hébergées en France
4. "Je peux annuler quand je veux ?" → Oui, 1 clic
5. "Y a-t-il une limite au nombre de devis ?" → Non, tout illimité

**Comportement :**
- Accordéon interactif
- Première question ouverte par défaut
- Animation smooth

#### FAQ Page Tarifs

**6 questions supplémentaires :**
1. Annulation à tout moment
2. Frais cachés
3. Fonctionnement de l'essai
4. Facture
5. Réduction engagement annuel
6. Limites

#### Support

**Contact :**
- Email : acontrecourant25@gmail.com
- Mentionné sur : Contact, Footer, Pages légales
- Délai de réponse : "Moins de 24h, souvent en quelques heures"

---

## 3. Aspects Techniques

### 3.1 Hébergement et Plateforme

#### Hébergement

- **Plateforme** : Vercel (Next.js)
- **Hébergeur** : Vercel Inc.
- **Adresse** : 340 S Lemon Ave #4133, Walnut, CA 91789, USA
- **Site** : vercel.com

#### Configuration Vercel

**Fichier `vercel.json` :**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

#### Stack Technique

- **Framework** : Next.js 14.2.4 (App Router)
- **React** : 19.1.0
- **TypeScript** : 5.9.2
- **Styling** : Tailwind CSS 3.4.0
- **Fonts** : Inter (Google Fonts)
- **Icons** : Lucide React
- **Animations** : Framer Motion 11.5.0
- **Formulaires** : React Hook Form + Zod

### 3.2 Performance et Optimisation

#### Optimisations Implémentées

1. **Next.js Image Optimization**
   - Composant `Image` de Next.js
   - Lazy loading automatique
   - Formats modernes (WebP)

2. **Code Splitting**
   - App Router avec lazy loading des routes
   - Composants client-side marqués `'use client'`

3. **SEO Assets**
   - Script de génération : `scripts/generate-seo-assets.js`
   - Open Graph images
   - Manifest.json pour PWA

4. **Animations Optimisées**
   - Framer Motion pour animations performantes
   - Composant `AnimatedSection` pour animations au scroll

#### Métriques à Surveiller

- **Lighthouse Score** : Objectif 90+ sur tous les critères
- **First Contentful Paint (FCP)** : < 1.8s
- **Largest Contentful Paint (LCP)** : < 2.5s
- **Time to Interactive (TTI)** : < 3.8s

#### Documentation Performance

- Fichier : `docs/PERFORMANCE.md`
- Fichier : `docs/SEO_OPTIMIZATION_COMPLETE.md`

### 3.3 SEO : Mots-clés, Meta Descriptions, Structure

#### Meta Tags Globaux (`app/layout.tsx`)

**Title :**
- Default : "ArtisanFlow – Devis en 20 secondes avec l'IA"
- Template : "%s | ArtisanFlow"

**Description :**
- "Application pour artisans : créez devis et factures en 20 secondes, gérez vos chantiers, vos photos, vos clients et vos signatures électroniques. Simple, rapide, puissant."

**Keywords :**
- artisan, devis, électricien, plombier, application mobile, IA, facturation, chantier, signature électronique, gestion chantier

**Open Graph :**
- Type : website
- Locale : fr_FR
- URL : https://artisanflow.fr/
- Image : https://artisanflow.fr/og-image.jpg (1200x630)
- Site Name : ArtisanFlow

**Twitter Card :**
- Type : summary_large_image
- Image : https://artisanflow.fr/og-image.jpg

#### Sitemap (`app/sitemap.ts`)

**URLs indexées :**
- `/` (priority: 1.0, monthly)
- `/fonctionnalites` (priority: 0.8, monthly)
- `/tarifs` (priority: 0.9, monthly)
- `/a-propos` (priority: 0.7, monthly)
- `/contact` (priority: 0.7, monthly)
- `/mentions-legales` (priority: 0.3, yearly)
- `/confidentialite` (priority: 0.3, yearly)
- `/cgu` (priority: 0.3, yearly)
- `/suppression-compte` (priority: 0.2, yearly)

**URL :** https://artisanflow.fr/sitemap.xml

#### Robots.txt (`app/robots.ts`)

**Règles :**
- User-agent : *
- Allow : `/`
- Disallow : `/api/`, `/share/`
- Sitemap : https://artisanflow.fr/sitemap.xml

#### Meta Descriptions par Page

| Page | Meta Description |
|------|-----------------|
| Accueil | "Application pour artisans : créez devis et factures en 20 secondes, gérez vos chantiers, vos photos, vos clients et vos signatures électroniques. Simple, rapide, puissant." |
| Fonctionnalités | "Découvrez toutes les fonctionnalités d'ArtisanFlow : devis IA, gestion chantiers, partage client, mode offline, et bien plus." |
| Tarifs | "Tarifs ArtisanFlow. Les modalités d'abonnement seront précisées lors de la mise en service du système d'abonnement." |
| À propos | "Découvrez l'histoire d'ArtisanFlow, créé par un artisan pour les artisans." |
| Contact | (Pas de meta spécifique, utilise le default) |
| CGU | "Conditions Générales d'Utilisation de l'application ArtisanFlow." |
| Mentions légales | "Mentions légales du site ArtisanFlow." |
| Confidentialité | "Politique de confidentialité et protection des données personnelles ArtisanFlow." |

#### Mots-clés Principaux

**Primaires :**
- devis artisan
- application artisan
- devis IA
- gestion chantier
- facturation artisan

**Secondaires :**
- électricien devis
- plombier devis
- signature électronique
- mode offline
- partage client chantier

**Longue traîne :**
- créer devis rapidement artisan
- application gestion chantier bâtiment
- devis automatique IA
- facture artisan mobile

### 3.4 Responsive Design et Compatibilité Mobile

#### Breakpoints Tailwind

- **sm** : 640px
- **md** : 768px
- **lg** : 1024px
- **xl** : 1280px
- **2xl** : 1536px

#### Adaptations Mobile

**Header :**
- Menu hamburger sur mobile
- Logo + texte réduit
- CTA masqué sur très petit écran

**Hero :**
- Titre : text-5xl → text-4xl sur mobile
- Layout : grid 1 colonne sur mobile
- Image : pleine largeur sur mobile

**Sections :**
- Padding réduit : py-16 md:py-24 lg:py-32
- Texte : text-xl md:text-2xl
- Grilles : 1 colonne → 2-3 colonnes selon breakpoint

**Formulaire Contact :**
- Champs pleine largeur
- Bouton pleine largeur
- Espacement adapté

#### PWA (Progressive Web App)

**Manifest (`public/manifest.json`) :**
- Name : "ArtisanFlow – Devis en 20 secondes avec l'IA"
- Short name : "ArtisanFlow"
- Display : standalone
- Background color : #0A1A2F
- Theme color : #0A1A2F
- Icons : 16x16, 32x32, 180x180 (Apple)

**Meta Tags PWA :**
- `mobile-web-app-capable` : yes
- `apple-mobile-web-app-capable` : yes
- `apple-mobile-web-app-status-bar-style` : black-translucent

### 3.5 Analytics et Tracking

#### État Actuel

**Aucun tracking implémenté actuellement.**

#### Recommandations

**À implémenter :**
1. **Google Analytics 4**
   - Tracking des pages vues
   - Événements de conversion (clics CTA, soumissions formulaires)
   - Funnel de conversion

2. **Google Tag Manager**
   - Gestion centralisée des tags
   - Facilite l'ajout de nouveaux trackers

3. **Hotjar ou Similar**
   - Heatmaps
   - Enregistrements de sessions
   - Feedback utilisateurs

4. **Vercel Analytics**
   - Intégration native avec Vercel
   - Web Vitals
   - Performance monitoring

#### Événements à Tracker

- Clic sur "Essai gratuit" (tous les CTAs)
- Soumission formulaire contact
- Ouverture FAQ
- Scroll depth (25%, 50%, 75%, 100%)
- Temps passé sur page
- Bounce rate par page

---

## 4. Branding et Design

### 4.1 Identité Visuelle

#### Couleurs

**Palette principale (Tailwind CSS) :**

```css
--primary: 219 100% 60%        /* Bleu #3B82F6 */
--primary-dark: 221 83% 53%     /* Bleu foncé #2563EB */
--accent: 142 76% 36%           /* Vert #10B981 */
--background: 0 0% 100%         /* Blanc */
--foreground: 222 47% 11%       /* Slate 900 */
--muted: 215 20% 65%            /* Slate 500 */
--card: 0 0% 100%               /* Blanc */
--border: 214 32% 91%           /* Slate 200 */
--destructive: 0 84% 60%        /* Rouge */
```

**Utilisation :**
- **Bleu** : CTAs, liens, accents
- **Vert** : Succès, validations
- **Slate** : Textes, bordures
- **Blanc** : Fond principal

#### Typographie

**Police principale :**
- **Font** : Inter (Google Fonts)
- **Fallback** : system-ui, sans-serif
- **Poids** : 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

**Hiérarchie :**
- **H1** : text-5xl à text-7xl (Hero)
- **H2** : text-3xl à text-5xl (Sections)
- **H3** : text-2xl (Sous-sections)
- **Body** : text-base (16px)
- **Small** : text-sm (14px)

#### Logo

**Fichiers :**
- `/logo.png` (32x32, utilisé dans Header/Footer)
- `/favicon-16.png` (16x16)
- `/favicon-32.png` (32x32)
- `/apple-touch-icon.png` (180x180)
- `/og-image.svg` (Open Graph)

**Marque déposée :**
- ArtisanFlow® - INPI n° 5157297
- Mentionné dans Footer et Mentions légales

### 4.2 Ton et Style de Communication

#### Ton

- **Direct** : Pas de langue de bois
- **Authentique** : Créé par un artisan, pour les artisans
- **Technique mais accessible** : Explique sans jargon inutile
- **Empathique** : Comprend les frustrations
- **Transparent** : Pas de frais cachés, pas de bullshit

#### Exemples de Formulations

**✅ Bon :**
- "Générez vos devis en 20 secondes"
- "Fait gagner 2h par jour"
- "Simple, rapide, puissant"
- "Sans engagement, sans frais cachés"

**❌ À éviter :**
- "Solution révolutionnaire"
- "Game changer"
- "Disruptif"
- Formulations marketing creuses

### 4.3 Éléments Graphiques et Illustrations

#### Images Actuelles

1. **Hero** : `/aperçu devis généré.jpg`
   - Aperçu de l'application mobile
   - Format : 1200x900 (aspect 4:3)

2. **À propos** : `/artisanflow/af-moi.jpg`
   - Photo du fondateur
   - Format : 500x500 (carré)

#### Illustrations Manquantes

**Recommandations :**
- Screenshots de l'app (fonctionnalités clés)
- Icônes personnalisées pour chaque fonctionnalité
- Diagrammes de workflow
- GIF animé montrant la création de devis

### 4.4 Cohérence avec l'Application

#### Design System Partagé

**Couleurs :**
- Même palette bleu/slate que l'app mobile
- Cohérence visuelle entre web et mobile

**Composants :**
- Boutons similaires (primary, secondary)
- Cards avec même style
- Typographie cohérente

**Messages :**
- Même storytelling
- Même ton de communication
- Même valeurs (Simplicité, Fiabilité, Honnêteté)

---

## 5. Stratégie Marketing

### 5.1 Objectifs du Site

#### Objectifs Principaux

1. **Lead Generation**
   - Collecte d'emails via formulaire essai gratuit
   - Formulaire de contact pour qualifier les prospects

2. **Information**
   - Présenter les fonctionnalités
   - Expliquer les tarifs
   - Rassurer sur la sécurité des données

3. **Conversion**
   - Inscription à l'essai gratuit
   - Téléchargement de l'app (quand disponible)
   - Abonnement payant

4. **Confiance**
   - Transparence (tarifs, CGU, confidentialité)
   - Preuve sociale (témoignages, stats)
   - Conformité légale (RGPD, mentions légales)

### 5.2 Intégrations

#### État Actuel

**Aucune intégration active :**

- ❌ Email marketing (Mailchimp, SendGrid, etc.)
- ❌ CRM (HubSpot, Salesforce, etc.)
- ❌ Paiement (Stripe, PayPal, etc.)
- ❌ Analytics (Google Analytics, etc.)

#### À Implémenter

**Priorité 1 :**
1. **Service Email** (Resend, SendGrid)
   - Formulaire de contact
   - Notifications d'inscription
   - Emails transactionnels

2. **Analytics** (Google Analytics 4)
   - Tracking des conversions
   - Comportement utilisateurs

**Priorité 2 :**
3. **CRM** (HubSpot, Pipedrive)
   - Qualification des leads
   - Suivi des prospects

4. **Email Marketing** (Mailchimp, Brevo)
   - Newsletter
   - Nurturing des leads

**Priorité 3 :**
5. **Paiement** (Stripe, RevenueCat)
   - Abonnements
   - Gestion des paiements

### 5.3 A/B Testing Prévu

**Aucun A/B testing configuré actuellement.**

#### Recommandations

**Tests à prévoir :**

1. **Hero CTA**
   - Variante A : "Essai gratuit 14 jours"
   - Variante B : "Commencer maintenant"

2. **Prix**
   - Variante A : "29,90€/mois"
   - Variante B : "Moins de 1€/jour"

3. **Témoignages**
   - Variante A : Avec photos
   - Variante B : Sans photos

4. **Formulaire Contact**
   - Variante A : Tous les champs visibles
   - Variante B : Champs progressifs

### 5.4 Stratégie de Contenu

#### Blog

**État actuel :** Aucun blog

**Recommandations :**
- Créer `/blog` avec articles SEO
- Sujets : Conseils artisans, actualités, tutoriels
- Fréquence : 1-2 articles/mois

#### Ressources

**Pages à créer :**
- `/ressources` : Guides, templates, outils
- `/tutoriels` : Vidéos, guides pas à pas
- `/actualites` : Nouveautés, mises à jour

#### SEO Content

**Articles ciblés :**
- "Comment créer un devis rapidement"
- "Gestion de chantier : guide complet"
- "Signature électronique : avantages"
- "Mode offline : pourquoi c'est important"

---

## 6. Administratif et Légal

### 6.1 Mentions Légales

**Fichier :** `app/mentions-legales/page.tsx`

**Contenu :**

1. **Éditeur du site**
   - Raison sociale : SASU À Contre Courant
   - SIRET : 98356287700024
   - Email : acontrecourant25@gmail.com
   - Directeur de publication : Christopher Crahay

2. **Hébergement**
   - Hébergeur : Vercel Inc.
   - Adresse : 340 S Lemon Ave #4133, Walnut, CA 91789, USA
   - Site : vercel.com

3. **Propriété intellectuelle**
   - Copyright : © 2025 À Contre Courant (SASU)
   - Marque : ArtisanFlow® - INPI n° 5157297
   - Protection : Droit d'auteur et propriété intellectuelle française
   - Usage autorisé : Consultation et exécution locale à titre personnel
   - Usage interdit : Revente, redistribution, publication, hébergement sous autre nom

4. **Données personnelles**
   - Lien vers politique de confidentialité

### 6.2 CGU/CGV

**Fichier :** `app/cgu/page.tsx`

**Dernière mise à jour :** 13 novembre 2025

**Sections :**

1. **Objet**
   - Application mobile ArtisanFlow
   - Éditeur : À Contre Courant (SASU)
   - Fonctionnalités principales

2. **Accès au service**
   - Inscription avec email
   - Abonnement (modalités à préciser)
   - Résiliation à tout moment

3. **Fonctionnalités**
   - Transcription vocale (OpenAI Whisper)
   - Génération de devis IA (OpenAI GPT-4o-mini)
   - Export PDF
   - Responsabilité utilisateur

4. **Propriété intellectuelle**
   - Application : Propriété de l'Éditeur
   - Contenus utilisateur : Propriété de l'utilisateur
   - Licence non exclusive pour stockage/traitement

5. **Données personnelles**
   - Lien vers politique de confidentialité
   - Résumé : Hébergement UE, conformité RGPD, pas de revente

6. **Obligations utilisateur**
   - Informations exactes
   - Respect des lois
   - Vérification des devis/factures

7. **Responsabilité**
   - Éditeur : Service de qualité, pas de garantie 100%
   - Utilisateur : Responsable des contenus créés

8. **Suspension et résiliation**
   - Conservation données : 30 jours après résiliation
   - Suspension possible en cas de non-paiement/fraude

9. **Modification des CGU**
   - Droit de modification
   - Information 30 jours avant

10. **Droit applicable**
    - Droit français
    - Juridiction : Tribunaux de Besançon

11. **Contact**
    - Email : acontrecourant25@gmail.com

### 6.3 Politique de Confidentialité

**Fichier :** `app/confidentialite/page.tsx`

**Dernière mise à jour :** 13 novembre 2025

**Sections :**

1. **Introduction**
   - Protection des données personnelles
   - Conformité RGPD

2. **Responsable du traitement**
   - À Contre Courant (SASU)
   - Email : acontrecourant25@gmail.com

3. **Données collectées**
   - Données de compte (email, nom, téléphone)
   - Données professionnelles (SIRET, TVA, assurances)
   - Données clients et chantiers
   - Données techniques (IP, appareil, logs)
   - Données OpenAI (enregistrements vocaux, transcriptions)

4. **Base légale**
   - Exécution du contrat
   - Consentement
   - Obligation légale
   - Intérêt légitime

5. **Finalités du traitement**
   - Fourniture du service
   - Transcription & analyse IA
   - Amélioration du service
   - Communication

6. **Destinataires**
   - Supabase (Irlande, UE) : Hébergement
   - OpenAI (États-Unis) : IA (Clauses Contractuelles Types)
   - Apple/Google/RevenueCat : Abonnements
   - Aucun autre partage

7. **Durée de conservation**
   - Compte utilisateur : Durée de l'abonnement
   - Clients/chantiers/photos : Durée de l'abonnement
   - Notes vocales : Durée de l'abonnement
   - Devis/factures : 10 ans (obligation légale)
   - Logs techniques : 90 jours
   - Données OpenAI : 30 jours max
   - Après résiliation : 30 jours puis suppression

8. **Sécurité**
   - Chiffrement HTTPS/TLS
   - Authentification Supabase (JWT)
   - Isolation multi-tenant (RLS)
   - Backups quotidiens chiffrés
   - Journalisation des accès

9. **Vos droits (RGPD)**
   - Droit d'accès
   - Droit de rectification
   - Droit à l'effacement
   - Droit d'opposition
   - Droit à la portabilité
   - Droit de limitation
   - Droit de réclamation (CNIL)
   - Contact : acontrecourant25@gmail.com (réponse sous 30 jours)

10. **Cookies et traceurs**
    - Aucun cookie publicitaire
    - Traceurs techniques essentiels uniquement

11. **Transferts internationaux**
    - OpenAI (États-Unis) avec Clauses Contractuelles Types
    - Pas d'autres transferts hors UE

12. **Mineurs**
    - Application destinée aux professionnels majeurs (18+)

13. **Modifications**
    - Droit de modification
    - Information 30 jours avant

14. **Contact**
    - Email : acontrecourant25@gmail.com

### 6.4 RGPD et Conformité

#### Conformité RGPD

**✅ Implémenté :**

1. **Politique de confidentialité complète**
   - Accessible depuis toutes les pages
   - Dernière mise à jour mentionnée

2. **Mentions légales complètes**
   - Informations éditeur
   - Hébergement
   - Propriété intellectuelle

3. **CGU détaillées**
   - Conditions d'utilisation
   - Responsabilités
   - Droits utilisateurs

4. **Consentement**
   - Formulaire de contact avec champs optionnels
   - Pas de cookies publicitaires

5. **Droits utilisateurs**
   - Droit d'accès, rectification, effacement
   - Contact pour exercer les droits
   - Délai de réponse : 30 jours

6. **Sécurité**
   - Chiffrement HTTPS
   - Authentification sécurisée
   - Isolation multi-tenant

#### Points d'Attention

**À compléter :**

1. **Banner de consentement cookies**
   - Actuellement : Pas de banner
   - Recommandation : Ajouter si analytics ajoutés

2. **Logs d'accès**
   - Traçabilité des accès aux données
   - Journalisation (à vérifier côté Supabase)

3. **DPO (Data Protection Officer)**
   - Pas de DPO désigné
   - Recommandation : Désigner si > 250 employés ou traitement à grande échelle

4. **Registre des traitements**
   - Document interne requis
   - À créer si non existant

#### Contact RGPD

**Email :** acontrecourant25@gmail.com  
**Délai de réponse :** 30 jours maximum

---

## 7. Annexes

### 7.1 Structure des Fichiers

```
app/
├── layout.tsx              # Layout principal avec Header/Footer
├── page.tsx                # Page d'accueil
├── globals.css             # Styles globaux
├── sitemap.ts              # Génération sitemap.xml
├── robots.ts               # Génération robots.txt
├── fonctionnalites/
│   └── page.tsx
├── tarifs/
│   └── page.tsx
├── a-propos/
│   └── page.tsx
├── contact/
│   ├── layout.tsx
│   └── page.tsx
├── essai-gratuit/
│   └── page.tsx
├── cgu/
│   └── page.tsx
├── mentions-legales/
│   └── page.tsx
├── confidentialite/
│   └── page.tsx
├── suppression-compte/
│   └── page.tsx
└── api/
    └── contact/
        └── route.ts        # API route formulaire contact

components/
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Container.tsx
│   └── MobileNav.tsx
├── home/
│   ├── Hero.tsx
│   ├── ProblemSection.tsx
│   ├── SolutionFeatures.tsx
│   ├── HowItWorks.tsx
│   ├── Benefits.tsx
│   ├── Stats.tsx
│   ├── Testimonials.tsx
│   ├── FAQ.tsx
│   └── FinalCTA.tsx
└── ui/
    ├── Button.tsx
    ├── Card.tsx
    ├── Input.tsx
    ├── Textarea.tsx
    ├── Badge.tsx
    └── AnimatedSection.tsx

lib/
└── constants/
    └── site.ts             # Configuration du site

public/
├── logo.png
├── favicon-16.png
├── favicon-32.png
├── apple-touch-icon.png
├── og-image.svg
├── manifest.json
└── aperçu devis généré.jpg
```

### 7.2 Commandes Utiles

```bash
# Développement
npm run dev              # Démarrer le serveur de développement

# Build
npm run build            # Build de production
npm run next:start      # Démarrer le serveur de production

# Linting
npm run lint            # Vérifier le code

# SEO Assets
npm run generate:seo    # Générer les assets SEO
```

### 7.3 Variables d'Environnement

**À créer (`.env.local`) :**
```env
# Pas de variables d'environnement nécessaires actuellement
# (À ajouter si intégration email, analytics, etc.)
```

### 7.4 Checklist de Déploiement

**Avant chaque déploiement :**

- [ ] Vérifier que tous les liens fonctionnent
- [ ] Tester les formulaires
- [ ] Vérifier le responsive (mobile, tablette, desktop)
- [ ] Tester les performances (Lighthouse)
- [ ] Vérifier le SEO (meta tags, sitemap, robots.txt)
- [ ] Tester les pages légales (CGU, mentions, confidentialité)
- [ ] Vérifier les images (optimisation, alt text)
- [ ] Tester les animations
- [ ] Vérifier la console (pas d'erreurs)

---

## 8. Évolutions Prévues

### 8.1 Court Terme

1. **Intégration Email**
   - Service email pour formulaire contact
   - Notifications d'inscription

2. **Analytics**
   - Google Analytics 4
   - Tracking des conversions

3. **Témoignages**
   - Ajouter de vrais témoignages clients

4. **Vidéos**
   - Vidéo de démonstration
   - GIF animé processus devis

### 8.2 Moyen Terme

1. **Blog**
   - Création section blog
   - Articles SEO

2. **Ressources**
   - Guides, templates, outils

3. **A/B Testing**
   - Tests de conversion

4. **CRM**
   - Intégration HubSpot/Pipedrive

### 8.3 Long Terme

1. **Multilingue**
   - Version anglaise
   - Autres langues selon marché

2. **Marketplace**
   - Templates par métier
   - Intégrations tierces

3. **Communauté**
   - Forum utilisateurs
   - Webinaires

---

**Fin de la documentation**

*Pour toute question ou mise à jour, contacter : acontrecourant25@gmail.com*

