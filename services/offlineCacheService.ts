import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger';

const CACHE_CLIENTS_KEY = 'offline_clients';
const CACHE_PROJECTS_KEY = 'offline_projects';
const CACHE_TIMESTAMP_KEY = 'offline_cache_timestamp';

/**
 * Service de cache pour les données hors ligne
 * Permet de stocker et récupérer les clients et chantiers en local
 */

/**
 * Cache les clients dans AsyncStorage
 */
export async function cacheClients(clients: any[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_CLIENTS_KEY, JSON.stringify(clients));
    await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    logger.info('offlineCache', `Clients mis en cache: ${clients.length}`);
  } catch (err) {
    logger.error('offlineCache', 'Erreur cache clients', err);
    // Ne pas faire planter l'app en cas d'erreur
  }
}

/**
 * Charge les clients depuis le cache
 */
export async function loadCachedClients(): Promise<any[]> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_CLIENTS_KEY);
    if (!cached) {
      return [];
    }
    const clients = JSON.parse(cached);
    logger.info('offlineCache', `Clients chargés depuis cache: ${clients.length}`);
    return clients;
  } catch (err) {
    logger.error('offlineCache', 'Erreur chargement cache clients', err);
    return [];
  }
}

/**
 * Cache les chantiers dans AsyncStorage
 */
export async function cacheProjects(projects: any[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_PROJECTS_KEY, JSON.stringify(projects));
    await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    logger.info('offlineCache', `Chantiers mis en cache: ${projects.length}`);
  } catch (err) {
    logger.error('offlineCache', 'Erreur cache chantiers', err);
    // Ne pas faire planter l'app en cas d'erreur
  }
}

/**
 * Charge les chantiers depuis le cache
 */
export async function loadCachedProjects(): Promise<any[]> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_PROJECTS_KEY);
    if (!cached) {
      return [];
    }
    const projects = JSON.parse(cached);
    logger.info('offlineCache', `Chantiers chargés depuis cache: ${projects.length}`);
    return projects;
  } catch (err) {
    logger.error('offlineCache', 'Erreur chargement cache chantiers', err);
    return [];
  }
}

/**
 * Récupère le timestamp du dernier cache
 */
export async function getCacheTimestamp(): Promise<number | null> {
  try {
    const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (err) {
    logger.error('offlineCache', 'Erreur lecture timestamp cache', err);
    return null;
  }
}

