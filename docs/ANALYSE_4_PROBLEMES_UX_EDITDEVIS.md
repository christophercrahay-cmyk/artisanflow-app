# Analyse des 4 Problèmes UX dans EditDevisScreen

**Date** : 2025-11-19  
**Fichier** : `screens/EditDevisScreen.js`

---

## ✅ PROBLÈME 1 : Section TVA étriquée et redondante

### 📍 Localisation
**Lignes 710-729**

### 🔍 Code actuel
```javascript
{/* TVA */}
<View style={[styles.section, { backgroundColor: theme.colors.surfaceAlt }]}>
  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
    TVA (%)  ← % dans le label
  </Text>
  <AFInput
    icon="percent"  ← Icône % qui affiche aussi un %
    value={tvaPercent.toString()}
    onChangeText={(text) => {
      if (isLocked || !canEdit) return;
      const num = parseFloat(text) || 0;
      if (num >= 0 && num <= 100) {
        setTvaPercent(num);
      }
    }}
    keyboardType="numeric"
    placeholder="20"
    containerStyle={{ marginBottom: 0 }}  ← Pas de style width/flex pour agrandir
    editable={!isLocked && canEdit}
  />
</View>
```

### ❌ Problèmes identifiés
1. **Redondance** : Le label dit "TVA (%)" ET l'icône est "percent" → double affichage du %
2. **Champ étroit** : Pas de style `width` ou `flex` pour agrandir le champ
3. **Icône redondante** : L'icône `percent` affiche un % alors que le label contient déjà "%"

### ✅ Solution proposée
- Retirer l'icône `percent` (ou la remplacer par une icône neutre comme `hash` ou `type`)
- Le label "TVA (%)" est suffisant
- Ajouter un style pour agrandir le champ (ex: `style={{ flex: 1 }}` ou `width: '100%'`)

---

## ✅ PROBLÈME 2 : Symbole $ au lieu de €

### 📍 Localisation
**Ligne 1024** dans le composant `LigneItem`

### 🔍 Code actuel
```javascript
<View style={styles.inputGroup}>
  <Text style={[styles.inputLabel, { color: theme.colors.textMuted }]}>Prix unit.</Text>
  <AFInput
    icon="dollar-sign"  ← ❌ Icône dollar au lieu d'euro
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
</View>
```

### ❌ Problème identifié
- L'icône `dollar-sign` affiche un symbole $ alors que l'application est française et utilise l'euro (€)

### ✅ Solution proposée
- **Option A** : Retirer l'icône et afficher "€" dans le placeholder ou comme préfixe texte
- **Option B** : Utiliser une icône neutre comme `tag` ou `hash` (Feather n'a pas d'icône euro)
- **Option C** : Créer un composant personnalisé qui affiche "€" comme préfixe au lieu d'une icône

**Recommandation** : Option A ou C (afficher "€" comme préfixe texte)

---

## ✅ PROBLÈME 3 : Suppression ligne immédiate (non annulable)

### 📍 Localisation
**Lignes 1047** (bouton supprimer) et **480-509** (fonction deleteLigne)

### 🔍 Code actuel
```javascript
// Ligne 1047 - Bouton supprimer dans LigneItem
<TouchableOpacity
  onPress={onDelete}  ← Appelle directement onDelete
  style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
>
  <Feather name="trash-2" size={18} color="#FFFFFF" />
</TouchableOpacity>

// Lignes 480-509 - Fonction deleteLigne
const deleteLigne = (ligneId) => {
  setLigneToDelete(ligneId);
  setShowDeleteLigneModal(true);  ← Ouvre une modal de confirmation
};

const confirmDeleteLigne = async () => {
  const ligneId = ligneToDelete;
  setShowDeleteLigneModal(false);
  setLigneToDelete(null);

  // Si c'est une ligne temporaire, juste la retirer de la liste
  if (ligneId.startsWith('temp-')) {
    setLignes(lignes.filter(l => l.id !== ligneId));  ← ⚠️ Suppression immédiate pour temp
    return;
  }

  // Sinon, supprimer de la base
  try {
    const { error } = await supabase
      .from('devis_lignes')
      .delete()
      .eq('id', ligneId);

    if (error) throw error;
    setLignes(lignes.filter(l => l.id !== ligneId));  ← ⚠️ Suppression immédiate
    showSuccess('Ligne supprimée');
  } catch (error) {
    showError(getErrorMessage(error, 'delete'));
  }
};

// Lignes 844-856 - Modal de confirmation
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

### ❌ Problèmes identifiés
1. **Confirmation existe MAIS** : La modal de confirmation existe (ligne 844), donc le problème n'est peut-être pas la confirmation manquante
2. **Suppression immédiate après confirmation** : Une fois confirmé, la ligne est supprimée immédiatement de la liste ET de la base, même si l'utilisateur quitte sans sauvegarder le devis
3. **Pas de rollback** : Si l'utilisateur clique "Supprimer" dans la modal puis quitte sans "Enregistrer" le devis, la ligne est quand même supprimée

### ✅ Solution proposée
- **Option A (Recommandée)** : Garder la confirmation mais améliorer le message pour indiquer qu'il faut sauvegarder après
- **Option B** : Marquer la ligne comme "à supprimer" et ne la supprimer réellement qu'au moment de "Enregistrer" le devis (plus complexe)

**Recommandation** : Option A - Améliorer le message de la modal existante

---

## ✅ PROBLÈME 4 : Clavier cache les champs

### 📍 Localisation
**Lignes 973-1053** - Composant `LigneItem` (section d'édition)

### 🔍 Code actuel
```javascript
// Ligne 973 - Structure du LigneItem
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
          {/* 3 champs : Qté, Unité, Prix unit. */}
        </View>
        <View style={styles.ligneActions}>
          {/* Boutons Valider et Supprimer */}
        </View>
      </>
    ) : (
      // Mode affichage
    )}
  </View>
);
```

### ❌ Problème identifié
- Le composant `LigneItem` est un simple `<View>` sans `KeyboardAvoidingView` ni `ScrollView`
- Quand le clavier s'ouvre (notamment pour le champ "Description" multiline), il peut cacher les champs en bas
- Le `KeyboardAvoidingView` existe au niveau parent (ligne 528) mais ne protège pas les modals/éléments flottants

### ✅ Solution proposée
- Wrapper la section d'édition dans un `KeyboardAvoidingView` ou `ScrollView`
- Ajouter `keyboardShouldPersistTaps="handled"` si ScrollView
- Augmenter le `paddingBottom` du conteneur pour laisser de l'espace au clavier

---

## 📋 RÉSUMÉ DES MODIFICATIONS À FAIRE

| Problème | Lignes | Action |
|----------|--------|--------|
| **1. TVA étriquée** | 715-727 | Retirer `icon="percent"`, agrandir le champ |
| **2. Symbole $** | 1024 | Remplacer `icon="dollar-sign"` par préfixe "€" ou icône neutre |
| **3. Suppression immédiate** | 1047, 480-509 | Améliorer le message de confirmation (déjà présent) |
| **4. Clavier cache champs** | 973-1053 | Wrapper dans KeyboardAvoidingView/ScrollView |

---

**Attente de validation avant modification** ✅

