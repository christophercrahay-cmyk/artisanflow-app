# 🔧 Solution au Problème de Confirmation d'Email

## Problème

Les utilisateurs de test ne peuvent pas se connecter car leurs emails ne sont pas confirmés.

## ✅ Solution 1: Désactiver la Vérification Email (Recommandé pour les Tests)

### Dans Supabase Dashboard :

1. Allez dans **Authentication** → **Settings**
2. Trouvez la section **Email Auth**
3. Désactivez **"Confirm email"** ou **"Enable email confirmations"**
4. Sauvegardez

Cela permettra aux utilisateurs de se connecter sans confirmation d'email.

## ✅ Solution 2: Confirmer les Emails Manuellement

### Dans Supabase Dashboard :

1. Allez dans **Authentication** → **Users**
2. Trouvez les utilisateurs :
   - `test1@artisanflow.com`
   - `test2@artisanflow.com`
3. Cliquez sur chaque utilisateur
4. Cliquez sur **"Confirm email"** ou changez **"Email confirmed"** à `true`

## ✅ Solution 3: Utiliser l'Admin API (Avancé)

Si vous avez la clé `service_role` Supabase, vous pouvez modifier le script pour confirmer automatiquement les emails.

**⚠️ ATTENTION:** Ne commitez JAMAIS la clé `service_role` dans le code !

Ajoutez dans le script :
```javascript
// À utiliser uniquement avec service_role key (NE PAS COMMITER)
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (SUPABASE_SERVICE_ROLE_KEY) {
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  // Confirmer l'email
  await supabaseAdmin.auth.admin.updateUserById(userId, {
    email_confirm: true
  });
}
```

## 📝 Recommandation

Pour les tests, **Solution 1** est la plus simple : désactivez la vérification email temporairement dans Supabase Dashboard.

