/**
 * Service de gestion de la signature électronique des devis
 * Signature Électronique Simple (SES) - conforme juridiquement
 */

import { supabase } from '../../supabaseClient';
import logger from '../../utils/logger';

// URL de base pour les liens de signature publique
// Domaine public Netlify pour la page de signature
const SIGN_BASE_URL = __DEV__ 
  ? 'https://artisanflowsignatures.netlify.app/sign'
  : 'https://artisanflowsignatures.netlify.app/sign';

/**
 * Génère un lien de signature pour un devis
 * Si le token existe déjà, le réutilise
 * @param {string} devisId - ID du devis
 * @returns {Promise<string>} URL publique de signature
 */
export async function generateSignatureLink(devisId) {
  try {
    if (!devisId) {
      throw new Error('devisId est requis');
    }

    // Récupérer l'utilisateur connecté pour vérifier les permissions
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier que le devis existe et appartient à l'utilisateur
    const { data: devis, error: devisError } = await supabase
      .from('devis')
      .select(`
        id,
        signature_token,
        signature_status,
        projects!inner(user_id)
      `)
      .eq('id', devisId)
      .single();

    if (devisError) {
      logger.error('SignatureService', 'Erreur récupération devis', devisError);
      throw new Error('Devis introuvable');
    }

    // Vérifier que le devis appartient à l'utilisateur (via projects.user_id)
    if (devis.projects?.user_id !== user.id) {
      logger.warn('SignatureService', 'Tentative accès devis non autorisé', { devisId, userId: user.id });
      throw new Error('Accès non autorisé à ce devis');
    }

    // Si le token existe déjà et le devis n'est pas encore signé, le réutiliser
    if (devis.signature_token && devis.signature_status === 'pending') {
      const finalUrl = `${SIGN_BASE_URL}?devisId=${encodeURIComponent(devisId)}&token=${encodeURIComponent(devis.signature_token)}`;
      console.log('🔗 Génération lien signature (réutilisé)');
      console.log('🔗 SignatureService - SIGN_BASE_URL:', SIGN_BASE_URL);
      console.log('🔗 SignatureService - devisId:', devisId);
      console.log('🔗 SignatureService - token:', devis.signature_token);
      console.log('🔗 SignatureService - URL finale:', finalUrl);
      console.log('🔗 SignatureService - Longueur du lien:', finalUrl.length);
      logger.info('SignatureService', 'Token existant réutilisé', { devisId });
      return finalUrl;
    }

    // Générer un nouveau token sécurisé
    const signatureToken = crypto.randomUUID ? crypto.randomUUID() : generateUUID();

    // Mettre à jour le devis avec le token et le statut 'pending'
    const { error: updateError } = await supabase
      .from('devis')
      .update({
        signature_token: signatureToken,
        signature_status: 'pending',
      })
      .eq('id', devisId);

    if (updateError) {
      logger.error('SignatureService', 'Erreur mise à jour devis', updateError);
      throw new Error('Impossible de générer le lien de signature');
    }

    const finalUrl = `${SIGN_BASE_URL}?devisId=${encodeURIComponent(devisId)}&token=${encodeURIComponent(signatureToken)}`;
    console.log('🔗 Génération lien signature');
    console.log('🔗 SignatureService - SIGN_BASE_URL:', SIGN_BASE_URL);
    console.log('🔗 SignatureService - devisId:', devisId);
    console.log('🔗 SignatureService - token:', signatureToken);
    console.log('🔗 SignatureService - URL finale:', finalUrl);
    console.log('🔗 SignatureService - Longueur du lien:', finalUrl.length);
    logger.success('SignatureService', 'Lien de signature généré', { devisId, finalUrl });
    return finalUrl;
  } catch (error) {
    logger.error('SignatureService', 'Erreur generateSignatureLink', error);
    throw error;
  }
}

/**
 * Marque un devis comme signé et enregistre la signature
 * @param {Object} params - Paramètres de signature
 * @param {string} params.devisId - ID du devis
 * @param {string} params.signatureToken - Token de signature
 * @param {string} params.signatureImageBase64 - Image de signature en base64 (data URL)
 * @param {string} params.signerName - Nom du signataire
 * @param {string} params.signerEmail - Email du signataire
 * @param {string} [params.signerIp] - IP du signataire (optionnel)
 * @returns {Promise<void>}
 */
