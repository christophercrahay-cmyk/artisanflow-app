# 🧪 QA Test Runner - Guide Complet

## 📋 Vue d'Ensemble

Le **QA Test Runner** est un écran caché permettant d'exécuter des tests E2E automatisés sur l'ensemble du flux ArtisanFlow.

### ⚠️ Accès

**Disponible Uniquement en Mode DEV**

- L'écran n'apparaît QUE si `__DEV__ === true`
- Invisible dans les builds production
- Supprimé automatiquement lors du build release

---

## 🚀 Accéder au QA Runner

### Méthode 1 : 10 Taps Rapides (Recommandé)

1. Ouvrez l'app en mode dev (`npx expo start`)
2. Allez dans l'onglet **"Documents"**
3. **Tapez 10 fois rapidement** sur le titre **"Documents"** (lignes "Documents" + "Devis & Factures")
4. L'écran QA Test Runner s'ouvre automatiquement

**Astuce** : Les taps doivent être effectués en moins de 500ms chacun

### Méthode 2 : Navigation Directe (Debug)

Si vous êtes en mode développement React Native Debugger :

```javascript
navigation.navigate('QATestRunner');
```

---

## 🎯 Scénario de Test Exécuté

Le runner exécute **7 étapes** en séquence :

### 1. Créer Client de Test ✅
- Nom : `QA_TestClient_{timestamp}`
- Téléphone, email, adresse mockés
- Client inséré dans Supabase

### 2. Créer Chantier de Test ✅
- Nom : `QA_TestProject_{timestamp}`
- Lié au client créé
- Statut : "active"

### 3. Ajouter Note Vocale Mock ✅
- Transcription pré-générée (pas de Whisper réel)
- Durée : 10 secondes
- Liée au chantier et client

### 4. Générer Devis via IA ✅
- Utilise `generateQuoteFromTranscription()`
- Analyse la transcription mockée
- Détecte 8 prises, 2 interrupteurs, 6 heures
- Crée un devis avec lignes, HT, TVA, TTC
- **Vérifications** :
  - ≥ 1 ligne de prestation
  - Totaux HT/TTC cohérents
  - Pas de NaN

### 5. Générer PDF ✅
- Génère un PDF via `expo-print`
- Upload vers Supabase Storage (bucket `docs`)
- Met à jour le devis avec `pdf_url`
- **Vérifications** :
  - PDF généré sans erreur
  - URL accessible

### 6. Créer Facture ✅
- Basée sur le devis créé
- Numérotation automatique
- Montants copiés du devis
- **Vérifications** :
  - Facture créée avec montants corrects

### 7. Upload Photo Mock ✅
- Image 1x1 pixel PNG (minimal)
- Upload vers `project-photos`
- URL publique générée
- **Vérifications** :
  - Photo uploadée
  - URL accessible

---

## 📊 Rapport de Test

### Format JSON

Le rapport contient :

```json
{
  "runId": "qa_run_1234567890",
  "startTime": 1234567890000,
  "endTime": 1234567895000,
  "duration": 5000,
  "steps": {
    "1_CreateClient": { "status": "✅", "timestamp": 1234567890100 },
    "2_CreateProject": { "status": "✅", "timestamp": 1234567890200 },
    ...
  },
  "ids": {
    "client_id": "uuid-...",
    "project_id": "uuid-...",
    "devis_id": "uuid-...",
    "pdf_url": "https://...",
    ...
  },
  "errors": []
}
```

### Affichage dans l'UI

Le rapport affiche :
- ✅/❌ Statut de chaque étape
- IDs et URLs créés (client_id, project_id, devis_id, pdf_url, etc.)
- Erreurs éventuelles
- Durée totale d'exécution

---

## 🔧 Actions Disponibles

### ▶️ Run Full Flow

**Action** : Lance l'exécution complète des 7 étapes

**Comportement** :
- Désactive les boutons pendant l'exécution
- Affiche un spinner de chargement
- Log en temps réel dans la console
- Affiche le rapport à la fin

**Durée estimée** : 5-10 secondes

---

### 🗑️ Purge Last Run

**Action** : Supprime UNIQUEMENT les données du dernier run

**Comportement** :
- Confirmation avant suppression
- Suppression dans l'ordre :
  1. Facture
  2. Devis
  3. Note
  4. Photo (Storage)
  5. Projet
  6. Client

**⚠️ Sécurité** :
- Ne supprime QUE les données créées par le QA Runner
- Utilise les IDs stockés dans le rapport
- Ne touche PAS aux données de l'utilisateur

---

### 📄 Export Report

**Action** : Exporte le rapport au format JSON

