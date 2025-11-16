# 🔧 DEBUG - Génération PDF Devis

**Date** : 6 novembre 2025  
**Problème** : Crash lors de la génération de PDF

---

## ✅ CORRECTIONS APPORTÉES

### 1. Validation Robuste des Données

**Fichier** : `screens/ProjectDetailScreen.js`

**Ajouts** :
- ✅ Validation `client` existe
- ✅ Validation `project` existe
- ✅ Validation `pdfLines` est un array
- ✅ Validation au moins 1 ligne valide
- ✅ Logs détaillés à chaque étape
- ✅ Messages d'erreur clairs

**Exemple de logs** :
```
✅ INFO [ProjectDetail] handleGeneratePDF appelé
✅ INFO [ProjectDetail] Début génération PDF | {"projectId":"xxx","clientId":"yyy"}
✅ INFO [ProjectDetail] Company préparé | {"name":"Mon Entreprise",...}
✅ INFO [ProjectDetail] ClientData préparé | {"name":"Dupont",...}
✅ INFO [ProjectDetail] ProjectData préparé | {"title":"Rénovation",...}
✅ INFO [ProjectDetail] Lignes préparées | {"total":1,"valides":1,...}
✅ INFO [ProjectDetail] Appel generateDevisPDF...
```

---

### 2. Protection dans generateDevisPDF

**Fichier** : `utils/utils/pdf.js`

**Ajouts** :
- ✅ Validation paramètres (company, client, project, lignes)
- ✅ Try-catch autour de `Print.printToFileAsync`
- ✅ Validation résultat `printResult.uri` existe
- ✅ Logs à chaque étape critique
- ✅ Propagation erreurs avec messages clairs

**Exemple de logs** :
```
✅ INFO [PDF] generateDevisPDF appelé | {"hasCompany":true,"hasClient":true,...}
✅ INFO [PDF] Génération devis DE-2025-1234
✅ INFO [PDF] Construction HTML...
✅ INFO [PDF] HTML construit | {"htmlLength":8542}
✅ INFO [PDF] Appel Print.printToFileAsync...
✅ SUCCESS [PDF] PDF local créé: file:///...
✅ INFO [PDF] Début upload: devis/xxx/DE-2025-1234.pdf
✅ SUCCESS [PDF] Upload réussi
```

---

## 🧪 COMMENT TESTER

### Étape 1 : Ouvrir le Terminal Expo

Dans le terminal où tourne `npm run start:tunnel`, vous verrez maintenant des logs détaillés.

### Étape 2 : Essayer de Générer un PDF

1. Aller sur un chantier dans l'app
2. Cliquer sur "Générer PDF" ou ouvrir le formulaire de devis
3. Remplir au moins une ligne
4. Cliquer "Générer PDF"

### Étape 3 : Regarder les Logs

**Si ça marche** :
```
✅ INFO [ProjectDetail] handleGeneratePDF appelé
✅ INFO [PDF] generateDevisPDF appelé
✅ INFO [PDF] HTML construit
✅ SUCCESS [PDF] PDF local créé
✅ SUCCESS [PDF] Upload réussi
✅ SUCCESS [ProjectDetail] PDF généré
```

**Si ça plante** :
```
✅ INFO [ProjectDetail] handleGeneratePDF appelé
🔴 ERROR [ProjectDetail] Client manquant

OU

✅ INFO [PDF] Appel Print.printToFileAsync...
🔴 ERROR [PDF] Erreur Print.printToFileAsync | {"message":"..."}
```

---

## 🔍 ERREURS POSSIBLES ET SOLUTIONS

### Erreur 1 : "Client ou chantier introuvable"

**Cause** : Le state `client` ou `project` est null

**Solution** :
1. Vérifier que vous êtes bien sur la page d'un chantier
2. Recharger la page du chantier
3. Vérifier les logs :
   ```
   🔴 ERROR [ProjectDetail] Client manquant | {"client":null}
   ```

---

### Erreur 2 : "Ajoutez au moins une ligne au devis"

