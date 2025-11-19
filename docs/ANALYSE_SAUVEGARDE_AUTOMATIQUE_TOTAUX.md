# Analyse : Sauvegarde Automatique des Totaux après Modification de Ligne

**Date** : 2025-11-19  
**Problème** : Les totaux sont recalculés dans l'interface mais ne sont pas sauvegardés en base après chaque modification

---

## 📍 FICHIER CONCERNÉ

**`screens/EditDevisScreen.js`**

---

## 🔍 CODE ACTUEL

### 1. Fonction de calcul des totaux (lignes 187-199)

```javascript
// Calculer les totaux
const calculateTotals = useCallback(() => {
  const totalHT = lignes.reduce((sum, ligne) => {
    const qty = parseFloat(ligne.quantite) || 0;
    const prix = parseFloat(ligne.prix_unitaire) || 0;
    return sum + (qty * prix);
  }, 0);

  const tva = parseFloat(tvaPercent) || 0;
  const tvaMontant = totalHT * (tva / 100);
  const totalTTC = totalHT + tvaMontant;

  return { totalHT, tvaMontant, totalTTC };
}, [lignes, tvaPercent]);
```

**✅ Fonctionne** : Calcule correctement les totaux  
**❌ Problème** : Ne sauvegarde PAS en base, seulement calcule

**Utilisation** :
- Ligne 238 : Appelée dans `saveChanges()` pour sauvegarder
- Ligne 527 : Appelée dans le render pour afficher les totaux

---

### 2. Fonction de mise à jour d'une ligne (lignes 202-220)

```javascript
// Mettre à jour une ligne
const updateLigne = (ligneId, field, value) => {
  setLignes(prevLignes => {
    return prevLignes.map(ligne => {
      if (ligne.id === ligneId) {
        const updated = { ...ligne, [field]: value };
        
        // Recalculer le prix_total si quantité ou prix_unitaire change
        if (field === 'quantite' || field === 'prix_unitaire') {
          const qty = parseFloat(updated.quantite) || 0;
          const prix = parseFloat(updated.prix_unitaire) || 0;
          updated.prix_total = qty * prix;
        }
        
        return updated;
      }
      return ligne;
    });
  });
};
```

**✅ Fonctionne** : Met à jour le state des lignes  
**❌ Problème** : Ne sauvegarde PAS les totaux en base après modification

**Appelée depuis** :
- Ligne 786 : `onUpdate={(field, value) => updateLigne(ligne.id, field, value)}`
- Ligne 1001 : Modification quantité
- Ligne 1017 : Modification unité
- Ligne 1032 : Modification prix unitaire

---

### 3. Fonction d'ajout de ligne (lignes 306-324)

```javascript
// Ajouter une nouvelle ligne
const addLigne = () => {
  // Vérifier si le devis peut être modifié
  if (isLocked || !canEdit) {
    Alert.alert('🔒 Devis verrouillé', getDevisLockMessage(devis?.statut || ''));
    return;
  }

  const newLigne = {
    id: `temp-${Date.now()}`,
    devis_id: devisId,
    description: '',
    quantite: 1,
    unite: 'unité',
    prix_unitaire: 0,
    prix_total: 0,
    ordre: lignes.length,
  };
  setLignes([...lignes, newLigne]);
  setEditingLigneId(newLigne.id);
};
```

**✅ Fonctionne** : Ajoute une ligne dans le state  
**❌ Problème** : Ne sauvegarde PAS les totaux en base après ajout

**Appelée depuis** :
- Ligne 742 : Bouton "Ajouter" dans l'interface

---

### 4. Fonction de suppression de ligne (lignes 488-512)

