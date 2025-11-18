/**
 * Configuration centralisée pour les URLs de partage de chantier
 * 
 * Cette config permet de gérer la base URL de partage via :
 * 1. Variable d'environnement EXPO_PUBLIC_SHARE_BASE_URL
 * 2. Config Expo extra.shareBaseUrl
 * 3. Fallback par défaut
 */

import Constants from 'expo-constants';

/**
 * Récupère la base URL pour le partage de chantier
 * Priorité :
 * 1. EXPO_PUBLIC_SHARE_BASE_URL (env)
 * 2. extra.shareBaseUrl (app.config.js)
 * 3. Fallback par défaut (Netlify de test)
 */
const getShareBaseUrl = () => {
  // 1. Variable d'environnement (priorité la plus haute)
  if (process.env.EXPO_PUBLIC_SHARE_BASE_URL) {
    return process.env.EXPO_PUBLIC_SHARE_BASE_URL;
  }

  // 2. Config Expo extra.shareBaseUrl
  const extraConfig = Constants.expoConfig?.extra;
  if (extraConfig?.shareBaseUrl) {
    return extraConfig.shareBaseUrl;
  }

  // 3. Fallback par défaut (Netlify de test)
  return 'https://magnificent-bonbon-b7534e.netlify.app';
};

/**
 * Construit l'URL complète de partage pour un chantier
 * @param {string} shareToken - Token de partage du projet
 * @returns {string} URL publique à partager
 * 
 * @example
 * buildShareUrl('abc123-def456') 
 * // => 'https://magnificent-bonbon-b7534e.netlify.app/share/chantier/abc123-def456'
 */
export const buildShareUrl = (shareToken) => {
  if (!shareToken) {
    throw new Error('shareToken est requis pour construire l\'URL de partage');
  }

  const baseUrl = getShareBaseUrl();
  // Nettoyer la base URL (enlever le trailing slash si présent)
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  
  return `${cleanBaseUrl}/share/chantier/${shareToken}`;
};

/**
 * Expose la base URL pour debug/info
 */
export const getShareBaseUrlForInfo = () => getShareBaseUrl();

