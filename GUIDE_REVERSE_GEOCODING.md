# 📍 Guide - Reverse Geocoding pour les Photos

## ✅ Implémentation terminée

Le reverse geocoding est maintenant implémenté pour afficher automatiquement la ville sous les photos géolocalisées.

## 📋 Étapes pour activer

### 1. Exécuter le script SQL

**IMPORTANT** : Exécutez ce script dans Supabase avant de tester !

1. Ouvrir **Supabase Dashboard** → **SQL Editor**
2. Copier-coller le contenu de `sql/add_city_to_project_photos.sql`
3. Cliquer sur **Run**

Ce script ajoute la colonne `city` à la table `project_photos`.

### 2. Tester la fonctionnalité

1. **Prendre une nouvelle photo** :
   - Aller sur un chantier
   - Cliquer sur "Prendre une photo"
   - Autoriser la géolocalisation si demandée
   - Prendre la photo

2. **Vérifier l'affichage** :
   - La photo devrait afficher la **ville** sous la date (ex: "Chaffois")
   - Si la ville n'est pas détectée, affiche "géolocalisée" en fallback

## 🔧 Fonctionnement technique

### Code modifié

**Fichier** : `PhotoUploader.js`

1. **Capture GPS + Reverse Geocoding** (lignes 156-230) :
   - Capture les coordonnées GPS avec `getCurrentPositionAsync()`
   - Appelle `reverseGeocodeAsync()` pour convertir en ville
   - Priorise `city`, sinon `locality`, sinon `subLocality`

2. **Stockage** (lignes 279-287) :
   - Stocke `latitude`, `longitude` ET `city` dans `project_photos`

3. **Affichage** (lignes 509-515) :
   - Affiche `item.city` si disponible
   - Sinon affiche "géolocalisée" en fallback

### Structure de données

**Table `project_photos`** :
- `latitude` (NUMERIC) - Coordonnée latitude
- `longitude` (NUMERIC) - Coordonnée longitude  
- `city` (TEXT) - **NOUVEAU** : Ville obtenue via reverse geocoding

## 📱 Comportement

### Cas 1 : Ville détectée ✅
- **Affichage** : "📍 Chaffois" (ou autre ville)
- **Condition** : GPS activé + reverse geocoding réussi

### Cas 2 : Coordonnées sans ville
- **Affichage** : "📍 géolocalisée"
- **Condition** : GPS activé mais reverse geocoding échoué ou pas de ville

### Cas 3 : Pas de GPS
- **Affichage** : Rien (pas de badge)
- **Condition** : Permission refusée ou GPS désactivé

## 🐛 Dépannage

### La ville ne s'affiche pas

1. **Vérifier que le script SQL a été exécuté** :
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'project_photos' AND column_name = 'city';
   ```
   Doit retourner une ligne avec `city`.

2. **Vérifier les logs** :
   - Chercher `[PhotoUploader] Ville détectée: ...` dans la console
   - Si absent, vérifier les erreurs de reverse geocoding

3. **Vérifier les permissions GPS** :
   - Android : Paramètres → Applications → ArtisanFlow → Permissions → Localisation
   - iOS : Paramètres → ArtisanFlow → Localisation

### Photos existantes

Les photos prises **avant** l'exécution du script SQL n'auront pas de ville.
Seules les **nouvelles photos** prises après l'activation auront la ville.

## 📝 Notes techniques

- Le reverse geocoding utilise les services natifs du système (iOS/Android)
- Pas besoin d'API externe (Google Maps, etc.)
- Fonctionne hors ligne si les données sont en cache
- Timeout implicite : si le reverse geocoding prend trop de temps, la photo est sauvegardée sans ville

---

**Version** : 1.0  
**Date** : 2025-11-13










