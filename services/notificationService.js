import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger';

const PUSH_TOKEN_KEY = '@artisanflow_push_token';

/**
 * Configuration par défaut des notifications
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Enregistre l'appareil pour recevoir des notifications push
 * @returns {Promise<string|null>} Push token ou null
 */
export async function registerForPushNotifications() {
  try {
    // Vérifier si on est sur un appareil physique
    if (!Device.isDevice) {
      logger.warn('Notifications', 'Les notifications push ne fonctionnent que sur un appareil physique');
      return null;
    }

    // Demander les permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      logger.warn('Notifications', 'Permission refusée');
      return null;
    }

    // Obtenir le token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    if (!projectId) {
      logger.error('Notifications', 'Project ID manquant dans app.json');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    logger.success('Notifications', `Token obtenu: ${token.data}`);

    // Sauvegarder le token
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token.data);

    // Configuration Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1D4ED8',
      });
    }

    return token.data;
  } catch (error) {
    logger.error('Notifications', 'Erreur enregistrement push', error);
    return null;
  }
}

/**
 * Récupère le token sauvegardé
 */
export async function getSavedPushToken() {
  try {
    const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    return token;
  } catch (error) {
    logger.error('Notifications', 'Erreur récupération token', error);
    return null;
  }
}

/**
 * Envoie une notification locale
 * @param {object} notification - Contenu de la notification
 */
export async function scheduleLocalNotification(notification) {
  try {
    const { title, body, data = {}, trigger = null } = notification;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: trigger || null, // null = immédiat
    });

    logger.success('Notifications', `Notification locale envoyée: ${notificationId}`);
    return notificationId;
  } catch (error) {
    logger.error('Notifications', 'Erreur notification locale', error);
    throw error;
  }
}

/**
 * Annule une notification programmée
 */
export async function cancelNotification(notificationId) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    logger.info('Notifications', `Notification ${notificationId} annulée`);
  } catch (error) {
    logger.error('Notifications', 'Erreur annulation notification', error);
  }
}

/**
 * Annule toutes les notifications programmées
 */
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    logger.info('Notifications', 'Toutes les notifications annulées');
  } catch (error) {
    logger.error('Notifications', 'Erreur annulation notifications', error);
  }
}

/**
 * Configure les listeners de notifications
 */
export function setupNotificationListeners(onNotificationReceived, onNotificationResponse) {
  // Notification reçue pendant que l'app est ouverte
  const receivedListener = Notifications.addNotificationReceivedListener(notification => {
    logger.info('Notifications', 'Notification reçue', notification);
    if (onNotificationReceived) {
      onNotificationReceived(notification);
    }
  });

  // Notification cliquée par l'utilisateur
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    logger.info('Notifications', 'Notification cliquée', response);
    if (onNotificationResponse) {
      onNotificationResponse(response);
    }
  });

  return () => {
    Notifications.removeNotificationSubscription(receivedListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}

/**
 * Obtient le badge count
 */
export async function getBadgeCount() {
  const count = await Notifications.getBadgeCountAsync();
  return count;
}

/**
 * Définit le badge count
 */
export async function setBadgeCount(count) {
  await Notifications.setBadgeCountAsync(count);
  logger.info('Notifications', `Badge count: ${count}`);
}

/**
 * Notifications prédéfinies pour ArtisanFlow
 */

export const NotificationTemplates = {
  /**
   * Rappel de devis en attente
   */
  devisReminder: (clientName, devisNumber) => ({
    title: '📄 Devis en attente',
    body: `Le devis ${devisNumber} pour ${clientName} attend une réponse`,
    data: { type: 'devis_reminder', devisNumber },
  }),

  /**
   * Facture échue
   */
  factureOverdue: (clientName, factureNumber) => ({
    title: '⚠️ Facture impayée',
    body: `La facture ${factureNumber} de ${clientName} est échue`,
    data: { type: 'facture_overdue', factureNumber },
  }),

  /**
   * Nouveau projet créé
   */
  newProject: (projectName, clientName) => ({
    title: '🏗️ Nouveau chantier',
    body: `${projectName} créé pour ${clientName}`,
    data: { type: 'new_project', projectName },
  }),

  /**
   * Note vocale transcrite
   */
  voiceTranscribed: (projectName) => ({
    title: '🎤 Transcription terminée',
    body: `Votre note pour ${projectName} a été transcrite`,
    data: { type: 'voice_transcribed', projectName },
  }),
};

/**
 * Programme une notification de rappel
 * @param {Date} date - Date du rappel
 * @param {object} notification - Contenu de la notification
 */
export async function scheduleReminder(date, notification) {
  const trigger = {
    date: date,
  };

  return scheduleLocalNotification({
    ...notification,
    trigger,
  });
}

