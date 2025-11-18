# Correction : "Ce lien de chantier n'est plus valide"

## 🔍 Diagnostic complet

### ÉTAPE 1 – Code front identifié

**Fichier** : `web/share/chantier/src/ShareChantierPage.tsx`

- **Récupération token** : Lignes 62-69
  ```typescript
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const chantierIndex = pathParts.indexOf('chantier');
  if (chantierIndex !== -1 && pathParts[chantierIndex + 1]) {
    shareToken = pathParts[chantierIndex + 1];
  }
  ```

- **Appel Supabase** : Lignes 80-83
  ```typescript
  const { data: result, error: rpcError } = await supabase.rpc(
    'public_get_chantier_by_share_token',
    { p_share_token: shareToken }
  );
  ```

- **Message "lien invalide" affiché si** :
  - Ligne 85-88 : `if (rpcError)` → Affiche "Ce lien de chantier n'est plus valide."
  - Ligne 91-93 : `if (!result || result.error)` → Affiche "Ce lien de chantier n'est plus valide."

---

## 🔍 ÉTAPE 2 – Requêtes SQL de diagnostic

Exécuter ces requêtes dans **Supabase SQL Editor** pour diagnostiquer :

### 1. Vérifier que le token existe (déjà confirmé ✅)
```sql
SELECT id, name, share_token, user_id 
FROM public.projects 
WHERE share_token = '67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd';
```

### 2. Tester la RPC function directement (CRITIQUE)
```sql
SELECT public_get_chantier_by_share_token('67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd');
```

**Résultat attendu** :
- ✅ **Si ça fonctionne** : Retourne un JSON avec les données du chantier
- ❌ **Si ça échoue** : Erreur ou `{"error": "Chantier non trouvé"}` → C'est le problème !

### 3. Vérifier si RLS est activé sur projects
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'projects';
```

**Résultat attendu** :
- Si `rowsecurity = true` → RLS est activé (peut bloquer)
- Si `rowsecurity = false` → RLS n'est pas activé (ne devrait pas bloquer)

### 4. Lister TOUTES les policies sur projects
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'projects'
ORDER BY policyname;
```

**À vérifier** :
- Y a-t-il une policy qui dit `user_id = auth.uid()` ? → Elle bloque anon
- Y a-t-il la policy `public_read_project_by_share_token` ? → Elle devrait permettre l'accès

### 5. Vérifier les grants sur la fonction
```sql
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'public_get_chantier_by_share_token';
```

**À vérifier** :
- `security_type` devrait être `DEFINER` (après correction) ou `INVOKER` (actuellement)

### 6. Tester l'accès anon directement (sans fonction)
```sql
SET ROLE anon;
SELECT id, name, share_token 
FROM public.projects 
WHERE share_token = '67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd';
RESET ROLE;
```

**Résultat attendu** :
- ✅ **Si ça fonctionne** : Retourne la ligne → RLS permet l'accès
- ❌ **Si ça échoue** : Erreur ou 0 lignes → RLS bloque l'accès → C'est le problème !

---

## 🎯 ÉTAPE 3 – Problème identifié

### Cause racine

La fonction `public_get_chantier_by_share_token` est définie en **`SECURITY INVOKER`** (ligne 11 de `create_public_chantier_rpc.sql`).

**Conséquence** :
- La fonction s'exécute avec les permissions de l'appelant (role `anon`)
- Les **RLS policies** s'appliquent normalement
- Si une RLS policy bloque `anon` sur la table `projects` (ex: `user_id = auth.uid()`), la fonction ne peut **pas lire** la table, même si elle filtre sur `share_token`

### Pourquoi ça bloque

