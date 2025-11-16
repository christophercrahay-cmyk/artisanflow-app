# 📊 GUIDE SUPABASE : Configuration pour l'IA Devis

## 🎯 Deux Scénarios Possibles

### ✅ CAS 1 : Base de données VIDE (nouvelle installation)

**Action à faire** : Exécuter le script complet `INIT_SUPABASE.sql`

1. Ouvrir https://supabase.com/dashboard
2. Sélectionner votre projet ArtisanFlow
3. Menu gauche → **SQL Editor**
4. Bouton **"New query"**
5. Copier-coller **TOUT** le contenu de `INIT_SUPABASE.sql`
6. Cliquer sur **"RUN"** (ou Ctrl+Enter)
7. ✅ Message de confirmation : "Initialisation complète !"

**Résultat** : Toutes les tables créées avec la bonne structure (incluant `client_id` dans `notes`)

---

### ⚠️ CAS 2 : Base de données EXISTANTE avec des données

**Action à faire** : Exécuter le script de migration `FIX_NOTES_CLIENT_ID.sql`

1. Ouvrir https://supabase.com/dashboard
2. Sélectionner votre projet ArtisanFlow
3. Menu gauche → **SQL Editor**
4. Bouton **"New query"**
5. Copier-coller **TOUT** le contenu de `FIX_NOTES_CLIENT_ID.sql`
6. Cliquer sur **"RUN"** (ou Ctrl+Enter)
7. ✅ Vérifier le résultat dans la console

**Résultat** : 
- Colonne `client_id` ajoutée à `notes`
- Les notes existantes remplies avec le `client_id` de leur projet
- Contrainte et index créés

---

## 🔍 Comment Savoir Quel Scénario Choisir ?

### Méthode 1 : Tester si la colonne existe déjà

Exécuter dans SQL Editor :

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'notes' 
  AND column_name = 'client_id';
```

**Résultat** :
- **0 lignes** → Colonne n'existe pas → Utiliser **CAS 1** (`INIT_SUPABASE.sql`)
- **1 ligne** → Colonne existe → Utiliser **CAS 2** (`FIX_NOTES_CLIENT_ID.sql`)

---

### Méthode 2 : Vérifier si vous avez des données

Exécuter dans SQL Editor :

```sql
SELECT COUNT(*) as total_notes FROM notes;
SELECT COUNT(*) as total_clients FROM clients;
SELECT COUNT(*) as total_projects FROM projects;
```

**Décision** :
- **0 notes, 0 clients, 0 projets** → Partir de zéro → **CAS 1**
- **Données existantes** → Migration → **CAS 2**

---

## 📋 Checklist d'Installation

### ✅ Après Exécution du Script

1. **Vérifier la table `notes`** :
```sql
SELECT * FROM notes LIMIT 5;
```
   - Si colonne `client_id` visible → ✅ OK

2. **Vérifier les contraintes** :
```sql
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE table_name = 'notes' AND constraint_type = 'FOREIGN KEY';
```
   - `fk_notes_project` → ✅ OK
   - `fk_notes_client` → ✅ OK

3. **Vérifier les index** :
```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'notes';
```
   - `idx_notes_project_id` → ✅ OK
   - `idx_notes_client_id` → ✅ OK

4. **Test d'insertion** (optionnel) :
```sql
INSERT INTO notes (project_id, client_id, type, transcription)
VALUES (
  (SELECT id FROM projects LIMIT 1),
  (SELECT id FROM clients LIMIT 1),
  'voice',
  'Test transcription'
);
```
   - Si succès → ✅ Base de données OK
   - Si erreur → ⚠️ Revoir la structure

5. **Nettoyer le test** :
```sql
DELETE FROM notes WHERE transcription = 'Test transcription';
```

---

## 🐛 Résolution de Problèmes Courants

### Erreur : "relation 'notes' does not exist"

**Cause** : La table `notes` n'existe pas du tout  
**Solution** : Exécuter `INIT_SUPABASE.sql` (CAS 1)

---

### Erreur : "column "client_id" does not exist"

**Cause** : La colonne `client_id` n'existe pas dans `notes`  
**Solution** : Exécuter `FIX_NOTES_CLIENT_ID.sql` (CAS 2)

---

### Erreur : "null value in column 'client_id' violates not-null constraint"

**Cause** : Des notes existantes ont `client_id = NULL`  
**Solution** : Re-exécuter `FIX_NOTES_CLIENT_ID.sql` pour remplir les valeurs NULL

---

### Erreur : "foreign key constraint 'fk_notes_client'"

**Cause** : Le `client_id` pointe vers un client qui n'existe pas  
**Solution** : Vérifier que tous les projets ont un `client_id` valide :
```sql
SELECT p.id, p.name, p.client_id 
FROM projects p 
WHERE p.client_id NOT IN (SELECT id FROM clients);
```

---

### Erreur : "Could not find the 'client_id' column of 'project_photos'"

**Cause** : La colonne `client_id` n'existe pas dans `project_photos`  
**Solution** : Exécuter `ADD_CLIENT_ID_TO_PROJECT_PHOTOS.sql`

Ce script :
- Ajoute la colonne `client_id` si manquante
- Remplit les photos existantes avec le `client_id` de leur projet
- Crée la contrainte FK et l'index

---

### Erreur : "duplicate key value violates unique constraint"

**Cause** : Numéro de devis déjà utilisé  
**Solution** : Normal si vous avez des devis existants, l'app générera des numéros uniques

---

## 📞 Support

Si vous avez toujours des problèmes :

1. **Afficher la structure de la table** :
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notes' 
ORDER BY ordinal_position;
```

2. **Afficher les logs de l'app** dans le terminal Expo :
```
[VoiceRecorder] Erreur uploadAndSave: ...
```

3. **Envoyer les logs** pour analyse

---

## 🎉 Une Fois Configuré

L'application fonctionnera automatiquement :
1. L'utilisateur enregistre une note vocale
2. Whisper transcrit l'audio
3. L'IA analyse et détecte les prestations
4. Un devis est créé automatiquement dans Supabase
5. Confirmation utilisateur avec détails

**Aucune autre action requise** ! 🚀

