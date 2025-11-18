/**
 * Service centralisé pour la gestion des devis
 * Logique métier et transitions de statuts
 */

import { supabase } from '../../supabaseClient';
import logger from '../../utils/logger';

/**
 * Finalise un devis (transition: edition → pret)
 * Vérifie que le devis a au moins une ligne avant de finaliser
 * 
 * @param {string} devisId - ID du devis à finaliser
 * @returns {Promise<{success: boolean, devis?: object, error?: string}>}
 */
export async function finalizeDevis(devisId) {
  try {
    if (!devisId) {
      throw new Error('devisId est requis');
    }

    logger.info('DevisService', 'Finalisation du devis', { devisId });

    // Vérifier que l'utilisateur est connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier que le devis existe et appartient à l'utilisateur
    const { data: devis, error: devisError } = await supabase
      .from('devis')
      .select(`
        id,
        statut,
        numero,
        projects!inner(user_id)
      `)
      .eq('id', devisId)
      .single();

    if (devisError) {
      logger.error('DevisService', 'Erreur récupération devis', devisError);
      throw new Error('Devis introuvable');
    }

    // Vérifier que le devis appartient à l'utilisateur
    if (devis.projects?.user_id !== user.id) {
      logger.warn('DevisService', 'Tentative accès devis non autorisé', { devisId, userId: user.id });
      throw new Error('Accès non autorisé à ce devis');
    }

    // Vérifier que le devis est en statut "edition"
    if (devis.statut !== 'edition') {
      logger.warn('DevisService', 'Tentative de finaliser un devis déjà finalisé', { 
        devisId, 
        currentStatut: devis.statut 
      });
      throw new Error(`Ce devis est déjà en statut "${devis.statut}". Seuls les devis en édition peuvent être finalisés.`);
    }

    // Vérifier que le devis a au moins une ligne
    const { data: lignes, error: lignesError } = await supabase
      .from('devis_lignes')
      .select('id')
      .eq('devis_id', devisId);

    if (lignesError) {
      logger.error('DevisService', 'Erreur vérification lignes', lignesError);
      throw new Error('Impossible de vérifier les lignes du devis');
    }

    if (!lignes || lignes.length === 0) {
      throw new Error('Le devis doit contenir au moins une ligne avant d\'être finalisé');
    }

    // Mettre à jour le statut
    const { data: updatedDevis, error: updateError } = await supabase
      .from('devis')
      .update({
        statut: 'pret',
        statut_updated_at: new Date().toISOString(),
      })
      .eq('id', devisId)
      .select()
      .single();

    if (updateError) {
      logger.error('DevisService', 'Erreur mise à jour statut', updateError);
      throw new Error('Impossible de finaliser le devis');
    }

    logger.success('DevisService', 'Devis finalisé avec succès', { 
      devisId, 
      numero: devis.numero,
      nbLignes: lignes.length 
    });

    return {
      success: true,
      devis: updatedDevis,
    };
  } catch (error) {
    logger.error('DevisService', 'Erreur finalizeDevis', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la finalisation du devis',
    };
  }
}

/**
 * Annule la finalisation d'un devis (transition: pret → edition)
 * Permet de revenir en édition si le devis n'a pas encore été envoyé
 * 
 * @param {string} devisId - ID du devis
 * @returns {Promise<{success: boolean, devis?: object, error?: string}>}
 */
export async function unfinalizeDevis(devisId) {
  try {
    if (!devisId) {
      throw new Error('devisId est requis');
    }

    logger.info('DevisService', 'Annulation finalisation du devis', { devisId });

    // Vérifier que l'utilisateur est connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier que le devis existe et appartient à l'utilisateur
    const { data: devis, error: devisError } = await supabase
      .from('devis')
      .select(`
        id,
        statut,
        numero,
        projects!inner(user_id)
      `)
      .eq('id', devisId)
      .single();

    if (devisError) {
      logger.error('DevisService', 'Erreur récupération devis', devisError);
      throw new Error('Devis introuvable');
    }

    // Vérifier que le devis appartient à l'utilisateur
    if (devis.projects?.user_id !== user.id) {
      logger.warn('DevisService', 'Tentative accès devis non autorisé', { devisId, userId: user.id });
      throw new Error('Accès non autorisé à ce devis');
    }

    // Vérifier que le devis est en statut "pret"
    if (devis.statut !== 'pret') {
      throw new Error(`Ce devis est en statut "${devis.statut}". Seuls les devis prêts peuvent revenir en édition.`);
    }

    // Mettre à jour le statut
    const { data: updatedDevis, error: updateError } = await supabase
      .from('devis')
      .update({
        statut: 'edition',
        statut_updated_at: new Date().toISOString(),
      })
      .eq('id', devisId)
      .select()
      .single();

    if (updateError) {
      logger.error('DevisService', 'Erreur mise à jour statut', updateError);
      throw new Error('Impossible d\'annuler la finalisation');
    }

    logger.success('DevisService', 'Finalisation annulée avec succès', { 
      devisId, 
      numero: devis.numero 
    });

    return {
      success: true,
      devis: updatedDevis,
    };
  } catch (error) {
    logger.error('DevisService', 'Erreur unfinalizeDevis', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de l\'annulation de la finalisation',
    };
  }
}

