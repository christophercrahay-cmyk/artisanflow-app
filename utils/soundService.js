/**
 * Service de sons pour feedback audio
 * Utilise expo-av avec des sons système ou des vibrations haptiques comme fallback
 * 
 * Note: Pour des sons personnalisés, ajoutez des fichiers .mp3/.wav dans assets/sounds/
 * et utilisez require() pour les charger
 */

import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Cache pour les sons préchargés
const soundCache = {};
let audioModeConfigured = false;

/**
 * Configure le mode audio
 */
const configureAudio = async () => {
  if (audioModeConfigured) return;
  
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    audioModeConfigured = true;
  } catch (error) {
    // Ignorer les erreurs
  }
};

/**
 * Joue un son système (utilise les sons natifs de l'appareil)
 * Sur Android/iOS, les sons système sont disponibles via des fichiers audio courts
 * 
 * Pour l'instant, on utilise les vibrations haptiques comme "son" tactile
 * et on peut ajouter des fichiers audio plus tard si besoin
 */
const playSound = async (type = 'click') => {
  try {
    // Toujours jouer une vibration haptique comme feedback
    switch (type) {
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'click':
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
    }
    
    // TODO: Ajouter des fichiers audio si besoin
    // Pour l'instant, on utilise juste les haptics comme feedback "sonore"
    // Pour ajouter des vrais sons :
    // 1. Créer un dossier assets/sounds/
    // 2. Ajouter des fichiers .mp3 (success.mp3, error.mp3, click.mp3)
    // 3. Utiliser require() pour les charger
    // 4. Jouer avec Audio.Sound.createAsync()
    
  } catch (error) {
    // Ignorer les erreurs silencieusement
  }
};

/**
 * Joue un son de succès
 */
export const playSuccessSound = () => playSound('success');

/**
 * Joue un son d'erreur
 */
export const playErrorSound = () => playSound('error');

/**
 * Joue un son de clic
 */
export const playClickSound = () => playSound('click');

/**
 * Nettoie tous les sons en cache
 */
export const cleanupSounds = async () => {
  try {
    await Promise.all(
      Object.values(soundCache).map(sound => 
        sound.unloadAsync().catch(() => {})
      )
    );
    Object.keys(soundCache).forEach(key => delete soundCache[key]);
  } catch (error) {
    // Ignorer les erreurs
  }
};

export default {
  playSuccessSound,
  playErrorSound,
  playClickSound,
  cleanupSounds,
};

