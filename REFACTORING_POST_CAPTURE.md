# Refactoring du flux post-capture

## 📋 Résumé

Refactorisation complète du système de post-capture pour associer les photos, notes vocales et notes texte aux chantiers. Le nouveau système est **typé, robuste et offre une meilleure UX**.

---

## 🎯 Comportement attendu

### 1. Capture réussie (photo/vocal/note)
- Après une capture réussie, un **bottom sheet** s'ouvre automatiquement
- Titre : "Associer à un chantier"
- Sous-titre : "Que souhaitez-vous faire avec cette capture ?"
- Trois options :
  - **Créer un nouveau chantier**
  - **Ajouter à un chantier**
  - **Annuler**

### 2. Bouton "Créer un nouveau chantier"
- Navigation vers `ProjectCreateScreen` avec `initialCapture` en paramètre
- À la création du chantier, la capture est automatiquement attachée
- Toast de succès : "✅ Photo ajoutée au chantier [Nom]"
- Navigation vers le détail du nouveau chantier

### 3. Bouton "Ajouter à un chantier"
- Si aucun chantier : toast "Aucun chantier trouvé. Créez-en un d'abord." + redirection vers création
- Si des chantiers existent : ouverture d'un **second bottom sheet** avec liste des projets
- Recherche par nom de chantier, client ou adresse
- Au clic sur un chantier : upload et attachement automatique
- Toast de succès approprié selon le type de capture

### 4. Bouton "Annuler"
- Ferme le bottom sheet
- Supprime la capture en attente
- Aucun appel réseau
- Toast : "❌ Capture annulée"

---

## 📁 Fichiers créés

### Types TypeScript
- **`types/capture.ts`** : Types pour `PendingCapture` (photo, audio, note)

### Hooks
- **`hooks/usePendingCapture.ts`** : Gestion des captures en attente
- **`hooks/useProjectsList.ts`** : Chargement de la liste des projets
- **`hooks/useAttachCaptureToProject.ts`** : Logique d'attachement des captures aux projets

### Composants
- **`components/CaptureLinkingSheet.tsx`** : Bottom sheet "Associer à un chantier"
- **`components/ProjectPickerSheet.tsx`** : Bottom sheet de sélection de projet

### Écrans
- **`screens/ProjectCreateScreen.tsx`** : Écran de création de chantier avec support `initialCapture`

---

## 📝 Fichiers modifiés

### Navigation
- **`navigation/AppNavigator.js`**
  - Ajout de `ProjectCreateScreen` dans `ClientsStack` et `CaptureStack`
  
- **`types/index.d.ts`**
  - Ajout de `ProjectCreate` dans `RootStackParamList` avec paramètres `initialCapture` et `clientId`

### Capture Hub
- **`screens/CaptureHubScreen.js`**
  - Remplacement de l'ancien système de `pendingCapture` par le nouveau hook `usePendingCapture`
  - Intégration de `CaptureLinkingSheet` et `ProjectPickerSheet`
  - Utilisation de `useAttachCaptureToProject` pour l'attachement
  - Suppression des fonctions obsolètes `savePhotoToProject`, `saveVoiceToProject`
  - Les notes texte utilisent maintenant le même flux que photo/vocal

---

## 🔄 Flux complet

### Photo
1. Clic sur "Photo" → Permission caméra
2. Capture photo → `createPendingCapture('photo', { fileUri })`
3. Ouverture de `CaptureLinkingSheet`
4. Choix :
   - **Créer** → Navigation vers `ProjectCreate` → Création + attachement
   - **Ajouter** → `ProjectPickerSheet` → Sélection → Attachement
   - **Annuler** → Suppression de la capture

### Vocal
1. Clic sur "Vocal" → Permission micro
2. Enregistrement → Arrêt → `createPendingCapture('audio', { fileUri, durationMs })`
3. Même flux que photo

### Note
1. Clic sur "Note" → Modal de saisie
2. Saisie du texte → "Continuer" → `createPendingCapture('note', { content })`
3. Même flux que photo/vocal

---

## ✨ Fonctionnalités

### Gestion des erreurs
- Tous les appels réseau sont dans des `try/catch`
- Toasts d'erreur clairs pour l'utilisateur
- Les erreurs d'attachement n'empêchent pas la création du projet (si applicable)

### Gestion des permissions
- Si la géolocalisation n'est pas disponible, la photo est quand même enregistrée (sans coordonnées)
- Si les permissions sont refusées, l'app continue de fonctionner

### Feedback utilisateur
- Loaders pendant les uploads
- Toasts de succès avec emoji et nom du chantier
- Toasts d'erreur explicites

---

## 🎨 Design

- Bottom sheets avec animation slide depuis le bas
- Thème dark cohérent
- Boutons premium avec ombres et bordures
- Recherche de projets avec filtre en temps réel
- Badge de capture dans `ProjectCreateScreen` si `initialCapture` est présent

---

## 🔧 Améliorations techniques

### TypeScript strict
- Tous les nouveaux fichiers sont typés
- Pas de `any` inutiles
- Types corrects pour les paramètres de navigation

### Séparation des responsabilités
- Logique métier dans les hooks
- Composants UI réutilisables
- Services centralisés (upload, compression)

### Performance
- Chargement des projets uniquement quand nécessaire
- Mise en cache des projets dans `useProjectsList`
- Compression des images avant upload

---

## ⚠️ Notes importantes

1. **Géolocalisation** : Les photos incluent `taken_at`, `latitude`, `longitude` si disponible
2. **Transcription** : Les notes vocales sont enregistrées mais la transcription se fait en arrière-plan (non bloquant)
3. **Ancien code** : L'ancien modal de sélection client/projet est conservé pour compatibilité mais n'est plus utilisé dans le nouveau flux
4. **Navigation** : `ProjectCreateScreen` remplace l'écran actuel et navigue vers `ProjectDetail` après création

---

## ✅ Tests à effectuer

1. **Photo** :
   - Capture → Créer nouveau chantier → Vérifier attachement
   - Capture → Ajouter à chantier existant → Vérifier attachement
   - Capture → Annuler → Vérifier que rien n'est uploadé

2. **Vocal** :
   - Même flux que photo

3. **Note** :
   - Saisie → Continuer → Créer/Ajouter → Vérifier attachement

4. **Cas limites** :
   - Aucun chantier existant → Redirection vers création
   - Permission refusée → Comportement gracieux
   - Erreur réseau → Toast d'erreur, pas de crash

---

## 📝 Migration SQL

**Aucune migration SQL nécessaire** - Le système utilise les tables existantes :
- `project_photos` pour les photos
- `notes` pour les notes vocales et texte
- `projects` pour les chantiers

Les colonnes `taken_at`, `latitude`, `longitude` doivent être présentes dans `project_photos` (voir `supabase/migrations_location_photos.sql`).

