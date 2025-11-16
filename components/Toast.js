import { ToastAndroid, Platform, Alert } from 'react-native';
import { playSuccessSound, playErrorSound, playClickSound } from '../utils/soundService';

/**
 * Affiche un toast (notification courte non-intrusive)
 * @param {string} message - Le message à afficher
 * @param {'success'|'error'|'info'|'warning'} type - Type de toast
 * @param {'short'|'long'} duration - Durée d'affichage
 * @param {boolean} playSound - Jouer un son (défaut: true)
 */
export const showToast = (message, type = 'success', duration = 'short', playSoundEnabled = true) => {
  const durationValue = duration === 'long' 
    ? ToastAndroid.LONG 
    : ToastAndroid.SHORT;

  // Jouer le son correspondant
  if (playSoundEnabled) {
    switch (type) {
      case 'success':
        playSuccessSound();
        break;
      case 'error':
        playErrorSound();
        break;
      default:
        playClickSound();
        break;
    }
  }

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
export const showSuccess = (message, duration = 'short', playSoundEnabled = true) => {
  showToast(`✅ ${message}`, 'success', duration, playSoundEnabled);
};

/**
 * Toast d'erreur (rouge)
 */
export const showError = (message, duration = 'short', playSoundEnabled = true) => {
  showToast(`❌ ${message}`, 'error', duration, playSoundEnabled);
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

