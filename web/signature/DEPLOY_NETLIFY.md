# Déploiement Netlify - ArtisanFlow /sign

Ce dossier contient une SPA Vite (`web/signature`) pour la page publique de signature de devis.

## Configuration via netlify.toml (root)

Un `netlify.toml` a été ajouté à la racine du repo avec :

```toml
[build]
  base = "web/signature"
  publish = "web/signature/dist"
  command = "npm ci && npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Cela permet à Netlify de builder depuis `web/signature` et de servir la SPA (route `/sign` avec query `token`).

## Variables d’environnement

Dans Netlify → Site Settings → Environment variables :

- `VITE_SIGN_FUNCTION_URL` = `https://<project>.supabase.co/functions/v1`

Cette URL est utilisée pour appeler l’Edge Function `sign-devis`.

## CORS Supabase

Ajouter le domaine Netlify (production + previews) dans la configuration CORS des Edge Functions afin d’autoriser les requêtes depuis le site.

## Déploiement

1. Connecter le repo Git à Netlify
2. Netlify détecte `netlify.toml` et applique :
   - Base: `web/signature`
   - Build: `npm ci && npm run build`
   - Publish: `web/signature/dist`
3. Renseigner `VITE_SIGN_FUNCTION_URL`
4. Déployer

## Test

Après déploiement :

- Ouvrir `https://<votre-site>.netlify.app/sign?token=VOTRE_TOKEN`

La page doit charger le devis (action `info`), permettre la signature et valider (action `sign`).

## Tests CORS (local et distant)

- Pré-vol (OPTIONS):

```bash
curl -i -X OPTIONS "https://<project>.supabase.co/functions/v1/sign-devis" \
  -H "Origin: https://mon-site.netlify.app"
```

Résultat attendu: `200 OK` avec en-têtes:

- `Access-Control-Allow-Origin: https://mon-site.netlify.app` (ou `*` si non reconnu)
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`
- `Access-Control-Max-Age: 86400`

- POST (exemple action info):

```bash
curl -i -X POST "https://<project>.supabase.co/functions/v1/sign-devis" \
  -H "Origin: https://mon-site.netlify.app" \
  -H "Content-Type: application/json" \
  -d '{ "action": "info", "token": "VOTRE_TOKEN" }'
```

Doit renvoyer un JSON et inclure les mêmes en-têtes CORS.


