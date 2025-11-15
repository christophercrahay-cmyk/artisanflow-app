# 🧹 PLAN NETTOYAGE DONNÉES - ARTISANFLOW

## Date: 7 Novembre 2025
## Objectif: Nettoyer les données avant développement futur

---

## 📋 TABLES CONCERNÉES

### Tables Principales
1. `clients` - Clients des artisans
2. `projects` - Chantiers/projets
3. `notes` - Notes vocales et texte
4. `project_photos` - Photos des chantiers
5. `client_photos` - Photos des clients

### Tables Secondaires
6. `devis` - Devis
7. `devis_lignes` - Lignes de devis
8. `factures` - Factures

---

## 🔍 ANOMALIES À IDENTIFIER

### 🔥 CRITIQUES (Bloquantes)

#### 1. Enregistrements sans user_id
**Impact** : Violation de l'isolation multi-tenant

**Tables concernées** :
- `clients` sans `user_id`
- `projects` sans `user_id`

**Action** : Identifier et corriger ou supprimer

#### 2. Enregistrements orphelins
**Impact** : Données incohérentes, erreurs dans l'app

**Cas** :
- Projets sans client valide (`client_id` NULL ou invalide)
- Notes sans projet valide (`project_id` invalide)
- Photos sans projet/client valide
- Devis sans projet valide
- Factures sans projet valide

**Action** : Supprimer ou corriger les relations

### ⚠️ IMPORTANTES (À corriger)

#### 3. Doublons
**Impact** : Confusion, données dupliquées

**Cas** :
- Clients avec même nom + même téléphone
- Projets avec même nom pour un même client

**Action** : Fusionner ou marquer comme doublons

#### 4. Incohérences
**Impact** : Bugs potentiels

**Cas** :
- Projet et son client n'ont pas le même `user_id`
- Photo avec `client_id` différent du `client_id` du projet
- Devis sans lignes (`devis_lignes` vide)

**Action** : Corriger les relations

### 💡 MINEURES (Nice to have)

#### 5. Données incomplètes
**Impact** : Faible

**Cas** :
- Clients sans nom
- Projets sans nom/title
- Notes vocales sans transcription

**Action** : Marquer ou compléter

---

## 📊 SCRIPT D'ANALYSE (NON DESTRUCTIF)

### Fichier: `sql/analyse_donnees_nettoyage.sql`

**Ce script identifie** :
1. ✅ Clients sans `user_id`
2. ✅ Doublons clients (nom + téléphone)
3. ✅ Clients sans nom
4. ✅ Projets sans `user_id`
5. ✅ Projets orphelins (client invalide)
6. ✅ Incohérence `user_id` (projet ≠ client)
7. ✅ Notes orphelines (projet invalide)
8. ✅ Photos orphelines (projet/client invalide)
9. ✅ Photos avec `client_id` incohérent
10. ✅ Devis orphelins
11. ✅ Devis sans lignes
12. ✅ Factures orphelines
13. ✅ Statistiques globales
14. ✅ Vérification RLS

**Utilisation** :
```bash
1. Ouvrir Supabase SQL Editor
2. Copier/coller sql/analyse_donnees_nettoyage.sql
3. Exécuter
4. Analyser les résultats
5. Me transmettre les résultats
```

---

## 🎯 PLAN DE NETTOYAGE (À VALIDER)

### Phase 1 : Analyse (NON DESTRUCTIF)

**Action** : Exécuter `sql/analyse_donnees_nettoyage.sql`

**Résultat attendu** :
- Liste des anomalies
- Nombre d'enregistrements concernés
- Détails pour chaque anomalie

**Durée** : 5 minutes

### Phase 2 : Décision (VALIDATION REQUISE)

**Action** : Analyser les résultats ensemble

**Questions** :
- Combien de clients sans `user_id` ?
- Combien de projets orphelins ?
- Combien de doublons ?
- Quelle stratégie de nettoyage ?

