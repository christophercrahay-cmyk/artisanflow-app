# 🧪 Plan de Test - Workflow Devis Refactorisé

**Date**: 16 Novembre 2025  
**Objectif**: Valider le nouveau workflow de création et signature de devis

---

## 📋 CHECKLIST DE TEST

### ✅ Préparation
- [ ] App mobile démarrée (Expo)
- [ ] Compte de test connecté
- [ ] Au moins 1 client et 1 projet existants
- [ ] Console de logs visible

---

## 🧪 TEST 1 : Création d'un nouveau devis

### Actions
1. Ouvrir l'app mobile
2. Aller dans l'onglet **Clients**
3. Sélectionner un client
4. Sélectionner un projet
5. Cliquer sur **"Générer devis IA"**
6. Enregistrer une note vocale ou utiliser des notes existantes
7. Valider la génération IA
8. Le devis est créé et vous êtes redirigé vers **EditDevisScreen**

### Résultats attendus
- ✅ Badge affiché : **"En édition"** (bleu)
- ✅ Bouton visible : **"Finaliser le devis"** (vert)
- ✅ Message d'aide : "💡 Finalisez le devis pour pouvoir l'envoyer au client"
- ✅ Pas de bouton "Générer le lien" visible

### Vérification BDD
```sql
SELECT id, numero, statut, signature_status 
FROM devis 
ORDER BY created_at DESC 
LIMIT 1;
```
**Résultat attendu**: `statut = 'edition'`, `signature_status = NULL`

---

## 🧪 TEST 2 : Finalisation du devis

### Actions
1. Depuis le devis en édition (TEST 1)
2. Vérifier qu'il y a au moins 1 ligne
3. Cliquer sur **"Finaliser le devis"**
4. Lire l'Alert de confirmation
5. Cliquer sur **"Finaliser"**
6. Attendre le rechargement

### Résultats attendus
- ✅ Toast de succès : "Devis finalisé avec succès"
- ✅ Badge change pour : **"Prêt à envoyer"** (orange)
- ✅ Bouton visible : **"Générer le lien de signature"** (bleu)
- ✅ Bouton visible : **"Revenir en édition"** (gris)
- ✅ Message d'aide : "💡 Générez le lien de signature et envoyez-le à votre client"

### Vérification BDD
```sql
SELECT id, numero, statut, statut_updated_at 
FROM devis 
WHERE id = 'DEVIS_ID_DU_TEST_1';
```
**Résultat attendu**: `statut = 'pret'`, `statut_updated_at` mis à jour

---

## 🧪 TEST 3 : Retour en édition (optionnel)

### Actions
1. Depuis le devis "prêt" (TEST 2)
2. Cliquer sur **"Revenir en édition"**
3. Lire l'Alert de confirmation
4. Cliquer sur **"Revenir en édition"**
5. Attendre le rechargement

### Résultats attendus
- ✅ Toast de succès : "Devis remis en édition"
- ✅ Badge revient à : **"En édition"** (bleu)
- ✅ Bouton visible : **"Finaliser le devis"** (vert)
- ✅ Bouton "Générer le lien" disparaît

### Vérification BDD
```sql
SELECT id, numero, statut, statut_updated_at 
FROM devis 
WHERE id = 'DEVIS_ID_DU_TEST_1';
```
**Résultat attendu**: `statut = 'edition'`, `statut_updated_at` mis à jour

**Note**: Re-finaliser le devis pour continuer les tests suivants.

---

## 🧪 TEST 4 : Génération du lien de signature

### Actions
1. Depuis le devis "prêt" (TEST 2)
2. Cliquer sur **"Générer le lien de signature"**
3. Attendre la génération
4. Lire l'Alert avec les options
5. Choisir **"Copier le lien"** ou **"Partager"**
6. Copier le lien affiché

### Résultats attendus
- ✅ Alert affichée avec 4 options : Tester, Copier, Partager, Annuler
- ✅ Lien généré format : `https://artisanflowsignatures.netlify.app/sign?devisId=XXX&token=YYY`
- ✅ Badge change pour : **"Envoyé - En attente de signature"** (bleu)
- ✅ Bouton change pour : **"Renvoyer le lien"**
- ✅ Message d'aide : "⏳ En attente de la signature du client"

### Vérification BDD
```sql
SELECT id, numero, statut, signature_status 
FROM devis 
WHERE id = 'DEVIS_ID_DU_TEST_1';

SELECT * FROM devis_signature_links 
WHERE devis_id = 'DEVIS_ID_DU_TEST_1' 
ORDER BY created_at DESC 
LIMIT 1;
```
**Résultat attendu**: 
- Devis: `statut = 'envoye'`, `signature_status = 'pending'`
- Link: `token` créé, `expires_at` dans 7 jours, `used_at = NULL`

---

## 🧪 TEST 5 : Signature par le client

