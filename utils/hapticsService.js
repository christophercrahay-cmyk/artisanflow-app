/**
 * Service de gestion des vibrations haptiques
 * Respecte la préférence utilisateur pour activer/désactiver les vibrations
 */

import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HAPTICS_ENABLED_KEY = '@artisanflow:haptics_enabled';

// Valeur par défaut : activé (true)
let hapticsEnabled = true;

/**
 * Charge la préférence depuis AsyncStorage
 */
export const loadHapticsPreference = async () => {
  try {
    const value = await AsyncStorage.getItem(HAPTICS_ENABLED_KEY);
    if (value !== null) {
      hapticsEnabled = value === 'true';
    }
    return hapticsEnabled;
  } catch (error) {
    console.error('[HapticsService] Erreur chargement préférence:', error);
    return true; // Par défaut activé en cas d'erreur
  }
};

/**
 * Sauvegarde la préférence dans AsyncStorage
 */
export const saveHapticsPreference = async (enabled) => {
  try {
    hapticsEnabled = enabled;
    await AsyncStorage.setItem(HAPTICS_ENABLED_KEY, enabled.toString());
    return true;
  } catch (error) {
    console.error('[HapticsService] Erreur sauvegarde préférence:', error);
    return false;
  }
};

/**
 * Vérifie si les vibrations sont activées
 */
export const isHapticsEnabled = () => {
  return hapticsEnabled;
};

/**
 * Impact feedback (léger, moyen, fort)
 * @param {Haptics.ImpactFeedbackStyle} style - Style d'impact (Light, Medium, Heavy)
 */
export const impactAsync = async (style = Haptics.ImpactFeedbackStyle.Medium) => {
  if (!hapticsEnabled) return;
  try {
    await Haptics.impactAsync(style);
  } catch (error) {
    // Ignorer silencieusement les erreurs (device peut ne pas supporter)
  }
};

// Exporter les styles pour faciliter l'utilisation
export const ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle;
export const NotificationFeedbackType = Haptics.NotificationFeedbackType;

/**
 * Notification feedback (succès, erreur, warning)
 */
export const notificationAsync = async (type) => {
  if (!hapticsEnabled) return;
  try {
    await Haptics.notificationAsync(type);
  } catch (error) {
    // Ignorer silencieusement les erreurs
  }
};

/**
 * Sélection feedback
 */
export const selectionAsync = async () => {
  if (!hapticsEnabled) return;
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    // Ignorer silencieusement les erreurs
  }
};

// Charger la préférence au démarrage
loadHapticsPreference();

