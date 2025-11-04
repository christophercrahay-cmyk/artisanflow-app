import { useState, useEffect } from 'react';
import { fetchWeather } from '../services/weatherService';

/**
 * Hook pour récupérer la météo basée sur la position GPS
 * @returns {{weather: {temp: number, icon: string, description: string, city: string} | null, loading: boolean, error: string | null}}
 */
export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        // Import dynamique pour éviter le crash si le module natif n'est pas disponible
        let Location;
        try {
          const locationModule = await import('expo-location');
          // Gérer les différents formats d'export (default ou named)
          Location = locationModule.default || locationModule;
          
          // Vérifier que les fonctions sont disponibles
          if (!Location || typeof Location.requestForegroundPermissionsAsync !== 'function') {
            throw new Error('Module expo-location non disponible - build native requise');
          }
        } catch (importErr) {
          console.warn('[useWeather] Module expo-location non disponible, build native requise:', importErr);
          if (isMounted) {
            setError('Module natif non disponible');
            setLoading(false);
          }
          return;
        }

        // Demander la permission de localisation
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          if (isMounted) {
            setError('Permission refusée');
            setLoading(false);
          }
          return;
        }

        // Récupérer la position actuelle
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;

        // Appeler l'API météo
        const weatherData = await fetchWeather(latitude, longitude);

        if (isMounted) {
          if (weatherData) {
            setWeather(weatherData);
          } else {
            setError('Météo indisponible');
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('[useWeather] Erreur:', err);
        if (isMounted) {
          setError('Météo indisponible');
          setLoading(false);
        }
      }
    };

    loadWeather();

    return () => {
      isMounted = false;
    };
  }, []);

  return { weather, loading, error };
}

