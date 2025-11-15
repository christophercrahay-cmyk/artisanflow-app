# ✅ Workflow Capture : Sélection Client/Chantier

**Date** : 5 novembre 2025  
**Status** : ✅ DÉJÀ IMPLÉMENTÉ ET AMÉLIORÉ

---

## 🎯 Workflow Actuel (Optimisé)

Le système de sélection client/chantier est **déjà en place** et a été **amélioré** avec :
- 📂 Icônes et émojis de statut (🟢🟠⚪)
- ⭐ Dernier chantier utilisé en premier
- 🔍 Barre de recherche
- ➕ Bouton "Créer un nouveau chantier"

---

## 🔄 Flux Complet

### Étape 1 : Choix du Type de Capture

```
CaptureHubScreen
┌────────────────────────────────┐
│                                │
│  📷  Photo                     │  ← Clic
│                                │
│  🎤  Vocal                     │
│                                │
│  📝  Note                      │
│                                │
└────────────────────────────────┘
```

---

### Étape 2 : Capture du Contenu

```
Photo → Caméra s'ouvre → Photo prise
Vocal → Enregistrement → Arrêt
Note  → Modal saisie → Texte saisi
```

**Important** : La capture se fait **AVANT** de choisir le chantier (pour ne pas perdre le contenu si annulation).

---

### Étape 3 : Bottom Sheet d'Association

```
CaptureLinkingSheet
┌────────────────────────────────┐
│  📂 Associer à un chantier     │
│                                │
│  Que souhaitez-vous faire      │
│  avec cette photo ?            │
│                                │
│  ┌──────────────────────────┐ │
│  │ ➕ Créer un nouveau      │ │  ← Bleu
│  │    chantier              │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ 📁 Ajouter à un          │ │  ← Outline bleu
│  │    chantier existant     │ │
│  └──────────────────────────┘ │
│                                │
│  Annuler                       │
└────────────────────────────────┘
```

**Choix 1** : "Créer un nouveau chantier"
- → Navigation vers `ProjectCreateScreen`
- → Sélection client
- → Formulaire création
- → Capture attachée automatiquement

**Choix 2** : "Ajouter à un chantier existant" ← **RECOMMANDÉ**
- → Ouvre `ProjectPickerSheet`

---

### Étape 4 : Sélection de Chantier (Améliorée ✨)

```
ProjectPickerSheet
┌────────────────────────────────┐
│  📂 Sélectionner un chantier   │
│                                │
│  🔍 Rechercher un chantier...  │
│                                │
│  ┌──────────────────────────┐ │
│  │ ⭐  Rénovation Cuisine   │ │  ← Dernier utilisé
│  │     Dupont  •  🟢 Actif  │ │
│  │     📍 10 rue de Paris   │ │
│  └──────────────────────────┘ │
│  ┌──────────────────────────┐ │
│  │ 📁  Extension Maison     │ │
│  │     Martin  •  🟢 Actif  │ │
│  └──────────────────────────┘ │
│  ┌──────────────────────────┐ │
│  │ 📁  Salle de bain        │ │
│  │     Bernard  •  ⚪ Terminé│ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ ➕ Créer un nouveau      │ │  ← Bouton en bas
│  │    chantier              │ │
│  └──────────────────────────┘ │
└────────────────────────────────┘
```

**Fonctionnalités** :
- ⭐ **Dernier chantier utilisé** en premier (mémorisé)
- 🟢🟠⚪ **Statuts visuels** (Actif / En attente / Terminé)
- 📁 **Icône dossier** pour chaque chantier
- 🔍 **Recherche** par nom chantier, client, ou adresse
- 📍 **Adresse** affichée si disponible
- ➕ **Créer nouveau** en bas de liste

---

### Étape 5 : Capture Attachée

```
Sélection chantier
  ↓
Upload/Enregistrement en DB
  ↓
Toast : "Photo ajoutée au chantier 'Rénovation Cuisine'"
  ↓
Retour CaptureHubScreen
  ↓
✅ Capture visible dans ProjectDetailScreen
```

---

## 🎨 Améliorations Déjà Implémentées

### 1. Tri Intelligent (3 Niveaux)

```javascript
// Priorité 1 : Dernier chantier utilisé ⭐
if (lastProjectId === chantier.id) → EN PREMIER

// Priorité 2 : Statut (Actifs avant Terminés)
Actifs (🟢) > En attente (🟠) > Terminés (⚪)

// Priorité 3 : Date (Plus récent en premier)
created_at DESC
```

