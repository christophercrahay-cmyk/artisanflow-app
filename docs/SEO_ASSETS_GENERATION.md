# Génération des Assets SEO

Ce document explique comment générer les fichiers favicon et l'image OpenGraph pour ArtisanFlow.

## Prérequis

Installez `sharp` comme dépendance de développement :

```bash
npm install --save-dev sharp
```

## Génération des assets

Exécutez le script de génération :

```bash
npm run generate:seo
```

Ce script va :

1. **Générer les favicons** :
   - `favicon-16.png` (16x16)
   - `favicon-32.png` (32x32)
   - `apple-touch-icon.png` (180x180)
   - `favicon.ico` (32x32)

2. **Générer l'image OpenGraph** :
   - `og-image.jpg` (1200x630)

## Fichiers générés

Tous les fichiers seront créés dans le dossier `public/`.

### Favicons

Les favicons sont générés à partir de `public/logo.png` ou `public/logo.svg` avec un fond bleu ArtisanFlow (#0A1A2F).

### Image OpenGraph

L'image OpenGraph (`og-image.jpg`) est générée avec :
- Fond bleu dégradé (#0A1A2F → #1E3A5F)
- Logo ArtisanFlow centré
- Texte : "Devis en 20 secondes avec l'IA"
- Format : 1200x630 pixels (ratio recommandé pour les réseaux sociaux)

## Vérification

Après génération, vérifiez que tous les fichiers sont présents dans `public/` :

- ✅ `favicon.ico`
- ✅ `favicon-16.png`
- ✅ `favicon-32.png`
- ✅ `apple-touch-icon.png`
- ✅ `og-image.jpg`

## Test des aperçus de partage

Testez les aperçus de partage sur :
- https://www.opengraph.xyz
- https://metatags.io
- https://cards-dev.twitter.com/validator

## Notes

- Le script utilise `sharp` pour le traitement d'images
- Les images sont optimisées pour le web (compression JPEG à 90% pour og-image)
- Les favicons utilisent le format PNG pour une meilleure qualité

