# Phase 1 : Synchronisation des Statuts - TERMINÉE ✅

**Date**: 16 Novembre 2025  
**Durée**: ~30 minutes  
**Statut**: ✅ Implémentée et prête à tester

---

## 📋 RÉSUMÉ DES MODIFICATIONS

### 1. Migration SQL (`sql/migrate_devis_statuts.sql`)

**Objectif**: Unifier les statuts et migrer les données existantes.

**Actions effectuées**:
- ✅ Ajout des nouveaux statuts: `edition`, `pret`, `envoye`, `signe`, `refuse`
- ✅ Migration automatique des données:
  - `signature_status = 'signed'` → `statut = 'signe'`
  - `signature_status = 'pending'` → `statut = 'envoye'`
  - `statut = 'brouillon'` → `statut = 'edition'`
  - `statut = 'accepte'` → `statut = 'signe'`
- ✅ Création d'index pour améliorer les performances
- ✅ Ajout d'une colonne `statut_updated_at` pour tracker les changements
- ✅ Création d'un trigger pour auto-update du timestamp
- ✅ Vérifications et rapports de migration

**Comment exécuter**:
```bash
# Via Supabase Dashboard
1. Aller dans SQL Editor
2. Copier le contenu de sql/migrate_devis_statuts.sql
3. Exécuter
4. Vérifier les logs de migration dans la console

# Via Supabase CLI
supabase db push --db-url "postgresql://..."
```

---

### 2. Service de Signature (`services/devis/signatureService.js`)

**Modifications**:

#### Fonction `generateSignatureLink()` (ligne 106-118)
**AVANT**:
```javascript
const { error: updateError } = await supabase
  .from('devis')
  .update({
    signature_status: 'pending',
  })
  .eq('id', devisId);
```

**APRÈS**:
```javascript
const { error: updateError } = await supabase
  .from('devis')
  .update({
    statut: 'envoye',              // ✅ Synchronisation
    signature_status: 'pending',
  })
  .eq('id', devisId);
```

**Impact**: Quand un lien de signature est généré, le devis passe automatiquement en statut "envoyé".

---

#### Fonction `markDevisAsSigned()` (ligne 210-220)
**AVANT**:
```javascript
const { error: updateError } = await supabase
  .from('devis')
  .update({
    signature_status: 'signed',
    signed_at: new Date().toISOString(),
    signed_by_name: signerName.trim(),
    signed_by_email: signerEmail.trim().toLowerCase(),
  })
  .eq('id', devisId);
```

**APRÈS**:
```javascript
const { error: updateError } = await supabase
  .from('devis')
  .update({
    statut: 'signe',                // ✅ Synchronisation
    signature_status: 'signed',
    signed_at: new Date().toISOString(),
    signed_by_name: signerName.trim(),
    signed_by_email: signerEmail.trim().toLowerCase(),
  })
  .eq('id', devisId);
```

**Impact**: Quand un devis est signé (via cette fonction legacy), le statut est synchronisé.

---

### 3. Edge Function (`supabase/functions/sign-devis/index.ts`)

**Modification** (ligne 168-180):

**AVANT**:
```typescript
const { error: devisErr } = await supabaseAdmin
  .from("devis")
  .update({
    signature_status: "signed",
    signed_at: new Date().toISOString(),
    signed_by_name: body.name,
    signed_ip: ip,
    signed_user_agent: userAgent,
    signature_image_url: signatureUrl,
  })
  .eq("id", link.devis_id);
```

**APRÈS**:
```typescript
const { error: devisErr } = await supabaseAdmin
  .from("devis")
  .update({
    statut: "signe",                // ✅ Synchronisation
    signature_status: "signed",
    signed_at: new Date().toISOString(),
    signed_by_name: body.name,
    signed_ip: ip,
    signed_user_agent: userAgent,
    signature_image_url: signatureUrl,
  })
  .eq("id", link.devis_id);
```

**Impact**: Quand un client signe via la page web publique, le devis passe automatiquement en statut "signé".

---

## 🔄 WORKFLOW APRÈS PHASE 1

### Avant (incohérent)
```
Création → statut: 'brouillon'
  ↓
Génération lien → signature_status: 'pending' (statut reste 'brouillon')
  ↓
Signature → signature_status: 'signed' (statut reste 'brouillon')
  ↓
Dans DocumentsScreen: Apparaît en "brouillon" ❌
```

### Après (cohérent)
```
Création → statut: 'edition'
  ↓
Génération lien → statut: 'envoye' + signature_status: 'pending'
  ↓
Signature → statut: 'signe' + signature_status: 'signed'
  ↓
Dans DocumentsScreen: Apparaît en "signé" ✅
```

---

## 🧪 TESTS À EFFECTUER

### Test 1: Migration SQL
1. Exécuter la migration SQL dans Supabase Dashboard
2. Vérifier les logs de migration (nombre de devis par statut)
3. Vérifier qu'aucun devis n'a été perdu ou corrompu

**Requête de vérification**:
```sql
SELECT statut, COUNT(*) as count 
FROM devis 
GROUP BY statut 
ORDER BY count DESC;
```

