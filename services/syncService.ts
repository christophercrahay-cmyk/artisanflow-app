import { supabase } from '../supabaseClient';
import { loadQueue, saveQueue, removeItemFromQueue, OfflineQueueItem } from './offlineQueueService';
import * as FileSystem from 'expo-file-system';
import logger from '../utils/logger';
import { showSuccess, showError } from '../components/Toast';

/**
 * Service de synchronisation de la queue hors ligne
 * Traite les éléments en attente quand la connexion revient
 */

/**
 * Traite la queue d'upload hors ligne
 * @param isOffline - Si true, ne fait rien
 */
export async function processOfflineQueue(isOffline: boolean): Promise<void> {
  if (isOffline) {
    logger.info('syncService', 'Mode hors ligne, queue non traitée');
    return;
  }

  try {
    const queue = await loadQueue();
    const pendingItems = queue.filter((item) => !item.synced);

    if (pendingItems.length === 0) {
      logger.info('syncService', 'Aucun élément en attente de synchronisation');
      return;
    }

    logger.info('syncService', `Traitement de ${pendingItems.length} élément(s) en queue`);

    let syncedCount = 0;
    const remaining: OfflineQueueItem[] = [];

    for (const item of pendingItems) {
      try {
        // Limiter les retries à 3
        if (item.retries >= 3) {
          logger.warn('syncService', `Item ${item.id} abandonné après 3 retries`);
          remaining.push(item);
          continue;
        }

        let success = false;

        if (item.type === 'photo') {
          success = await uploadOfflinePhoto(item);
        } else if (item.type === 'note') {
          success = await uploadOfflineNote(item);
        }

        if (success) {
          syncedCount++;
          // Retirer l'élément de la queue après succès
          await removeItemFromQueue(item.id);
        } else {
          item.retries++;
          remaining.push(item);
          logger.warn('syncService', `Échec sync item ${item.id}, retry ${item.retries}/3`);
        }
      } catch (err) {
        item.retries++;
        remaining.push(item);
        logger.error('syncService', `Erreur traitement item ${item.id}`, err);
      }
    }

    // Sauvegarder la queue mise à jour (éléments non synchronisés)
    if (remaining.length > 0) {
      const allQueue = await loadQueue();
      const syncedIds = new Set(
        pendingItems
          .filter((item) => !remaining.find((r) => r.id === item.id))
          .map((item) => item.id)
      );
      const updatedQueue = allQueue.filter((item) => !syncedIds.has(item.id));
      await saveQueue(updatedQueue);
    }

    if (syncedCount > 0) {
      logger.success('syncService', `${syncedCount} élément(s) synchronisé(s) avec succès`);
      showSuccess(`✅ ${syncedCount} élément${syncedCount > 1 ? 's' : ''} synchronisé${syncedCount > 1 ? 's' : ''}`);
    }
  } catch (err) {
    logger.error('syncService', 'Erreur traitement queue', err);
  }
}

/**
 * Upload une photo créée hors ligne
 */
async function uploadOfflinePhoto(item: OfflineQueueItem): Promise<boolean> {
  try {
    const { localUri, projectId, metadata } = item.data;

    // Vérifier que le fichier existe toujours
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (!fileInfo.exists) {
      logger.error('syncService', `Fichier photo introuvable: ${localUri}`);
      return false;
    }

    // Lire le fichier en utilisant fetch (méthode compatible React Native)
    // localUri est déjà un chemin complet depuis FileSystem.documentDirectory
    const response = await fetch(localUri);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Générer un nom de fichier unique
    const fileName = `projects/${projectId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
    const bucket = 'project-photos';

    // Upload vers Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, bytes, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      logger.error('syncService', 'Erreur upload photo storage', uploadError);
      return false;
    }

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;

    // Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.error('syncService', 'Utilisateur non connecté');
      return false;
    }

    // Créer le row en base
    const { error: dbError } = await supabase.from('project_photos').insert([
      {
        project_id: projectId,
        user_id: user.id,
        url: publicUrl,
        storage_path: fileName,
        ...metadata,
      },
    ]);

    if (dbError) {
      logger.error('syncService', 'Erreur insertion photo DB', dbError);
      return false;
    }

    // Supprimer le fichier local après upload réussi
    try {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
    } catch (deleteErr) {
      logger.warn('syncService', 'Erreur suppression fichier local', deleteErr);
      // Ne pas faire échouer la sync si la suppression échoue
    }

    logger.success('syncService', `Photo ${item.id} synchronisée avec succès`);
    return true;
  } catch (err) {
    logger.error('syncService', 'Erreur upload photo offline', err);
    return false;
  }
}

/**
 * Upload une note créée hors ligne
 */
async function uploadOfflineNote(item: OfflineQueueItem): Promise<boolean> {
  try {
    const { projectId, clientId, content, createdAt } = item.data;

    // Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.error('syncService', 'Utilisateur non connecté');
      return false;
    }

    // Insérer la note en base
    const { error } = await supabase.from('notes').insert([
      {
        project_id: projectId,
        client_id: clientId,
        user_id: user.id,
        type: 'text',
        transcription: content,
        created_at: createdAt || new Date().toISOString(),
      },
    ]);

    if (error) {
      logger.error('syncService', 'Erreur insertion note DB', error);
      return false;
    }

    logger.success('syncService', `Note ${item.id} synchronisée avec succès`);
    return true;
  } catch (err) {
    logger.error('syncService', 'Erreur upload note offline', err);
    return false;
  }
}

