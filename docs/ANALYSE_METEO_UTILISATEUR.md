# 🔍 Analyse : Météo par Utilisateur

## 📊 État Actuel

### ❌ Problème Identifié

**Le code actuel utilise le GPS** au lieu de la ville de l'utilisateur :

1. **`hooks/useWeather.js`** :
   - ✅ Utilise `expo-location` pour obtenir la position GPS
   - ❌ **N'utilise PAS** la ville depuis Supabase
   - ❌ Demande la permission GPS (UX problématique)

2. **`services/weatherService.js`** :
   - ✅ Utilise OpenWeatherMap API
   - ❌ Fonction `fetchWeather()` accepte uniquement `latitude, longitude`
   - ❌ **Pas de fonction pour rechercher par nom de ville**

3. **Table `brand_settings`** :
   - ✅ Contient `company_address` (adresse complète)
   - ❌ **Pas de champ `city` ou `company_city` dédié**
   - ⚠️ La ville devrait être extraite de `company_address` ou stockée séparément

## 🎯 Solution Recommandée

### 1. Ajouter un champ `city` dans `brand_settings`

```sql
ALTER TABLE brand_settings 
ADD COLUMN IF NOT EXISTS company_city TEXT;
```

### 2. Modifier `weatherService.js` pour supporter la recherche par ville

OpenWeatherMap API supporte la recherche par nom de ville :
- Endpoint : `https://api.openweathermap.org/data/2.5/weather?q={city}&appid={key}`

### 3. Modifier `useWeather.js` pour utiliser la ville depuis Supabase

- Récupérer `company_city` depuis `brand_settings` (filtré par `user_id`)
- Utiliser cette ville pour la météo au lieu du GPS

## 📈 Analyse : Logique / Performance / UX

### ✅ Logique
- **Correct** : Chaque utilisateur a sa propre ville dans `brand_settings`
- **Correct** : RLS garantit que chaque user voit ses propres settings
- **Amélioration nécessaire** : Extraire/utiliser `company_city` au lieu de GPS

### ⚡ Performance
- **Avantage** : Pas de permission GPS = pas de latence GPS
- **Avantage** : Requête Supabase simple (1 requête pour récupérer la ville)
- **Avantage** : Cache possible de la ville (moins de requêtes Supabase)
- **Neutre** : OpenWeatherMap API reste la même (1 requête par ville)

### 🎨 UX
- **✅ BON** : Pas besoin de permission GPS (plus fluide)
- **✅ BON** : Météo basée sur la ville de l'entreprise (plus logique pour un artisan)
- **✅ BON** : Utilisateur configure sa ville une fois dans les paramètres
- **⚠️ À prévoir** : Gestion du cas où `company_city` est vide (fallback ou message)

## 🔧 Modifications Nécessaires

1. **Migration SQL** : Ajouter `company_city` à `brand_settings`
2. **`weatherService.js`** : Ajouter `fetchWeatherByCity(cityName)`
3. **`useWeather.js`** : Remplacer GPS par récupération de `company_city` depuis Supabase
4. **`SettingsScreen.js`** : Ajouter un champ pour saisir/modifier `company_city`

## 📝 Recommandations

1. **Fallback intelligent** :
   - Si `company_city` est vide → extraire la ville depuis `company_address`
   - Si toujours vide → message "Configurez votre ville dans les paramètres"

2. **Cache** :
   - Stocker la ville dans AsyncStorage pour éviter les requêtes Supabase répétées
   - Recharger uniquement si les settings changent

3. **Validation** :
   - Vérifier que la ville existe dans OpenWeatherMap avant de sauvegarder
   - Proposer des suggestions de villes (autocomplete)

