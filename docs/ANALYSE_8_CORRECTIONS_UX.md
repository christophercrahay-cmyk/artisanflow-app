# Analyse des 8 Corrections UX

**Date** : 2025-11-19  
**Fichier principal** : `screens/EditDevisScreen.js`

---

## ✅ CORRECTION 1 : Symbole $ → € dans le champ Prix unitaire

### 📍 Localisation
**Fichier** : `screens/EditDevisScreen.js`  
**Ligne** : 1080  
**Composant** : `LigneItem` (modal d'édition de ligne)

### 🔍 Code actuel
```1078:1091:screens/EditDevisScreen.js
              <Text style={[styles.inputLabel, { color: theme.colors.textMuted }]}>Prix unit.</Text>
              <AFInput
                icon="dollar-sign"
                value={localPrix}
                onChangeText={(text) => {
                  if (isLocked || !canEdit) return;
                  setLocalPrix(text);
                  onUpdate('prix_unitaire', parseFloat(text) || 0);
                }}
                keyboardType="numeric"
                placeholder="0.00"
                containerStyle={{ marginBottom: 0 }}
                editable={!isLocked && canEdit}
              />
```

### ❌ Problème
- `icon="dollar-sign"` affiche le symbole $ au lieu de €

### ✅ Solution
- Remplacer `icon="dollar-sign"` par un symbole € (ou retirer l'icon et utiliser un préfixe texte "€")

---

## ✅ CORRECTION 2 : Champ TVA trop petit et % redondant

### 📍 Localisation
**Fichier** : `screens/EditDevisScreen.js`  
**Lignes** : 763-779

### 🔍 Code actuel
```763:779:screens/EditDevisScreen.js
          {/* TVA */}
          <View style={[styles.section, { backgroundColor: theme.colors.surfaceAlt }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              TVA (%)
            </Text>
            <AFInput
              value={tvaPercent.toString()}
              onChangeText={(text) => {
                if (isLocked || !canEdit) return;
                const num = parseFloat(text) || 0;
                if (num >= 0 && num <= 100) {
                  setTvaPercent(num);
                  // Sauvegarder automatiquement les totaux après changement de TVA (avec délai pour laisser l'utilisateur finir de taper)
                  setTimeout(() => {
                    recalculerEtSauvegarderTotaux();
                  }, 500);
                }
              }}
```

### ❌ Problème
- Le label affiche "TVA (%)" donc le "%" est déjà dans le label
- Le champ peut être trop petit (pas de `minWidth` ou `flex` défini)
- Pas de "%" visible dans le `value`, donc OK

### ✅ Solution
- Le label "TVA (%)" est correct
- Ajouter `containerStyle={{ minWidth: 150 }}` ou `style={{ flex: 1 }}` pour agrandir le champ
- Vérifier le style `containerStyle` actuel

---

## ✅ CORRECTION 3 : Clavier cache les champs (modal édition ligne)

### 📍 Localisation
**Fichier** : `screens/EditDevisScreen.js`  
**Composant** : `LigneItem` (lignes 1006-1130)

### 🔍 Code actuel
```1029:1109:screens/EditDevisScreen.js
  return (
    <View style={[styles.ligneCard, { backgroundColor: theme.colors.surfaceAlt }]}>
      {isEditing ? (
        <>
          <AFInput
            icon="file-text"
            value={localDescription}
            onChangeText={(text) => {
              if (isLocked || !canEdit) return;
              setLocalDescription(text);
            }}
            placeholder="Description"
            multiline
            containerStyle={{ marginBottom: 12 }}
            editable={!isLocked && canEdit}
          />
          <View style={styles.ligneInputsRow}>
            {/* ... champs Qté, Unité, Prix unit. ... */}
          </View>
          <View style={styles.ligneActions}>
            {/* Boutons Valider / Supprimer */}
          </View>
        </>
      ) : (
        {/* Mode affichage */}
      )}
    </View>
  );
```

### ❌ Problème
- Le composant `LigneItem` n'a pas de `KeyboardAvoidingView` ni `ScrollView`
- Quand le clavier s'ouvre, il cache les champs

### ✅ Solution
- Wrapper le contenu `isEditing` dans `KeyboardAvoidingView` + `ScrollView`
- Ajouter `keyboardShouldPersistTaps="handled"` sur le ScrollView

---

## ✅ CORRECTION 4 : Confirmation suppression ligne

### 📍 Localisation
**Fichier** : `screens/EditDevisScreen.js`  
**Lignes** : 525-528, 530-560, 900-911

### 🔍 Code actuel
```525:528:screens/EditDevisScreen.js
  const deleteLigne = (ligneId) => {
    setLigneToDelete(ligneId);
    setShowDeleteLigneModal(true);
  };
```

```900:911:screens/EditDevisScreen.js
      <AFModal
        visible={showDeleteLigneModal}
        title="Supprimer cette ligne ?"
        message="Cette action est irréversible."
        onCancel={() => {
          setShowDeleteLigneModal(false);
          setLigneToDelete(null);
        }}
        onConfirm={confirmDeleteLigne}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        danger={true}
      />
```

### ✅ Statut
**DÉJÀ CORRIGÉ** ✅
- Il y a bien une modal de confirmation (`AFModal`)
- La fonction `deleteLigne()` ouvre la modal
- La fonction `confirmDeleteLigne()` fait la suppression réelle

### ⚠️ Action
**AUCUNE ACTION NÉCESSAIRE** - Cette correction est déjà en place

---

## ✅ CORRECTION 5 : Modal "Revenir en édition" à supprimer

### 📍 Localisation
**Fichier** : `screens/EditDevisScreen.js`  
**Lignes** : 465-467, 469-484, 700, 890-898

### 🔍 Code actuel
```465:467:screens/EditDevisScreen.js
  const handleUnfinalizeDevis = async () => {
    setShowUnfinalizeModal(true);
  };
```

```890:898:screens/EditDevisScreen.js
      <AFModal
        visible={showUnfinalizeModal}
        title="Revenir en édition ?"
        message="Le devis repassera en mode édition. Le lien de signature (si généré) restera valide."
        onCancel={() => setShowUnfinalizeModal(false)}
        onConfirm={confirmUnfinalize}
        confirmLabel="Revenir en édition"
        cancelLabel="Annuler"
      />
```

### ❌ Problème
- Le bouton "Revenir en édition" ouvre une modal inutile
- L'action devrait être directe

### ✅ Solution
- Supprimer la modal `showUnfinalizeModal`
- Modifier `handleUnfinalizeDevis` pour appeler directement `confirmUnfinalize()`
- Retirer l'état `showUnfinalizeModal` (ligne 60)

---

## ✅ CORRECTION 6 : Compteur "Actifs" sur dashboard

### 📍 Localisation
**Fichiers** : 
- `screens/CaptureHubScreen2.js` (lignes 125-131)
- `screens/DashboardScreen2.js` (lignes 111-117)

### 🔍 Code actuel

**CaptureHubScreen2.js** :
```125:131:screens/CaptureHubScreen2.js
      const active = projects?.filter((p) => 
        p.status === 'active' || 
        p.status === 'in_progress' || 
        p.status === 'pause' || 
        p.status === 'paused' || 
        !p.status  // null ou undefined = actif par défaut
      ) || [];
```

**DashboardScreen2.js** :
```111:117:screens/DashboardScreen2.js
      const active = projects?.filter((p) => 
        p.status === 'active' || 
        p.status === 'in_progress' || 
        p.status === 'pause' || 
        p.status === 'paused' || 
        !p.status  // null ou undefined = actif par défaut
      ) || [];
```

### ✅ Statut
**DÉJÀ CORRIGÉ** ✅
- Le filtre semble correct
- Il compte les projets avec status `'active'`, `'in_progress'`, `'pause'`, `'paused'`, ou `null`

### ⚠️ Action
**VÉRIFIER** : Si le compteur affiche toujours 0, le problème peut être :
1. Le champ `status` en base n'a pas les bonnes valeurs
2. Il y a un autre écran (HomeScreen) qui n'a pas été corrigé
3. Le compteur n'est pas mis à jour après chargement

**À VÉRIFIER** : Chercher d'autres écrans avec compteur "Actifs"

---

## ✅ CORRECTION 7 : Formatage numéros de téléphone

### 📍 Localisation
**Fichiers concernés** :
- `screens/DocumentsScreen2.js` (lignes 220, 238, 263, 274, 756, 771)
- `screens/ClientsListScreen2.js` (lignes 54, 104, 111, 144, 230, 248)
- Potentiellement d'autres écrans

### 🔍 Code actuel

**DocumentsScreen2.js** :
- Ligne 263 : `client_phone: d.clients?.phone || null`
- Ligne 274 : `client_phone: f.clients?.phone || null`
- Lignes 756, 771 : Utilisation de `shareDialogDocument.client_phone`

**ClientsListScreen2.js** :
- Ligne 54 : `const [phone, setPhone] = useState('');`
- Ligne 104 : `const phone = normalize(client.phone?.toString());`
- Ligne 230 : `phone: phone.trim() || null,`

### ❌ Problème
- Le fichier `utils/phoneFormatter.js` n'existe pas
- Les numéros de téléphone ne sont pas formatés à l'affichage

### ✅ Solution
1. **Créer** `utils/phoneFormatter.js` avec la fonction `formatPhoneNumber()`
2. **Appliquer** dans tous les endroits où un téléphone est affiché :
   - Liste clients
   - Détail client
   - Cartes clients
   - Devis (info client)
   - Documents (info client)

---

## ✅ CORRECTION 8 : Retirer les messages de debug restants

### 📍 Localisation
**Fichier** : `screens/EditDevisScreen.js`

### 🔍 Recherche effectuée
```bash
grep -i "Alert.alert.*DEBUG|console.log.*DEBUG|ERREUR DEBUG" screens/EditDevisScreen.js
```

### ✅ Statut
**AUCUN MESSAGE DE DEBUG TROUVÉ** ✅
- Aucun `Alert.alert('DEBUG', ...)` trouvé
- Aucun `Alert.alert('ERREUR DEBUG', ...)` trouvé
- Aucun `console.log` de debug trouvé

### ⚠️ Action
**AUCUNE ACTION NÉCESSAIRE** - Le code est propre

---

## 📋 RÉSUMÉ DES ACTIONS À EFFECTUER

| # | Correction | Statut | Action |
|---|------------|--------|--------|
| 1 | $ → € (Prix unitaire) | ❌ À corriger | Remplacer `icon="dollar-sign"` par symbole € |
| 2 | TVA agrandi + % retiré | ⚠️ À vérifier | Agrandir le champ TVA (ajouter `minWidth` ou `flex`) |
| 3 | KeyboardAvoidingView (modal ligne) | ❌ À corriger | Wrapper `LigneItem` édition dans `KeyboardAvoidingView` + `ScrollView` |
| 4 | Confirmation suppression | ✅ Déjà corrigé | **AUCUNE ACTION** |
| 5 | Modal "Revenir en édition" | ❌ À corriger | Supprimer modal, action directe |
| 6 | Compteur actifs | ⚠️ À vérifier | Vérifier si d'autres écrans ont le problème |
| 7 | Formatage téléphones | ❌ À créer | Créer `utils/phoneFormatter.js` et appliquer partout |
| 8 | Debug nettoyé | ✅ Déjà propre | **AUCUNE ACTION** |

---

## 🎯 PROCHAINES ÉTAPES

1. **Corrections simples** (1, 2, 3, 5) : Modifications directes dans `EditDevisScreen.js`
2. **Création fichier** (7) : Créer `utils/phoneFormatter.js` puis appliquer dans tous les écrans
3. **Vérification** (6) : Chercher d'autres écrans avec compteur "Actifs"

**Attente de validation avant application** ✅

