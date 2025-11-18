# Dépannage – Liens de partage chantier

## ✅ Confirmation : L'URL est correcte

L'app mobile génère bien les liens avec la bonne base URL :
```
https://magnificent-bonbon-b7534e.netlify.app/share/chantier/{token}
```

## ❌ Problème : "Ce lien de chantier n'est plus valide"

Si vous voyez cette erreur en ouvrant le lien, vérifiez les points suivants :

---

## 1. Vérifier le déploiement du front web

### Sur Netlify

1. **Vérifier que le site est bien déployé** :
   - Aller sur https://app.netlify.com
   - Vérifier que le site `magnificent-bonbon-b7534e` est actif
   - Vérifier que le dernier déploiement est en succès

2. **Vérifier les variables d'environnement** :
   - Aller dans **Site settings** → **Environment variables**
   - Vérifier que ces variables sont définies :
     ```
     VITE_SUPABASE_URL=https://upihalivqstavxijlwaj.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - ⚠️ **Important** : Après avoir ajouté/modifié des variables d'environnement, il faut **redéployer** le site

3. **Vérifier le routing** :
   - Le fichier `public/_redirects` doit contenir :
     ```
     /* /index.html 200
     ```
   - Cela permet au routing côté client de fonctionner

---

## 2. Vérifier que le token existe dans la base de données

### Via Supabase Dashboard

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Table Editor** → `projects`
4. Chercher le projet avec le `share_token` : `67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd`
5. Vérifier que :
   - Le `share_token` n'est pas `NULL`
   - Le projet existe bien
   - Le `user_id` correspond à un utilisateur valide

### Via SQL Editor

```sql
SELECT id, name, share_token, user_id 
FROM public.projects 
WHERE share_token = '67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd';
```

Si aucun résultat, le token n'existe pas ou a été révoqué.

---

## 3. Vérifier la RPC function

### Tester la RPC function directement

Dans **SQL Editor** de Supabase :

```sql
SELECT public_get_chantier_by_share_token('67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd');
```

**Résultats attendus** :
- ✅ Si le token existe : Retourne un JSON avec les données du chantier
- ❌ Si le token n'existe pas : Retourne `{"error": "Chantier non trouvé"}`

### Vérifier que la migration est appliquée

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'public_get_chantier_by_share_token';
```

Si aucun résultat, la fonction n'existe pas. Il faut appliquer la migration :
```bash
supabase db push
```

---

## 4. Vérifier les RLS policies

La RPC function doit être accessible sans authentification (car c'est un accès public).

Vérifier dans **Authentication** → **Policies** que la fonction `public_get_chantier_by_share_token` est bien en `SECURITY INVOKER` (ce qui est le cas dans la migration).

---

## 5. Vérifier la console du navigateur

Ouvrir les **Developer Tools** (F12) dans le navigateur et regarder :

1. **Console** : Y a-t-il des erreurs JavaScript ?
2. **Network** : La requête vers Supabase est-elle envoyée ? Quelle est la réponse ?

Exemple d'erreur possible :
- `401 Unauthorized` → Problème de clé Supabase
- `404 Not Found` → La RPC function n'existe pas
- `500 Internal Server Error` → Problème dans la fonction SQL

---

## 6. Test local du front web

Pour tester localement :

```bash
cd web/share/chantier

# Créer un fichier .env
echo "VITE_SUPABASE_URL=https://upihalivqstavxijlwaj.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." >> .env

# Lancer le serveur de dev
npm run dev
```

Puis ouvrir : `http://localhost:5175/share/chantier/67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd`

---

## 7. Checklist de déploiement Netlify

- [ ] Le front web est buildé et déployé sur Netlify
- [ ] Les variables d'environnement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont configurées
- [ ] Le fichier `public/_redirects` existe avec `/* /index.html 200`
- [ ] Le site a été redéployé après avoir ajouté les variables d'environnement
- [ ] La RPC function `public_get_chantier_by_share_token` existe dans Supabase
- [ ] Le token existe dans la table `projects` avec `share_token` non NULL

---

## Solutions rapides

### Si le token n'existe pas

1. Dans l'app mobile, aller sur le chantier
2. Cliquer sur "Partager avec le client"
3. Un nouveau token sera généré

### Si les variables d'environnement ne sont pas configurées sur Netlify

1. Aller sur https://app.netlify.com
2. Sélectionner le site
3. **Site settings** → **Environment variables**
4. Ajouter :
   - `VITE_SUPABASE_URL` = `https://upihalivqstavxijlwaj.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (votre clé anon)
5. **Trigger deploy** → **Deploy site**

### Si la RPC function n'existe pas

```bash
# Dans le projet
supabase db push
```

Ou appliquer manuellement la migration :
```bash
supabase migration up
```

---

## Test de bout en bout

1. **Générer un nouveau lien** dans l'app mobile
2. **Copier le lien** (ex: `https://magnificent-bonbon-b7534e.netlify.app/share/chantier/xxx`)
3. **Ouvrir dans un navigateur** (mode navigation privée pour éviter le cache)
4. **Vérifier** que le chantier s'affiche correctement

---

**Dernière mise à jour** : Novembre 2025

