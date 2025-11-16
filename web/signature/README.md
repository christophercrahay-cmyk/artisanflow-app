# ArtisanFlow - Page de signature (/sign)

Mini-projet React + Vite (TypeScript) pour la page publique de signature de devis.

## Démarrage

```bash
cd web/signature
npm install
npm run dev
```

Ouvrir: http://localhost:5173/sign?token=VOTRE_TOKEN

## Configuration

Définir l'URL de l'Edge Function `sign-devis` via:

- Variable d'environnement Vite: `VITE_SIGN_FUNCTION_URL=https://<project>.supabase.co/functions/v1`
- OU fallback global (dans `index.html`): `window.SIGN_FN_BASE = 'https://<project>.supabase.co/functions/v1'`

## Build

```bash
npm run build
npm run preview
```

## Notes

- Aucun secret côté client. On utilise une URL publique d'Edge Function.
- La page lit le paramètre `token` dans l'URL, appelle `sign-devis` (`action: "info"` puis `action: "sign"`), gère les états (loading, error, ready, submitting, success) et permet de dessiner une signature exportée en dataURL PNG.


