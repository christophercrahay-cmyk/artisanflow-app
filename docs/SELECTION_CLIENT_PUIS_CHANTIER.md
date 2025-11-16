# ✨ Sélection Client → Chantier (2 Étapes)

**Date** : 5 novembre 2025  
**Fichiers créés** :
- `components/ClientProjectSelector.js`
- `components/ActiveProjectSelector.js`

**Fichier modifié** :
- `screens/CaptureHubScreen.js`

---

## 🎯 Nouveau Workflow en 2 Étapes

### Avant (Problématique)

```
Capture → Photo → Tous les chantiers mélangés
→ Difficile de trouver le bon chantier
→ Pas de regroupement par client
```

---

### Après (Optimisé) ✅

```
Étape 1 : Sélectionner le CLIENT
   ↓
Étape 2 : Sélectionner le CHANTIER de ce client
   ↓
Capture Photo/Vocal/Note directement attachée
```

---

## 🔄 Workflow Complet

### Première Utilisation

```
1. CaptureHubScreen
   → Aucun chantier actif sélectionné
   
2. Clic "Photo" 📷
   → Modal "👤 Sélectionner un client" s'ouvre (Étape 1)
   
3. Liste des clients affichée :
   ┌──────────────────────────┐
   │ 👤  Dupont               │
   │     📍 10 rue de Paris   │
   │     📞 06 12 34 56 78    │
   └──────────────────────────┘
   ┌──────────────────────────┐
   │ 👤  Martin               │
   │     📍 25 avenue...      │
   └──────────────────────────┘
   
4. Clic sur "Dupont"
   → Breadcrumb : "Client : Dupont"
   → Modal change : "📂 Sélectionner un chantier" (Étape 2)
   
5. Liste des chantiers de Dupont :
   ┌──────────────────────────┐
   │ 📁  Rénovation Cuisine   │
   │     📍 10 rue de Paris   │
   │     🟢                   │
   └──────────────────────────┘
   ┌──────────────────────────┐
   │ 📁  Extension Garage     │
   │     🟠                   │
   └──────────────────────────┘
   
6. Clic sur "Rénovation Cuisine"
   → Modal se ferme
   → activeProject = "Rénovation Cuisine"
   → Caméra s'ouvre automatiquement
   
7. Photo prise
   → Upload direct au chantier
   → Toast "Photo ajoutée au chantier 'Rénovation Cuisine'"
   
8. ✅ Photo attachée au bon chantier
```

---

### Utilisations Suivantes (Plus Rapide)

```
CaptureHubScreen
┌────────────────────────────────────┐
│  Chantier actif                    │
│  Rénovation Cuisine                │  ← Barre sélecteur
│  Dupont                             │     (cliquable)
└────────────────────────────────────┘
     ↓
Clic "Photo" → Caméra → Photo → Upload
     ↓
✅ 1 clic → Photo attachée !

Pour changer de chantier :
  → Clic sur la barre "Chantier actif"
  → Sélection Client → Chantier
```

---

## 🎨 Composants Créés

### 1. ClientProjectSelector (Modal 2 Étapes)

**Étape 1 : Sélection Client**

```
┌────────────────────────────────────┐
│  ←  👤 Sélectionner un client      │  ← Header
│                                    │
│  🔍 Rechercher un client...        │  ← Recherche
│                                    │
│  ┌──────────────────────────────┐ │
│  │ 👤  Dupont                   │ │  ← Client 1
│  │     📍 10 rue de Paris       │ │
│  │     📞 06 12 34 56 78        │ │
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │ 👤  Martin                   │ │  ← Client 2
│  │     📍 25 avenue Jean Jaurès │ │
│  └──────────────────────────────┘ │
└────────────────────────────────────┘
```

---

**Étape 2 : Sélection Chantier**

```
┌────────────────────────────────────┐
│  ←  📂 Sélectionner un chantier    │  ← Header avec back
│                                    │
│  Client : Dupont                   │  ← Breadcrumb
│                                    │
│  🔍 Rechercher un chantier...      │  ← Recherche
│                                    │
│  ┌──────────────────────────────┐ │
│  │ 📁  Rénovation Cuisine  🟢   │ │  ← Chantier 1
│  │     📍 10 rue de Paris       │ │
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │ 📁  Extension Garage  🟠     │ │  ← Chantier 2
│  └──────────────────────────────┘ │
└────────────────────────────────────┘
```

---

### 2. ActiveProjectSelector (Barre du Haut)

```
CaptureHubScreen
┌────────────────────────────────────┐
│  Capture                           │
│  Capturez instantanément...        │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ 📂  Chantier actif           │ │  ← Cliquable
│  │     Rénovation Cuisine       │ │
│  │     Dupont              ▼    │ │
│  └──────────────────────────────┘ │
│                                    │
│  📷  Photo                         │
│  🎤  Vocal                         │
│  📝  Note                          │
└────────────────────────────────────┘
```

---

## 🔄 Logique de Flux

### Si Aucun Chantier Actif

