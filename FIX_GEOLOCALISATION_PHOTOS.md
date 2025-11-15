# 🔧 Correction - Badge "géolocalisée" affiché incorrectement

## Problème
Le badge "géolocalisée" s'affiche sous les photos même quand elles n'ont pas de coordonnées GPS valides.

## Solution en 3 étapes

### Étape 1 : Nettoyer la base de données

Exécuter le script SQL dans Supabase :

1. Ouvrir **Supabase Dashboard** → **SQL Editor**
2. Copier-coller le contenu de `sql/fix_photo_geolocation.sql`
3. Cliquer sur **Run**

Ce script va :
- Mettre à NULL les coordonnées 0,0 (invalides)
- Mettre à NULL les coordonnées hors limites
- Corriger les incohérences (une coordonnée NULL mais pas l'autre)
- Afficher un rapport des photos avec/sans géolocalisation

### Étape 2 : Vérifier les logs dans l'app

1. Ouvrir l'app en mode développement
2. Aller sur un chantier avec des photos
3. Ouvrir la console/logs
4. Chercher les messages `[PhotoUploader] Photo X: lat=..., lng=..., hasLocation=...`

Ces logs vous diront :
- Quelles coordonnées sont stockées pour chaque photo
- Si la vérification considère la géolocalisation comme valide ou non

### Étape 3 : Tester avec une nouvelle photo

1. Prendre une nouvelle photo avec la caméra
2. Vérifier que le badge "géolocalisée" s'affiche **seulement** si :
   - La permission GPS est accordée
   - La position GPS est réellement capturée
   - Les coordonnées sont valides (pas 0,0, pas hors limites)

## Vérification manuelle dans Supabase

Pour vérifier les données directement :

```sql
-- Voir toutes les photos avec leurs coordonnées
SELECT 
  id,
  project_id,
  latitude,
  longitude,
  created_at,
  CASE 
    WHEN latitude IS NOT NULL AND longitude IS NOT NULL 
         AND latitude != 0 AND longitude != 0
         AND latitude >= -90 AND latitude <= 90
         AND longitude >= -180 AND longitude <= 180
    THEN '✅ Valide'
    ELSE '❌ Invalide'
  END as status
FROM project_photos
ORDER BY created_at DESC;
```

## Si le problème persiste

1. **Vérifier les permissions GPS** :
   - Android : Paramètres → Applications → ArtisanFlow → Permissions → Localisation
   - iOS : Paramètres → ArtisanFlow → Localisation

2. **Vérifier que vous utilisez un Dev Client** :
   - La géolocalisation ne fonctionne pas avec Expo Go
   - Utiliser un build Dev Client (`npm run build:dev`)

3. **Vérifier les logs** :
   - Chercher `[PhotoUploader] Géolocalisation capturée` dans les logs
   - Si absent, la géolocalisation n'est pas capturée

4. **Forcer le rafraîchissement** :
   - Fermer complètement l'app
   - Relancer l'app
   - Les photos devraient se recharger avec les données nettoyées

## Code modifié

- ✅ Vérification robuste des coordonnées (gère les strings, NaN, 0,0, limites)
- ✅ Logs de debug pour diagnostiquer
- ✅ Script SQL pour nettoyer les données existantes
- ✅ Capture GPS améliorée avec validation

---

**Après avoir exécuté le script SQL, le badge devrait s'afficher uniquement pour les photos réellement géolocalisées.**

