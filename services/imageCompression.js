import logger from '../utils/logger';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Configuration de compression par défaut
 */
const DEFAULT_CONFIG = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8, // 0-1
  format: ImageManipulator.SaveFormat.JPEG,
};

/**
 * Compresse une image
 * @param {string} uri - URI de l'image source
 * @param {object} options - Options de compression (optionnel)
 * @returns {Promise<{uri: string, width: number, height: number, size: number}>}
 */
export async function compressImage(uri, options = {}) {
  try {
    const config = { ...DEFAULT_CONFIG, ...options };
    
    logger.info('ImageCompression', `Compression de l'image: ${uri}`);
    
    const startTime = Date.now();

    // Manipuler l'image
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: config.maxWidth,
            height: config.maxHeight,
          },
        },
      ],
      {
        compress: config.quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    const duration = Date.now() - startTime;

    // Obtenir la taille du fichier (approximation)
    const response = await fetch(result.uri);
    const blob = await response.blob();
    const sizeInKB = (blob.size / 1024).toFixed(2);

    logger.success('ImageCompression', 
      `Image compressée en ${duration}ms - Taille: ${sizeInKB}KB`,
      { 
        width: result.width, 
        height: result.height,
        originalUri: uri,
        compressedUri: result.uri
      }
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      size: blob.size,
      sizeKB: parseFloat(sizeInKB),
    };
  } catch (error) {
    logger.error('ImageCompression', 'Erreur compression image', error);
    throw error;
  }
}

/**
 * Compresse une image pour les miniatures
 * @param {string} uri - URI de l'image source
 * @returns {Promise<object>}
 */
export async function compressImageThumbnail(uri) {
  return compressImage(uri, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.7,
  });
}

/**
 * Compresse plusieurs images en batch
 * @param {string[]} uris - Tableau d'URIs
 * @param {object} options - Options de compression
 * @returns {Promise<object[]>}
 */
export async function compressMultipleImages(uris, options = {}) {
  logger.info('ImageCompression', `Compression de ${uris.length} images`);
  
  const results = [];
  
  for (const uri of uris) {
    try {
      const compressed = await compressImage(uri, options);
      results.push(compressed);
    } catch (error) {
      logger.error('ImageCompression', `Échec compression: ${uri}`, error);
      // Continuer avec l'image suivante
    }
  }
  
  return results;
}

/**
 * Redimensionne une image sans compression
 * @param {string} uri - URI de l'image source
 * @param {number} width - Largeur cible
 * @param {number} height - Hauteur cible
 * @returns {Promise<object>}
 */
export async function resizeImage(uri, width, height) {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width,
            height,
          },
        },
      ],
      {
        compress: 1,
        format: ImageManipulator.SaveFormat.PNG,
      }
    );

    return result;
  } catch (error) {
    logger.error('ImageCompression', 'Erreur redimensionnement', error);
    throw error;
  }
}

/**
 * Rotation d'une image
 * @param {string} uri - URI de l'image source
 * @param {number} degrees - Degrés de rotation (90, 180, 270)
 * @returns {Promise<object>}
 */
export async function rotateImage(uri, degrees) {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          rotate: degrees,
        },
      ],
      {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result;
  } catch (error) {
    logger.error('ImageCompression', 'Erreur rotation', error);
    throw error;
  }
}

