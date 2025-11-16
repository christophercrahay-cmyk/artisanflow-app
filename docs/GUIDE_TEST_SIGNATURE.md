# 🧪 Guide de Test - Signature Électronique

## ✅ Prérequis (vérifier avant de tester)

### 1. Migration SQL exécutée
- ✅ Ouvrir Supabase Dashboard → SQL Editor
- ✅ Exécuter le fichier `sql/add_signature_devis.sql`
- ✅ Vérifier que la table `devis` a les colonnes : `signature_token`, `signature_status`, `signed_at`, `signed_by_name`, `signed_by_email`
- ✅ Vérifier que la table `devis_signatures` existe

### 2. Dépendances installées
```bash
npx expo install react-native-webview
```

### 3. App redémarrée
```bash
npm start
# Puis relancer l'app sur votre device/émulateur
```

---

## 🎯 Test Complet - Étape par Étape

### **Étape 1 : Créer ou Ouvrir un Devis**

1. **Dans l'app ArtisanFlow** :
   - Ouvrir un projet existant
   - Créer un nouveau devis OU ouvrir un devis existant
   - Aller dans l'écran d'édition du devis (`EditDevisScreen`)

2. **Vérifier** :
   - Le devis doit avoir au moins une ligne
   - Le montant doit être calculé

---

### **Étape 2 : Générer le Lien de Signature**

1. **Dans l'écran d'édition du devis** :
   - Scroller jusqu'à la section **"Signature électronique"**
   - Vous devriez voir un badge **"En attente de signature"** (orange/jaune)
   - Cliquer sur le bouton **"Générer le lien de signature"**

2. **Résultat attendu** :
   - Une alerte s'affiche avec le lien de signature
   - Format du lien : `https://artisanflow.app/sign/[devisId]/[token]`
   - **Copier ce lien** (vous en aurez besoin)

3. **Vérifier dans Supabase** :
   - Aller dans Table Editor → `devis`
   - Trouver votre devis
   - Vérifier que `signature_token` est rempli
   - Vérifier que `signature_status` = `'pending'`

---

### **Étape 3 : Ouvrir l'Écran de Signature**

**Option A : Navigation manuelle dans l'app (pour test rapide)**

1. **Dans l'app** :
   - Extraire le `devisId` et le `token` du lien généré
   - Exemple : si le lien est `https://artisanflow.app/sign/abc123/xyz789`
     - `devisId` = `abc123`
     - `token` = `xyz789`

2. **Naviguer manuellement** :
   - Dans votre code de navigation, ajouter temporairement un bouton de test :
   ```javascript
   navigation.navigate('SignDevis', { 
     devisId: 'abc123', // Remplacez par votre devisId
     token: 'xyz789'     // Remplacez par votre token
   });
   ```

**Option B : Utiliser le lien directement (si deep links configurés)**

1. **Copier le lien** généré à l'étape 2
2. **Ouvrir le lien** :
   - Sur le même appareil : ouvrir dans un navigateur
   - Sur un autre appareil : envoyer par SMS/Email et ouvrir
   - L'app devrait s'ouvrir automatiquement sur l'écran de signature

---

### **Étape 4 : Signer le Devis**

1. **Sur l'écran de signature** (`SignDevisScreen`) :
   - Vous devriez voir :
     - Le titre "Signature du devis"
     - Les informations du devis (numéro, client, montant)
     - Un formulaire avec :
       - Champ "Votre nom complet"
       - Champ "Votre email"
       - Checkbox "Je reconnais avoir lu et accepté le devis"
       - Zone de signature (canvas blanc)

2. **Remplir le formulaire** :
   - ✅ Entrer votre nom : `Test Client`
   - ✅ Entrer votre email : `test@example.com`
   - ✅ Cocher la checkbox
   - ✅ Signer dans la zone de signature (dessiner avec le doigt/stylo)

3. **Cliquer sur "Signer le devis"** :
   - Le bouton doit être activé (bleu) si tout est rempli
   - Attendre la confirmation

4. **Résultat attendu** :
   - Écran de succès : "Devis signé avec succès !"
   - Message : "Merci d'avoir signé ce devis. Une copie sera envoyée à l'artisan."

---

### **Étape 5 : Vérifier la Signature dans l'App**

1. **Retourner dans l'app ArtisanFlow** :
   - Aller dans l'écran d'édition du devis (`EditDevisScreen`)
   - Scroller jusqu'à la section "Signature électronique"

2. **Vérifications** :
   - ✅ Badge doit être **"✅ Signé le [date]"** (vert)
   - ✅ Afficher les informations :
     - "Signé par : Test Client"
     - "Email : test@example.com"
   - ✅ Bouton **"Voir le PDF signé"** doit être visible

---

### **Étape 6 : Vérifier le PDF Signé**

