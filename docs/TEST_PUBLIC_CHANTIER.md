# Guide de test - Partage public de chantier

## 📋 Checklist de test

### ÉTAPE 1 : Vérifier que le token existe

1. **Dans l'app mobile** :
   - Aller sur un chantier
   - Cliquer sur "Partager avec le client"
   - Copier le token de l'URL (ex: `67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd`)

2. **Dans Supabase SQL Editor** :
```sql
SELECT id, name, share_token 
FROM public.projects 
WHERE share_token = '67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd';
```

**Résultat attendu** : 1 ligne avec le chantier

**Si 0 lignes** :
- Le token n'a pas été généré
- Dans l'app mobile, cliquer à nouveau sur "Partager avec le client"
- Vérifier que `projects.share_token` est bien rempli

---

### ÉTAPE 2 : Tester le RPC directement

**Dans Supabase SQL Editor** :
```sql
SELECT * FROM public.get_public_chantier('67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd');
```

**Résultat attendu** : 1 ligne avec toutes les colonnes :
- `project_id`, `project_name`, `project_address_line`, `project_postal_code`, `project_city`, `project_status`
- `client_id`, `client_name`, `client_phone`, `client_email`
- `photos` : JSONB array avec `[{photo_id, url, created_at}, ...]`
- `documents` : JSONB array avec `[{document_id, type, numero, montant_ttc, status, pdf_url, created_at}, ...]`

**Si erreur ou 0 lignes** :
- Vérifier que la migration `fix_public_chantier_complete.sql` a été appliquée
- Vérifier que le token existe bien dans `projects.share_token`
- Vérifier les logs d'erreur dans Supabase

---

### ÉTAPE 3 : Vérifier les permissions

**Dans Supabase SQL Editor** :
```sql
-- Vérifier que anon peut exécuter la fonction
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_public_chantier';

-- Vérifier les grants
SELECT 
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
AND routine_name = 'get_public_chantier';
```

**Résultat attendu** :
- `security_type` = `DEFINER`
- `grantee` doit inclure `anon` et `authenticated`

---

### ÉTAPE 4 : Tester dans le navigateur

1. **Ouvrir le lien complet** :
   ```
   https://magnificent-bonbon-b7534e.netlify.app/share/chantier/67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd
   ```

2. **Vérifier l'affichage** :
   - ✅ Le nom du chantier s'affiche
   - ✅ Les infos client (nom, téléphone, email) s'affichent
   - ✅ L'adresse du chantier s'affiche
   - ✅ Les photos s'affichent (si présentes)
   - ✅ Les devis s'affichent avec lien PDF (si présents)
   - ✅ Les factures s'affichent avec lien PDF (si présentes)
   - ❌ **PAS** de message "Ce lien de chantier n'est plus valide"

3. **Vérifier la console du navigateur (F12)** :
   - **Console** : Pas d'erreurs JavaScript
   - **Network** : 
     - Requête vers Supabase RPC `get_public_chantier`
     - Status 200
     - Réponse contient les données JSON

---

### ÉTAPE 5 : Test avec un nouveau token

1. **Dans l'app mobile** :
   - Créer un nouveau chantier ou utiliser un chantier existant
   - Cliquer sur "Partager avec le client"
   - Copier le nouveau token

2. **Vérifier dans Supabase** :
```sql
SELECT * FROM public.get_public_chantier('<NOUVEAU_TOKEN>');
```

3. **Tester dans le navigateur** :
   - Ouvrir le lien avec le nouveau token
   - Vérifier que tout s'affiche correctement

---

## 🐛 Dépannage

### Problème : "Ce lien de chantier n'est plus valide"

**Causes possibles** :

1. **Le token n'existe pas** :
   - Vérifier avec `SELECT * FROM projects WHERE share_token = '...'`
   - Si 0 lignes, régénérer le lien dans l'app mobile

2. **La fonction RPC n'existe pas** :
   - Vérifier avec `SELECT * FROM information_schema.routines WHERE routine_name = 'get_public_chantier'`
   - Si 0 lignes, appliquer la migration `fix_public_chantier_complete.sql`

3. **Erreur dans la fonction** :
   - Vérifier les logs Supabase
   - Tester la fonction directement dans SQL Editor
   - Vérifier que les noms de colonnes correspondent au schéma réel

4. **Problème de permissions** :
   - Vérifier que `GRANT EXECUTE` a été fait pour `anon`
   - Vérifier que `SECURITY DEFINER` est bien défini

### Problème : Les photos ne s'affichent pas

**Vérifier** :
- Les photos existent dans `project_photos` pour ce projet
- La colonne `url` contient bien une URL valide
- Les URLs sont accessibles publiquement (pas de signed URL expirée)

### Problème : Les documents ne s'affichent pas

**Vérifier** :
- Les devis/factures existent dans `devis`/`factures` pour ce projet
- La colonne `pdf_url` n'est pas NULL
- Les PDFs sont accessibles publiquement

---

## ✅ Critères de succès

Après tous les tests, le système est fonctionnel si :

- ✅ Le RPC retourne les données pour un token valide
- ✅ Le front affiche toutes les infos (client, chantier, photos, documents)
- ✅ Plus de message "lien invalide" pour un token existant
- ✅ Les liens PDF fonctionnent
- ✅ Les photos s'affichent correctement

---

**Dernière mise à jour** : Novembre 2025