export async function markDevisAsSigned({
  devisId,
  signatureToken,
  signatureImageBase64,
  signerName,
  signerEmail,
  signerIp,
}) {
  try {
    if (!devisId || !signatureToken || !signatureImageBase64 || !signerName || !signerEmail) {
      throw new Error('Paramètres manquants pour la signature');
    }

    // Valider le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signerEmail)) {
      throw new Error('Format d\'email invalide');
    }

    // Vérifier que le devis existe et que le token correspond
    const { data: devis, error: devisError } = await supabase
      .from('devis')
      .select(`
        id,
        signature_token,
        signature_status,
        projects!inner(user_id)
      `)
      .eq('id', devisId)
      .eq('signature_token', signatureToken)
      .single();

    if (devisError || !devis) {
      logger.error('SignatureService', 'Devis ou token invalide', devisError);
      throw new Error('Token de signature invalide ou devis introuvable');
    }

    // Vérifier que le devis n'est pas déjà signé
    if (devis.signature_status === 'signed') {
      throw new Error('Ce devis est déjà signé');
    }

    const userId = devis.projects?.user_id;
    if (!userId) {
      throw new Error('Impossible de déterminer le propriétaire du devis');
    }

    // Insérer la signature dans devis_signatures
    const { error: insertError } = await supabase
      .from('devis_signatures')
      .insert({
        devis_id: devisId,
        user_id: userId,
        signer_name: signerName.trim(),
        signer_email: signerEmail.trim().toLowerCase(),
        signature_image_base64: signatureImageBase64,
        signer_ip: signerIp || null,
      });

    if (insertError) {
      logger.error('SignatureService', 'Erreur insertion signature', insertError);
      throw new Error('Impossible d\'enregistrer la signature');
    }

    // Mettre à jour le devis
    const { error: updateError } = await supabase
      .from('devis')
      .update({
        signature_status: 'signed',
        signed_at: new Date().toISOString(),
        signed_by_name: signerName.trim(),
        signed_by_email: signerEmail.trim().toLowerCase(),
      })
      .eq('id', devisId);

    if (updateError) {
      logger.error('SignatureService', 'Erreur mise à jour devis', updateError);
      // Essayer de supprimer la signature insérée pour éviter l'incohérence
      await supabase
        .from('devis_signatures')
        .delete()
        .eq('devis_id', devisId);
      throw new Error('Impossible de finaliser la signature');
    }

    logger.success('SignatureService', 'Devis signé avec succès', {
      devisId,
      signerName,
      signerEmail,
    });
  } catch (error) {
    logger.error('SignatureService', 'Erreur markDevisAsSigned', error);
    throw error;
  }
}

/**
 * Vérifie la validité d'un token de signature (pour l'écran public)
 * @param {string} devisId - ID du devis
 * @param {string} signatureToken - Token de signature
 * @returns {Promise<{valid: boolean, devis: object|null, error: string|null}>}
 */
export async function validateSignatureToken(devisId, signatureToken) {
  try {
    if (!devisId || !signatureToken) {
      return { valid: false, devis: null, error: 'Paramètres manquants' };
    }

    const { data: devis, error } = await supabase
      .from('devis')
      .select(`
        id,
        numero,
        signature_token,
        signature_status,
        signed_at,
        signed_by_name,
        signed_by_email,
        montant_ttc,
        date_creation,
        projects!inner(
          id,
          title,
          clients!inner(
            id,
            name
          )
        )
      `)
      .eq('id', devisId)
      .eq('signature_token', signatureToken)
      .single();

    if (error || !devis) {
      return { valid: false, devis: null, error: 'Token invalide ou devis introuvable' };
    }

    if (devis.signature_status === 'signed') {
      return { valid: false, devis, error: 'Ce devis est déjà signé' };
    }

    return { valid: true, devis, error: null };
  } catch (error) {
    logger.error('SignatureService', 'Erreur validateSignatureToken', error);
    return { valid: false, devis: null, error: 'Erreur lors de la validation' };
  }
}

/**
 * Récupère les informations de signature d'un devis (pour l'artisan)
 * @param {string} devisId - ID du devis
 * @returns {Promise<{signature: object|null, error: string|null}>}
 */
export async function getDevisSignatureInfo(devisId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Récupérer la dernière signature
    const { data: signature, error } = await supabase
      .from('devis_signatures')
      .select('*')
      .eq('devis_id', devisId)
      .eq('user_id', user.id)
      .order('signed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error('SignatureService', 'Erreur récupération signature', error);
      return { signature: null, error: 'Erreur lors de la récupération' };
    }

    return { signature, error: null };
  } catch (error) {
    logger.error('SignatureService', 'Erreur getDevisSignatureInfo', error);
    return { signature: null, error: error.message };
  }
}

/**
 * Génère un UUID simple si crypto.randomUUID n'est pas disponible
 * @returns {string}
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