### Actions
1. Copier le lien généré (TEST 4)
2. Ouvrir le lien dans un **navigateur** (pas dans l'app)
3. Vérifier que la page web s'affiche correctement
4. Entrer votre nom complet : "Test Signature"
5. Dessiner une signature dans le canvas
6. Cliquer sur **"Signer le devis"**
7. Attendre la confirmation

### Résultats attendus (page web)
- ✅ Informations du devis affichées (numéro, montant, client, projet)
- ✅ Informations de l'artisan affichées (nom, entreprise)
- ✅ Canvas de signature fonctionnel
- ✅ Message de succès après signature : "✅ Devis signé avec succès !"

### Résultats attendus (app mobile)
1. Retourner dans l'app
2. Ouvrir le devis (ou recharger EditDevisScreen)
3. Vérifier les changements :
   - ✅ Badge : **"Signé le 16/11/2025"** (vert)
   - ✅ Informations affichées : "Signé par: Test Signature"
   - ✅ Bouton visible : **"Voir le PDF signé"** (vert)
   - ✅ Pas de message d'aide

### Vérification BDD
```sql
SELECT 
  id, 
  numero, 
  statut, 
  signature_status, 
  signed_at, 
  signed_by_name,
  signature_image_url
FROM devis 
WHERE id = 'DEVIS_ID_DU_TEST_1';

SELECT * FROM devis_signature_links 
WHERE devis_id = 'DEVIS_ID_DU_TEST_1';
```
**Résultat attendu**: 
- Devis: `statut = 'signe'`, `signature_status = 'signed'`, `signed_at` rempli, `signed_by_name = 'Test Signature'`, `signature_image_url` rempli
- Link: `used_at` rempli

---

## 🧪 TEST 6 : Génération du PDF signé

### Actions
1. Depuis le devis signé (TEST 5)
2. Cliquer sur **"Voir le PDF signé"**
3. Attendre la génération
4. Le PDF s'ouvre ou est partagé

### Résultats attendus
- ✅ PDF généré sans erreur
- ✅ Section "Signé électroniquement" visible dans le PDF
- ✅ Informations du signataire affichées
- ✅ **Image de signature visible** (noire, taille 400x200px)
- ✅ Image sur une nouvelle page (pas coupée)

### Vérification logs
Chercher dans les logs :
```
✅ INFO [PDF] 🔍 Devis signé détecté
✅ INFO [PDF] 🔍 DEBUT téléchargement signature depuis URL
✅ INFO [PDF] ✅ URL signée générée
✅ INFO [PDF] 📥 Téléchargement terminé
✅ INFO [PDF] 📊 Info fichier téléchargé | size: > 1000
✅ INFO [PDF] ✅ Signature image téléchargée pour le PDF | base64Length: > 1000
```

---

## 🧪 TEST 7 : Affichage dans DocumentsScreen

### Actions
1. Retourner à l'écran principal
2. Aller dans l'onglet **"Documents"**
3. Vérifier la liste des documents
4. Tester les filtres de statut

### Résultats attendus
- ✅ Le devis de test apparaît avec le badge **"Signé"** (vert)
- ✅ Filtres disponibles : Tous, Édition, Prêt, Envoyé, Signé
- ✅ Filtre "Signé" affiche uniquement les devis signés
- ✅ Filtre "Envoyé" affiche uniquement les devis envoyés
- ✅ Filtre "Édition" affiche uniquement les devis en édition

### Vérification
Tester chaque filtre et compter le nombre de documents affichés.

---

## 🧪 TEST 8 : Workflow complet (bout en bout)

### Scénario complet
```
1. Créer un nouveau devis via IA
   → Statut: EDITION (bleu)
   
2. Éditer les lignes si nécessaire
   → Toujours en EDITION
   
3. Cliquer "Finaliser le devis"
   → Statut: PRET (orange)
   
4. Cliquer "Générer le lien de signature"
   → Statut: ENVOYE (bleu)
   
5. Ouvrir le lien dans un navigateur
   → Page web de signature
   
6. Signer le devis
   → Statut: SIGNE (vert)
   
7. Voir le PDF signé
   → PDF avec signature visible
   
8. Vérifier dans DocumentsScreen
   → Badge "Signé" affiché
```

### Durée estimée
~5 minutes pour le workflow complet

---

## 🐛 PROBLÈMES POTENTIELS

### Problème 1: Bouton "Finaliser" désactivé
**Symptôme**: Le bouton est grisé et non cliquable.

**Cause**: Le devis n'a pas de lignes (`lignes.length === 0`).

**Solution**: Ajouter au moins une ligne au devis avant de finaliser.

---

### Problème 2: Erreur "Devis déjà en statut X"
**Symptôme**: Toast d'erreur lors de la finalisation.

**Cause**: Le devis n'est pas en statut "edition".

**Solution**: Vérifier le statut dans la BDD. Si nécessaire, le corriger manuellement :
```sql
UPDATE devis SET statut = 'edition' WHERE id = 'DEVIS_ID';
```

---

### Problème 3: Badge ne change pas après finalisation
**Symptôme**: Le badge reste "En édition" après avoir cliqué sur "Finaliser".

**Cause**: Le rechargement du devis a échoué.

**Solution**: 
1. Vérifier les logs pour voir l'erreur
2. Fermer et rouvrir EditDevisScreen
3. Vérifier que le statut est bien "pret" dans la BDD

---

### Problème 4: Lien de signature ne fonctionne pas
**Symptôme**: Erreur "Lien invalide" sur la page web.

**Cause**: L'Edge Function n'a pas été redéployée correctement.

**Solution**: Redéployer l'Edge Function via le Dashboard Supabase.

---

### Problème 5: Image de signature ne s'affiche pas dans le PDF
**Symptôme**: Seul le texte "Signature" apparaît.

**Cause**: Le téléchargement de l'image a échoué.

**Solution**: Vérifier les logs pour voir :
- `📊 Info fichier téléchargé | size: ?`
- Si `size < 1000`, l'URL signée a échoué
- Vérifier que le bucket "signatures" est bien configuré

---

## 📊 CRITÈRES DE SUCCÈS

### Critique (doit fonctionner)
- ✅ Création de devis avec statut "edition"
- ✅ Finalisation change le statut en "pret"
- ✅ Génération du lien change le statut en "envoye"
- ✅ Signature change le statut en "signe"
- ✅ Affichage correct dans DocumentsScreen

### Important (devrait fonctionner)
- ✅ Retour en édition depuis "pret"
- ✅ Image de signature visible dans le PDF
- ✅ Filtres de statut fonctionnels
- ✅ Messages d'aide contextuels

### Optionnel (nice to have)
- ⚪ Notifications push lors de la signature
- ⚪ Génération automatique du PDF signé
- ⚪ Historique des changements de statut

---

## 🔍 LOGS À SURVEILLER

### Lors de la finalisation
```
✅ INFO [DevisService] Finalisation du devis
✅ SUCCESS [DevisService] Devis finalisé avec succès
```

### Lors de la génération du lien
```
✅ INFO [SignatureService] Lien de signature généré
🔗 Génération lien signature (nouvelle entrée devis_signature_links)
```

### Lors de la signature
```
📨 Edge Function - Requête reçue
📨 Edge Function - Body: { action: "sign", ... }
```

### Lors de la génération du PDF
```
✅ INFO [PDF] 🔍 Devis signé détecté
✅ INFO [PDF] 🔍 DEBUT téléchargement signature depuis URL
✅ INFO [PDF] ✅ URL signée générée
✅ INFO [PDF] 📊 Info fichier téléchargé | size: > 1000
✅ INFO [PDF] ✅ Signature image téléchargée pour le PDF | base64Length: > 1000
```

---

## 📸 CAPTURES D'ÉCRAN À FAIRE

Pour validation visuelle :

1. **EditDevisScreen - Statut "En édition"**
   - Badge bleu "En édition"
   - Bouton vert "Finaliser le devis"

2. **EditDevisScreen - Statut "Prêt"**
   - Badge orange "Prêt à envoyer"
   - Bouton bleu "Générer le lien"
   - Bouton gris "Revenir en édition"

3. **EditDevisScreen - Statut "Envoyé"**
   - Badge bleu "Envoyé - En attente de signature"
   - Bouton "Renvoyer le lien"

4. **EditDevisScreen - Statut "Signé"**
   - Badge vert "Signé le JJ/MM/AAAA"
   - Informations du signataire
   - Bouton "Voir le PDF signé"

5. **DocumentsScreen - Liste avec filtres**
   - Filtres : Tous, Édition, Prêt, Envoyé, Signé
   - Documents avec badges colorés

6. **PDF signé**
   - Section "Signé électroniquement"
   - Image de signature visible (noire, grande)
   - Sur une page séparée

---

## 🚨 EN CAS DE PROBLÈME

### Si un test échoue
1. **Noter le numéro du test** qui a échoué
2. **Copier les logs d'erreur** complets
3. **Faire une capture d'écran** de l'erreur
4. **Vérifier la BDD** avec les requêtes SQL fournies
5. **Me partager ces informations** pour diagnostic

### Rollback si nécessaire
Si le refactoring cause des problèmes critiques :

```sql
-- Revenir aux anciens statuts
UPDATE devis SET statut = 'brouillon' WHERE statut = 'edition';
UPDATE devis SET statut = 'brouillon' WHERE statut = 'pret';
-- Les statuts 'envoye' et 'signe' restent inchangés
```

Puis redéployer l'ancienne version de l'Edge Function.

---

## ✅ VALIDATION FINALE

Une fois tous les tests passés :

- [ ] Tous les tests 1-7 sont ✅
- [ ] Aucune erreur critique détectée
- [ ] Les logs sont propres
- [ ] L'UX est fluide et intuitive
- [ ] La documentation est à jour

**Si tout est OK** → Le refactoring est validé et peut être déployé en production ! 🎉

---

**Prochaine étape**: Lancer l'app et commencer les tests ! 🚀

