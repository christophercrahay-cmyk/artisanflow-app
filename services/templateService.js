/**
 * Service de gestion des templates de devis
 */

import { supabase } from '../supabaseClient';
import logger from '../utils/logger';

/**
 * Récupère tous les templates de l'utilisateur
 */
export async function getTemplates() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const { data, error } = await supabase
      .from('devis_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    logger.info('TemplateService', `${data?.length || 0} templates chargés`);
    return data || [];
  } catch (error) {
    logger.error('TemplateService', 'Erreur chargement templates', error);
    throw error;
  }
}

/**
 * Récupère un template avec ses lignes
 */
export async function getTemplateWithLignes(templateId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Récupérer le template
    const { data: template, error: templateError } = await supabase
      .from('devis_templates')
      .select('*')
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single();

    if (templateError) throw templateError;
    if (!template) {
      throw new Error('Template non trouvé');
    }

    // Récupérer les lignes
    const { data: lignes, error: lignesError } = await supabase
      .from('devis_template_lignes')
      .select('*')
      .eq('template_id', templateId)
      .order('ordre', { ascending: true });

    if (lignesError) throw lignesError;

    return {
      ...template,
      lignes: lignes || [],
    };
  } catch (error) {
    logger.error('TemplateService', 'Erreur chargement template', error);
    throw error;
  }
}

/**
 * Crée un nouveau template avec ses lignes
 */
export async function createTemplate(templateData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const { name, description, category, lignes } = templateData;

    // Créer le template
    const { data: template, error: templateError } = await supabase
      .from('devis_templates')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        category: category?.trim() || null,
      })
      .select()
      .single();

    if (templateError) throw templateError;

    // Créer les lignes si fournies
    if (lignes && lignes.length > 0) {
      const lignesToInsert = lignes.map((ligne, index) => ({
        template_id: template.id,
        description: ligne.description.trim(),
        quantite: parseFloat(ligne.quantite) || 1,
        unite: ligne.unite?.trim() || 'unité',
        prix_unitaire: parseFloat(ligne.prix_unitaire) || 0,
        prix_total: parseFloat(ligne.prix_total) || 0,
        ordre: index + 1,
      }));

      const { error: lignesError } = await supabase
        .from('devis_template_lignes')
        .insert(lignesToInsert);

      if (lignesError) {
        // Supprimer le template si les lignes échouent
        await supabase.from('devis_templates').delete().eq('id', template.id);
        throw lignesError;
      }
    }

    logger.success('TemplateService', `Template "${name}" créé avec ${lignes?.length || 0} lignes`);
    return template;
  } catch (error) {
    logger.error('TemplateService', 'Erreur création template', error);
    throw error;
  }
}

/**
 * Met à jour un template
 */
export async function updateTemplate(templateId, templateData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const { name, description, category, lignes } = templateData;

    // Vérifier que le template appartient à l'utilisateur
    const { data: existingTemplate, error: checkError } = await supabase
      .from('devis_templates')
      .select('id')
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existingTemplate) {
      throw new Error('Template non trouvé ou non autorisé');
    }

    // Mettre à jour le template
    const { data: template, error: templateError } = await supabase
      .from('devis_templates')
      .update({
        name: name?.trim() || undefined,
        description: description?.trim() || null,
        category: category?.trim() || null,
      })
      .eq('id', templateId)
      .select()
      .single();

    if (templateError) throw templateError;

    // Si des lignes sont fournies, remplacer toutes les lignes existantes
    if (lignes !== undefined) {
      // Supprimer les anciennes lignes
      await supabase
        .from('devis_template_lignes')
        .delete()
        .eq('template_id', templateId);

      // Ajouter les nouvelles lignes
      if (lignes.length > 0) {
        const lignesToInsert = lignes.map((ligne, index) => ({
          template_id: templateId,
          description: ligne.description.trim(),
          quantite: parseFloat(ligne.quantite) || 1,
          unite: ligne.unite?.trim() || 'unité',
          prix_unitaire: parseFloat(ligne.prix_unitaire) || 0,
          prix_total: parseFloat(ligne.prix_total) || 0,
          ordre: index + 1,
        }));

        const { error: lignesError } = await supabase
          .from('devis_template_lignes')
          .insert(lignesToInsert);

        if (lignesError) throw lignesError;
      }
    }

    logger.success('TemplateService', `Template "${template.name}" mis à jour`);
    return template;
  } catch (error) {
    logger.error('TemplateService', 'Erreur mise à jour template', error);
    throw error;
  }
}

/**
 * Supprime un template
 */
export async function deleteTemplate(templateId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier que le template appartient à l'utilisateur
    const { data: existingTemplate, error: checkError } = await supabase
      .from('devis_templates')
      .select('id, name')
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existingTemplate) {
      throw new Error('Template non trouvé ou non autorisé');
    }

    // Supprimer le template (les lignes seront supprimées automatiquement par CASCADE)
    const { error } = await supabase
      .from('devis_templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;

    logger.success('TemplateService', `Template "${existingTemplate.name}" supprimé`);
    return true;
  } catch (error) {
    logger.error('TemplateService', 'Erreur suppression template', error);
    throw error;
  }
}

/**
 * Applique un template à un devis (crée les lignes dans devis_lignes)
 */
export async function applyTemplateToDevis(templateId, devisId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Récupérer le template avec ses lignes
    const template = await getTemplateWithLignes(templateId);

    if (!template.lignes || template.lignes.length === 0) {
      throw new Error('Ce template ne contient aucune ligne');
    }

    // Vérifier que le devis appartient à l'utilisateur
    const { data: devis, error: devisError } = await supabase
      .from('devis')
      .select('id')
      .eq('id', devisId)
      .eq('user_id', user.id)
      .single();

    if (devisError || !devis) {
      throw new Error('Devis non trouvé ou non autorisé');
    }

    // Créer les lignes dans devis_lignes
    const lignesToInsert = template.lignes.map((ligne, index) => ({
      devis_id: devisId,
      description: ligne.description,
      quantite: ligne.quantite,
      unite: ligne.unite,
      prix_unitaire: ligne.prix_unitaire,
      prix_total: ligne.prix_total,
      ordre: index + 1,
    }));

    const { error: lignesError } = await supabase
      .from('devis_lignes')
      .insert(lignesToInsert);

    if (lignesError) throw lignesError;

    logger.success('TemplateService', `Template "${template.name}" appliqué au devis (${lignesToInsert.length} lignes)`);
    return lignesToInsert;
  } catch (error) {
    logger.error('TemplateService', 'Erreur application template', error);
    throw error;
  }
}

