# 🎨 PLAN D'AMÉLIORATION UX/UI - ArtisanFlow

## 📊 Priorisation des améliorations

### ⚡ Phase 1 : Quick Wins (Impact élevé, effort faible)
*Estimation : 2-3 heures*

- [x] ✅ **Textes des boutons** : Simplifier ("Créer un chantier" → "Nouveau chantier")
- [x] ✅ **États vides** : Pictos + messages explicatifs ("Aucun chantier pour le moment")
- [ ] 🔄 **Toasts/Snackbar** : Confirmations visuelles non-intrusives
- [ ] 🔄 **Palette de couleurs** : Unifier (bleu principal + gris + accent)
- [ ] 🔄 **Espacements** : Revoir marges entre sections (mobile)
- [ ] 🔄 **Textes boutons** : Uniformiser la casse et longueur
- [ ] 🔄 **Compression images** : Auto-optimisation avant upload (déjà fait partiellement)

### 🚀 Phase 2 : Fonctionnalités UX (Impact élevé, effort moyen)
*Estimation : 1-2 jours*

- [ ] 📱 **Dashboard/Accueil** : Résumé du jour (chantiers actifs, photos récentes)
- [ ] 🎓 **Onboarding** : 3 écrans au premier lancement
- [ ] 🔔 **Système de feedback** : Bouton "Signaler un bug"
- [ ] 🏷️ **Identifiants chantiers** : Numéro unique visible (ex: CHT-001)
- [ ] 📦 **Archivage** : Option "Archiver" au lieu de "Supprimer"
- [ ] 🖼️ **Prévisualisation médias** : Miniatures photos, lecture audio

### 🔧 Phase 3 : Améliorations techniques (Impact moyen, effort élevé)
*Estimation : 2-3 jours*

- [ ] 📡 **Mode hors ligne** : Cache local + synchro différée
- [ ] ✅ **Vérification réseau** : Check avant upload
- [ ] 🎨 **Changement police** : Inter ou Poppins
- [ ] ♿ **Contrastes** : Optimiser pour usage terrain (plein soleil)
- [ ] 🔄 **Hiérarchie menus** : Réorganiser navigation

---

## ✅ Phase 1 : Implémentation immédiate

### 1. Simplification des textes

| Écran | Avant | Après |
|-------|-------|-------|
| ClientsList | "Ajouter un client" | "Nouveau client" ✅ |
| ClientDetail | "Ajouter un chantier" | "Nouveau chantier" ✅ |
| ProjectDetail | "Générer un devis PDF" | "Créer un devis" |
| Settings | "Sauvegarder" | "Enregistrer" |

### 2. États vides avec pictos

```jsx
// Exemple : Liste vide de chantiers
<View style={styles.emptyState}>
  <Feather name="folder-plus" size={48} color={theme.colors.textMuted} />
  <Text style={styles.emptyTitle}>Aucun chantier</Text>
  <Text style={styles.emptySubtitle}>
    Créez votre premier chantier pour commencer
  </Text>
  <TouchableOpacity style={styles.emptyButton}>
    <Text>Nouveau chantier</Text>
  </TouchableOpacity>
</View>
```

### 3. Système de Toasts

Créer un composant `Toast.js` réutilisable :

```jsx
// components/Toast.js
export const showToast = (message, type = 'success') => {
  // success, error, info, warning
  ToastAndroid.show(message, ToastAndroid.SHORT);
  // ou utiliser react-native-toast-message
};
```

Remplacer les `Alert.alert()` par des toasts pour les confirmations non-critiques.

### 4. Palette de couleurs unifiée

**Proposition de palette** :

```javascript
// theme/colors.js
export const colors = {
  // Bleu principal (artisan, confiance, pro)
  primary: '#1D4ED8',      // Bleu professionnel
  primaryLight: '#60A5FA', // Bleu clair
  primaryDark: '#1E3A8A',  // Bleu foncé
  
  // Accent (pour CTA, succès)
  accent: '#10B981',       // Vert (succès, validation)
  accentLight: '#34D399',
  
  // Gris neutres
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Sémantiques
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Surfaces (mode sombre)
  background: '#0F1115',
  surface: '#1A1D22',
  surfaceElevated: '#2A2E35',
};
```

### 5. Espacements standardisés

```javascript
// theme/spacing.js
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};
```

---

## 🚀 Phase 2 : Dashboard

### Structure proposée

```
┌─────────────────────────────────┐
│  Bonjour, [Prénom] 👋           │
│  Mardi 4 novembre 2025          │
├─────────────────────────────────┤
│  📊 Aujourd'hui                 │
│  ┌───┬───┬───┬───┐              │
│  │ 3 │ 2 │ 5 │ 8 │              │
│  │🏗️│✅│📸│📄│              │
│  └───┴───┴───┴───┘              │
│  Actifs│Terminés│Photos│Devis   │
├─────────────────────────────────┤
│  🔥 Chantiers en cours          │
│  ┌─────────────────────────┐    │
│  │ Rénovation cuisine      │    │
│  │ M. Dupont • En cours    │    │
│  └─────────────────────────┘    │
├─────────────────────────────────┤
│  📸 Photos récentes             │
│  [🖼️] [🖼️] [🖼️] [🖼️]    │
└─────────────────────────────────┘
```

