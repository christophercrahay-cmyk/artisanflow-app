import { useState, useEffect } from 'react';
import { fetchWeatherByCity } from '../services/weatherService';
import { supabase } from '../supabaseClient';
import { getCurrentUser } from '../utils/auth';
import logger from '../utils/logger';

/**
 * Hook pour récupérer la météo basée sur la ville de l'utilisateur depuis Supabase
 * Récupère la ville depuis brand_settings.company_city ou company_address
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

        // 1. Récupérer l'utilisateur connecté
        const user = await getCurrentUser();
        if (!user) {
          if (isMounted) {
            setError('Utilisateur non connecté');
            setLoading(false);
          }
          return;
        }

        // 2. Récupérer les settings de l'utilisateur depuis Supabase
        const { data: settings, error: settingsError } = await supabase
          .from('brand_settings')
          .select('company_city, company_address')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle(); // Utiliser maybeSingle() au lieu de single() pour gérer l'absence de données

        if (settingsError) {
          // PGRST116 = aucune ligne trouvée (settings n'existent pas encore)
          if (settingsError.code === 'PGRST116') {
            logger.info('useWeather', 'Aucun paramètre configuré pour cet utilisateur');
          } else {
            logger.warn('useWeather', 'Erreur récupération settings', settingsError);
          }
          // Ne pas bloquer si les settings n'existent pas encore
        }

        // 3. Extraire la ville (priorité: company_city > extraction depuis company_address)
        let cityName = null;
        
        if (settings?.company_city && settings.company_city.trim()) {
          cityName = settings.company_city.trim();
        } else if (settings?.company_address && settings.company_address.trim()) {
          // Extraire la ville depuis l'adresse (dernier élément après la dernière virgule)
          const addressParts = settings.company_address.split(',').map(s => s.trim());
          if (addressParts.length > 0) {
            // Prendre le dernier élément (généralement la ville)
            cityName = addressParts[addressParts.length - 1];
          }
        }

        if (!cityName) {
          if (isMounted) {
            setError('Ville non configurée');
            setLoading(false);
          }
          logger.info('useWeather', 'Aucune ville configurée dans les paramètres');
          return;
        }

        // 4. Appeler l'API météo avec la ville
        logger.info('useWeather', `Récupération météo pour: ${cityName}`);
        const weatherData = await fetchWeatherByCity(cityName);

        if (isMounted) {
          if (weatherData) {
            setWeather(weatherData);
            logger.success('useWeather', `Météo récupérée: ${weatherData.temp}°C à ${weatherData.city}`);
          } else {
            setError('Ville non trouvée');
            logger.warn('useWeather', `Ville non trouvée dans OpenWeatherMap: ${cityName}`);
          }
          setLoading(false);
        }
      } catch (err) {
        logger.error('useWeather', 'Erreur chargement météo', err);
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

