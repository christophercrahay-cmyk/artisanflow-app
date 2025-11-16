import { useEffect, useState } from 'react';
import {
  registerForPushNotifications,
  setupNotificationListeners,
  getSavedPushToken,
} from '../services/notificationService';
import logger from '../utils/logger';

/**
 * Hook personnalisé pour gérer les notifications
 */
export function useNotifications() {
  const [pushToken, setPushToken] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Enregistrer pour les notifications push
    registerForPushNotifications().then(token => {
      if (token) {
        setPushToken(token);
      }
    });

    // Charger le token sauvegardé
    getSavedPushToken().then(token => {
      if (token) {
        setPushToken(token);
      }
    });

    // Configurer les listeners
    const unsubscribe = setupNotificationListeners(
      // Notification reçue
      (notification) => {
        logger.info('useNotifications', 'Notification reçue', notification);
        setNotification(notification);
      },
      // Notification cliquée
      (response) => {
        logger.info('useNotifications', 'Notification cliquée', response);
        // Gérer la navigation basée sur le type de notification
        handleNotificationResponse(response);
      }
    );

    return unsubscribe;
  }, []);

  return {
    pushToken,
    notification,
  };
}

/**
 * Gère la réponse à une notification cliquée
 */
function handleNotificationResponse(response) {
  const data = response.notification.request.content.data;

  switch (data.type) {
    case 'devis_reminder':
      // Naviguer vers les devis
      logger.info('useNotifications', `Ouvrir devis: ${data.devisNumber}`);
      break;
    case 'facture_overdue':
      // Naviguer vers les factures
      logger.info('useNotifications', `Ouvrir facture: ${data.factureNumber}`);
      break;
    case 'new_project':
      // Naviguer vers le projet
      logger.info('useNotifications', `Ouvrir projet: ${data.projectName}`);
      break;
    case 'voice_transcribed':
      // Naviguer vers les notes
      logger.info('useNotifications', `Ouvrir notes: ${data.projectName}`);
      break;
    default:
      logger.info('useNotifications', 'Type de notification inconnu');
  }
}

