/**
 * Service de partage de chantiers avec les clients
 * Génère ou récupère un lien public sécurisé pour un chantier via share_token
 */

import { supabase } from '../supabaseClient';
import logger from '../utils/logger';
import { buildShareUrl } from '../config/shareConfig';

/**
 * Construit l'URL publique de partage pour un chantier
 * @deprecated Utiliser buildShareUrl() de config/shareConfig.js à la place
 * @param {string} shareToken - Token de partage du projet
 * @returns {string} URL publique à partager
 */
export function buildChantierShareUrl(shareToken) {
  // Utiliser la config centralisée
  return buildShareUrl(shareToken);
}

/**
 * Génère ou récupère un lien public pour un chantier
 * @param {string} projectId - ID du projet à partager
 * @returns {Promise<string>} URL publique à partager
 */
export async function getOrCreateProjectShareLink(projectId) {
  try {
    // ✅ Vérifier que l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    // ✅ Vérifier que le projet appartient à l'utilisateur et récupérer le share_token
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id, share_token')
      .eq('id', projectId)
      .eq('user_id', user.id) // ✅ Filtre obligatoire pour isolation utilisateurs
      .single();

    if (projectError || !project) {
      logger.error('ProjectShareService', 'Projet non trouvé ou accès non autorisé', projectError);
      throw new Error('Projet non trouvé ou accès non autorisé');
    }

    // Si le share_token existe déjà, l'utiliser
    if (project.share_token) {
      const url = buildShareUrl(project.share_token);
      logger.info('ProjectShareService', 'Share token existant réutilisé', { projectId, shareToken: project.share_token });
      return url;
    }

    // Sinon, générer un nouveau share_token
    // Générer un UUID côté client (le DEFAULT de la DB devrait le faire, mais on force pour être sûr)
    const newToken = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({ share_token: newToken })
      .eq('id', projectId)
      .select('share_token')
      .single();

    if (updateError || !updatedProject?.share_token) {
      logger.error('ProjectShareService', 'Erreur génération share_token', updateError);
      throw new Error('Impossible de générer le lien de partage');
    }

    const url = buildShareUrl(updatedProject.share_token);
    logger.success('ProjectShareService', 'Nouveau share_token créé', { projectId, shareToken: updatedProject.share_token });
    return url;
  } catch (error) {
    logger.error('ProjectShareService', 'Erreur getOrCreateProjectShareLink', error);
    throw error;
  }
}

/**
 * Révoque un lien public pour un chantier (met share_token à NULL)
 * @param {string} projectId - ID du projet
 * @returns {Promise<boolean>} true si révoqué avec succès
 */
export async function revokeProjectShareLink(projectId) {
  try {
    // ✅ Vérifier que l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    // ✅ Vérifier que le projet appartient à l'utilisateur
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .eq('user_id', user.id) // ✅ Filtre obligatoire pour isolation utilisateurs
      .single();

    if (projectError || !project) {
      logger.error('ProjectShareService', 'Projet non trouvé ou accès non autorisé', projectError);
      throw new Error('Projet non trouvé ou accès non autorisé');
    }

    // Révoquer le lien en mettant share_token à NULL
    const { error: updateError } = await supabase
      .from('projects')
      .update({ share_token: null })
      .eq('id', projectId);

    if (updateError) {
      logger.error('ProjectShareService', 'Erreur révocation lien', updateError);
      throw updateError;
    }

    logger.success('ProjectShareService', 'Lien révoqué (share_token supprimé)', { projectId });
    return true;
  } catch (error) {
    logger.error('ProjectShareService', 'Erreur revokeProjectShareLink', error);
    throw error;
  }
}

