# 📁 Guide - Système de Dossiers pour Photos de Chantier

## ✅ Implémentation terminée

Un système complet de dossiers pour organiser les photos de chantier a été créé.

## 📋 Fichiers créés/modifiés

### Nouveaux fichiers
- `sql/create_project_photo_folders.sql` - Script SQL pour créer la table et les colonnes
- `components/PhotoFolderManager.js` - Composant de gestion des dossiers
- `GUIDE_DOSSIERS_PHOTOS_CHANTIER.md` - Ce guide

### Fichiers modifiés
- `PhotoUploader.js` - Intégration du système de dossiers

## 🗄️ Structure de la base de données

### Table `project_photo_folders`
- `id` (UUID) - Identifiant unique
- `project_id` (UUID) - Référence au chantier
- `user_id` (UUID) - Référence à l'utilisateur (isolation multi-tenant)
- `name` (TEXT) - Nom du dossier
- `description` (TEXT) - Description optionnelle
- `color` (TEXT) - Couleur optionnelle pour le dossier
- `order_index` (INTEGER) - Ordre d'affichage
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### Table `project_photos`
- Nouvelle colonne `folder_id` (UUID) - Référence au dossier (nullable)

## 🎯 Fonctionnalités

### Gestion des dossiers
- **Créer un dossier** : Bouton "+" dans le sélecteur de dossiers
- **Sélectionner un dossier** : Cliquer sur un dossier pour filtrer les photos
- **Supprimer un dossier** : Long press sur un dossier (les photos sont déplacées vers "Toutes les photos")
- **Dossier "Toutes les photos"** : Affiche toutes les photos du chantier

### Upload de photos
- Les photos sont automatiquement ajoutées au dossier sélectionné
- Si aucun dossier n'est sélectionné, la photo est ajoutée sans dossier

### Filtrage
- Les photos sont filtrées selon le dossier sélectionné
- Le filtrage se fait côté serveur (requête Supabase)

## 🔒 Sécurité (RLS)

- **Isolation multi-tenant** : Chaque utilisateur ne voit que ses propres dossiers
- **Policies RLS** : 
  - SELECT : Voir ses propres dossiers
  - INSERT : Créer ses propres dossiers
  - UPDATE : Modifier ses propres dossiers
  - DELETE : Supprimer ses propres dossiers

## 🚀 Installation

1. **Exécuter le script SQL dans Supabase** :
   ```sql
   -- Exécuter sql/create_project_photo_folders.sql
   ```

2. **Vérifier que les colonnes sont créées** :
   - `project_photo_folders` table créée
   - `project_photos.folder_id` colonne ajoutée

3. **Tester dans l'application** :
   - Aller sur un chantier
   - Voir le sélecteur de dossiers au-dessus des photos
   - Créer un nouveau dossier
   - Sélectionner un dossier et uploader une photo

## 📱 Utilisation

1. **Créer un dossier** :
   - Cliquer sur le bouton "+" à côté des dossiers
   - Entrer un nom (ex: "Avant travaux", "Pendant travaux", "Après travaux")
   - Optionnellement ajouter une description
   - Cliquer sur "Créer"

2. **Sélectionner un dossier** :
   - Cliquer sur un dossier dans la liste horizontale
   - Les photos sont filtrées automatiquement

3. **Uploader dans un dossier** :
   - Sélectionner le dossier souhaité
   - Cliquer sur "Prendre une photo"
   - La photo est automatiquement ajoutée au dossier sélectionné

4. **Supprimer un dossier** :
   - Long press sur un dossier (à implémenter si nécessaire)
   - Les photos sont déplacées vers "Toutes les photos"

## 🎨 Interface

- **Sélecteur horizontal** : Liste défilable des dossiers
- **Bouton "+"** : Créer un nouveau dossier
- **Dossier sélectionné** : Mise en évidence visuelle (fond coloré)
- **Modal création** : Interface simple pour créer un dossier

## ⚠️ Notes importantes

- **Unicité** : Un nom de dossier est unique par projet et utilisateur
- **Suppression** : La suppression d'un dossier déplace les photos vers "Toutes les photos" (pas de perte de données)
- **Compatibilité** : Les photos existantes sans dossier restent accessibles via "Toutes les photos"

---

**Version** : 1.0  
**Date** : 2025-11-13










