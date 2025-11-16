# Changelog - Migration vers Système d'Import GPT

## ✅ Changements effectués

### 1. Nettoyage de l'ancienne infra

#### Fichiers modifiés :
- **`services/import/documentImport.ts`** :
  - ❌ Supprimé : `importClientsFromFile()` (stub avec TODO)
  - ✅ Conservé : `pickImportFile()` (réutilisé)
  - 📝 Ajouté : Commentaires indiquant l'obsolescence

- **`screens/ImportDataScreen.tsx`** :
  - ❌ Supprimé : Appel à `importClientsFromFile()` (stub)
  - ❌ Supprimé : Message "parsing à implémenter" / "traitement futur"
  - ✅ Ajouté : Nouveau flux avec analyse GPT
  - ✅ Ajouté : Affichage du résumé d'analyse
  - ✅ Ajouté : Boutons "Analyser" et "Importer" séparés

### 2. Nouveaux fichiers créés

#### Types TypeScript
- **`types/import.ts`** : Types complets pour le système d'import
  - `ImportAnalysis`, `ImportSummary`, `ImportEntities`
  - `ImportClient`, `ImportProject`, `ImportQuote`, `ImportInvoice`
  - `ImportLineItem`, `ImportArticle`, `ImportNote`

#### Services
- **`services/import/aiImportService.ts`** : Service principal
  - `uploadImportFile()` : Upload dans Supabase Storage
  - `analyzeImportFile()` : Appel Edge Function /ai/import/analyze
  - `processImport()` : Appel Edge Function /ai/import/process

#### Edge Functions Supabase
- **`supabase/functions/ai-import-analyze/index.ts`** :
  - Télécharge le fichier (URL ou Storage)
  - Convertit en texte (CSV/TXT supporté, Excel TODO)
  - Appelle GPT-4o-mini avec schéma JSON strict
  - Retourne `ImportAnalysis`

- **`supabase/functions/ai-import-process/index.ts`** :
  - Reçoit `ImportAnalysis`
  - Mappe vers tables Supabase (clients, projects)
  - Insère avec `user_id` (multi-tenant)
  - Retourne compteurs d'import

#### Documentation
- **`docs/IMPORT_SYSTEM.md`** : Documentation complète du système
- **`docs/CHANGELOG_IMPORT.md`** : Ce fichier

---

## 🔄 Flux avant / après

### AVANT (ancien système)
```
1. Sélection fichier
2. Appel importClientsFromFile() → STUB
3. Message "parsing à implémenter"
4. ❌ Rien ne se passe
```

### APRÈS (nouveau système)
```
1. Sélection fichier
2. Upload dans Supabase Storage
3. Analyse avec GPT → JSON structuré
4. Affichage résumé (X clients, Y projets, etc.)
5. Confirmation utilisateur
6. Import réel en base
7. ✅ Données importées
```

---

## 📋 Actions requises pour déployer

### 1. Créer le bucket Storage

Dans Supabase Dashboard → Storage → Create bucket :
- **Nom** : `imports`
- **Public** : `false` (privé)

Ou via SQL :
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('imports', 'imports', false)
ON CONFLICT (id) DO NOTHING;
```

### 2. Configurer les secrets Edge Functions

Dans Supabase Dashboard → Edge Functions → Secrets :
- `OPENAI_API_KEY` : Votre clé API OpenAI

### 3. Déployer les Edge Functions

```bash
# Depuis la racine du projet
supabase functions deploy ai-import-analyze
supabase functions deploy ai-import-process
```

### 4. Vérifier les variables d'environnement

Les Edge Functions utilisent automatiquement :
- `SUPABASE_URL` (auto)
- `SUPABASE_SERVICE_ROLE_KEY` (auto)
- `OPENAI_API_KEY` (à configurer manuellement)

---

## ⚠️ Limitations actuelles

### Support fichiers
- ✅ CSV / TXT / TSV : Supporté
- ⚠️ Excel (XLS/XLSX) : Non supporté en Edge Function (limitation Deno)
  - **Solution temporaire** : Convertir Excel en CSV avant import
- ⚠️ PDF : Non supporté (TODO)

### Mapping entités
- ✅ Clients : Implémenté
- ✅ Projets : Implémenté (avec création client si nécessaire)
- ⚠️ Devis : TODO (structure prête, mapping à finaliser)
- ⚠️ Factures : TODO (structure prête, mapping à finaliser)
- ⚠️ Lignes de devis : TODO (nécessite devis importés)
- ⚠️ Articles : TODO (table à créer)
- ⚠️ Notes : TODO (nécessite project_id)

---

## 🧪 Tests recommandés

1. **Test import CSV simple** :
   - Créer un CSV avec colonnes : Nom, Email, Téléphone
   - Importer et vérifier que les clients sont créés

2. **Test import avec projets** :
   - CSV avec clients + projets
   - Vérifier que les projets sont liés aux bons clients

3. **Test multi-tenant** :
   - Importer avec utilisateur A
   - Vérifier que utilisateur B ne voit pas les données

---

## 📝 Notes importantes

### Ancien système d'import clients conservé

Le fichier `utils/import/importClients.js` et `ClientsListScreen2.js` conservent l'ancien système d'import CSV avec mapping manuel. Ce système reste fonctionnel et indépendant du nouveau système GPT.

**Deux systèmes coexistent** :
1. **Import CSV manuel** (ClientsListScreen2) : Pour import CSV avec mapping colonnes
2. **Import universel GPT** (ImportDataScreen) : Pour import depuis n'importe quel logiciel

---

## 🎯 Prochaines étapes

1. ✅ Déployer les Edge Functions
2. ✅ Tester avec un fichier CSV réel
3. ⚠️ Implémenter le mapping devis/factures
4. ⚠️ Ajouter support Excel (bibliothèque compatible Deno)
5. ⚠️ Ajouter support PDF (extraction texte)

---

**Date de migration** : 2025-01-XX  
**Version** : 2.0.0