/**
 * Crée un devis rapidement (pour Phase 3)
 * Génère automatiquement via IA si des notes vocales existent
 * 
 * @param {string} clientId - ID du client
 * @param {string} projectId - ID du projet
 * @returns {Promise<{success: boolean, devisId?: string, error?: string}>}
 */
export async function createDevisQuick(clientId, projectId) {
  try {
    if (!clientId || !projectId) {
      throw new Error('clientId et projectId sont requis');
    }

    logger.info('DevisService', 'Création rapide de devis', { clientId, projectId });

    // Vérifier que l'utilisateur est connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier que le projet existe et appartient à l'utilisateur
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      throw new Error('Projet introuvable ou accès non autorisé');
    }

    // Générer un numéro de devis unique
    const numero = await generateDevisNumber(user.id);

    // Créer le devis avec statut "edition"
    const { data: newDevis, error: insertError } = await supabase
      .from('devis')
      .insert({
        user_id: user.id,
        project_id: projectId,
        client_id: clientId,
        numero,
        statut: 'edition',
        montant_ht: 0,
        montant_ttc: 0,
        tva_percent: 20,
      })
      .select()
      .single();

    if (insertError) {
      logger.error('DevisService', 'Erreur création devis', insertError);
      throw new Error('Impossible de créer le devis');
    }

    logger.success('DevisService', 'Devis créé avec succès', { 
      devisId: newDevis.id, 
      numero: newDevis.numero 
    });

    return {
      success: true,
      devisId: newDevis.id,
      numero: newDevis.numero,
    };
  } catch (error) {
    logger.error('DevisService', 'Erreur createDevisQuick', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la création du devis',
    };
  }
}

/**
 * Génère un numéro de devis unique pour un utilisateur
 * Format: DE-YYYY-XXXX (XXXX = compteur incrémental)
 * 
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<string>} Numéro de devis unique
 */
async function generateDevisNumber(userId) {
  try {
    const year = new Date().getFullYear();
    
    // Récupérer le dernier numéro de devis de l'année pour cet utilisateur
    const { data: lastDevis } = await supabase
      .from('devis')
      .select('numero')
      .eq('user_id', userId)
      .like('numero', `DE-${year}-%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let counter = 1;
    
    if (lastDevis?.numero) {
      // Extraire le compteur du dernier numéro (ex: DE-2025-0042 → 42)
      const match = lastDevis.numero.match(/DE-\d{4}-(\d+)$/);
      if (match) {
        counter = parseInt(match[1], 10) + 1;
      }
    }

    // Formater avec padding (ex: 1 → 0001)
    const paddedCounter = counter.toString().padStart(4, '0');
    return `DE-${year}-${paddedCounter}`;
  } catch (error) {
    logger.error('DevisService', 'Erreur génération numéro', error);
    // Fallback: numéro aléatoire
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `DE-${new Date().getFullYear()}-${rand}`;
  }
}

/**
 * Vérifie si un devis peut être finalisé
 * 
 * @param {string} devisId - ID du devis
 * @returns {Promise<{canFinalize: boolean, reason?: string}>}
 */
export async function canFinalizeDevis(devisId) {
  try {
    const { data: devis, error: devisError } = await supabase
      .from('devis')
      .select('id, statut')
      .eq('id', devisId)
      .single();

    if (devisError || !devis) {
      return { canFinalize: false, reason: 'Devis introuvable' };
    }

    if (devis.statut !== 'edition') {
      return { canFinalize: false, reason: `Le devis est déjà en statut "${devis.statut}"` };
    }

    const { data: lignes, error: lignesError } = await supabase
      .from('devis_lignes')
      .select('id')
      .eq('devis_id', devisId);

    if (lignesError) {
      return { canFinalize: false, reason: 'Erreur lors de la vérification des lignes' };
    }

    if (!lignes || lignes.length === 0) {
      return { canFinalize: false, reason: 'Le devis doit contenir au moins une ligne' };
    }

    return { canFinalize: true };
  } catch (error) {
    logger.error('DevisService', 'Erreur canFinalizeDevis', error);
    return { canFinalize: false, reason: 'Erreur lors de la vérification' };
  }
}

