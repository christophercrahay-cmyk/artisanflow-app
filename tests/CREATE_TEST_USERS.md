# 👥 Créer les Utilisateurs de Test Manuellement

## 📋 Pourquoi créer manuellement ?

Si le script rencontre des problèmes avec la création automatique d'utilisateurs (emails invalides, problèmes de délivrabilité), vous pouvez créer les utilisateurs manuellement dans Supabase Dashboard.

## ✅ Étapes pour Créer les Utilisateurs

### Dans Supabase Dashboard :

1. **Allez dans Authentication** → **Users**
2. **Cliquez sur "Add User"** (ou "Invite User")
3. **Créez UserA :**
   - **Email:** `test1@artisanflow.com`
   - **Password:** `motdepasse123`
   - **Auto Confirm User:** ✅ **Cochez cette case** (important !)
   - Cliquez sur **"Create User"**

4. **Créez UserB :**
   - **Email:** `test2@artisanflow.com`
   - **Password:** `motdepasse123`
   - **Auto Confirm User:** ✅ **Cochez cette case** (important !)
   - Cliquez sur **"Create User"**

## 🔑 Points Importants

- ✅ **Auto Confirm User** doit être coché pour que les utilisateurs puissent se connecter immédiatement
- ✅ Aucun email ne sera envoyé si vous cochez "Auto Confirm User"
- ✅ Les utilisateurs seront prêts à être utilisés immédiatement

## 🚀 Après la Création

Une fois les utilisateurs créés, exécutez simplement :

```bash
node tests/test_rls_security.js
```

Le script détectera automatiquement les utilisateurs existants et les utilisera pour les tests.

## 📝 Alternative : Utiliser des Emails Réels

Si vous préférez utiliser des emails valides :

1. Changez les emails dans le script :
   - `test1@artisanflow.com` → votre email réel (ex: `votre-email@gmail.com`)
   - `test2@artisanflow.com` → un autre email réel

2. Modifiez `tests/test_rls_security.js` :
   ```javascript
   const userAEmail = 'votre-email@gmail.com';
   const userBEmail = 'autre-email@gmail.com';
   ```

3. Les emails de confirmation seront envoyés normalement

## ⚠️ Note sur les Emails Invalides

Supabase peut considérer certains domaines d'email comme invalides (comme `@artisanflow.com` si le domaine n'existe pas réellement). Pour éviter cela :

- Utilisez des emails avec des domaines valides (gmail.com, yahoo.com, etc.)
- Ou créez les utilisateurs manuellement dans Supabase Dashboard

