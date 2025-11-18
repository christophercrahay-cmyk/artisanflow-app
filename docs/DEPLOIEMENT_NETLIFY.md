# Déploiement Netlify - Front partage chantier

## ✅ Build réussi

Le front a été compilé avec succès :
- `dist/index.html`
- `dist/assets/index-Cs3QRiwM.css`
- `dist/assets/index-BfsIsNSd.js`

## 🚀 Redéploiement sur Netlify

### Option 1 : Déploiement automatique (si connecté à Git)

Si Netlify est connecté à votre repo Git, le déploiement se fait automatiquement après un commit.

### Option 2 : Déploiement manuel via Netlify CLI

```bash
# Installer Netlify CLI si pas déjà fait
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
cd web/share/chantier
netlify deploy --prod --dir=dist
```

### Option 3 : Déploiement manuel via interface Netlify

1. Aller sur https://app.netlify.com
2. Sélectionner le site `magnificent-bonbon-b7534e`
3. Aller dans **Deploys**
4. Glisser-déposer le dossier `web/share/chantier/dist` dans la zone de déploiement

---

## ✅ Vérifications après déploiement

### 1. Vérifier que le site est déployé

Aller sur : `https://magnificent-bonbon-b7534e.netlify.app`

Le site doit s'afficher (même si c'est une page vide, c'est normal).

### 2. Tester avec un token réel

Ouvrir dans le navigateur :
```
https://magnificent-bonbon-b7534e.netlify.app/share/chantier/67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd
```

### 3. Vérifier la console (F12)

Ouvrir la console et vérifier :
- `🔍 Chargement chantier avec token: 67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd`
- `📦 Résultat RPC: ...` (doit montrer les données)
- `✅ Données récupérées et parsées: ...`

### 4. Vérifier l'affichage

La page doit afficher :
- ✅ Nom du chantier : "Chez Moi"
- ✅ Infos client : "Crahay Christopher", téléphone, email
- ✅ Adresse : "7 rue Royale 25300 Chaffois"
- ✅ 17 photos
- ✅ 2 devis avec liens PDF
- ❌ Plus de message "lien invalide"

---

## 🐛 Si ça ne fonctionne toujours pas

### Vérifier les variables d'environnement Netlify

1. Aller sur https://app.netlify.com
2. Sélectionner le site
3. **Site settings** → **Environment variables**
4. Vérifier que ces variables existent :
   - `VITE_SUPABASE_URL` = `https://upihalivqstavxijlwaj.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (votre clé anon)

5. Si elles n'existent pas, les ajouter
6. **Redéployer** après avoir ajouté/modifié les variables

### Vérifier les logs Netlify

Dans **Deploys** → **Functions logs**, vérifier s'il y a des erreurs.

---

**Dernière mise à jour** : Novembre 2025

