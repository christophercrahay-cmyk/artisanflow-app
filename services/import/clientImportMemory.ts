/**
 * Service de mémoire des mappings d'import pour les clients
 * Permet de réutiliser automatiquement les mappings pour des fichiers similaires
 */

import { supabase } from '../../supabaseClient';
import logger from '../../utils/logger';
import { ClientFieldMapping, computeHeadersSignature } from '../../utils/clientImportMapping';

/**
 * Récupère un mapping sauvegardé pour un utilisateur et une signature de headers
 */
export async function getSavedMapping(
  userId: string,
  headersSignature: string
): Promise<ClientFieldMapping | null> {
  try {
    const { data, error } = await supabase
      .from('client_import_mappings')
      .select('mapping')
      .eq('user_id', userId)
      .eq('headers_signature', headersSignature)
      .maybeSingle();

    if (error) {
      // Si la table n'existe pas encore, on ignore l'erreur gracieusement
      if (error.message?.includes('Could not find the table') || 
          error.message?.includes('does not exist') ||
          error.code === 'PGRST116' ||
          error.code === '42P01') {
        logger.warn('ClientImportMemory', 'Table client_import_mappings non trouvée. Exécutez la migration SQL.');
        return null;
      }
      logger.error('ClientImportMemory', 'Erreur récupération mapping', error);
      return null;
    }

    if (data?.mapping) {
      logger.info('ClientImportMemory', `Mapping trouvé pour signature ${headersSignature}`);
      return data.mapping as ClientFieldMapping;
    }

    return null;
  } catch (error: any) {
    // Gérer gracieusement si la table n'existe pas
    if (error?.message?.includes('Could not find the table') || 
        error?.message?.includes('does not exist')) {
      logger.warn('ClientImportMemory', 'Table client_import_mappings non trouvée. Exécutez la migration SQL.');
      return null;
    }
    logger.error('ClientImportMemory', 'Exception récupération mapping', error);
    return null;
  }
}

/**
 * Sauvegarde un mapping pour un utilisateur et une signature de headers
 */
export async function saveMapping(
  userId: string,
  headersSignature: string,
  mapping: ClientFieldMapping
): Promise<void> {
  try {
    // Utiliser upsert pour créer ou mettre à jour
    const { error } = await supabase.from('client_import_mappings').upsert(
      {
        user_id: userId,
        headers_signature: headersSignature,
        mapping: mapping,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,headers_signature',
      }
    );

    if (error) {
      // Si la table n'existe pas encore, on ignore l'erreur gracieusement
      if (error.message?.includes('Could not find the table') || 
          error.message?.includes('does not exist') ||
          error.code === '42P01') {
        logger.warn('ClientImportMemory', 'Table client_import_mappings non trouvée. Le mapping ne sera pas sauvegardé. Exécutez la migration SQL.');
        return; // Ne pas throw, juste logger un warning
      }
      logger.error('ClientImportMemory', 'Erreur sauvegarde mapping', error);
      throw error;
    }

    logger.success('ClientImportMemory', `Mapping sauvegardé pour signature ${headersSignature}`);
  } catch (error: any) {
    // Gérer gracieusement si la table n'existe pas
    if (error?.message?.includes('Could not find the table') || 
        error?.message?.includes('does not exist')) {
      logger.warn('ClientImportMemory', 'Table client_import_mappings non trouvée. Le mapping ne sera pas sauvegardé.');
      return; // Ne pas throw, juste logger un warning
    }
    logger.error('ClientImportMemory', 'Exception sauvegarde mapping', error);
    throw error;
  }
}

/**
 * Calcule la signature et récupère le mapping sauvegardé si disponible
 */
export async function getOrDetectMapping(
  userId: string,
  headers: string[]
): Promise<{ mapping: ClientFieldMapping; wasSaved: boolean; signature: string }> {
  const signature = computeHeadersSignature(headers);
  const savedMapping = await getSavedMapping(userId, signature);

  if (savedMapping) {
    return {
      mapping: savedMapping,
      wasSaved: true,
      signature,
    };
  }

  // Si pas de mapping sauvegardé, utiliser la détection automatique
  const { detectColumns } = await import('../../utils/clientImportMapping');
  const detected = detectColumns(headers);

  return {
    mapping: detected.autoMapping,
    wasSaved: false,
    signature,
  };
}

