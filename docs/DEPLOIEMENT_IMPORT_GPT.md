# 🚀 Guide de Déploiement - Système d'Import GPT

## ✅ Checklist de déploiement

### 1. Créer le bucket Storage (5 min)

**Dans Supabase Dashboard** :
1. Aller dans **Storage**
2. Cliquer sur **Create bucket**
3. Nom : `imports`
4. Public : `false` (privé)
5. Cliquer sur **Create**

**Ou via SQL** :
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('imports', 'imports', false)
ON CONFLICT (id) DO NOTHING;
```

---

### 2. Configurer OpenAI API Key (2 min)

**Dans Supabase Dashboard** :
1. Aller dans **Edge Functions** → **Secrets**
2. Cliquer sur **Add new secret**
3. Nom : `OPENAI_API_KEY`
4. Valeur : Votre clé API OpenAI (commence par `sk-...`)
5. Cliquer sur **Save**

**⚠️ Important** : La clé doit être valide et avoir des crédits disponibles.

---

### 3. Déployer les Edge Functions (5 min)

**Depuis la racine du projet** :

```bash
# Déployer la fonction d'analyse
supabase functions deploy ai-import-analyze

# Déployer la fonction de traitement
supabase functions deploy ai-import-process
```

**Vérification** :
- Dans Supabase Dashboard → Edge Functions, vous devriez voir :
  - `ai-import-analyze` ✅
  - `ai-import-process` ✅

---

### 4. (Optionnel) Ajouter user_id aux tables devis/factures

**Si vous voulez améliorer les performances RLS** :

1. Ouvrir Supabase Dashboard → SQL Editor
2. Ouvrir le fichier `sql/add_user_id_to_devis_factures.sql`
3. Copier tout le contenu
4. Coller dans l'éditeur SQL
5. Cliquer sur **Run**

**Note** : Cette étape est **optionnelle**. Le système fonctionne sans car le RLS utilise `projects.user_id`.

---

## 🧪 Test du système

### Test 1 : Import CSV simple

1. Créer un fichier CSV `test_import.csv` :
```csv
Nom,Email,Téléphone,Adresse,Ville
Jean Dupont,jean@example.com,0123456789,123 Rue Test,Paris
Marie Martin,marie@example.com,0987654321,456 Avenue Test,Lyon
```

2. Dans l'app :
   - Aller dans Settings → Import de données
   - Sélectionner `test_import.csv`
   - Cliquer sur "Analyser le fichier"
   - Vérifier : "2 clients détectés"
   - Cliquer sur "Importer les données"
   - Vérifier dans l'app que les 2 clients sont créés

### Test 2 : Import avec projets et devis

1. Créer un fichier CSV `test_complet.csv` :
```csv
Client,Email,Projet,Devis,Montant HT,Montant TTC
Jean Dupont,jean@example.com,Rénovation cuisine,DEV-2025-001,1000,1200
Marie Martin,marie@example.com,Plomberie salle de bain,DEV-2025-002,500,600
```

2. Tester l'import et vérifier :
   - 2 clients créés
   - 2 projets créés
   - 2 devis créés (avec numéros générés automatiquement)

---

## 🐛 Dépannage

### Erreur "Bucket imports not found"
→ Créer le bucket (voir étape 1)

### Erreur "OPENAI_API_KEY non configurée"
→ Configurer le secret (voir étape 2)

### Erreur "Excel non supporté"
→ Convertir Excel en CSV avant import (Fichier → Enregistrer sous → CSV)

### Erreur "Column user_id does not exist" lors de l'import devis/factures
→ Exécuter la migration SQL (voir étape 4) OU modifier le code pour ne pas inclure user_id

### Erreur "RLS policy violation"
→ Vérifier que les tables ont bien les policies RLS activées
→ Vérifier que l'utilisateur est bien authentifié

---

## 📊 Coûts OpenAI

**Modèle utilisé** : `gpt-4o-mini`

**Coût approximatif** :
- ~1000 tokens d'input par fichier analysé
- ~2000 tokens d'output (JSON structuré)
- **Coût** : ~$0.0001 par analyse (très économique)

**Limites** :
- Fichiers limités à 200 lignes ou 50 Ko pour éviter les coûts excessifs
- Troncature automatique si le fichier est trop gros

---

## 🔄 Flux complet

```
1. Utilisateur sélectionne fichier CSV
   ↓
2. Upload dans Supabase Storage (bucket 'imports')
   ↓
3. Appel /ai/import/analyze
   - Télécharge le fichier
   - Convertit en texte
   - Envoie à GPT-4o-mini
   - Reçoit JSON structuré
   ↓
4. Affichage résumé dans l'app
   "X clients, Y projets, Z devis détectés"
   ↓
5. Utilisateur confirme
   ↓
6. Appel /ai/import/process
   - Mappe vers tables Supabase
   - Insère avec user_id
   - Retourne compteurs
   ↓
7. Affichage résultat
   "X clients importés, Y projets importés..."
```

---

## ✅ Vérification finale

Après déploiement, vérifier :

- [ ] Bucket `imports` créé dans Supabase Storage
- [ ] Secret `OPENAI_API_KEY` configuré dans Edge Functions
- [ ] Edge Function `ai-import-analyze` déployée et accessible
- [ ] Edge Function `ai-import-process` déployée et accessible
- [ ] Test d'import CSV fonctionne
- [ ] Clients créés avec le bon `user_id`
- [ ] Projets créés et liés aux bons clients
- [ ] Devis créés avec numéros générés

---

**Statut** : ✅ Prêt pour production  
**Version** : 2.0.0

