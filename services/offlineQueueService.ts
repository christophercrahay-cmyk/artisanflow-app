import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger';

const OFFLINE_QUEUE_KEY = 'offline_queue';

export type QueueItemType = 'photo' | 'note';

export interface OfflineQueueItem {
  id: string;            // uuid
  type: QueueItemType;
  data: any;             // payload spécifique (project_id, chemin local, contenu note…)
  createdAt: number;     // timestamp
  synced: boolean;
  retries: number;
}

/**
 * Service de gestion de la queue d'upload hors ligne
 * Stocke les éléments créés hors ligne pour synchronisation ultérieure
 */

/**
 * Charge la queue depuis AsyncStorage
 */
export async function loadQueue(): Promise<OfflineQueueItem[]> {
  try {
    const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!queueStr) {
      return [];
    }
    return JSON.parse(queueStr);
  } catch (err) {
    logger.error('offlineQueue', 'Erreur chargement queue', err);
    return [];
  }
}

/**
 * Sauvegarde la queue dans AsyncStorage
 */
export async function saveQueue(queue: OfflineQueueItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    logger.info('offlineQueue', `Queue sauvegardée: ${queue.length} éléments`);
  } catch (err) {
    logger.error('offlineQueue', 'Erreur sauvegarde queue', err);
    throw err;
  }
}

/**
 * Ajoute un élément à la queue
 */
export async function addToQueue(input: { type: QueueItemType; data: any }): Promise<OfflineQueueItem> {
  try {
    const queue = await loadQueue();
    const item: OfflineQueueItem = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: input.type,
      data: input.data,
      createdAt: Date.now(),
      synced: false,
      retries: 0,
    };
    queue.push(item);
    await saveQueue(queue);
    logger.info('offlineQueue', `Élément ajouté à la queue: ${item.id} (type: ${item.type})`);
    return item;
  } catch (err) {
    logger.error('offlineQueue', 'Erreur ajout queue', err);
    throw err;
  }
}

/**
 * Marque un élément comme synchronisé
 */
export async function markItemSynced(id: string): Promise<void> {
  try {
    const queue = await loadQueue();
    const item = queue.find((i) => i.id === id);
    if (item) {
      item.synced = true;
      await saveQueue(queue);
      logger.info('offlineQueue', `Élément marqué comme synchronisé: ${id}`);
    }
  } catch (err) {
    logger.error('offlineQueue', 'Erreur marquage synced', err);
    throw err;
  }
}

/**
 * Retire un élément de la queue (après synchronisation réussie)
 */
export async function removeItemFromQueue(id: string): Promise<void> {
  try {
    const queue = await loadQueue();
    const filtered = queue.filter((i) => i.id !== id);
    await saveQueue(filtered);
    logger.info('offlineQueue', `Élément retiré de la queue: ${id}`);
  } catch (err) {
    logger.error('offlineQueue', 'Erreur retrait queue', err);
    throw err;
  }
}

