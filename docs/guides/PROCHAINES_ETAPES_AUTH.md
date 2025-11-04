# 🚀 PROCHAINES ÉTAPES - Auth Supabase

**Status** : ✅ SQL fait → ⚠️ Storage + Tests

---

## ✅ CE QUI EST FAIT

- ✅ 8 tables avec colonnes `user_id`
- ✅ RLS activé + 32 politiques
- ✅ 8 index créés
- ✅ Code app modifié (Auth, guard, déconnexion)
- ✅ Logs intégrés

---

## ⚠️ CE QUI RESTE (15 min)

### 1️⃣ Créer le bucket Storage (5 min)

**Dans Supabase Dashboard** :

1. Aller dans **Storage** (menu gauche)
2. Cliquer **"New bucket"**
3. Remplir :
   - **Name** : `artisanflow`
   - **Public bucket** : **YES** ✅
4. Cliquer **"Create bucket"**

---

### 2️⃣ Configurer les politiques Storage (10 min)

**Guide détaillé** : `STORAGE_POLICIES_MANUAL.md`

**Résumé rapide** :

1. Dans **Storage** → **Policies**
2. Sélectionner bucket `artisanflow`
3. Cliquer **"New Policy"**
4. Répéter 4 fois :

#### **Politique 1 : SELECT (Read)**

- Name : `Users can read own files`
- Operation : `SELECT`
- Policy definition :
```sql
bucket_id = 'artisanflow' AND
(storage.foldername(name))[1] = 'user' AND
(storage.foldername(name))[2] = auth.uid()::text
```

#### **Politique 2 : INSERT (Upload)**

- Name : `Users can upload own files`
- Operation : `INSERT`
- Policy definition : **même que ci-dessus**

#### **Politique 3 : UPDATE**

- Name : `Users can update own files`
- Operation : `UPDATE`
- Policy definition : **même que ci-dessus**

#### **Politique 4 : DELETE**

- Name : `Users can delete own files`
- Operation : `DELETE`
- Policy definition : **même que ci-dessus**

---

### 3️⃣ Tester l'app

```bash
npm start
```

**Tests à faire** :

1. ✅ App lance → **Écran Auth** s'affiche
2. ✅ Créer compte : test@example.com + password
3. ✅ Se connecter → Redirection vers app
4. ✅ Créer un client → Devrait fonctionner
5. ✅ Check Supabase : client a `user_id` non nul
6. ✅ Se déconnecter (Settings → Déconnexion)
7. ✅ Retour écran Auth
8. ✅ Créer un autre compte : test2@example.com
9. ✅ Check : pas de données du premier compte

---

## 🎯 SUCCÈS SI

- ✅ Bucket créé
- ✅ 4 politiques créées
- ✅ App démarre avec écran Auth
- ✅ Connexion fonctionne
- ✅ Données isolées

---

## ❌ ÉCHEC SI

- ❌ Bucket non créé → Upload photos échoue
- ❌ Politiques manquantes → Upload échoue
- ❌ App crash → Vérifier logs Metro
- ❌ Pas d'isolation → RLS non actif

---

**Prochaine action** : Créer le bucket `artisanflow` 🎯

