# Standardisation des couleurs d'icônes - ArtisanFlow

## ✅ Modifications effectuées

### 1. Création du système de couleurs standardisé

**Fichier créé :** `theme/iconColors.js`

```javascript
export const ICON_COLORS = {
  primary: "#E5E7EB",     // gris clair : icônes par défaut
  secondary: "#9CA3AF",   // gris moyen : icônes secondaires
  folder: "#3B82F6",      // bleu dossier chantier
  active: "#22C55E",      // vert actif (badge statut)
  danger: "#EF4444",      // rouge (supprimer, erreur)
  archive: "#F59E0B",     // jaune/orange archive
  ai: "#A855F7",          // violet IA (éclair, génération)
};
```

### 2. Fichiers mis à jour

#### ✅ `screens/ProjectDetailScreen.js`
- ✅ Toutes les icônes `arrow-left` → `ICON_COLORS.primary`
- ✅ Icône `folder` → `ICON_COLORS.folder`
- ✅ Icône `more-vertical` → `ICON_COLORS.primary`
- ✅ Icône `edit-3` → `ICON_COLORS.primary`
- ✅ Icônes `zap` (IA) → `ICON_COLORS.ai`
- ✅ Icône `archive` → `ICON_COLORS.archive`
- ✅ Icône `trash-2` → `ICON_COLORS.danger`
- ✅ Icône `x` (annuler) → `ICON_COLORS.secondary`
- ✅ Icône `check` → `ICON_COLORS.primary`
- ✅ Icône `alert-triangle` → `ICON_COLORS.danger`
- ✅ `ActivityIndicator` → `ICON_COLORS.primary`

#### ✅ `components/CollapsibleSection.js`
- ✅ Icône de section → `ICON_COLORS.primary`
- ✅ Icône `chevron-down` → `ICON_COLORS.secondary`

### 3. Règles d'application

- **Icônes principales** : `ICON_COLORS.primary` (#E5E7EB)
- **Icônes secondaires/navigation** : `ICON_COLORS.secondary` (#9CA3AF)
- **Dossier chantier** : `ICON_COLORS.folder` (#3B82F6)
- **IA (éclair, génération)** : `ICON_COLORS.ai` (#A855F7)
- **Archive** : `ICON_COLORS.archive` (#F59E0B)
- **Supprimer/Erreur** : `ICON_COLORS.danger` (#EF4444)
- **Actif** : `ICON_COLORS.active` (#22C55E) - déjà géré dans les badges

### 4. Fichiers à mettre à jour (optionnel - si besoin)

Les fichiers suivants utilisent encore `theme.colors.text` ou `theme.colors.textMuted` qui peuvent être adaptés selon le contexte :

- `screens/ClientsListScreen2.js`
- `screens/DocumentsScreen2.js`
- `screens/CaptureHubScreen2.js`
- `screens/ProjectsListScreen.js`
- `screens/EditDevisScreen.js`
- `screens/TemplatesScreen.js`
- `screens/SignDevisScreen.js`
- `components/SearchBar.tsx`
- `components/PhotoUploader.js`
- `components/VoiceRecorder.js`
- Et autres composants...

**Note :** Ces fichiers peuvent continuer à utiliser `theme.colors.text` si cette couleur est déjà claire dans le thème. La standardisation est principalement pour les icônes qui étaient en noir (#000) ou trop sombres.

## 🎯 Résultat

- ✅ Aucune icône noire dans `ProjectDetailScreen.js`
- ✅ Toutes les icônes sont lisibles sur fond dark
- ✅ Cohérence visuelle garantie avec le système `ICON_COLORS`
- ✅ Facile à maintenir : un seul fichier de constantes

## 📝 Utilisation future

Pour toute nouvelle icône, utiliser :

```javascript
import { ICON_COLORS } from '../theme/iconColors';

<Feather name="icon-name" size={20} color={ICON_COLORS.primary} />
```