**Comportement** :
- Crée un fichier `.json` temporaire
- Partage via `expo-sharing`
- Compatible avec mail, drive, etc.

**Usage** :
- Documentation de tests
- Debugging d'erreurs
- CI/CD integration

---

## 🐛 Gestion des Erreurs

### En Cas d'Échec

Le runner continue même si une étape échoue :
- Arrête le flux à l'étape en erreur
- Log l'erreur dans le rapport
- Affiche ✅ pour les étapes réussies
- Affiche ❌ pour l'étape en échec

### Logs en Temps Réel

Tous les logs sont affichés dans la console :

```
[QA] 1_CreateClient: ✅ { clientId: '...' }
[QA] 2_CreateProject: ✅ { projectId: '...' }
[QA] 4_GenerateDevisIA: ❌ { error: '...' }
```

---

## 🔍 Vérifications Implémentées

### Étape 4 : Devis IA
```javascript
✅ Au moins 1 prestation détectée
✅ Totaux HT/TTC non-NaN
✅ Totaux > 0
✅ Devis créé en base
```

### Étape 5 : PDF
```javascript
✅ PDF généré sans erreur
✅ Upload Supabase réussi
✅ pdf_url accessible
```

### Étape 6 : Facture
```javascript
✅ Montants copiés du devis
✅ Numéro unique généré
✅ Facture créée en base
```

### Étape 7 : Photo
```javascript
✅ Upload Storage réussi
✅ URL publique générée
✅ Photo insérée en base
```

---

## 🛠️ Architecture Technique

### Fichiers Créés

```
artisanflow/
├── screens/
│   └── QATestRunnerScreen.js      # UI du runner
├── utils/
│   ├── qaRunner.js                 # Logique du runner
│   └── qaMocks.js                  # Données mockées
├── README_QA.md                    # Cette documentation
└── GUIDE_SUPABASE.md               # Guide SQL (modifié)
```

### Intégration Navigation

```javascript
// navigation/AppNavigator.js
let QATestRunnerScreen = null;
if (__DEV__) {
  QATestRunnerScreen = require('../screens/QATestRunnerScreen').default;
}
```

### Accès Caché

```javascript
// screens/DocumentsScreen.js
const handleTitleTap = () => {
  // Compte 10 taps rapides
  if (tapCount >= 10 && __DEV__) {
    navigation.navigate('QATestRunner');
  }
};
```

---

## 🚫 Limites et Contraintes

### Mock vs Réel

| Composant | Mode QA | Mode Production |
|-----------|---------|-----------------|
| Whisper | ❌ Mock transcription | ✅ Whisper.rn réel |
| Audio | ❌ Pas d'enregistrement | ✅ Caméra + upload |
| Photos | ✅ Image 1x1 pixel | ✅ Camera réelle |
| IA Devis | ✅ Même logique | ✅ Même logique |
| PDF | ✅ Même génération | ✅ Même génération |

### Pas de Régressions

- Le runner n'utilise PAS les fonctions mockées pour les vraies données
- Chaque test isolé (IDs préfixés `QA_Test`)
- Purge complète garantie

---

## 📈 Utilisation en Production

### Avant Chaque Release

1. ✅ Lancer le runner en mode dev
2. ✅ Vérifier tous les ✅ verts
3. ✅ Exporter le rapport
4. ✅ Commiter le rapport dans le repo
5. ✅ Build production

### CI/CD Integration

```bash
# Exemple GitHub Actions
- name: Run QA Tests
  run: |
    npx expo start --no-dev &
    sleep 10
    # Lancer automatiquement le runner via detox ou appium
```

---

## 🆘 Troubleshooting

### Le runner ne s'ouvre pas

**Cause** : Mode production ou `__DEV__ = false`  
**Solution** : Assurez-vous d'être en mode dev (`npx expo start`)

### Erreur "Module not found"

**Cause** : Import manquant  
**Solution** : Vérifiez que tous les fichiers utils/qa* existent

### Erreur Supabase

**Cause** : Tables manquantes ou RLS  
**Solution** : Exécutez `INIT_SUPABASE.sql` dans Supabase

### Photo pas uploadée

**Cause** : Bucket `project-photos` non accessible  
**Solution** : Vérifiez les permissions Storage dans Supabase

---

## 📚 Ressources

- **Code du Runner** : `utils/qaRunner.js`
- **Mocks** : `utils/qaMocks.js`
- **UI** : `screens/QATestRunnerScreen.js`
- **Nav** : `navigation/AppNavigator.js`
- **Guide Supabase** : `GUIDE_SUPABASE.md`

---

**Développé par l'équipe ArtisanFlow** 🚀  
**Version** : 1.0.0  
**Date** : 2024

