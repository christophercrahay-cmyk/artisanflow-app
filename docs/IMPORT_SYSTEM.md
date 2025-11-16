# Système d'Import Universel - Documentation

## 📋 Vue d'ensemble

Le système d'import d'ArtisanFlow utilise **GPT-4o-mini** pour analyser automatiquement n'importe quel fichier exporté depuis un logiciel de gestion (Obat, Tolteck, EBP, Boby, Excel, etc.) et extraire les données structurées.

**Avantages** :
- ✅ Fonctionne avec **tous les formats** (CSV, Excel, PDF, JSON)
- ✅ Fonctionne avec **tous les logiciels** (pas besoin de parser spécifique)
- ✅ Détection automatique des entités (clients, projets, devis, factures, etc.)
- ✅ Mapping intelligent vers les tables Supabase

---

## 🔄 Flux d'import

```
1. Utilisateur sélectionne un fichier
   ↓
2. Upload dans Supabase Storage (bucket 'imports')
   ↓
3. Appel Edge Function /ai/import/analyze
   - Télécharge le fichier
   - Convertit en texte (CSV/Excel → texte)
   - Envoie à GPT avec schéma JSON strict
   - Retourne JSON structuré (summary + entities)
   ↓
4. Affichage du résumé à l'utilisateur
   ↓
5. Utilisateur confirme l'import
   ↓
6. Appel Edge Function /ai/import/process
   - Mappe les entités vers les tables Supabase
   - Insère les données avec user_id (multi-tenant)
   - Retourne le résultat (compteurs)
```

---

## 📁 Structure des fichiers

### Types TypeScript
- `types/import.ts` : Types pour ImportAnalysis, ImportSummary, ImportEntities, etc.

### Services Mobile
- `services/import/aiImportService.ts` : Service principal (upload, analyze, process)
- `services/import/documentImport.ts` : ⚠️ OBSOLÈTE (gardé uniquement pour pickImportFile)

### Edge Functions Supabase
- `supabase/functions/ai-import-analyze/index.ts` : Analyse avec GPT
- `supabase/functions/ai-import-process/index.ts` : Insertion en base

### Écrans
- `screens/ImportDataScreen.tsx` : Interface utilisateur pour l'import

---

## 🔧 Configuration

### 1. Variables d'environnement Supabase

Les Edge Functions nécessitent :
- `OPENAI_API_KEY` : Clé API OpenAI
- `SUPABASE_URL` : URL du projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service role (pour bypass RLS si nécessaire)

### 2. Bucket Storage

Créer un bucket `imports` dans Supabase Storage :
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('imports', 'imports', false)
ON CONFLICT (id) DO NOTHING;
```

### 3. Déployer les Edge Functions

```bash
# Depuis la racine du projet
supabase functions deploy ai-import-analyze
supabase functions deploy ai-import-process
```

---

## 📊 Format JSON retourné par GPT

### Summary
```json
{
  "summary": {
    "clients": 10,
    "projects": 5,
    "quotes": 3,
    "invoices": 2,
    "line_items": 15,
    "articles": 8,
    "notes": 0,
    "unknown_rows": 1
  }
}
```

### Entities
```json
{
  "entities": {
    "clients": [
      {
        "name": "Jean Dupont",
        "email": "jean@example.com",
        "phone": "0123456789",
        "address": "123 Rue Example",
        "postal_code": "75001",
        "city": "Paris",
        "type": "particulier",
        "status": "client"
      }
    ],
    "projects": [
      {
        "title": "Rénovation cuisine",
        "client_name": "Jean Dupont",
        "address": "123 Rue Example",
        "city": "Paris"
      }
    ],
    "quotes": [...],
    "invoices": [...],
    "line_items": [...],
    "articles": [...],
    "notes": [...]
  }
}
```

---

## 🗄️ Mapping vers les tables Supabase

### Clients
- `name` → `clients.name`
- `email` → `clients.email`
- `phone` → `clients.phone`
- `address` + `postal_code` + `city` → `clients.address` (formaté)
- `user_id` ajouté automatiquement (multi-tenant)

### Projets
- `title` → `projects.name`
- `client_name` → Recherche dans `clients` par nom → `projects.client_id`
- `address` → `projects.address`
- `user_id` ajouté automatiquement

### Devis / Factures
- ⚠️ **TODO** : Implémenter le mapping complet vers `devis` et `factures`
- Pour l'instant, seuls les clients et projets sont importés

---

## 🧹 Nettoyage de l'ancienne infra

### Fichiers supprimés / modifiés

1. **`services/import/documentImport.ts`** :
   - ✅ `pickImportFile()` conservé (réutilisé)
   - ❌ `importClientsFromFile()` supprimé (était un stub)

2. **`screens/ImportDataScreen.tsx`** :
   - ✅ Mis à jour pour utiliser `aiImportService.ts`
   - ✅ Nouveau flux : Upload → Analyse → Import

3. **Ancien système d'import clients** (`utils/import/importClients.js`) :
   - ⚠️ **CONSERVÉ** : Utilisé par `ClientsListScreen2.js` pour l'import CSV manuel
   - Ce système reste fonctionnel pour l'import CSV avec mapping manuel
   - Le nouveau système GPT est pour l'import universel depuis n'importe quel logiciel

---

## 🚀 Utilisation

### Depuis l'app mobile

1. Ouvrir l'écran "Importer mes données" (Settings → Import de données)
2. Sélectionner un fichier (CSV, Excel, PDF, etc.)
3. Cliquer sur "Analyser le fichier"
4. Vérifier le résumé affiché
5. Cliquer sur "Importer les données"

### Depuis le code

```typescript
import { uploadImportFile, analyzeImportFile, processImport } from '../services/import/aiImportService';

// 1. Upload
const fileUrl = await uploadImportFile(fileUri, fileName);

// 2. Analyser
const analysis = await analyzeImportFile(fileUrl);

// 3. Importer
const result = await processImport(analysis);
```

---

## 🐛 Dépannage

### Erreur "Bucket imports not found"
→ Créer le bucket dans Supabase Storage (voir Configuration)

### Erreur "OPENAI_API_KEY non configurée"
→ Configurer la variable d'environnement dans Supabase Dashboard → Edge Functions → Secrets

### Erreur "userId requis"
→ Vérifier que l'utilisateur est bien authentifié (session Supabase valide)

### Excel non supporté
→ Pour l'instant, seuls CSV/TXT sont supportés en Edge Function. Convertir Excel en CSV avant import.

---

## 📝 TODO / Améliorations futures

- [ ] Support Excel natif dans Edge Function (bibliothèque xlsx compatible Deno)
- [ ] Support PDF (extraction de texte)
- [ ] Mapping complet devis/factures vers tables Supabase
- [ ] Mapping lignes de devis vers `devis_lignes`
- [ ] Table `articles` pour le catalogue
- [ ] Gestion des doublons (détection par email/nom)
- [ ] Prévisualisation avant import (écran dédié)

---

## 🔒 Sécurité

- ✅ Multi-tenant : Toutes les données sont liées à `user_id`
- ✅ RLS activé sur toutes les tables
- ✅ Edge Functions utilisent Service Role Key uniquement pour les opérations nécessaires
- ✅ Validation des données avant insertion

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2025-01-XX