```javascript
const confirmDeleteLigne = async () => {
  const ligneId = ligneToDelete;
  setShowDeleteLigneModal(false);
  setLigneToDelete(null);

  // Si c'est une ligne temporaire, juste la retirer de la liste
  if (ligneId.startsWith('temp-')) {
    setLignes(lignes.filter(l => l.id !== ligneId));
    return;  // ⚠️ Retour immédiat, pas de sauvegarde
  }

  // Sinon, supprimer de la base
  try {
    const { error } = await supabase
      .from('devis_lignes')
      .delete()
      .eq('id', ligneId);

    if (error) throw error;
    setLignes(lignes.filter(l => l.id !== ligneId));
    showSuccess('Ligne supprimée');
    // ⚠️ Pas de sauvegarde des totaux après suppression
  } catch (error) {
    showError(getErrorMessage(error, 'delete'));
  }
};
```

**✅ Fonctionne** : Supprime la ligne de la base et du state  
**❌ Problème** : Ne sauvegarde PAS les totaux en base après suppression

**Appelée depuis** :
- Ligne 855 : Modal de confirmation de suppression

---

### 5. Fonction de sauvegarde (lignes 223-303)

```javascript
// Sauvegarder les modifications
const saveChanges = async () => {
  // ...
  const { totalHT, tvaMontant, totalTTC } = calculateTotals();

  // Mettre à jour le devis (totaux et TVA)
  const { error: devisError } = await supabase
    .from('devis')
    .update({
      montant_ht: totalHT,
      tva_percent: parseFloat(tvaPercent) || 0,
      montant_ttc: totalTTC,
    })
    .eq('id', devisId);

  // ... sauvegarde des lignes ...
  
  showSuccess('Devis modifié avec succès');
  setTimeout(() => {
    navigation.goBack();
  }, 300);
};
```

**✅ Fonctionne** : Sauvegarde les totaux en base  
**❌ Problème** : Seulement appelée quand on clique sur "Enregistrer"

**Appelée depuis** :
- Ligne 548 : Bouton "Enregistrer" dans le header

---

### 6. Modification de la TVA (lignes 718-729)

```javascript
<AFInput
  value={tvaPercent.toString()}
  onChangeText={(text) => {
    if (isLocked || !canEdit) return;
    const num = parseFloat(text) || 0;
    if (num >= 0 && num <= 100) {
      setTvaPercent(num);  // ⚠️ Change seulement le state, pas la base
    }
  }}
  // ...
/>
```

**✅ Fonctionne** : Met à jour le state de la TVA  
**❌ Problème** : Ne sauvegarde PAS les totaux en base après changement de TVA

---

## ❌ PROBLÈMES IDENTIFIÉS

### Problème 1 : Totaux non sauvegardés après modification de ligne
- `updateLigne()` modifie le state mais ne sauvegarde pas les totaux
- Les totaux sont recalculés dans l'interface (via `calculateTotals()`)
- Mais les totaux en base restent à l'ancienne valeur jusqu'à `saveChanges()`

### Problème 2 : Totaux non sauvegardés après ajout de ligne
- `addLigne()` ajoute une ligne dans le state
- Les totaux sont recalculés dans l'interface
- Mais les totaux en base ne sont pas mis à jour

### Problème 3 : Totaux non sauvegardés après suppression de ligne
- `confirmDeleteLigne()` supprime la ligne de la base
- Les totaux sont recalculés dans l'interface
- Mais les totaux en base ne sont pas mis à jour

### Problème 4 : Totaux non sauvegardés après changement de TVA
- `setTvaPercent()` change le state de la TVA
- Les totaux sont recalculés dans l'interface
- Mais les totaux en base ne sont pas mis à jour

---

## ✅ SOLUTION PROPOSÉE

### Étape 1 : Créer une fonction de sauvegarde automatique des totaux