1. Le front appelle la fonction en tant que `anon` (pas authentifié)
2. La fonction essaie de lire `public.projects` avec `WHERE share_token = p_share_token`
3. RLS vérifie : "Est-ce que `anon` peut lire cette ligne ?"
4. Si une policy dit "seulement si `user_id = auth.uid()`", alors `anon` (qui n'a pas de `auth.uid()`) ne peut pas lire
5. La fonction retourne `NULL` → Le front affiche "lien invalide"

---

## ✅ ÉTAPE 4 – Solution : Migration SQL

### Fichier créé

**`supabase/migrations/fix_public_chantier_rpc_security.sql`**

### Changement principal

**AVANT** :
```sql
SECURITY INVOKER  -- S'exécute avec les permissions de l'appelant (anon)
```

**APRÈS** :
```sql
SECURITY DEFINER  -- S'exécute avec les permissions du propriétaire (postgres)
SET search_path = public  -- Sécurité : limiter le search_path
```

### Pourquoi ça fonctionne

- **SECURITY DEFINER** : La fonction s'exécute avec les permissions du propriétaire (postgres), qui peut lire toutes les tables
- **Bypass RLS** : Les RLS policies ne s'appliquent plus (le propriétaire a tous les droits)
- **Sécurité maintenue** : La fonction filtre strictement sur `share_token = p_share_token`, donc on ne peut lire que le chantier correspondant au token

### Application de la migration

**Option 1 : Via Supabase CLI**
```bash
supabase db push
```

**Option 2 : Via Supabase Dashboard**
1. Aller dans **SQL Editor**
2. Copier-coller le contenu de `supabase/migrations/fix_public_chantier_rpc_security.sql`
3. Exécuter

**Option 3 : Exécution manuelle**
Copier-coller directement dans Supabase SQL Editor :

```sql
CREATE OR REPLACE FUNCTION public_get_chantier_by_share_token(p_share_token UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chantier json;
  v_photos json;
  v_devis json;
  v_factures json;
  v_result json;
BEGIN
  SELECT json_build_object(
    'id', p.id,
    'share_token', p.share_token,
    'name', p.name,
    'status', p.status,
    'address', p.address,
    'created_at', p.created_at,
    'client', json_build_object(
      'id', c.id,
      'name', c.name,
      'city', c.city
    )
  ) INTO v_chantier
  FROM public.projects p
  LEFT JOIN public.clients c ON c.id = p.client_id
  WHERE p.share_token = p_share_token
  LIMIT 1;

  IF v_chantier IS NULL THEN
    RETURN json_build_object('error', 'Chantier non trouvé');
  END IF;

  SELECT COALESCE(json_agg(
    json_build_object(
      'id', pp.id,
      'url', pp.url,
      'created_at', pp.created_at
    ) ORDER BY pp.created_at ASC
  ), '[]'::json) INTO v_photos
  FROM public.project_photos pp
  INNER JOIN public.projects p ON p.id = pp.project_id
  WHERE p.share_token = p_share_token;

  SELECT COALESCE(json_agg(
    json_build_object(
      'id', d.id,
      'numero', d.numero,
      'date', COALESCE(d.date_creation, d.created_at),
      'total_ttc', d.montant_ttc,
      'pdf_url', d.pdf_url
    ) ORDER BY COALESCE(d.date_creation, d.created_at) DESC
  ), '[]'::json) INTO v_devis
  FROM public.devis d
  INNER JOIN public.projects p ON p.id = d.project_id
  WHERE p.share_token = p_share_token
  AND d.pdf_url IS NOT NULL;

  SELECT COALESCE(json_agg(
    json_build_object(
      'id', f.id,
      'numero', f.numero,
      'date', COALESCE(f.date_creation, f.created_at),
      'total_ttc', f.montant_ttc,
      'pdf_url', f.pdf_url
    ) ORDER BY COALESCE(f.date_creation, f.created_at) DESC
  ), '[]'::json) INTO v_factures
  FROM public.factures f
  INNER JOIN public.projects p ON p.id = f.project_id
  WHERE p.share_token = p_share_token
  AND f.pdf_url IS NOT NULL;

  SELECT json_build_object(
    'chantier', v_chantier,
    'photos', v_photos,
    'devis', v_devis,
    'factures', v_factures
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public_get_chantier_by_share_token(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public_get_chantier_by_share_token(UUID) TO authenticated;
```

---

## 🧪 Test après correction

### 1. Tester la fonction directement
```sql
SELECT public_get_chantier_by_share_token('67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd');
```

**Résultat attendu** : JSON avec les données du chantier

### 2. Tester dans le navigateur
Ouvrir : `https://magnificent-bonbon-b7534e.netlify.app/share/chantier/67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd`

**Résultat attendu** : La page affiche le chantier "Chez Moi" avec photos, devis, factures

### 3. Vérifier la console du navigateur (F12)
- **Console** : Pas d'erreurs
- **Network** : La requête RPC retourne un 200 avec les données

---

## 📋 Résumé final

### Pourquoi la page renvoyait "Ce lien n'est plus valide"

1. La fonction RPC est en `SECURITY INVOKER`
2. Elle s'exécute avec les permissions de `anon` (non authentifié)
3. Les RLS policies bloquent `anon` sur la table `projects`
4. La fonction ne peut pas lire la table → Retourne `NULL` ou erreur
5. Le front affiche "lien invalide"

### Partie précise en cause

**Fichier** : `supabase/migrations/create_public_chantier_rpc.sql`  
**Ligne 11** : `SECURITY INVOKER`  
**Solution** : Changer en `SECURITY DEFINER`

### Requêtes SQL de diagnostic

Voir section "ÉTAPE 2" ci-dessus (6 requêtes prêtes à coller)

### Migration SQL complète

**Fichier** : `supabase/migrations/fix_public_chantier_rpc_security.sql`

Ou exécuter directement le SQL fourni dans la section "Application de la migration"

### Modifications front

**Aucune modification nécessaire** dans le front. Le code existant est correct.

---

## ✅ Objectif final

Après application de la correction :
- ✅ Le lien `https://magnificent-bonbon-b7534e.netlify.app/share/chantier/67ddb1d7-1abb-48a0-a5bc-47a4aa29d6fd` affiche correctement le chantier
- ✅ Un visiteur anonyme (client) peut voir le chantier sans authentification
- ✅ Plus de message "lien invalide" si le token existe en base

---

**Dernière mise à jour** : Novembre 2025

