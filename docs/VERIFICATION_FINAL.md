# Vérification finale - Partage public de chantier

## ✅ État actuel

### RPC fonctionne
Le RPC `get_public_chantier` retourne bien les données :
- ✅ Infos projet : `project_id`, `project_name`, `project_address_line`, `project_status`
- ✅ Infos client : `client_id`, `client_name`, `client_phone`, `client_email`
- ✅ Photos : Array avec 17 photos
- ✅ Documents : Array avec 2 devis

### Front amélioré
Le front a été amélioré pour :
- ✅ Gérer les retours array ou objet
- ✅ Parser les JSONB arrays si nécessaire
- ✅ Logs détaillés pour le diagnostic

---

## 🔍 Vérifications à faire

### 1. Vérifier le token dans l'URL

Le token testé dans SQL : `67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd`

**Vérifier que l'URL du navigateur utilise le même token** :
```
https://magnificent-bonbon-b7534e.netlify.app/share/chantier/67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd
```

Si l'URL utilise un autre token, tester avec celui qui fonctionne en SQL.

### 2. Vérifier la console du navigateur

Ouvrir la console (F12) et vérifier les logs :
- `🔍 Chargement chantier avec token: ...` → Le token est bien extrait
- `📦 Résultat RPC: ...` → Voir ce que retourne Supabase
- `✅ Données récupérées et parsées: ...` → Les données sont bien parsées

**Partager ce qui apparaît dans la console.**

### 3. Rebuild et redéployer le front

Le front a été modifié, il faut le rebuild :

```bash
cd web/share/chantier
npm run build
```

Puis redéployer sur Netlify.

### 4. Vérifier les variables d'environnement Netlify

Sur Netlify, vérifier que les variables d'environnement sont bien configurées :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🐛 Si ça ne fonctionne toujours pas

### Cas 1 : Le token dans l'URL est différent

**Solution** : Utiliser le token qui fonctionne en SQL dans l'URL, ou régénérer un nouveau lien dans l'app mobile.

### Cas 2 : La console montre une erreur RPC

**Vérifier** :
- Les variables d'environnement Supabase sont correctes
- La fonction RPC existe bien (`SELECT * FROM information_schema.routines WHERE routine_name = 'get_public_chantier'`)
- Les permissions sont OK (`GRANT EXECUTE` pour `anon`)

### Cas 3 : Le résultat est vide (0 lignes)

**Vérifier** :
- Le token existe dans `projects.share_token`
- Le client existe pour ce projet
- Les JOINs fonctionnent (tester la requête 3 du diagnostic)

---

## ✅ Test de succès

Après rebuild et redéploiement, la page doit afficher :
- ✅ Nom du chantier : "Chez Moi"
- ✅ Infos client : "Crahay Christopher", téléphone, email
- ✅ Adresse : "7 rue Royale 25300 Chaffois"
- ✅ 17 photos
- ✅ 2 devis avec liens PDF
- ❌ Plus de message "lien invalide"

---

**Dernière mise à jour** : Novembre 2025