### Composants à créer

1. `screens/DashboardScreen.js`
2. `components/StatCard.js`
3. `components/RecentProjectCard.js`
4. `components/PhotoGrid.js`

---

## 🎓 Phase 2 : Onboarding

### 3 écrans proposés

**Écran 1 : Bienvenue**
```
┌─────────────────────┐
│                     │
│    [Illustration]   │
│    Carnet 3D        │
│                     │
│  ArtisanFlow        │
│  Votre carnet de    │
│  chantier intelligent│
│                     │
│      [Suivant]      │
└─────────────────────┘
```

**Écran 2 : Capture**
```
┌─────────────────────┐
│                     │
│    [Illustration]   │
│    Caméra 3D        │
│                     │
│  Capturez tout      │
│  Photos, notes      │
│  vocales, devis     │
│                     │
│      [Suivant]      │
└─────────────────────┘
```

**Écran 3 : Organisation**
```
┌─────────────────────┐
│                     │
│    [Illustration]   │
│    Dossiers 3D      │
│                     │
│  Organisez vos      │
│  chantiers et       │
│  clients            │
│                     │
│  [Commencer]        │
└─────────────────────┘
```

---

## 🔧 Phase 3 : Techniques

### Mode hors ligne basique

**Stratégie** :
1. Cache SQLite local (via `expo-sqlite`)
2. Queue d'uploads en attente
3. Indicateur visuel "Hors ligne"
4. Synchro auto au retour du réseau

```javascript
// utils/offlineManager.js
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const queueUpload = async (type, data) => {
  const queue = await AsyncStorage.getItem('upload_queue') || '[]';
  const parsed = JSON.parse(queue);
  parsed.push({ type, data, timestamp: Date.now() });
  await AsyncStorage.setItem('upload_queue', JSON.stringify(parsed));
};

export const processQueue = async () => {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) return;
  
  const queue = await AsyncStorage.getItem('upload_queue') || '[]';
  const items = JSON.parse(queue);
  
  for (const item of items) {
    // Upload to Supabase
    await uploadToSupabase(item);
  }
  
  await AsyncStorage.setItem('upload_queue', '[]');
};
```

### Archivage des chantiers

**Modification BDD** :
```sql
ALTER TABLE projects 
ADD COLUMN archived BOOLEAN DEFAULT FALSE;

ALTER TABLE projects 
ADD COLUMN archived_at TIMESTAMP;
```

**Interface** :
- Bouton "Archiver" dans le menu chantier
- Filtre "Afficher archivés" dans la liste
- Badge "Archivé" sur les chantiers archivés

---

## 📋 Checklist d'implémentation

### Semaine 1 : Quick Wins
- [ ] Créer composant Toast
- [ ] Remplacer Alert par Toast pour confirmations
- [ ] Unifier palette de couleurs dans theme.js
- [ ] Revoir tous les espacements (mobile)
- [ ] Simplifier textes des boutons
- [ ] Ajouter états vides avec pictos

### Semaine 2 : Dashboard & Onboarding
- [ ] Créer DashboardScreen
- [ ] Composants de stats
- [ ] Écran Onboarding (3 slides)
- [ ] Système de feedback intégré
- [ ] Identifiants uniques chantiers

### Semaine 3 : Techniques & Polish
- [ ] Mode hors ligne basique
- [ ] Archivage chantiers
- [ ] Changement police (Inter/Poppins)
- [ ] Optimisation contrastes
- [ ] Tests utilisateurs

---

## 🎯 Améliorations déjà implémentées

✅ Compression images avant upload (`imageCompression.js`)  
✅ Messages de confirmation avec contexte (nom du chantier)  
✅ Loaders correctement gérés (never stuck)  
✅ Icônes cohérentes (Feather Icons partout)  
✅ Logo professionnel dans Paramètres  
✅ Suppression photos client (focus chantiers)  

---

## 💡 Suggestions bonus

### Slogan sous le logo
**Options** :
- "Votre carnet de chantier intelligent"
- "L'assistant des artisans pros"
- "Gérez vos chantiers en toute simplicité"
- "Votre métier, notre technologie"

### Hiérarchie menus proposée
1. **🏠 Accueil** (Dashboard)
2. **👥 Clients** (avec sous-nav → Chantiers)
3. **📸 Capture** (accès rapide)
4. **📄 Documents** (Devis, Factures, Photos)
5. **⚙️ Paramètres**

### Identifiants chantiers
Format proposé : `CHT-2025-001`, `CHT-2025-002`, etc.
- CHT = Chantier
- 2025 = Année
- 001 = Numéro séquentiel

---

**Date du plan** : 4 novembre 2025  
**Priorité** : Phases 1 & 2 (impact maximum)  
**Prochaine action** : Implémenter Phase 1 (Quick Wins)

