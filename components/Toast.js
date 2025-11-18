import { playSuccessSound, playErrorSound, playClickSound } from '../utils/soundService';

// Import du contexte toast (nouveau système)
let toastContext = null;

/**
 * Initialise le contexte toast (appelé depuis ToastProvider)
 * @internal
 */
export const setToastContext = (context) => {
  toastContext = context;
};

/**
 * Affiche un toast (notification courte non-intrusive)
 * @param {string} message - Le message à afficher
 * @param {'success'|'error'|'info'} type - Type de toast
 * @param {'short'|'long'} duration - Durée d'affichage (converti en ms)
 * @param {boolean} playSoundEnabled - Jouer un son (défaut: true)
 */
export const showToast = (message, type = 'success', duration = 'short', playSoundEnabled = true) => {
  // Convertir duration en millisecondes
  const durationMs = duration === 'long' ? 5000 : 3500;

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

  // Utiliser le nouveau système de toast
  if (toastContext) {
    toastContext.showToast({ type, message, duration: durationMs });
  } else {
    // Fallback silencieux si le contexte n'est pas encore initialisé
    console.warn('[Toast] ToastContext non initialisé. Message:', message);
  }
};

/**
 * Toast de succès (vert)
 */
export const showSuccess = (message, duration = 'short', playSoundEnabled = true) => {
  showToast(message, 'success', duration, playSoundEnabled);
};

/**
 * Toast d'erreur (rouge)
 */
export const showError = (message, duration = 'short', playSoundEnabled = true) => {
  showToast(message, 'error', duration, playSoundEnabled);
};

/**
 * Toast d'information (bleu)
 */
export const showInfo = (message, duration = 'short') => {
  showToast(message, 'info', duration);
};

/**
 * Toast d'avertissement (orange) - mappé sur 'info' pour l'instant
 */
export const showWarning = (message, duration = 'short') => {
  showToast(message, 'info', duration);
};