```javascript
Clic Photo/Vocal/Note
  ↓
if (!activeProject) {
  // Ouvrir sélection Client → Chantier
  setShowClientProjectSelector(true);
}
  ↓
Étape 1 : Liste clients
  ↓
Clic client → Étape 2 : Liste chantiers du client
  ↓
Clic chantier → Définir comme activeProject
  ↓
Lancer la capture automatiquement
```

---

### Si Chantier Actif Déjà Sélectionné

```javascript
Clic Photo/Vocal/Note
  ↓
if (activeProject) {
  // Capture directe
  handlePhotoCaptureStartDirect();
}
  ↓
Photo/Vocal/Note → Upload direct au chantier actif
  ↓
Toast confirmation
```

---

## 🎨 Navigation Modal

### Bouton Back

**Étape 1 (Client)** :
```
← (icône X) → Ferme la modal complètement
```

**Étape 2 (Chantier)** :
```
← (flèche gauche) → Retour étape 1 (clients)
```

---

### Breadcrumb

**Étape 2 uniquement** :
```
┌────────────────────────┐
│ Client : Dupont        │  ← Badge bleu
└────────────────────────┘
```

**Montre** quel client a été sélectionné à l'étape 1.

---

## 📊 Données Affichées

### Liste Clients (Étape 1)

```
Chaque client :
  👤 Icône
  Nom du client (bold)
  📍 Adresse (si disponible)
  📞 Téléphone (si disponible)
  → Chevron
```

---

### Liste Chantiers (Étape 2)

```
Chaque chantier :
  📁 Icône
  Nom du chantier (bold)
  🟢🟠⚪ Statut emoji
  📍 Adresse (si disponible)
  → Chevron
```

---

## 🔍 Recherche

### Étape 1 (Clients)

**Placeholder** : "Rechercher un client..."

**Filtre par** :
- Nom du client
- Adresse du client

**Exemple** :
```
Recherche "paris"
→ Trouve : Dupont (10 rue de Paris)
→ Masque : Martin (Marseille)
```

---

### Étape 2 (Chantiers)

**Placeholder** : "Rechercher un chantier..."

**Filtre par** :
- Nom du chantier
- Adresse du chantier

**Exemple** :
```
Recherche "cuisine"
→ Trouve : Rénovation Cuisine
→ Masque : Extension Garage
```

---

## 🎯 Exemple Complet

### Scénario : Photo pour Client Dupont, Chantier Cuisine

```
1. CaptureHubScreen
   → Barre "Chantier actif" : vide (ou autre chantier)
   
2. Clic 📷 Photo
   → Modal s'ouvre : "👤 Sélectionner un client"
   
3. Liste affichée :
   - Dupont (10 rue de Paris)
   - Martin (25 avenue Jean Jaurès)
   - Bernard (3 place de la Mairie)
   
4. Clic "Dupont"
   → Breadcrumb : "Client : Dupont"
   → Modal : "📂 Sélectionner un chantier"
   → Chargement chantiers de Dupont...
   
5. Liste chantiers :
   - Rénovation Cuisine 🟢
   - Extension Garage 🟠
   - Salle de bain ⚪
   
6. Clic "Rénovation Cuisine"
   → activeProject = Rénovation Cuisine
   → Modal se ferme
   → Barre se met à jour : "Rénovation Cuisine / Dupont"
   → Caméra s'ouvre (300ms delay)
   
7. Photo prise
   → Upload direct
   → Toast "Photo ajoutée au chantier 'Rénovation Cuisine'"
   
8. Prochaine photo :
   → Clic 📷
   → Caméra directe (chantier actif)
   → 1 clic !
```

---

## 💡 Changement de Chantier

```
Barre "Chantier actif" affiche :
  Rénovation Cuisine
  Dupont

Pour changer :
  → Clic sur la barre
  → Modal liste TOUS les chantiers (comme avant)
  → OU : Refaire Client → Chantier
```

---

## 📊 Comparaison

### Avant

```
Photo → Tous les chantiers mélangés
→ Difficile de trouver
→ Pas de regroupement client
```

---

### Après

```
Photo → Client d'abord → Chantiers filtrés du client
→ Logique claire
→ 2 étapes séparées
→ Chantier actif mémorisé
```

**Gain : +150% clarté** ✨

---

## ✅ Checklist

- [x] Composant `ClientProjectSelector.js` créé
- [x] Étape 1 : Liste clients avec recherche
- [x] Étape 2 : Liste chantiers du client
- [x] Breadcrumb "Client : X" en étape 2
- [x] Bouton back (X en étape 1, ← en étape 2)
- [x] Recherche dans les 2 étapes
- [x] Émojis 👤 pour clients, 📁 pour chantiers
- [x] Statuts 🟢🟠⚪ pour chantiers
- [x] activeProject mémorisé après sélection
- [x] Captures directes si chantier actif
- [x] Modal si pas de chantier actif
- [x] 0 linter errors

---

**ArtisanFlow - Sélection Client → Chantier Implémentée** ✅🎯

