# Analyse du Mode Hors Ligne - ArtisanFlow

**Date** : 2025-11-19  
**Contexte** : L'utilisateur rapporte que le mode hors ligne est "catastrophique"

---

## 📋 TABLE DES MATIÈRES

1. [État Actuel de l'Implémentation](#1-état-actuel-de-limplémentation)
2. [Fichiers et Composants](#2-fichiers-et-composants)
3. [Fonctionnalités par Écran](#3-fonctionnalités-par-écran)
4. [Problèmes Identifiés](#4-problèmes-identifiés)
5. [Architecture Actuelle](#5-architecture-actuelle)

---

## 1. ÉTAT ACTUEL DE L'IMPLÉMENTATION

### 1.1 Détection de Connexion

#### ✅ Systèmes en place

**1. Hook `useOffline`** (`hooks/useOffline.ts`)
- Utilise `@react-native-community/netinfo`
- Détecte `isConnected` ET `isInternetReachable`
- Retourne `{ isOffline: boolean }`

**2. Context `NetworkStatusContext`** (`contexts/NetworkStatusContext.tsx`)
- Provider global pour toute l'application
- Expose `isOffline` via `useNetworkStatus()`
- Utilisé dans `App.js` (lignes 21, 158, 171)

**3. `OfflineManager.isOnline()`** (`utils/offlineManager.js`)
- Utilise `expo-network` (⚠️ **DOUBLE DÉTECTION**)
- Vérifie `networkState.isConnected && networkState.isInternetReachable`

#### ⚠️ Problèmes identifiés

1. **Double système de détection** :
   - `useOffline` utilise `@react-native-community/netinfo`
   - `OfflineManager` utilise `expo-network`
   - Risque d'incohérence entre les deux

2. **Pas de vérification réelle de connectivité Supabase** :
   - La détection réseau ne garantit pas que Supabase est accessible
   - Pas de ping/test de connexion à Supabase

---

### 1.2 Stockage Local

#### ✅ Technologies utilisées

**AsyncStorage** (`@react-native-async-storage/async-storage`)
- Stockage clé-valeur JSON
- Utilisé pour :
  - Queue d'uploads (`@upload_queue`)
  - Cache de données (`@offline_cache`)
  - Cache clients (`offline_clients`)
  - Cache projets (`offline_projects`)
  - Cache documents (`offline_documents_cache`)

#### ✅ Services de cache

**1. `offlineCacheService.ts`**
- `cacheClients(clients[])` : Cache les clients
- `loadCachedClients()` : Charge depuis cache
- `cacheProjects(projects[])` : Cache les chantiers
- `loadCachedProjects()` : Charge depuis cache
- `cacheDocuments(documents[])` : Cache les devis/factures
- `loadCachedDocuments()` : Charge depuis cache

**2. `OfflineManager.cacheData(key, data)`**
- Cache générique avec timestamp
- Expiration configurable (maxAge)

#### ⚠️ Problèmes identifiés

1. **Pas de cache pour les détails** :
   - Les détails de chantier, client, devis ne sont pas mis en cache
   - Seules les listes sont cachées

2. **Pas de stratégie d'invalidation** :
   - Le cache n'est pas invalidé automatiquement
   - Pas de timestamp de dernière mise à jour

3. **Pas de limite de taille** :
   - Le cache peut grandir indéfiniment
   - Risque de saturation AsyncStorage

---

### 1.3 Synchronisation

#### ✅ Systèmes en place

**1. Queue d'uploads** (`offlineQueueService.ts`)
- Types supportés : `'photo' | 'note'`
- Structure : `{ id, type, data, createdAt, synced, retries }`
- Stockée dans AsyncStorage (`offline_queue`)

**2. Service de sync** (`syncService.ts`)
- `processOfflineQueue(isOffline)` : Traite la queue
- Upload photos hors ligne
- Upload notes hors ligne
- Retry limit : 3 tentatives
- Suppression des fichiers locaux après upload réussi

**3. `OfflineManager.processQueue(supabase)`**
- Traite la queue d'uploads
- Supporte : `'photo'`, `'voice'`, `'note'`, `'client'`, `'project'`
- Upload storage + DB pour médias
- Upload DB seulement pour données

**4. Traitement automatique** (`App.js`)
- Vérification périodique toutes les 10 secondes (ligne 124)
- Traitement après connexion utilisateur (ligne 102)

#### ⚠️ Problèmes identifiés

1. **Queue limitée** :
   - Seulement `'photo'` et `'note'` dans `offlineQueueService.ts`
   - Pas de support pour : devis, factures, modifications clients, modifications chantiers

2. **Pas de sync bidirectionnelle** :
   - Les modifications en ligne ne sont pas synchronisées vers le cache
   - Le cache peut devenir obsolète

3. **Pas de gestion de conflits** :
   - Si une donnée est modifiée en ligne pendant l'offline, pas de résolution

4. **Sync déclenchée manuellement** :
   - Pas de sync automatique au retour de connexion
   - Dépend de la vérification périodique (10s)

---

### 1.4 Gestion des Conflits

#### ❌ Aucune stratégie de résolution

- Pas de détection de conflits
- Pas de merge automatique
- Pas de stratégie "last write wins" ou "user choice"

---

## 2. FICHIERS ET COMPOSANTS

### 2.1 Fichiers de Détection

| Fichier | Rôle | Lignes clés |
|---------|------|-------------|
| `hooks/useOffline.ts` | Hook React pour détecter offline | 8-30 |
| `contexts/NetworkStatusContext.tsx` | Provider global pour statut réseau | 20-57 |
| `utils/offlineManager.js` | Manager avec `isOnline()` | 17-25 |
| `utils/networkManager.js` | Manager alternatif (non utilisé ?) | 8-175 |

### 2.2 Fichiers de Cache

| Fichier | Rôle | Lignes clés |
|---------|------|-------------|
| `services/offlineCacheService.ts` | Cache clients/projets/documents | 16-134 |
| `utils/offlineManager.js` | Cache générique | 207-254 |

### 2.3 Fichiers de Queue/Sync

| Fichier | Rôle | Lignes clés |
|---------|------|-------------|
| `services/offlineQueueService.ts` | Queue d'uploads (photo/note) | 25-106 |
| `services/syncService.ts` | Traitement de la queue | 16-208 |
| `utils/offlineManager.js` | Queue alternative | 33-133 |
| `utils/offlineQueue.js` | Queue legacy (non utilisé ?) | 1-49 |

### 2.4 Composants UI

| Fichier | Rôle | Lignes clés |
|---------|------|-------------|
| `components/OfflineIndicator.js` | Bannière "Mode hors ligne" | 11-78 |
| `components/common/OfflineBanner.tsx` | Bannière alternative | 10-45 |
| `components/NetworkStatusBar.js` | Barre de statut (importé dans App.js) | - |

### 2.5 Intégration dans App.js

- `NetworkStatusProvider` enveloppe toute l'app (lignes 158, 171)
- Vérification périodique toutes les 10s (ligne 124)
- Traitement queue après connexion (ligne 102)

---

## 3. FONCTIONNALITÉS PAR ÉCRAN

### 3.1 Dashboard / HomeScreen

#### ✅ Ce qui fonctionne
- **Affichage des chantiers** : ✅ Charge depuis cache si offline
- **Compteurs (actifs, terminés)** : ✅ Calculés depuis cache

#### ❌ Ce qui ne fonctionne pas
- **Dernières activités** : ❌ Pas de cache pour les activités
- **Mise à jour en temps réel** : ❌ Pas de refresh automatique

**Fichiers concernés** :
- `screens/CaptureHubScreen2.js` : Utilise `isOffline` (ligne 40)
- `screens/DashboardScreen2.js` : Pas de gestion offline visible

---

### 3.2 ClientsScreen (`ClientsListScreen2.js`)

#### ✅ Ce qui fonctionne
- **Liste des clients** : ✅ Charge depuis cache si offline (ligne 133)
- **Affichage** : ✅ Affiche les clients en cache

#### ❌ Ce qui ne fonctionne pas
- **Détails client** : ❌ Pas de cache pour les détails
- **Ajout client** : ❌ Pas de queue pour les nouveaux clients
- **Modification client** : ❌ Pas de queue pour les modifications
- **Suppression client** : ❌ Pas de queue pour les suppressions

**Code actuel** :
```javascript
// Ligne 133-138
if (isOffline) {
  const cachedClients = await loadCachedClients();
  setClients(cachedClients);
  return;
}
```

---

### 3.3 ProjectsScreen / Chantiers (`ProjectsListScreen.js`)

#### ✅ Ce qui fonctionne
- **Liste des chantiers** : ✅ Charge depuis cache si offline (ligne 46)
- **Affichage** : ✅ Affiche les chantiers en cache

#### ❌ Ce qui ne fonctionne pas
- **Détails chantier** : ❌ Pas de cache pour les détails
- **Création chantier** : ❌ Pas de queue pour les nouveaux chantiers
- **Modification chantier** : ❌ Pas de queue pour les modifications
- **Photos** : ⚠️ Partiellement (queue pour upload, mais pas pour création)
- **Notes vocales** : ⚠️ Partiellement (queue pour upload, mais pas pour création)

**Code actuel** :
```javascript
// Ligne 46-50
if (isOffline) {
  const cachedProjects = await loadCachedProjects();
  setProjects(cachedProjects);
  return;
}
```

---

### 3.4 DocumentsScreen (`DocumentsScreen2.js`)

#### ✅ Ce qui fonctionne
- **Liste devis/factures** : ✅ Charge depuis cache si offline (ligne 206)
- **Affichage** : ✅ Affiche les documents en cache

#### ❌ Ce qui ne fonctionne pas
- **Création devis** : ❌ Pas de queue pour les nouveaux devis
- **Modification devis** : ❌ Pas de queue pour les modifications
- **Génération PDF** : ❌ Nécessite connexion (ligne 418)
- **Signature** : ❌ Nécessite connexion (Edge Function)
- **Partage** : ❌ Nécessite connexion

**Code actuel** :
```javascript
// Ligne 206-214
if (isOffline) {
  const cachedDocs = await loadCachedDocuments();
  setDocuments(cachedDocs);
  if (cachedDocs.length === 0) {
    showError('Aucun document en cache...');
  }
  return;
}
```

---

### 3.5 EditDevisScreen

#### ❌ Ce qui ne fonctionne pas
- **Aucune gestion offline** : ❌ Pas de `isOffline` détecté
- **Modification devis** : ❌ Échoue si offline
- **Sauvegarde** : ❌ Échoue si offline
- **Ajout/suppression lignes** : ❌ Échoue si offline

**Fichier** : `screens/EditDevisScreen.js`
- Aucune référence à `isOffline`, `offlineQueue`, ou `cache`

---

### 3.6 ProjectDetailScreen

#### ❌ Ce qui ne fonctionne pas
- **Aucune gestion offline** : ❌ Pas de `isOffline` détecté
- **Affichage détails** : ❌ Échoue si offline
- **Photos** : ⚠️ Partiellement (PhotoUploader gère la queue)

---

### 3.7 PhotoUploader (`PhotoUploader.js`)

#### ✅ Ce qui fonctionne
- **Upload photos** : ✅ Queue si offline (ligne 36, 465)
- **Affichage photos** : ✅ Charge depuis Supabase (peut échouer offline)

#### ⚠️ Partiellement
- **Géolocalisation** : ⚠️ Peut échouer offline
- **Reverse geocoding** : ⚠️ Nécessite connexion

**Code actuel** :
```javascript
// Ligne 36
const { isOffline } = useNetworkStatus();

// Ligne 465 (probablement)
if (isOffline) {
  await addToQueue({ type: 'photo', data: {...} });
}
```

---

### 3.8 Génération IA (Devis/Factures)

#### ❌ Ce qui ne fonctionne pas
- **Transcription vocale** : ❌ Nécessite connexion (Whisper API)
- **Génération devis** : ❌ Nécessite connexion (GPT-4o-mini)
- **Parsing résultats** : ❌ Nécessite connexion

**Raison** : Les Edge Functions Supabase nécessitent une connexion internet.

---

## 4. PROBLÈMES IDENTIFIÉS

### 4.1 Problèmes Critiques 🔴

#### 1. **Pas de queue pour les modifications de données**
- **Impact** : Les modifications de devis, clients, chantiers sont perdues si offline
- **Fichiers concernés** : `EditDevisScreen.js`, `ClientsListScreen2.js`, `ProjectDetailScreen.js`
- **Solution nécessaire** : Implémenter une queue pour toutes les modifications

#### 2. **Pas de cache pour les détails**
- **Impact** : Impossible d'afficher les détails d'un chantier/client/devis offline
- **Fichiers concernés** : Tous les écrans de détails
- **Solution nécessaire** : Cache complet des détails avec relations

#### 3. **Double système de détection réseau**
- **Impact** : Incohérences possibles entre `useOffline` et `OfflineManager`
- **Fichiers concernés** : `hooks/useOffline.ts`, `utils/offlineManager.js`
- **Solution nécessaire** : Unifier sur un seul système

#### 4. **Pas de sync automatique au retour de connexion**
- **Impact** : Les données restent en queue jusqu'à la vérification périodique (10s)
- **Fichiers concernés** : `App.js`, `syncService.ts`
- **Solution nécessaire** : Écouter les changements réseau et sync immédiatement

#### 5. **EditDevisScreen complètement cassé offline**
- **Impact** : Impossible de modifier un devis offline
- **Fichiers concernés** : `screens/EditDevisScreen.js`
- **Solution nécessaire** : Implémenter queue + cache pour devis

---

### 4.2 Problèmes Moyens 🟡

#### 6. **Queue limitée aux photos et notes**
- **Impact** : Pas de support pour devis, factures, clients, chantiers
- **Fichiers concernés** : `offlineQueueService.ts`
- **Solution nécessaire** : Étendre les types de queue

#### 7. **Pas de stratégie d'invalidation du cache**
- **Impact** : Le cache peut devenir obsolète
- **Fichiers concernés** : `offlineCacheService.ts`
- **Solution nécessaire** : Timestamps + invalidation automatique

#### 8. **Pas de gestion de conflits**
- **Impact** : Perte de données si modifications concurrentes
- **Fichiers concernés** : Tous
- **Solution nécessaire** : Stratégie de résolution de conflits

#### 9. **Pas de limite de taille du cache**
- **Impact** : Risque de saturation AsyncStorage
- **Fichiers concernés** : `offlineCacheService.ts`
- **Solution nécessaire** : Limite + nettoyage automatique

#### 10. **Messages d'erreur pas adaptés**
- **Impact** : UX confuse quand offline
- **Fichiers concernés** : Tous les écrans
- **Solution nécessaire** : Messages clairs "Mode hors ligne"

---

### 4.3 Problèmes Mineurs 🟢

#### 11. **Pas d'indicateur offline dans tous les écrans**
- **Impact** : L'utilisateur ne sait pas toujours qu'il est offline
- **Fichiers concernés** : Certains écrans
- **Solution nécessaire** : Bannière globale ou indicateur par écran

#### 12. **Pas de feedback pendant sync**
- **Impact** : L'utilisateur ne sait pas que la sync est en cours
- **Fichiers concernés** : `syncService.ts`
- **Solution nécessaire** : Toast ou indicateur de progression

#### 13. **Géolocalisation peut échouer offline**
- **Impact** : Photos sans localisation si offline
- **Fichiers concernés** : `PhotoUploader.js`
- **Solution nécessaire** : Cache de la dernière position connue

---

## 5. ARCHITECTURE ACTUELLE

### 5.1 Schéma de Détection

```
App.js
  └─ NetworkStatusProvider
       └─ useNetworkStatus() → isOffline
            ├─ hooks/useOffline.ts (NetInfo)
            └─ utils/offlineManager.js (expo-network) ⚠️ DOUBLE
```

### 5.2 Schéma de Cache

```
Écran (ex: ClientsListScreen2)
  ├─ isOffline ? 
  │   ├─ OUI → loadCachedClients()
  │   └─ NON → supabase.from('clients').select()
  │
  └─ Après chargement en ligne → cacheClients(data)
```

### 5.3 Schéma de Queue

```
Action (ex: PhotoUploader)
  ├─ isOffline ?
  │   ├─ OUI → addToQueue({ type: 'photo', data })
  │   └─ NON → Upload direct Supabase
  │
  └─ App.js (toutes les 10s)
       └─ processOfflineQueue()
            └─ syncService.ts
                 ├─ uploadOfflinePhoto()
                 └─ uploadOfflineNote()
```

### 5.4 Problèmes d'Architecture

1. **Pas de couche d'abstraction** :
   - Chaque écran gère offline différemment
   - Pas de service unifié

2. **Queue et cache séparés** :
   - `offlineQueueService.ts` pour queue
   - `offlineCacheService.ts` pour cache
   - Pas de coordination entre les deux

3. **Pas de stratégie globale** :
   - Chaque écran décide comment gérer offline
   - Pas de règles uniformes

---

## 6. RÉSUMÉ EXÉCUTIF

### ✅ Ce qui fonctionne
- Détection offline (avec incohérences)
- Cache des listes (clients, projets, documents)
- Queue pour photos et notes
- Sync automatique périodique (toutes les 10s)

### ❌ Ce qui ne fonctionne pas
- Modifications de données (devis, clients, chantiers)
- Affichage des détails offline
- Création de nouvelles entités offline
- Sync immédiate au retour de connexion
- Gestion de conflits
- Invalidation du cache

### 🎯 Priorités de Correction

1. **CRITIQUE** : Implémenter queue pour toutes les modifications
2. **CRITIQUE** : Cache complet des détails
3. **CRITIQUE** : Unifier la détection réseau
4. **IMPORTANT** : Sync automatique au retour de connexion
5. **IMPORTANT** : Étendre les types de queue
6. **MOYEN** : Stratégie d'invalidation du cache
7. **MOYEN** : Gestion de conflits

---

**Fin du rapport**

