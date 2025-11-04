# ⚠️ FIX URGENT - Colonnes Manquantes

## 🔴 Problème Détecté

L'erreur suivante apparaît :
```
ERROR: column clients.address does not exist
```

## ✅ Solution

Votre base de données existante ne contient pas certaines colonnes ajoutées lors de la transformation.

---

## 🎯 Action à Faire MAINTENANT

### Option 1 : Script Rapide (RECOMMANDÉ)

1. Ouvrez votre **Supabase Dashboard**
2. Allez dans **SQL Editor**
3. Copiez-collez le contenu de **`ADD_ADDRESS_COLUMN.sql`**
4. Cliquez sur **RUN**

**Cela ajoutera uniquement la colonne manquante `address`.**

---

### Option 2 : Script Complet (Toutes les colonnes)

Si vous avez d'autres erreurs de colonnes manquantes :

1. Ouvrez votre **Supabase Dashboard**
2. Allez dans **SQL Editor**
3. Copiez-collez le contenu de **`FIX_MISSING_COLUMNS_COMPLETE.sql`**
4. Cliquez sur **RUN**

**Cela ajoutera :**
- ✅ `clients.address`
- ✅ `project_photos.client_id` (+ FK + index)
- ✅ `devis.pdf_url`
- ✅ `factures.pdf_url`
- ✅ Table `brand_settings` (si elle n'existe pas)

---

## 📋 Scripts Disponibles

| Script | Usage |
|--------|-------|
| `ADD_ADDRESS_COLUMN.sql` | Fix rapide de l'erreur `clients.address` |
| `FIX_MISSING_COLUMNS_COMPLETE.sql` | Fix complet de toutes les colonnes |
| `INIT_SUPABASE.sql` | Réinitialisation complète (supprime les données) |
| `FIX_COLONNES_MANQUANTES.sql` | Version alternative du fix complet |

---

## ⚡ Quick Fix

**Copier-coller ceci dans Supabase SQL Editor :**

```sql
-- Quick fix pour clients.address
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'address') THEN
    ALTER TABLE clients ADD COLUMN address TEXT;
    RAISE NOTICE '✅ Colonne clients.address ajoutée';
  ELSE
    RAISE NOTICE '⚠️ Colonne clients.address existe déjà';
  END IF;
END $$;
```

---

## ✅ Après le Fix

Une fois le script exécuté :

1. Relancez l'app :
```bash
npx expo start -c
```

2. L'erreur devrait disparaître

---

**⚠️ IMPORTANT :** Ces scripts sont **idempotents** (sûrs à exécuter plusieurs fois).

Ils n'écrasent **jamais** de données existantes.

