import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import logger from './logger';

const QUEUE_KEY = '@upload_queue';
const CACHE_KEY = '@offline_cache';

/**
 * Gestionnaire de mode hors ligne
 * Gère la queue d'uploads et le cache local
 */
export class OfflineManager {
  /**
   * Vérifie si l'app est en ligne
   */
  static async isOnline() {
    try {
      const networkState = await Network.getNetworkStateAsync();
      return networkState.isConnected && networkState.isInternetReachable;
    } catch (err) {
      logger.error('OfflineManager', 'Erreur vérification réseau', err);
      return false;
    }
  }

  /**
   * Ajoute un upload à la queue
   * @param {string} type - Type d'upload ('photo', 'voice', 'note', 'client', 'project')
   * @param {object} data - Données à uploader
   * @param {string} table - Table Supabase cible
   */
  static async queueUpload(type, data, table) {
    try {
      const queue = await this.getQueue();
      const item = {
        id: `queue_${Date.now()}_${Math.random()}`,
        type,
        table,
        data,
        timestamp: Date.now(),
        retries: 0,
      };
      queue.push(item);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      logger.info('OfflineManager', `Upload ajouté à la queue: ${type}`, { queueSize: queue.length });
      return item.id;
    } catch (err) {
      logger.error('OfflineManager', 'Erreur ajout queue', err);
      throw err;
    }
  }

  /**
   * Récupère la queue d'uploads
   */
  static async getQueue() {
    try {
      const queueStr = await AsyncStorage.getItem(QUEUE_KEY);
      return queueStr ? JSON.parse(queueStr) : [];
    } catch (err) {
      logger.error('OfflineManager', 'Erreur lecture queue', err);
      return [];
    }
  }

  /**
   * Traite la queue d'uploads (à appeler quand le réseau revient)
   */
  static async processQueue(supabase) {
    const isConnected = await this.isOnline();
    if (!isConnected) {
      logger.warn('OfflineManager', 'Pas de connexion, queue non traitée');
      return { processed: 0, failed: 0 };
    }

    try {
      const queue = await this.getQueue();
      if (queue.length === 0) {
        return { processed: 0, failed: 0 };
      }

      logger.info('OfflineManager', `Traitement de ${queue.length} upload(s) en queue`);
      let processed = 0;
      let failed = 0;
      const remaining = [];

      for (const item of queue) {
        try {
          // Limiter les retries à 3
          if (item.retries >= 3) {
            logger.warn('OfflineManager', `Item ${item.id} abandonné après 3 retries`);
            failed++;
            continue;
          }

          // Upload selon le type
          let result;
          if (item.type === 'photo' || item.type === 'voice') {
            // Upload storage + DB
            result = await this.processMediaUpload(item, supabase);
          } else {
            // Upload DB seulement
            result = await this.processDbUpload(item, supabase);
          }

          if (result.success) {
            processed++;
            logger.success('OfflineManager', `Upload ${item.id} traité avec succès`);
          } else {
            item.retries++;
            remaining.push(item);
            failed++;
            logger.warn('OfflineManager', `Upload ${item.id} échoué, retry ${item.retries}/3`);
          }
        } catch (err) {
          item.retries++;
          remaining.push(item);
          failed++;
          logger.error('OfflineManager', `Erreur traitement upload ${item.id}`, err);
        }
      }

      // Sauvegarder la queue mise à jour
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
      
      logger.success('OfflineManager', `Queue traitée: ${processed} succès, ${failed} échecs`);
      return { processed, failed, remaining: remaining.length };
    } catch (err) {
      logger.error('OfflineManager', 'Erreur traitement queue', err);
      return { processed: 0, failed: 0 };
    }
  }

  /**
   * Traite un upload média (photo/vocal) avec storage
   */
  static async processMediaUpload(item, supabase) {
    try {
      const { type, data, table } = item;
      
      // Upload vers storage
      let publicUrl = null;
      if (data.storageData) {
        const { bucket, path, bytes, contentType } = data.storageData;
        const { error: uploadErr } = await supabase.storage
          .from(bucket)
          .upload(path, bytes, { contentType, upsert: false });

        if (uploadErr) {
          throw uploadErr;
        }

        // Récupérer l'URL publique
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
        publicUrl = urlData.publicUrl;
        
        // Mettre à jour data.dbData avec l'URL
        if (data.dbData) {
          data.dbData.url = publicUrl;
        }
      }

      // Insertion DB
      const { error: dbErr } = await supabase.from(table).insert([data.dbData || data]);
      if (dbErr) {
        throw dbErr;
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  }

  /**
   * Traite un upload DB seulement (client, project, note texte)
   */
  static async processDbUpload(item, supabase) {
    try {
      const { data, table } = item;
      const { error } = await supabase.from(table).insert([data]);
      if (error) {
        throw error;
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  }

  /**
   * Vide la queue (pour tests ou reset)
   */
  static async clearQueue() {
    try {
      await AsyncStorage.removeItem(QUEUE_KEY);
      logger.info('OfflineManager', 'Queue vidée');
    } catch (err) {
      logger.error('OfflineManager', 'Erreur vidage queue', err);
    }
  }

  /**
   * Cache local pour données fréquentes
   */
  static async cacheData(key, data) {
    try {
      const cache = await this.getCache();
      cache[key] = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (err) {
      logger.error('OfflineManager', 'Erreur cache', err);
    }
  }

  /**
   * Récupère des données du cache
   */
  static async getCachedData(key, maxAge = 3600000) {
    try {
      const cache = await this.getCache();
      const item = cache[key];
      if (!item) {return null;}

      const age = Date.now() - item.timestamp;
      if (age > maxAge) {
        // Cache expiré
        delete cache[key];
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        return null;
      }

      return item.data;
    } catch (err) {
      logger.error('OfflineManager', 'Erreur lecture cache', err);
      return null;
    }
  }

  /**
   * Récupère le cache complet
   */
  static async getCache() {
    try {
      const cacheStr = await AsyncStorage.getItem(CACHE_KEY);
      return cacheStr ? JSON.parse(cacheStr) : {};
    } catch (err) {
      return {};
    }
  }
}

/**
 * Hook React pour vérifier le statut réseau
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    const checkNetwork = async () => {
      const online = await OfflineManager.isOnline();
      if (mounted) {
        setIsOnline(online);
      }
    };

    // Vérifier immédiatement
    checkNetwork();

    // Vérifier périodiquement (toutes les 5 secondes)
    const interval = setInterval(checkNetwork, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return isOnline;
};