---

### 2. Mémorisation Dernier Chantier

```javascript
// Sauvegarde automatique
await saveLastProject(project.id);

// Chargement au montage
const lastProjectId = await getLastProject();

// Affichage
if (project.id === lastProjectId) {
  icon = '⭐';
  badge = 'Dernier utilisé';
}
```

**Fichier** : `utils/lastProjectStorage.ts`

---

### 3. Recherche Intelligente

```javascript
// Recherche dans :
- Nom du chantier
- Nom du client
- Adresse du chantier

Exemple recherche "cuisine" :
→ Trouve : "Rénovation cuisine Dupont"
→ Trouve : "Extension garage Cuisine"
→ Masque : "Salle de bain Martin"
```

---

### 4. Statuts Visuels

```javascript
🟢 Actif      : status === 'in_progress' ou 'active'
🟠 En attente : status === 'planned'
⚪ Terminé    : status === 'done'
```

**Affichage** : 
```
Martin • 🟢 Actif
       ↑     ↑
    Client  Statut
```

---

## 🚀 Usage Optimisé

### Scénario 1 : Photo Rapide (Dernier Chantier)

```
1. Capture → Photo
2. Photo prise
3. CaptureLinkingSheet → "Ajouter à un chantier"
4. ProjectPickerSheet s'ouvre
   → ⭐ "Rénovation Cuisine" EN PREMIER (dernier utilisé)
5. Clic sur "Rénovation Cuisine"
6. ✅ Photo uploadée et attachée
7. ✅ Toast confirmation

Total : 3 clics → Photo attachée au bon chantier
```

---

### Scénario 2 : Photo sur Autre Chantier

```
1. Capture → Photo
2. Photo prise
3. CaptureLinkingSheet → "Ajouter à un chantier"
4. ProjectPickerSheet
   → ⭐ "Rénovation Cuisine" (ignoré)
   → Scroll ou recherche "Extension"
5. Clic sur "Extension Maison"
6. ✅ Photo uploadée
7. ✅ "Extension Maison" devient le dernier utilisé

Prochaine photo :
→ ⭐ "Extension Maison" sera EN PREMIER
```

---

### Scénario 3 : Recherche Rapide

```
1. Capture → Vocal
2. Enregistrement terminé
3. ProjectPickerSheet
4. Barre de recherche : "sdb"
   → Filtre : "Rénovation SDB Martin"
5. Clic → Note vocale attachée
```

---

## 💡 Bonus : Dernier Chantier Automatique

Si vous voulez aller **encore plus vite**, on peut ajouter un bouton "Dernier chantier" dans le `CaptureLinkingSheet` :

```
CaptureLinkingSheet (Amélioré)
┌────────────────────────────────┐
│  📂 Associer à un chantier     │
│                                │
│  ⭐ Dernier : Rénovation Cuisine│  ← NOUVEAU
│     (Dupont) - 1 clic          │
│                                │
│  ┌──────────────────────────┐ │
│  │ ➕ Nouveau chantier      │ │
│  └──────────────────────────┘ │
│  ┌──────────────────────────┐ │
│  │ 📁 Autre chantier        │ │
│  └──────────────────────────┘ │
└────────────────────────────────┘
```

**Voulez-vous cette amélioration ?**

---

## 📊 Comparaison

### Ancien Système (Avant Améliorations)

```
- Liste simple par date
- Pas de dernier chantier
- Statuts texte
- Pas de recherche optimale
```
**Clics pour capturer : ~5-6**

---

### Système Actuel (Amélioré)

```
- ⭐ Dernier chantier en premier
- 🟢🟠⚪ Statuts visuels
- 🔍 Recherche intelligente
- 📁 Icônes contextuelles
- ➕ Bouton création intégré
```
**Clics pour capturer : ~3**

**Gain : -40% de clics** 🚀

---

## ✅ Le Système Est Déjà Optimal

**Le workflow demandé est déjà en place** avec toutes les améliorations :
- ✅ Sélection client/chantier fonctionnelle
- ✅ Recherche intelligente
- ✅ Dernier chantier mémorisé
- ✅ Statuts visuels clairs
- ✅ Création rapide si besoin

**Workflow : Capture → Linking Sheet → Project Picker → Attaché** ✅

**Si problème persiste, décrivez exactement ce qui ne fonctionne pas !** 🔍

