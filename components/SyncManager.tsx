import React, { useEffect } from 'react';
import { useNetworkStatus } from '../contexts/NetworkStatusContext';
import { processOfflineQueue } from '../services/syncService';
import logger from '../utils/logger';

/**
 * Composant qui gère la synchronisation automatique
 * Déclenche la sync quand la connexion revient
 */
export default function SyncManager() {
  const { isOffline } = useNetworkStatus();

  useEffect(() => {
    if (!isOffline) {
      // La connexion est revenue, traiter la queue
      logger.info('SyncManager', 'Connexion rétablie, traitement de la queue');
      processOfflineQueue(false).catch((err) => {
        logger.error('SyncManager', 'Erreur traitement queue', err);
      });
    }
  }, [isOffline]);

  return null; // Ce composant ne rend rien
}