**Cause** : Le formulaire `pdfLines` est vide ou toutes les lignes sont invalides

**Solution** :
1. Ajouter au moins une ligne avec :
   - Désignation (ex: "Main d'œuvre")
   - Quantité (ex: 1)
   - Prix unitaire HT (ex: 300)
2. Vérifier les logs :
   ```
   ✅ INFO [ProjectDetail] Lignes préparées | {"total":1,"valides":0}
   ```

---

### Erreur 3 : "Impossible de créer le PDF: ..."

**Cause** : `Print.printToFileAsync` a échoué (module expo-print)

**Solutions possibles** :
1. **Problème de permissions** :
   - Android : Vérifier permission "Stockage"
   - iOS : Vérifier permission "Fichiers"

2. **Module manquant** :
   ```bash
   npm install expo-print
   ```

3. **Rebuild l'app** :
   ```bash
   npx expo prebuild --clean
   npm run android
   # ou
   npm run ios
   ```

4. **Logs à chercher** :
   ```
   🔴 ERROR [PDF] Erreur Print.printToFileAsync | {"message":"..."}
   ```

---

### Erreur 4 : "Upload échoué : ... bucket 'docs' ..."

**Cause** : Le bucket Supabase `docs` n'existe pas ou n'est pas configuré

**Solution** :
1. Aller dans Supabase → Storage
2. Créer un bucket `docs` :
   - Public : ✅ OUI
   - File size limit : 50MB
3. Configurer les policies RLS :
   ```sql
   -- Lecture publique
   CREATE POLICY "Public read" ON storage.objects
   FOR SELECT USING (bucket_id = 'docs');
   
   -- Écriture authentifiée
   CREATE POLICY "Authenticated upload" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'docs' AND
     auth.role() = 'authenticated'
   );
   ```

4. **Logs à chercher** :
   ```
   🔴 ERROR [PDF] Erreur upload | {"message":"Bucket not found"}
   ```

---

### Erreur 5 : Crash sans message

**Cause** : Exception non attrapée quelque part

**Solution** :
1. Regarder TOUS les logs dans le terminal
2. Chercher le DERNIER log avant le crash :
   ```
   ✅ INFO [PDF] Appel Print.printToFileAsync...
   [CRASH ICI]
   ```
3. L'erreur est probablement dans `Print.printToFileAsync`
4. Copier/coller TOUS les logs et me les envoyer

---

## 📝 CHECKLIST DE DÉBOGAGE

Avant de générer un PDF, vérifier :

- [ ] Le chantier est bien chargé (nom affiché en haut)
- [ ] Le client est lié au chantier (nom client affiché)
- [ ] Au moins 1 ligne dans le formulaire devis
- [ ] La ligne a : désignation + quantité + prix
- [ ] Le terminal Expo est ouvert pour voir les logs
- [ ] Le bucket `docs` existe dans Supabase Storage

---

## 🚀 TESTEZ MAINTENANT

1. **Rechargez l'app** :
   - Secouez le téléphone → Reload
   - OU relancer `npm run start:tunnel`

2. **Ouvrez un chantier**

3. **Cliquez "Générer PDF"** (ou accédez au formulaire)

4. **Remplissez le formulaire** :
   - Nom entreprise : Mon Entreprise
   - Au moins 1 ligne :
     - Désignation : Test
     - Quantité : 1
     - Prix : 100

5. **Cliquez "Générer PDF"**

6. **Regardez le terminal** pour les logs

---

## 📊 SI ÇA PLANTE ENCORE

**Copiez-moi TOUS les logs du terminal depuis** :
```
✅ INFO [ProjectDetail] handleGeneratePDF appelé
```
**Jusqu'au message d'erreur.**

**Incluez aussi** :
- La version d'Expo (`expo --version`)
- Le type d'appareil (Android/iOS, émulateur/physique)
- Le message d'erreur exact affiché dans l'app

---

**Avec ces logs détaillés, on pourra identifier exactement où ça plante !** 🔍

