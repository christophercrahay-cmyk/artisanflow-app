import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from './logger';

const CACHE_PREFIX = '@artisanflow_cache_';
const OFFLINE_QUEUE_KEY = '@artisanflow_offline_queue';

class NetworkManager {
  constructor() {
    this.isConnected = true;
    this.listeners = [];
    this.offlineQueue = [];
    this.pollInterval = null;
    this.initNetworkListener();
  }

  async initNetworkListener() {
    // Vérifier l'état initial
    await this.checkNetworkState();

    // Polling périodique pour vérifier l'état du réseau
    this.pollInterval = setInterval(async () => {
      await this.checkNetworkState();
    }, 3000); // Vérifier toutes les 3 secondes
  }

  async checkNetworkState() {
    try {
      const networkState = await Network.getNetworkStateAsync();
      const wasConnected = this.isConnected;
      this.isConnected = networkState.isConnected;

      // Logger seulement si l'état a changé
      if (wasConnected !== this.isConnected) {
        logger.info('NetworkManager', `Réseau: ${this.isConnected ? 'Connecté' : 'Déconnecté'}`);
        
        // Si on vient de se reconnecter, traiter la queue
        if (!wasConnected && this.isConnected) {
          this.processOfflineQueue();
        }

        // Notifier les listeners
        this.notifyListeners(this.isConnected);
      }
    } catch (error) {
      logger.error('NetworkManager', 'Erreur vérification réseau', error);
    }
  }

  destroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(isConnected) {
    this.listeners.forEach(callback => callback(isConnected));
  }

  // === CACHE ===

  async getCachedData(key) {
    try {
      const cached = await AsyncStorage.getItem(CACHE_PREFIX + key);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        logger.info('NetworkManager', `Cache HIT: ${key}`);
        return data;
      }
      return null;
    } catch (error) {
      logger.error('NetworkManager', 'Erreur lecture cache', error);
      return null;
    }
  }

  async setCachedData(key, data) {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheEntry));
      logger.info('NetworkManager', `Cache SET: ${key}`);
    } catch (error) {
      logger.error('NetworkManager', 'Erreur écriture cache', error);
    }
  }

  async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      logger.info('NetworkManager', `Cache vidé: ${cacheKeys.length} entrées`);
    } catch (error) {
      logger.error('NetworkManager', 'Erreur vidage cache', error);
    }
  }

  // === OFFLINE QUEUE ===

  async addToOfflineQueue(action) {
    try {
      this.offlineQueue.push(action);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.offlineQueue));
      logger.info('NetworkManager', `Action ajoutée à la queue: ${action.type}`);
    } catch (error) {
      logger.error('NetworkManager', 'Erreur ajout queue', error);
    }
  }

  async loadOfflineQueue() {
    try {
      const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (queue) {
        this.offlineQueue = JSON.parse(queue);
        logger.info('NetworkManager', `Queue chargée: ${this.offlineQueue.length} actions`);
      }
    } catch (error) {
      logger.error('NetworkManager', 'Erreur chargement queue', error);
    }
  }

  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) {
      logger.info('NetworkManager', 'Queue vide, rien à synchroniser');
      return;
    }

    logger.info('NetworkManager', `Traitement de ${this.offlineQueue.length} actions en attente`);

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const action of queue) {
      try {
        await this.executeAction(action);
        logger.success('NetworkManager', `Action exécutée: ${action.type}`);
      } catch (error) {
        logger.error('NetworkManager', `Échec action: ${action.type}`, error);
        // Remettre dans la queue si échec
        this.offlineQueue.push(action);
      }
    }

    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.offlineQueue));
  }

  async executeAction(action) {
    // À implémenter selon vos besoins
    // Exemple: appeler les méthodes Supabase appropriées
    switch (action.type) {
      case 'INSERT_CLIENT':
        // await supabase.from('clients').insert(action.data);
        break;
      case 'UPDATE_CLIENT':
        // await supabase.from('clients').update(action.data).eq('id', action.id);
        break;
      case 'DELETE_CLIENT':
        // await supabase.from('clients').delete().eq('id', action.id);
        break;
      // Ajouter d'autres types d'actions
      default:
        logger.warn('NetworkManager', `Type d'action inconnu: ${action.type}`);
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export default new NetworkManager();

