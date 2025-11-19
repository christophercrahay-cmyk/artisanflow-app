# ÉTAPE 3 : PROTECTION EditDevisScreen ✅

**Date** : 2025-11-16  
**Statut** : ✅ TERMINÉE - EN ATTENTE VALIDATION  
**Objectif** : Ajouter les vérifications de statut dans EditDevisScreen pour bloquer la modification des devis verrouillés

---

## 📝 MODIFICATIONS APPORTÉES

### 1. Import des fonctions de vérification

**Fichier** : `screens/EditDevisScreen.js` (ligne 32-40)

```javascript
import { 
  canEditDevis, 
  isDevisLocked, 
  requiresEditWarning,
  getDevisLockMessage,
  getDevisEditWarningMessage 
} from '../utils/devisRules';
```

### 2. Ajout des variables de vérification

**Fichier** : `screens/EditDevisScreen.js` (ligne 62-71)

```javascript
// Vérifier si le devis est verrouillé (pour désactiver les champs)
const isLocked = useMemo(() => {
  return devis ? isDevisLocked(devis.statut) : false;
}, [devis]);

// Vérifier si le devis peut être modifié
const canEdit = useMemo(() => {
  return devis ? canEditDevis(devis.statut) : false;
}, [devis]);
```

### 3. Vérification au chargement du devis

**Fichier** : `screens/EditDevisScreen.js` (ligne 124-184)

**Comportement** :
- Si `isDevisLocked(devis.statut)` → Affiche une alerte avec message + bouton "Retour" + bouton "Dupliquer"
- Si `requiresEditWarning(devis.statut)` → Affiche un warning avec confirmation avant de continuer

**Code ajouté** :
```javascript
useEffect(() => {
  if (!devis) return;

  // Vérifier si le devis est verrouillé
  if (isDevisLocked(devis.statut)) {
    Alert.alert(
      '🔒 Devis verrouillé',
      getDevisLockMessage(devis.statut),
      [
        { 
          text: 'Retour', 
          onPress: () => navigation.goBack(),
          style: 'cancel'
        },
        { 
          text: 'Dupliquer', 
          onPress: () => {
            // TODO : Implémenter la duplication de devis
            navigation.goBack();
          }
        }
      ],
      { cancelable: false }
    );
    return;
  }

  // Vérifier si un warning est requis avant modification
  if (requiresEditWarning(devis.statut)) {
    Alert.alert(
      '⚠️ Attention',
      getDevisEditWarningMessage(devis.statut),
      [
        { 
          text: 'Annuler', 
          onPress: () => navigation.goBack(),
          style: 'cancel'
        },
        { 
          text: 'Continuer', 
          onPress: () => {
            logger.info('EditDevisScreen', 'Modification devis envoyé confirmée', { devisId, statut: devis.statut });
          }
        }
      ]
    );
  }
}, [devis, navigation, devisId]);
```

### 4. Protection de la fonction `saveChanges`

**Fichier** : `screens/EditDevisScreen.js` (ligne 223-230)

```javascript
const saveChanges = async () => {
  // Vérifier si le devis peut être modifié
  if (isLocked || !canEdit) {
    Alert.alert('🔒 Devis verrouillé', getDevisLockMessage(devis?.statut || ''));
    return;
  }

  try {
    setSaving(true);
    // ... reste du code
  }
};
```

### 5. Protection de la fonction `addLigne`

**Fichier** : `screens/EditDevisScreen.js` (ligne 228-245)

```javascript
const addLigne = () => {
  // Vérifier si le devis peut être modifié
  if (isLocked || !canEdit) {
    Alert.alert('🔒 Devis verrouillé', getDevisLockMessage(devis?.statut || ''));
    return;
  }

  // ... reste du code
};
```

### 6. Désactivation du champ TVA

**Fichier** : `screens/EditDevisScreen.js` (ligne 634-646)

```javascript
<AFInput
  icon="percent"
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
  containerStyle={{ marginBottom: 0 }}
  editable={!isLocked && canEdit}
/>
```

### 7. Désactivation du bouton "Ajouter"

**Fichier** : `screens/EditDevisScreen.js` (ligne 655-662)

