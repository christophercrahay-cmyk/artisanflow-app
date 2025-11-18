# Refonte complète des modales ArtisanFlow

## ✅ Modifications effectuées

### 1. Composant générique créé

**Fichier créé :** `components/ui/AFModal.tsx`

Composant modal standardisé avec :
- Fond semi-transparent noir : `rgba(0,0,0,0.6)`
- Carte centrale : `backgroundColor: "#0F172A"`, `borderRadius: 20`, `padding: 24`
- Style cohérent avec le thème dark ArtisanFlow
- Support des props : `visible`, `title`, `message`, `onCancel`, `onConfirm`, `confirmLabel`, `cancelLabel`, `danger`, `children`

### 2. Fichiers modifiés

#### ✅ `components/ui/index.js`
- Ajout de l'export `AFModal`

#### ✅ `screens/ProjectDetailScreen.js`
- ✅ Remplacement de `Alert.alert` pour archivage → `AFModal`
- ✅ Remplacement de `Alert.alert` pour désarchivage → `AFModal`
- ✅ Remplacement de la modal de confirmation de suppression → `AFModal` avec `danger={true}`
- ✅ Ajout des états `showArchiveModal` et `showUnarchiveModal`

### 3. Modales remplacées dans ProjectDetailScreen

1. **Modal de confirmation de suppression**
   - Avant : Modal personnalisée complexe
   - Après : `<AFModal danger={true} />`
   - Message : Confirmation avec nom du chantier et avertissement

2. **Modal archivage**
   - Avant : `Alert.alert`
   - Après : `<AFModal />`
   - Message : Explication que le chantier sera masqué mais conservé

3. **Modal désarchivage**
   - Avant : `Alert.alert`
   - Après : `<AFModal />`
   - Message : Explication que le chantier redeviendra visible

### 4. Modales conservées (complexes)

Les modales suivantes sont conservées car elles ont des besoins spécifiques :
- **Modal menu actions** : Plusieurs boutons avec icônes (statut, archiver, supprimer, annuler)
- **Modal note texte** : Contient un `TextInput` multiline avec `KeyboardAvoidingView`
- **Modal changement statut** : Liste d'options avec sélection visuelle

### 5. Alert.alert restants à remplacer (optionnel)

Les fichiers suivants contiennent encore des `Alert.alert` qui peuvent être remplacés :

- `screens/ClientDetailScreen.js` (7 occurrences)
- `screens/ClientsListScreen2.js` (1 occurrence)
- `screens/DocumentsScreen2.js` (5 occurrences)
- `PhotoUploader.js` (2 occurrences)
- `DevisFactures.js` (3 occurrences)
- `VoiceRecorder.js` (si présent)

**Note :** Certains `Alert.alert` peuvent être conservés s'ils sont utilisés pour des messages d'erreur simples ou des notifications non-bloquantes.

## 🎯 Résultat

- ✅ Composant modal générique créé et fonctionnel
- ✅ Modales de confirmation remplacées dans `ProjectDetailScreen`
- ✅ Style cohérent avec le thème dark ArtisanFlow
- ✅ Support des actions dangereuses (suppression) avec `danger={true}`
- ✅ Code plus maintenable et réutilisable

## 📝 Utilisation future

Pour toute nouvelle modal de confirmation :

```tsx
import AFModal from '../components/ui/AFModal';

<AFModal
  visible={showModal}
  title="Titre de la modal"
  message="Message explicatif"
  onCancel={() => setShowModal(false)}
  onConfirm={handleConfirm}
  confirmLabel="Confirmer"
  cancelLabel="Annuler"
  danger={false} // true pour actions dangereuses
/>
```

