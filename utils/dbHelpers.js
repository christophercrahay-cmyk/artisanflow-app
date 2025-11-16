/**
 * Helpers DB avec gestion automatique de user_id
 */

import { getCurrentUser } from './auth';
import logger from './logger';

/**
 * Wrapper pour requêtes Supabase avec user_id automatique
 * 
 * @param {Function} supabaseQuery - Query Supabase (ex: supabase.from('table').select())
 * @param {string} category - Catégorie pour logs
 * @returns {Promise<{data, error}>}
 */
export async function dbQuery(supabaseQuery, category = 'DB') {
  try {
    const user = await getCurrentUser();
    if (!user) {
      logger.warn(category, 'Pas de user connecté');
      return { data: null, error: new Error('Non authentifié') };
    }

    logger.debug(category, `Query pour user: ${user.id}`);
    const result = await supabaseQuery;
    
    if (result.error) {
      logger.error(category, 'Erreur query', result.error);
    } else {
      logger.debug(category, `${result.data?.length || 0} entrées`);
    }

    return result;
  } catch (err) {
    logger.error(category, 'Exception query', err);
    return { data: null, error: err };
  }
}

/**
 * Wrapper pour INSERT avec user_id automatique
 * 
 * @param {Object} tableData - Données à insérer
 * @param {string} category - Catégorie pour logs
 * @returns {Object} Data avec user_id si manquant
 */
export async function prepareInsertData(tableData, category = 'DB') {
  try {
    const user = await getCurrentUser();
    if (!user) {
      logger.warn(category, 'Pas de user connecté');
      return { ...tableData, user_id: null };
    }

    // user_id déjà présent ou ajouté automatiquement
    return { ...tableData, user_id: user.id };
  } catch (err) {
    logger.error(category, 'Exception prepareInsertData', err);
    return tableData;
  }
}

/**
 * Wrapper pour UPDATE/DELETE avec vérification user_id (RLS déjà fait, log supplémentaire)
 */
export async function dbMutate(supabaseQuery, category = 'DB') {
  try {
    const user = await getCurrentUser();
    if (!user) {
      logger.warn(category, 'Pas de user connecté');
      return { data: null, error: new Error('Non authentifié') };
    }

    logger.info(category, `Mutation pour user: ${user.id}`);
    const result = await supabaseQuery;
    
    if (result.error) {
      logger.error(category, 'Erreur mutation', result.error);
    } else {
      logger.success(category, 'Mutation réussie');
    }

    return result;
  } catch (err) {
    logger.error(category, 'Exception mutation', err);
    return { data: null, error: err };
  }
}

/**
 * Récupère user_id actuel (synchrone si session déjà chargée)
 */
export function getUserIdSync() {
  // @ts-ignore
  const session = supabase.auth.session;
  return session?.user?.id || null;
}

