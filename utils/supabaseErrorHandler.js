/**
 * Gestionnaire centralisé d'erreurs Supabase
 * À utiliser dans tous les appels Supabase pour un logging cohérent
 */

import logger from './logger';

/**
 * Log une erreur Supabase de manière uniforme
 * @param {string} context - Nom de la fonction/fichier où l'erreur s'est produite
 * @param {object} error - Objet d'erreur Supabase
 * @param {object} additionalData - Données supplémentaires pour le contexte
 */
export function logSupabaseError(context, error, additionalData = {}) {
  if (!error) {return;}

  const errorDetails = {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
    ...additionalData,
  };

  logger.error('Supabase', `Erreur dans ${context}`, errorDetails);
  
  // Log détaillé en dev
  if (__DEV__) {
    console.error(`[Supabase Error in ${context}]`, JSON.stringify(errorDetails, null, 2));
  }
}

/**
 * Wrapper pour les opérations Supabase avec gestion d'erreur automatique
 * @param {string} context - Contexte de l'opération
 * @param {Promise} operation - Promise Supabase
 * @returns {Promise<{data, error}>} Résultat de l'opération
 */
export async function executeSupabaseOperation(context, operation) {
  try {
    const result = await operation;
    
    if (result.error) {
      logSupabaseError(context, result.error);
    }
    
    return result;
  } catch (error) {
    logSupabaseError(context, error);
    return { data: null, error };
  }
}

/**
 * Vérifie si une erreur Supabase indique une colonne manquante
 * @param {object} error - Erreur Supabase
 * @returns {boolean}
 */
export function isMissingColumnError(error) {
  return error?.code === 'PGRST204' || error?.message?.includes('Could not find');
}

/**
 * Vérifie si une erreur Supabase indique un problème d'authentification
 * @param {object} error - Erreur Supabase
 * @returns {boolean}
 */
export function isAuthError(error) {
  return error?.code === 'PGRST301' || error?.message?.includes('JWT');
}

/**
 * Formate un message d'erreur lisible pour l'utilisateur
 * @param {object} error - Erreur Supabase
 * @returns {string} Message formaté
 */
export function formatUserFriendlyError(error) {
  if (!error) {return 'Une erreur inconnue s\'est produite';}
  
  if (isMissingColumnError(error)) {
    return 'Configuration de la base de données incorrecte. Contactez le support.';
  }
  
  if (isAuthError(error)) {
    return 'Session expirée. Veuillez vous reconnecter.';
  }
  
  if (error.message?.includes('violates foreign key')) {
    return 'Opération impossible: des données liées existent.';
  }
  
  if (error.message?.includes('duplicate key')) {
    return 'Cette entrée existe déjà.';
  }
  
  return error.message || 'Une erreur s\'est produite';
}