```javascript
const saveTotauxEnBase = useCallback(async (totalHT, montantTVA, totalTTC) => {
  try {
    const { error } = await supabase
      .from('devis')
      .update({
        montant_ht: totalHT,
        tva_percent: parseFloat(tvaPercent) || 0,
        montant_ttc: totalTTC,
      })
      .eq('id', devisId);

    if (error) throw error;

    logger.info('EditDevisScreen', 'Totaux sauvegardés automatiquement', { 
      totalHT, 
      montantTVA, 
      totalTTC 
    });
  } catch (error) {
    logger.error('EditDevisScreen', 'Erreur sauvegarde totaux', error);
    // Ne pas afficher d'erreur à l'utilisateur (sauvegarde silencieuse)
  }
}, [devisId, tvaPercent]);
```

### Étape 2 : Créer une fonction de recalcul et sauvegarde

```javascript
const recalculerEtSauvegarderTotaux = useCallback(async () => {
  const { totalHT, tvaMontant, totalTTC } = calculateTotals();
  await saveTotauxEnBase(totalHT, tvaMontant, totalTTC);
}, [calculateTotals, saveTotauxEnBase]);
```

### Étape 3 : Appeler après chaque modification

**Dans `updateLigne`** :
```javascript
const updateLigne = (ligneId, field, value) => {
  setLignes(prevLignes => {
    // ... code existant ...
  });
  // ✅ Appeler après modification
  setTimeout(() => {
    recalculerEtSauvegarderTotaux();
  }, 100); // Petit délai pour laisser le state se mettre à jour
};
```

**Dans `addLigne`** :
```javascript
const addLigne = () => {
  // ... code existant ...
  setLignes([...lignes, newLigne]);
  setEditingLigneId(newLigne.id);
  // ✅ Appeler après ajout
  setTimeout(() => {
    recalculerEtSauvegarderTotaux();
  }, 100);
};
```

**Dans `confirmDeleteLigne`** :
```javascript
const confirmDeleteLigne = async () => {
  // ... code existant ...
  setLignes(lignes.filter(l => l.id !== ligneId));
  showSuccess('Ligne supprimée');
  // ✅ Appeler après suppression
  await recalculerEtSauvegarderTotaux();
};
```

**Dans le changement de TVA** :
```javascript
onChangeText={(text) => {
  if (isLocked || !canEdit) return;
  const num = parseFloat(text) || 0;
  if (num >= 0 && num <= 100) {
    setTvaPercent(num);
    // ✅ Appeler après changement de TVA
    setTimeout(() => {
      recalculerEtSauvegarderTotaux();
    }, 300); // Délai plus long pour laisser l'utilisateur finir de taper
  }
}}
```

---

## 📋 RÉSUMÉ DES MODIFICATIONS

| Fonction | Ligne actuelle | Modification nécessaire |
|----------|----------------|-------------------------|
| `calculateTotals` | 187 | ✅ OK, pas de changement |
| `updateLigne` | 202 | ➕ Appeler `recalculerEtSauvegarderTotaux()` après |
| `addLigne` | 306 | ➕ Appeler `recalculerEtSauvegarderTotaux()` après |
| `confirmDeleteLigne` | 488 | ➕ Appeler `recalculerEtSauvegarderTotaux()` après |
| Changement TVA | 720 | ➕ Appeler `recalculerEtSauvegarderTotaux()` après |
| `saveChanges` | 223 | ✅ OK, peut garder la sauvegarde pour les autres champs |

---

## ⚠️ CONSIDÉRATIONS

### Performance
- Les sauvegardes automatiques peuvent être nombreuses
- Utiliser un debounce pour éviter trop de requêtes
- Ou utiliser un délai (setTimeout) pour regrouper les modifications

### Gestion d'erreurs
- Les erreurs de sauvegarde automatique ne doivent pas bloquer l'utilisateur
- Logger les erreurs mais ne pas afficher de toast (sauvegarde silencieuse)
- L'utilisateur peut toujours cliquer sur "Enregistrer" pour forcer la sauvegarde

### Concurrence
- Si plusieurs modifications rapides, la dernière sauvegarde doit gagner
- Utiliser un debounce ou un système de queue

---

**Attente de validation avant modification** ✅

