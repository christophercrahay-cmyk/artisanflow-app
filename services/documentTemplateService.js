/**
 * Service pour gérer le template de document sélectionné par l'utilisateur
 */

import { supabase } from '../supabaseClient';
import { DEFAULT_TEMPLATE, isValidTemplateId } from '../types/documentTemplates';
import logger from '../utils/logger';

/**
 * Récupère le template par défaut de l'utilisateur depuis brand_settings
 * @returns {Promise<DocumentTemplateId>}
 */
export async function getDefaultTemplate() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.warn('DocumentTemplateService', 'Utilisateur non connecté');
      return DEFAULT_TEMPLATE;
    }

    const { data: settings } = await supabase
      .from('brand_settings')
      .select('template_default')
      .eq('user_id', user.id)
      .maybeSingle();

    let templateRaw = settings?.template_default || DEFAULT_TEMPLATE;
    
    // ✅ Compatibilité : mapper l'ancien 'premium' vers 'premiumNoirOr'
    if (templateRaw === 'premium') {
      templateRaw = 'premiumNoirOr';
    }
    
    // Valider que le template est valide
    if (isValidTemplateId(templateRaw)) {
      return templateRaw;
    }

    logger.warn('DocumentTemplateService', `Template invalide "${templateRaw}", utilisation du défaut`);
    return DEFAULT_TEMPLATE;
  } catch (error) {
    logger.error('DocumentTemplateService', 'Erreur récupération template', error);
    return DEFAULT_TEMPLATE;
  }
}

/**
 * Met à jour le template par défaut de l'utilisateur
 * @param {DocumentTemplateId} templateId
 * @returns {Promise<boolean>}
 */
export async function setDefaultTemplate(templateId) {
  try {
    if (!isValidTemplateId(templateId)) {
      throw new Error(`Template invalide: ${templateId}`);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier si brand_settings existe
    const { data: existing } = await supabase
      .from('brand_settings')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      // Mettre à jour
      const { error } = await supabase
        .from('brand_settings')
        .update({ template_default: templateId })
        .eq('user_id', user.id);

      if (error) throw error;
    } else {
      // Créer avec le template
      const { error } = await supabase
        .from('brand_settings')
        .insert({
          user_id: user.id,
          template_default: templateId,
        });

      if (error) throw error;
    }

    logger.success('DocumentTemplateService', `Template mis à jour: ${templateId}`);
    return true;
  } catch (error) {
    logger.error('DocumentTemplateService', 'Erreur mise à jour template', error);
    throw error;
  }
}

