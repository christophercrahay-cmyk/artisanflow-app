import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'artisanflow_offline_queue';

/**
 * Structure d'une action en queue :
 * {
 *   id: string (UUID généré),
 *   type: 'photo' | 'voice' | 'note' | 'devis' | 'facture',
 *   data: object (données spécifiques à l'action),
 *   retry_count: number,
 *   created_at: ISO string,
 * }
 */

/**
 * Récupère la queue complète depuis AsyncStorage
 */
export async function getQueue() {
  try {
    const json = await AsyncStorage.getItem(QUEUE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (err) {
    console.error('[OfflineQueue] Erreur getQueue:', err);
    return [];
  }
}

/**
 * Ajoute une action à la queue
 */
export async function addToQueue(action) {
  try {
    const queue = await getQueue();
    const newAction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...action,
      retry_count: 0,
      created_at: new Date().toISOString(),
    };
    queue.push(newAction);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log('[OfflineQueue] Action ajoutée:', newAction.id);
    return newAction.id;
  } catch (err) {
    console.error('[OfflineQueue] Erreur addToQueue:', err);
    return null;
  }
}

/**
 * Supprime une action de la queue
 */
export async function removeFromQueue(actionId) {
  try {
    const queue = await getQueue();
    const filtered = queue.filter((a) => a.id !== actionId);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
    console.log('[OfflineQueue] Action supprimée:', actionId);
  } catch (err) {
    console.error('[OfflineQueue] Erreur removeFromQueue:', err);
  }
}

/**
 * Incrémente le compteur de retry d'une action
 */
export async function incrementRetry(actionId) {
  try {
    const queue = await getQueue();
    const updated = queue.map((a) =>
      a.id === actionId ? { ...a, retry_count: (a.retry_count || 0) + 1 } : a
    );
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('[OfflineQueue] Erreur incrementRetry:', err);
  }
}

/**
 * Récupère les actions éligibles pour retry (retry_count < 3)
 */
export async function getEligibleActions() {
  const queue = await getQueue();
  return queue.filter((a) => (a.retry_count || 0) < 3);
}

/**
 * Vide complètement la queue
 */
export async function clearQueue() {
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
    console.log('[OfflineQueue] Queue vidée');
  } catch (err) {
    console.error('[OfflineQueue] Erreur clearQueue:', err);
  }
}

/**
 * Retourne le nombre d'actions en queue
 */
export async function getQueueSize() {
  const queue = await getQueue();
  return queue.length;
}

/**
 * Exemple d'utilisation dans un composant :
 * 
 * import { addToQueue } from './utils/offlineQueue';
 * 
 * try {
 *   await supabase.from('table').insert(data);
 * } catch (err) {
 *   // Si erreur réseau, ajouter à la queue
 *   if (err.message.includes('Network')) {
 *     await addToQueue({
 *       type: 'photo',
 *       data: { ... },
 *     });
 *   }
 * }
 */

