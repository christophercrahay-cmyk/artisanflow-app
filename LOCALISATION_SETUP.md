# Configuration de la localisation et météo

## 📋 Résumé des fonctionnalités ajoutées

### 1. Bloc météo sur l'écran d'accueil
- Badge météo affiché dans le header de la page d'accueil
- Affichage de la température, icône météo et nom de la ville
- Basé sur la position GPS de l'utilisateur
- Utilise l'API OpenWeatherMap

### 2. Horodatage et géolocalisation des photos
- Chaque photo de chantier stocke :
  - `taken_at` : Date/heure de prise de vue (timestamp)
  - `latitude`, `longitude` : Position GPS au moment de la photo
- Affichage sous chaque photo :
  - Date formatée : "Prise le JJ/MM/AAAA à HH:MM"
  - Badge "géolocalisée" si coordonnées disponibles

---

## 🔧 Configuration requise

### 1. Clé API OpenWeatherMap

1. Créer un compte sur [OpenWeatherMap](https://openweathermap.org/api)
2. Générer une clé API (gratuite jusqu'à 1000 appels/jour)
3. Ouvrir le fichier `services/weatherService.js`
4. Remplacer `YOUR_API_KEY_HERE` par votre clé :

```javascript
const WEATHER_API_KEY = 'votre_cle_api_ici';
```

### 2. Migration SQL Supabase

Exécuter la migration SQL dans Supabase SQL Editor :

```sql
-- Fichier : supabase/migrations_location_photos.sql
-- Copier-coller le contenu dans Supabase SQL Editor et exécuter
```

**Étapes :**
1. Ouvrir Supabase Dashboard
2. Aller dans "SQL Editor"
3. Coller le contenu de `supabase/migrations_location_photos.sql`
4. Cliquer sur "Run"

---

## 📁 Fichiers créés/modifiés

### Nouveaux fichiers
- `services/weatherService.js` - Service météo avec OpenWeatherMap
- `hooks/useWeather.js` - Hook React pour récupérer la météo
- `components/WeatherBadge.js` - Composant badge météo
- `supabase/migrations_location_photos.sql` - Migration SQL pour les colonnes de localisation

### Fichiers modifiés
- `app.json` - Ajout des permissions de localisation (iOS et Android)
- `components/HomeHeader.tsx` - Intégration du badge météo
- `PhotoUploader.js` - Capture de `taken_at`, `latitude`, `longitude` + affichage des infos

---

## 🎨 Affichage des photos

Chaque photo affiche maintenant :
- **Date de prise** : "Prise le 04/11/2025 à 14:30"
- **Badge géolocalisation** : Icône + texte "géolocalisée" (si GPS disponible)

---

## ⚙️ Permissions

L'application demande automatiquement les permissions de localisation :
- **Au lancement** : Pour la météo
- **Lors de la prise de photo** : Pour géolocaliser la photo

**Comportement si permission refusée :**
- L'app continue de fonctionner normalement
- La météo affiche "Météo indisponible"
- Les photos sont enregistrées sans géolocalisation

---

## 🔍 Test

1. **Météo** :
   - Ouvrir l'écran d'accueil
   - Vérifier que le badge météo s'affiche (ou "Météo indisponible" si permission refusée)

2. **Photos géolocalisées** :
   - Prendre une photo depuis un chantier
   - Vérifier que la date et le badge "géolocalisée" apparaissent sous la photo

---

## 📝 Notes techniques

- Les coordonnées GPS sont stockées avec une précision `Balanced` (équilibre entre précision et batterie)
- Les photos anciennes (sans `taken_at`) utilisent `created_at` comme fallback pour l'affichage
- La migration SQL crée des index pour optimiser les requêtes futures