```javascript
<TouchableOpacity
  onPress={addLigne}
  style={[
    styles.addButton, 
    { 
      backgroundColor: (isLocked || !canEdit) ? theme.colors.border : theme.colors.primary,
      opacity: (isLocked || !canEdit) ? 0.5 : 1,
    }
  ]}
  disabled={isLocked || !canEdit}
>
  <Feather name="plus" size={20} color="#FFFFFF" />
  <Text style={styles.addButtonText}>Ajouter</Text>
</TouchableOpacity>
```

### 8. Protection des lignes de devis

**Fichier** : `screens/EditDevisScreen.js` (ligne 767-771, 960-1020)

**Modifications** :
- Protection de `onEdit` : Affiche une alerte si tentative d'édition d'un devis verrouillé
- Protection de `onUpdate` : Retourne immédiatement si devis verrouillé
- Désactivation des champs `AFInput` dans `LigneItem` : `editable={!isLocked && canEdit}`
- Protection de `handleSave` dans `LigneItem` : Vérifie avant de sauvegarder

**Code** :
```javascript
// Dans le mapping des lignes
onEdit={() => {
  if (isLocked || !canEdit) {
    Alert.alert('🔒 Devis verrouillé', getDevisLockMessage(devis?.statut || ''));
    return;
  }
  setEditingLigneId(ligne.id);
}}
onUpdate={(field, value) => {
  if (isLocked || !canEdit) return;
  updateLigne(ligne.id, field, value);
}}

// Dans LigneItem
const handleSave = () => {
  if (isLocked || !canEdit) return;
  onUpdate('description', localDescription || '');
  // ... reste
};
```

---

## 🎯 COMPORTEMENT ATTENDU

### Devis en statut `'edition'` ou `'pret'`
- ✅ Modification autorisée
- ✅ Ajout de lignes autorisé
- ✅ Modification TVA autorisée
- ✅ Sauvegarde autorisée

### Devis en statut `'envoye'`
- ⚠️ Warning affiché au chargement
- ✅ Modification autorisée après confirmation
- ✅ Tous les champs éditables

### Devis en statut `'signe'` ou `'refuse'`
- ❌ Alerte au chargement : "Devis verrouillé"
- ❌ Bouton "Retour" → Retourne à l'écran précédent
- ❌ Bouton "Dupliquer" → TODO (pour l'instant retourne)
- ❌ Tous les champs désactivés (`editable={false}`)
- ❌ Bouton "Ajouter" désactivé
- ❌ Tentative de modification → Alerte "Devis verrouillé"

---

## ✅ VÉRIFICATIONS EFFECTUÉES

### Linting
- ✅ Aucune erreur de lint détectée

### Accès au statut
- ✅ Utilise `devis.statut` (pas `devis.status`) - conforme au code existant

### Protection complète
- ✅ Vérification au chargement
- ✅ Protection de `saveChanges`
- ✅ Protection de `addLigne`
- ✅ Désactivation des champs TVA
- ✅ Désactivation du bouton "Ajouter"
- ✅ Protection des lignes (édition, modification, sauvegarde)

---

## 🧪 TESTS À EFFECTUER

### Test 1 : Devis en édition
1. Créer un devis avec statut `'edition'`
2. Naviguer vers `EditDevisScreen`
3. ✅ Vérifier que les champs sont éditables
4. ✅ Vérifier que l'ajout de lignes fonctionne
5. ✅ Vérifier que la sauvegarde fonctionne

### Test 2 : Devis signé
1. Créer un devis avec statut `'signe'`
2. Naviguer vers `EditDevisScreen`
3. ✅ Vérifier que l'alerte s'affiche au chargement
4. ✅ Vérifier que les champs sont désactivés
5. ✅ Vérifier que le bouton "Ajouter" est désactivé
6. ✅ Vérifier que la tentative de modification affiche une alerte

### Test 3 : Devis envoyé
1. Créer un devis avec statut `'envoye'`
2. Naviguer vers `EditDevisScreen`
3. ✅ Vérifier que le warning s'affiche au chargement
4. ✅ Vérifier que la confirmation permet de continuer
5. ✅ Vérifier que les champs sont éditables après confirmation

---

## ⚠️ TODO

- [ ] Implémenter la fonctionnalité de duplication de devis (bouton "Dupliquer")

---

## ✅ VALIDATION REQUISE

**Avant de passer à l'ÉTAPE 4**, confirmer :

1. ✅ Les modifications sont correctes
2. ✅ Le comportement correspond aux attentes
3. ✅ Aucun problème détecté
4. ✅ Les tests manuels passent

**En attente de validation pour continuer vers l'ÉTAPE 4...**