1. **Cliquer sur "Voir le PDF signé"** :
   - Le PDF doit se générer
   - Le PDF doit s'ouvrir dans le partage natif

2. **Vérifier le contenu du PDF** :
   - ✅ Toutes les lignes du devis doivent être présentes
   - ✅ En bas du PDF, il doit y avoir un **encadré "Signé électroniquement"** avec :
     - "Signé par : Test Client"
     - "Email : test@example.com"
     - "Le : [date et heure]"
     - **L'image de la signature** (dessin que vous avez fait)

---

### **Étape 7 : Vérifier dans Supabase**

1. **Table `devis`** :
   - Trouver votre devis
   - Vérifier :
     - ✅ `signature_status` = `'signed'`
     - ✅ `signed_at` = date/heure de la signature
     - ✅ `signed_by_name` = `'Test Client'`
     - ✅ `signed_by_email` = `'test@example.com'`

2. **Table `devis_signatures`** :
   - Trouver l'entrée correspondant à votre devis (`devis_id`)
   - Vérifier :
     - ✅ `signer_name` = `'Test Client'`
     - ✅ `signer_email` = `'test@example.com'`
     - ✅ `signature_image_base64` contient une longue chaîne base64 (image de la signature)
     - ✅ `signed_at` = date/heure de la signature

---

## 🐛 Tests de Cas Limites

### **Test 1 : Lien Invalide**
- Essayer d'ouvrir `SignDevis` avec un `token` incorrect
- **Résultat attendu** : Message d'erreur "Lien de signature invalide"

### **Test 2 : Devis Déjà Signé**
- Générer un lien de signature
- Signer le devis une première fois
- Essayer de signer à nouveau avec le même lien
- **Résultat attendu** : Message "Ce devis a déjà été signé"

### **Test 3 : Formulaire Incomplet**
- Essayer de signer sans remplir le nom
- **Résultat attendu** : Message "Veuillez saisir votre nom complet"
- Essayer de signer sans email valide
- **Résultat attendu** : Message "Veuillez saisir une adresse email valide"
- Essayer de signer sans cocher la checkbox
- **Résultat attendu** : Message "Veuillez accepter les conditions"
- Essayer de signer sans dessiner de signature
- **Résultat attendu** : Message "Veuillez signer le document"

---

## 📱 Test sur Plusieurs Appareils

### **Scénario : Artisan → Client**

1. **Sur l'appareil de l'artisan** :
   - Générer le lien de signature
   - Copier le lien
   - Envoyer par SMS/Email à un autre appareil

2. **Sur l'appareil du client** :
   - Ouvrir le lien reçu
   - Signer le devis

3. **Retour sur l'appareil de l'artisan** :
   - Rafraîchir l'écran du devis
   - Vérifier que le statut est passé à "Signé"

---

## ✅ Checklist de Validation

- [ ] Migration SQL exécutée
- [ ] `react-native-webview` installé
- [ ] Lien de signature généré avec succès
- [ ] Écran de signature s'affiche correctement
- [ ] Formulaire de signature fonctionne
- [ ] Signature enregistrée avec succès
- [ ] Statut du devis mis à jour dans l'app
- [ ] PDF signé généré avec la signature visible
- [ ] Données correctes dans Supabase (`devis` et `devis_signatures`)

---

## 🚨 Problèmes Courants

### **"Écran noir" ou crash sur SignDevisScreen**
→ Vérifier que `react-native-webview` est bien installé et l'app redémarrée

### **"Lien invalide" même avec le bon token**
→ Vérifier que le `devisId` et le `token` sont bien passés en paramètres

### **Le PDF ne contient pas la signature**
→ Vérifier que `signature_status = 'signed'` dans Supabase
→ Vérifier que `devis_signatures` contient bien une entrée avec `signature_image_base64`

### **Le bouton "Signer" reste désactivé**
→ Vérifier que tous les champs sont remplis :
  - Nom non vide
  - Email valide (format @)
  - Checkbox cochée
  - Signature dessinée (au moins un trait)

---

## 💡 Astuce pour Tester Rapidement

Pour tester sans configurer les deep links :

1. Générer le lien dans l'app
2. Extraire `devisId` et `token` du lien
3. Ajouter temporairement un bouton de test dans votre écran :
```javascript
<TouchableOpacity
  onPress={() => {
    navigation.navigate('SignDevis', {
      devisId: 'VOTRE_DEVIS_ID',
      token: 'VOTRE_TOKEN'
    });
  }}
>
  <Text>Test Signature</Text>
</TouchableOpacity>
```

---

## 📞 Support

Si vous rencontrez un problème :
1. Vérifier les logs dans la console Metro
2. Vérifier les données dans Supabase
3. Vérifier que toutes les migrations SQL sont exécutées
4. Vérifier que `react-native-webview` est installé

