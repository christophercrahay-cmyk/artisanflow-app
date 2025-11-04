import { ToastAndroid, Platform, Alert } from 'react-native';

/**
 * Affiche un toast (notification courte non-intrusive)
 * @param {string} message - Le message à afficher
 * @param {'success'|'error'|'info'|'warning'} type - Type de toast
 * @param {'short'|'long'} duration - Durée d'affichage
 */
export const showToast = (message, type = 'success', duration = 'short') => {
  const durationValue = duration === 'long' 
    ? ToastAndroid.LONG 
    : ToastAndroid.SHORT;

  if (Platform.OS === 'android') {
    ToastAndroid.show(message, durationValue);
  } else {
    // Sur iOS, utiliser Alert en dernier recours
    // (à remplacer par react-native-toast-message pour une meilleure UX)
    Alert.alert('', message);
  }
};

/**
 * Toast de succès (vert)
 */
export const showSuccess = (message, duration = 'short') => {
  showToast(`✅ ${message}`, 'success', duration);
};

/**
 * Toast d'erreur (rouge)
 */
export const showError = (message, duration = 'short') => {
  showToast(`❌ ${message}`, 'error', duration);
};

/**
 * Toast d'information (bleu)
 */
export const showInfo = (message, duration = 'short') => {
  showToast(`ℹ️ ${message}`, 'info', duration);
};

/**
 * Toast d'avertissement (orange)
 */
export const showWarning = (message, duration = 'short') => {
  showToast(`⚠️ ${message}`, 'warning', duration);
};

