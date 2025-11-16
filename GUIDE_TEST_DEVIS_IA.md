# 🧪 GUIDE DE TEST - MODULE DEVIS IA

## 📋 Checklist de test complète

### ✅ PRÉPARATION

#### 1. Vérifier les tables Supabase
Exécuter dans le SQL Editor de Supabase :

```sql
-- Vérifier que devis_lignes existe
SELECT COUNT(*) FROM devis_lignes;

-- Vérifier que company_settings existe
SELECT * FROM company_settings LIMIT 1;

-- Si company_settings est vide, insérer des données de test
INSERT INTO company_settings (user_id, company_name, siret, address, phone, email)
VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Mon Entreprise Test',
  '123 456 789 00012',
  '123 Rue de Test, 75001 Paris',
  '01 23 45 67 89',
  'contact@test.fr'
);
```

#### 2. Vérifier le bucket Supabase Storage
- Aller dans **Storage** > **Buckets**
- Vérifier que le bucket `docs` existe
- S'il n'existe pas, le créer et le rendre **public**

#### 3. Redéployer l'Edge Function
```bash
cd supabase/functions
supabase functions deploy ai-devis-conversational
```

#### 4. Vérifier les variables d'environnement
Dans Supabase > **Edge Functions** > **Secrets** :
- `OPENAI_API_KEY` : doit être définie

---

### 🧪 TEST 1 : LISIBILITÉ DES CHAMPS

**Objectif** : Vérifier que les champs de saisie sont lisibles sur mobile (thème sombre)

**Étapes** :
1. Ouvrir l'app sur le téléphone
2. Aller dans un projet
3. Cliquer sur **"Générer devis IA"**
4. Attendre que l'IA génère le devis et pose des questions
5. Essayer de taper du texte dans un champ de réponse

**Critères de succès** :
- ✅ Le texte tapé est **visible** (couleur claire sur fond foncé)
- ✅ Le placeholder est **lisible** (gris moyen)
- ✅ La bordure du champ est **visible** (gris foncé)
- ✅ Le champ a une **hauteur confortable** (pas trop petit)
- ✅ Le clavier ne cache pas le texte
- ✅ Le scroll fonctionne si le clavier est ouvert

---

### 🧪 TEST 2 : QUESTIONS IA GÉNÉRIQUES

**Objectif** : Vérifier que l'IA pose des questions génériques adaptées à tous métiers

**Étapes** :
1. Enregistrer une note vocale générique, par exemple :
   - *"Je dois faire une installation électrique dans un appartement"*
   - *"Je dois repeindre un salon"*
   - *"Je dois installer une cuisine"*
2. Cliquer sur **"Générer devis IA"**
3. Attendre la réponse de l'IA

**Critères de succès** :
- ✅ L'IA pose des **questions pertinentes** (type de prestation, quantités, contraintes, etc.)
- ✅ Les questions sont **génériques** (pas spécifiques à un seul métier)
- ✅ Maximum **5 questions** par tour
- ✅ Si assez d'infos, l'IA ne pose **aucune question** et génère directement le devis

**Exemples de questions attendues** :
- "Quel est le type exact de prestation ?"
- "Pouvez-vous préciser les quantités pour chaque élément ?"
- "Y a-t-il des contraintes particulières ?"
- "Le matériel/fournitures sont-ils inclus ou fournis par le client ?"
- "Quel est le délai souhaité pour la réalisation ?"

---

### 🧪 TEST 3 : RÉPONSES TEXTE ET VOCAL

**Objectif** : Vérifier que les deux modes de réponse fonctionnent

**Étapes** :
1. Après que l'IA ait posé des questions, essayer de répondre en **mode texte** :
   - Taper une réponse dans le champ
   - Vérifier que le texte est bien visible
2. Essayer de répondre en **mode vocal** :
   - Cliquer sur le bouton "Vocal"
   - Cliquer sur "Appuyez pour répondre"
   - Enregistrer une réponse vocale
   - Vérifier que la transcription s'affiche

**Critères de succès** :
- ✅ Le **mode texte** fonctionne (saisie, affichage, validation)
- ✅ Le **mode vocal** fonctionne (enregistrement, transcription, affichage)
- ✅ Les deux modes peuvent être **alternés** pour différentes questions
- ✅ Le bouton "Envoyer" est **actif** seulement si toutes les questions ont une réponse

---

### 🧪 TEST 4 : GÉNÉRATION DEVIS + STOCKAGE

**Objectif** : Vérifier que le devis est bien créé dans la BDD avec lignes structurées

**Étapes** :
1. Répondre à toutes les questions de l'IA
2. Cliquer sur **"Envoyer"**
3. Attendre la mise à jour du devis
4. Si status = "ready", cliquer sur **"Créer le devis (brouillon)"**
5. Vérifier dans Supabase :

```sql
-- Récupérer le dernier devis créé
SELECT * FROM devis ORDER BY created_at DESC LIMIT 1;

-- Récupérer ses lignes
SELECT * FROM devis_lignes WHERE devis_id = '<id_du_devis>' ORDER BY ordre;
```

**Critères de succès** :
- ✅ Le devis est créé dans la table `devis`
- ✅ Les lignes sont créées dans `devis_lignes` avec :
  - `description` remplie
  - `quantite` > 0
  - `unite` appropriée (unité, m², forfait, etc.)
  - `prix_unitaire` > 0
  - `prix_total` = quantite × prix_unitaire
  - `ordre` séquentiel (1, 2, 3, etc.)
- ✅ Le `montant_ht` du devis = somme des `prix_total` des lignes
- ✅ Le `montant_ttc` = montant_ht × (1 + tva_percent/100)

---

### 🧪 TEST 5 : AFFICHAGE DANS LA LISTE