**Durée** : 10 minutes

### Phase 3 : Nettoyage (DESTRUCTIF - APRÈS VALIDATION)

**Actions possibles** :

#### A. Supprimer les orphelins
```sql
-- Supprimer notes orphelines
DELETE FROM notes
WHERE project_id NOT IN (SELECT id FROM projects);

-- Supprimer photos orphelines
DELETE FROM project_photos
WHERE project_id NOT IN (SELECT id FROM projects);
```

#### B. Corriger les user_id manquants
```sql
-- Corriger projects sans user_id (via client)
UPDATE projects p
SET user_id = c.user_id
FROM clients c
WHERE p.client_id = c.id
  AND p.user_id IS NULL
  AND c.user_id IS NOT NULL;
```

#### C. Fusionner les doublons
```sql
-- À définir selon les cas spécifiques
```

**⚠️ CES REQUÊTES NE SERONT EXÉCUTÉES QU'APRÈS VALIDATION**

### Phase 4 : Vérification (POST-NETTOYAGE)

**Action** : Ré-exécuter le script d'analyse

**Résultat attendu** :
- 0 clients sans `user_id`
- 0 projets orphelins
- 0 notes orphelines
- 0 photos orphelines
- Doublons traités

**Durée** : 5 minutes

---

## 🧪 TESTS APRÈS NETTOYAGE

### Test 1 : Isolation utilisateurs
1. Se connecter avec User A
2. Vérifier que tous les clients ont un `user_id`
3. Vérifier que tous les projets ont un `user_id`
4. Vérifier l'isolation (pas de données d'autres users)

### Test 2 : Intégrité des données
1. Ouvrir chaque client
2. Vérifier que ses projets s'affichent
3. Ouvrir chaque projet
4. Vérifier que photos et notes s'affichent

### Test 3 : Fonctionnalités
1. Créer un nouveau client
2. Créer un nouveau projet
3. Ajouter photo et note
4. Vérifier que tout fonctionne

**✅ Si tous les tests passent → Nettoyage réussi**

---

## ⚠️ PRÉCAUTIONS

### Avant nettoyage

- [ ] Faire un backup Supabase (Settings > Database > Backups)
- [ ] Exécuter le script d'analyse
- [ ] Valider le plan de nettoyage
- [ ] Tester sur un environnement de dev si possible

### Pendant nettoyage

- [ ] Exécuter les requêtes une par une
- [ ] Vérifier le nombre de lignes affectées
- [ ] Arrêter si quelque chose semble anormal

### Après nettoyage

- [ ] Ré-exécuter le script d'analyse
- [ ] Tester l'app complètement
- [ ] Vérifier l'isolation utilisateurs
- [ ] Documenter les actions effectuées

---

## 📊 RÉSULTATS ATTENDUS

### Avant Nettoyage (Estimation)
```
⚠️ Clients sans user_id: ?
⚠️ Projets sans user_id: ?
⚠️ Projets orphelins: ?
⚠️ Notes orphelines: ?
⚠️ Photos orphelines: ?
⚠️ Doublons: ?
```

### Après Nettoyage (Objectif)
```
✅ Clients sans user_id: 0
✅ Projets sans user_id: 0
✅ Projets orphelins: 0
✅ Notes orphelines: 0
✅ Photos orphelines: 0
✅ Doublons: Traités
```

---

## 🎯 PROCHAINE ÉTAPE

**EXÉCUTER LE SCRIPT D'ANALYSE** :

1. Ouvrir **Supabase SQL Editor**
2. Copier/coller `sql/analyse_donnees_nettoyage.sql`
3. Exécuter
4. **Me transmettre les résultats**
5. On décide ensemble de la stratégie de nettoyage

**⚠️ NE RIEN SUPPRIMER AVANT VALIDATION**

---

**Script d'analyse prêt. Attente des résultats.** ⏸️

