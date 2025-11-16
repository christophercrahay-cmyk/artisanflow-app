# 🔍 Comment trouver votre Project Reference Supabase

## ⚠️ Important

Pour `supabase link`, vous avez besoin du **Project Reference**, **PAS** des clés API (anon/service role).

---

## 📍 Où trouver le Project Reference

### Méthode 1 : Dans Supabase Dashboard (RECOMMANDÉ)

1. Ouvrez votre **Supabase Dashboard** : https://supabase.com/dashboard
2. Sélectionnez votre projet **ArtisanFlow**
3. Allez dans **Settings** (⚙️ en bas à gauche)
4. Cliquez sur **API** dans le menu de gauche
5. Dans la section **Project API keys**, vous verrez :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **Project Reference** : `xxxxx` ← **C'est celui-ci !**

**Exemple** :
- Project URL : `https://upihalivqstavxijlwaj.supabase.co`
- **Project Reference** : `upihalivqstavxijlwaj` ← Utilisez celui-ci

---

### Méthode 2 : Depuis l'URL du projet

Si vous connaissez l'URL de votre projet Supabase, le Project Reference est la partie avant `.supabase.co` :

```
https://VOTRE_REF.supabase.co
         ^^^^^^^^^^^^
         C'est ça !
```

**Exemple** :
- URL : `https://upihalivqstavxijlwaj.supabase.co`
- Project Reference : `upihalivqstavxijlwaj`

---

### Méthode 3 : Depuis votre code existant

Si vous avez déjà configuré Supabase dans votre projet, regardez dans :

- `supabaseClient.js` ou `config/supabase.js`
- Cherchez une URL qui ressemble à : `https://xxxxx.supabase.co`
- La partie `xxxxx` est votre Project Reference

---

## ❌ Ce que vous N'utilisez PAS

Pour `supabase link`, vous **N'AVEZ PAS BESOIN** de :
- ❌ **anon key** (clé publique)
- ❌ **service_role key** (clé secrète)
- ❌ **JWT secret**

Ces clés sont utilisées pour les appels API, pas pour lier le projet avec Supabase CLI.

---

## ✅ Commande correcte

Une fois que vous avez votre Project Reference :

```powershell
.\supabase.exe link --project-ref VOTRE_PROJECT_REF
```

**Exemple** :
```powershell
.\supabase.exe link --project-ref upihalivqstavxijlwaj
```

---

## 🔐 À propos des clés API

Les clés API (anon/service role) sont utilisées pour :

- **anon key** : Appels API depuis le client (mobile app)
- **service_role key** : Appels API depuis le serveur (Edge Functions)

Elles sont déjà configurées dans votre projet et ne sont **PAS nécessaires** pour `supabase link`.

---

## 🆘 Besoin d'aide ?

Si vous ne trouvez pas votre Project Reference :

1. Vérifiez que vous êtes connecté au bon compte Supabase
2. Vérifiez que vous avez sélectionné le bon projet
3. Regardez dans **Settings → API** dans le Dashboard

---

**Résumé** : Utilisez le **Project Reference** (ex: `upihalivqstavxijlwaj`), **PAS** les clés API ! 🎯