**Objectif** : Vérifier que le devis s'affiche correctement dans la liste

**Étapes** :
1. Après création du devis, fermer la modal
2. Scroller dans la page du projet jusqu'à la section **"📋 Devis"**
3. Vérifier que le devis créé apparaît dans la liste

**Critères de succès** :
- ✅ Le devis apparaît avec son **numéro** (ex: DE-2025-0001)
- ✅ Le **montant TTC** affiché correspond au montant calculé
- ✅ Le **statut** est "Brouillon"
- ✅ Un **bouton "👁️ PDF"** est visible à droite

---

### 🧪 TEST 6 : GÉNÉRATION PDF

**Objectif** : Vérifier que le PDF est généré avec les vraies lignes et totaux

**Étapes** :
1. Dans la liste des devis, cliquer sur le bouton **"👁️ PDF"**
2. Attendre la génération du PDF (quelques secondes)
3. Le PDF devrait s'ouvrir ou proposer un partage

**Critères de succès** :
- ✅ Le PDF est **généré sans erreur**
- ✅ Le PDF contient :
  - Bloc **Entreprise** (nom, SIRET, adresse, téléphone, email)
  - Bloc **Destinataire** (client)
  - Bloc **Chantier** (projet)
  - **Tableau des lignes** avec toutes les lignes du devis
  - **Totaux** : Total HT, TVA XX%, Total TTC
  - **Mentions légales** et zone signature
- ✅ Les **montants sont corrects** (pas de 0,00 €)
- ✅ Le **nombre de lignes** correspond à ce qui est dans la BDD
- ✅ Le PDF peut être **partagé** (WhatsApp, email, etc.)

**Vérification visuelle du PDF** :
- Ouvrir le PDF et vérifier ligne par ligne
- Recalculer manuellement : Total HT = somme des lignes
- Vérifier : TVA = Total HT × 20%
- Vérifier : Total TTC = Total HT + TVA

---

### 🧪 TEST 7 : CAS LIMITES

#### Test 7.1 : Devis sans lignes
**Étapes** :
1. Créer un devis "à l'ancienne" (sans passer par l'IA)
2. Essayer de cliquer sur "👁️ PDF"

**Résultat attendu** :
- ✅ Message d'erreur : "Ce devis ne contient pas de lignes détaillées"
- ✅ Suggestion d'utiliser le bouton "Générer devis IA"

#### Test 7.2 : Note vocale très courte
**Étapes** :
1. Enregistrer une note vocale très courte : *"Prise électrique"*
2. Générer le devis IA

**Résultat attendu** :
- ✅ L'IA pose des **questions de clarification** (quantité, type, etc.)
- ✅ Pas de génération de devis incomplet

#### Test 7.3 : Note vocale très détaillée
**Étapes** :
1. Enregistrer une note vocale très détaillée :
   *"Je dois installer 8 prises électriques encastrées, 3 interrupteurs simples, et 2 points lumineux dans un salon de 25m². Le client fournit le matériel. Délai : 2 jours."*
2. Générer le devis IA

**Résultat attendu** :
- ✅ L'IA génère un devis **complet sans poser de questions** (status = "ready")
- ✅ Le devis contient **3 lignes** (prises, interrupteurs, lumineux)
- ✅ Les **quantités** sont correctes (8, 3, 2)

---

### 🧪 TEST 8 : WORKFLOW COMPLET (E2E)

**Scénario complet** :
1. Créer un nouveau client "Client Test"
2. Créer un nouveau projet "Projet Test" pour ce client
3. Enregistrer 2-3 notes vocales sur le projet
4. Cliquer sur "Générer devis IA"
5. Répondre aux questions (mix texte + vocal)
6. Valider le devis
7. Vérifier dans la liste des devis
8. Générer le PDF
9. Partager le PDF par WhatsApp

**Critères de succès** :
- ✅ Aucune erreur à aucune étape
- ✅ Le devis est créé avec toutes les lignes
- ✅ Le PDF est correct et partageable
- ✅ Le workflow est **fluide** et **intuitif**

---

## 🐛 PROBLÈMES CONNUS ET SOLUTIONS

### Problème 1 : "Network request failed"
**Cause** : L'Edge Function n'est pas accessible  
**Solution** : Vérifier que l'URL dans `services/aiConversationalService.js` est correcte

### Problème 2 : "Aucune ligne de devis trouvée"
**Cause** : Le devis n'a pas de lignes dans `devis_lignes`  
**Solution** : Vérifier que `createDevisFromAI` insère bien les lignes

### Problème 3 : PDF avec montants à 0,00 €
**Cause** : Les lignes ne sont pas récupérées correctement  
**Solution** : Vérifier que `generateDevisPDFFromDB` récupère bien les lignes avec `supabase.from('devis_lignes')`

### Problème 4 : Champs de saisie illisibles
**Cause** : Thème sombre avec mauvais contraste  
**Solution** : Vérifier que les styles dans `DevisAIGenerator.js` utilisent bien `#E5E5E5` pour le texte et `#222` pour le fond

---

## 📊 RAPPORT DE TEST

Après avoir effectué tous les tests, remplir ce tableau :

| Test | Status | Commentaires |
|------|--------|--------------|
| 1. Lisibilité des champs | ⬜ | |
| 2. Questions IA génériques | ⬜ | |
| 3. Réponses texte et vocal | ⬜ | |
| 4. Génération devis + stockage | ⬜ | |
| 5. Affichage dans la liste | ⬜ | |
| 6. Génération PDF | ⬜ | |
| 7. Cas limites | ⬜ | |
| 8. Workflow complet E2E | ⬜ | |

**Légende** : ✅ OK | ⚠️ Problème mineur | ❌ Bloquant

---

**Date de test** : ___________  
**Testeur** : ___________  
**Version** : 1.1.0

