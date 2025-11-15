/**
 * Service météo utilisant OpenWeatherMap API
 * 
 * Configuration :
 * - Créer une clé API sur https://openweathermap.org/api
 * - Ajouter la clé dans un fichier .env ou directement dans WEATHER_API_KEY ci-dessous
 */

const WEATHER_API_KEY = 'b90718faf7bc9bb8eab9bad65f52cec2'; 
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Récupère les données météo pour une position donnée (GPS)
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<{temp: number, icon: string, description: string, city: string} | null>}
 */
export async function fetchWeather(latitude, longitude) {
  if (!WEATHER_API_KEY || WEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
    console.warn('[WeatherService] Clé API manquante. Configurez WEATHER_API_KEY dans weatherService.js');
    return null;
  }

  try {
    const url = `${WEATHER_API_URL}?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=fr`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error('[WeatherService] Erreur API:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    return {
      temp: Math.round(data.main.temp),
      icon: data.weather[0].icon,
      description: data.weather[0].description,
      city: data.name,
    };
  } catch (error) {
    console.error('[WeatherService] Erreur fetch météo:', error);
    return null;
  }
}

/**
 * Récupère les données météo pour une ville donnée (par nom)
 * @param {string} cityName - Nom de la ville (ex: "Paris", "Lyon", "Paris,FR")
 * @returns {Promise<{temp: number, icon: string, description: string, city: string} | null>}
 */
export async function fetchWeatherByCity(cityName) {
  if (!WEATHER_API_KEY || WEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
    console.warn('[WeatherService] Clé API manquante. Configurez WEATHER_API_KEY dans weatherService.js');
    return null;
  }

  if (!cityName || !cityName.trim()) {
    console.warn('[WeatherService] Nom de ville manquant');
    return null;
  }

  try {
    // Encoder le nom de la ville pour l'URL
    const encodedCity = encodeURIComponent(cityName.trim());
    const url = `${WEATHER_API_URL}?q=${encodedCity}&appid=${WEATHER_API_KEY}&units=metric&lang=fr`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`[WeatherService] Ville non trouvée: ${cityName}`);
        return null;
      }
      console.error('[WeatherService] Erreur API:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    return {
      temp: Math.round(data.main.temp),
      icon: data.weather[0].icon,
      description: data.weather[0].description,
      city: data.name,
    };
  } catch (error) {
    console.error('[WeatherService] Erreur fetch météo par ville:', error);
    return null;
  }
}

/**
 * Convertit l'icône OpenWeatherMap en nom d'icône Feather
 * @param {string} weatherIcon - Code icône OpenWeatherMap (ex: "01d", "02n")
 * @returns {string} Nom d'icône Feather
 */
export function getWeatherIcon(weatherIcon) {
  if (!weatherIcon) {return 'sun';}

  const iconMap = {
    '01d': 'sun', // Clear sky day
    '01n': 'moon', // Clear sky night
    '02d': 'cloud', // Few clouds day
    '02n': 'cloud', // Few clouds night
    '03d': 'cloud', // Scattered clouds
    '03n': 'cloud',
    '04d': 'cloud', // Broken clouds
    '04n': 'cloud',
    '09d': 'cloud-rain', // Shower rain
    '09n': 'cloud-rain',
    '10d': 'cloud-rain', // Rain
    '10n': 'cloud-rain',
    '11d': 'cloud-lightning', // Thunderstorm
    '11n': 'cloud-lightning',
    '13d': 'cloud-snow', // Snow
    '13n': 'cloud-snow',
    '50d': 'wind', // Mist
    '50n': 'wind',
  };

  return iconMap[weatherIcon] || 'sun';
}