**Résultat attendu**: Tous les devis doivent avoir un statut valide (`edition`, `pret`, `envoye`, `signe`, `refuse`).

---

### Test 2: Génération de lien de signature
1. Ouvrir un devis en statut "edition" dans EditDevisScreen
2. Cliquer sur "Générer le lien de signature"
3. Vérifier que le statut passe à "envoye" dans la BDD

**Requête de vérification**:
```sql
SELECT id, numero, statut, signature_status 
FROM devis 
WHERE id = 'DEVIS_ID_ICI';
```

**Résultat attendu**: `statut = 'envoye'` + `signature_status = 'pending'`.

---

### Test 3: Signature par le client
1. Copier le lien de signature généré
2. Ouvrir le lien dans un navigateur
3. Signer le devis (nom + signature dessinée)
4. Vérifier que le statut passe à "signe" dans la BDD

**Requête de vérification**:
```sql
SELECT id, numero, statut, signature_status, signed_at, signed_by_name 
FROM devis 
WHERE id = 'DEVIS_ID_ICI';
```

**Résultat attendu**: `statut = 'signe'` + `signature_status = 'signed'` + `signed_at` rempli.

---

### Test 4: Affichage dans DocumentsScreen
1. Ouvrir l'app mobile
2. Aller dans l'onglet "Documents"
3. Vérifier que les devis signés apparaissent avec le badge "Signé"
4. Filtrer par statut "Signé" et vérifier que les devis signés sont bien affichés

**Résultat attendu**: Les devis avec `statut = 'signe'` doivent apparaître dans la liste avec le bon badge.

---

## 🐛 PROBLÈMES POTENTIELS ET SOLUTIONS

### Problème 1: Contrainte de statut échoue
**Symptôme**: Erreur SQL lors de la migration: `CHECK constraint "devis_statut_check" is violated`.

**Cause**: Des devis ont des statuts non reconnus (ex: `null`, `'draft'`, etc.).

**Solution**:
```sql
-- Identifier les devis avec statuts invalides
SELECT id, numero, statut FROM devis 
WHERE statut NOT IN ('edition', 'pret', 'envoye', 'signe', 'refuse', 'brouillon', 'accepte');

-- Les corriger manuellement
UPDATE devis SET statut = 'edition' WHERE statut IS NULL;
```

---

### Problème 2: Edge Function ne se déploie pas
**Symptôme**: Erreur lors du déploiement de `sign-devis`.

**Cause**: Syntaxe TypeScript incorrecte ou dépendances manquantes.

**Solution**:
```bash
# Redéployer l'Edge Function
cd supabase/functions/sign-devis
deno cache index.ts
supabase functions deploy sign-devis
```

---

### Problème 3: Devis signés n'apparaissent pas comme "signés"
**Symptôme**: Dans DocumentsScreen, les devis signés apparaissent toujours en "brouillon".

**Cause**: La fonction `normalizeStatus()` dans DocumentsScreen utilise encore l'ancienne logique.

**Solution**: Passer à la Phase 2 pour supprimer `normalizeStatus()` et utiliser directement `statut`.

---

## 📊 MÉTRIQUES DE SUCCÈS

### Avant Phase 1
- ❌ Incohérence entre `statut` et `signature_status`
- ❌ Devis signés apparaissent en "brouillon"
- ❌ Statut "envoyé" jamais utilisé
- ❌ Confusion pour l'utilisateur

### Après Phase 1
- ✅ Synchronisation automatique des statuts
- ✅ Devis signés apparaissent correctement
- ✅ Statut "envoyé" utilisé automatiquement
- ✅ Workflow cohérent et prévisible

---

## 🚀 PROCHAINES ÉTAPES (Phase 2)

1. **Créer `services/devis/devisService.js`** avec:
   - `finalizeDevis(devisId)` → `statut: 'edition'` → `'pret'`
   - `createDevisQuick(clientId, projectId)` → Création rapide

2. **Modifier `EditDevisScreen.js`**:
   - Ajouter bouton "Finaliser le devis"
   - Conditionner "Générer le lien" à `statut === 'pret'`

3. **Modifier `DocumentsScreen2.js`**:
   - Supprimer `normalizeStatus()`
   - Utiliser directement `statut`
   - Ajouter badges colorés par statut

4. **Modifier `DevisAIGenerator2.js`**:
   - Créer avec `statut: 'edition'` au lieu de `'brouillon'`

---

## 📝 NOTES IMPORTANTES

1. **Rétrocompatibilité**: Les anciens statuts `'brouillon'` et `'accepte'` sont conservés temporairement dans la contrainte SQL pour éviter les erreurs. Ils seront supprimés après validation complète.

2. **Colonne `signature_status`**: Cette colonne est conservée pour l'instant mais pourra être supprimée après validation complète (Phase 4).

3. **Déploiement de l'Edge Function**: Nécessite un redéploiement via Supabase Dashboard ou CLI.

4. **Tests en production**: Effectuer les tests sur un devis de test avant de valider en production.

---

**Statut**: ✅ Phase 1 terminée et prête à tester  
**Prochaine étape**: Exécuter la migration SQL et tester le workflow complet

