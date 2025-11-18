# Diagnostic détaillé - RPC get_public_chantier

## 🔍 Étapes de diagnostic

### 1. Ouvrir la console du navigateur (F12)

Avec les logs ajoutés, vous devriez voir :
- `🔍 Chargement chantier avec token: ...`
- `📦 Résultat RPC: ...`
- Soit `✅ Données récupérées:` soit une erreur `❌`

**Partagez ce que vous voyez dans la console.**

### 2. Vérifier dans Supabase SQL Editor

Exécuter ces requêtes (remplacer `VOTRE_TOKEN` par le token réel) :

```sql
-- A. Le token existe-t-il ?
SELECT id, name, share_token, client_id 
FROM public.projects 
WHERE share_token = 'VOTRE_TOKEN';

-- B. Le client existe-t-il pour ce projet ?
SELECT 
  p.id AS project_id,
  p.name AS project_name,
  p.client_id,
  c.id AS client_exists,
  c.name AS client_name
FROM public.projects p
LEFT JOIN public.clients c ON c.id = p.client_id
WHERE p.share_token = 'VOTRE_TOKEN';

-- C. Tester le RPC
SELECT * FROM public.get_public_chantier('VOTRE_TOKEN');
```

### 3. Problèmes possibles

#### Problème A : Le token n'existe pas
**Symptôme** : Requête A retourne 0 lignes
**Solution** : Régénérer le lien dans l'app mobile

#### Problème B : Le client n'existe pas
**Symptôme** : Requête B montre `client_id` non NULL mais `client_exists` est NULL
**Solution** : Le projet a un `client_id` invalide. Soit :
- Corriger le `client_id` dans `projects`
- Modifier le RPC pour utiliser `LEFT JOIN` au lieu de `INNER JOIN`

#### Problème C : Le RPC retourne 0 lignes
**Symptôme** : Requête C retourne 0 lignes mais le token existe
**Cause probable** : Le `INNER JOIN` avec `clients` exclut le projet si le client n'existe pas
**Solution** : Changer `INNER JOIN` en `LEFT JOIN` dans le RPC

---

## 🔧 Correction si le problème vient du JOIN

Si le problème est le `INNER JOIN` avec `clients`, voici la correction à appliquer dans la migration :

```sql
-- Dans la CTE 'base', changer :
INNER JOIN public.clients c ON c.id = p.client_id
-- En :
LEFT JOIN public.clients c ON c.id = p.client_id
```

Et adapter les colonnes client pour gérer les NULL :
```sql
c.id AS client_id,  -- Peut être NULL
c.name AS client_name,  -- Peut être NULL
NULLIF(COALESCE(c.phone, ''), '') AS client_phone,
NULLIF(COALESCE(c.email, ''), '') AS client_email
```

