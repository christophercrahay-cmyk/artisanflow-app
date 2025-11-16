/**
 * Service de partage de documents (devis/factures)
 * Supporte : Email, WhatsApp, SMS, Partage générique
 */

import * as Linking from 'expo-linking';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import logger from '../utils/logger';

/**
 * Génère un message pré-rempli pour un document
 */
export function generateShareMessage(document, companyName = 'Mon Entreprise') {
  const docType = document.type === 'devis' ? 'Devis' : 'Facture';
  const montant = document.total_ttc?.toFixed(2) || '0.00';
  
  if (document.type === 'devis') {
    return `Bonjour,

Je vous envoie le ${docType} ${document.number} pour le projet "${document.project_title}".

Montant TTC : ${montant} €

Merci de me confirmer votre accord.

Cordialement,
${companyName}`;
  } else {
    return `Bonjour,

Je vous envoie la ${docType} ${document.number} pour le projet "${document.project_title}".

Montant TTC : ${montant} €

Merci de procéder au règlement.

Cordialement,
${companyName}`;
  }
}

/**
 * Partage par Email
 * Note: mailto ne supporte pas les pièces jointes directement
 * On ouvre d'abord le client email avec le message, puis on propose le PDF via le menu de partage
 */
export async function shareViaEmail(document, pdfUri, companyName) {
  try {
    const subject = `${document.type === 'devis' ? 'Devis' : 'Facture'} ${document.number} - ${document.project_title}`;
    const body = generateShareMessage(document, companyName);
    
    // Encoder le message pour l'URL
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    
    // Construire l'URL mailto
    const mailtoUrl = `mailto:${document.client_email || ''}?subject=${encodedSubject}&body=${encodedBody}`;
    
    // Ouvrir le client email
    const canOpen = await Linking.canOpenURL(mailtoUrl);
    if (canOpen) {
      await Linking.openURL(mailtoUrl);
      
      // Attendre un peu puis proposer le PDF via le menu de partage
      // L'utilisateur pourra choisir son client email dans le menu
      setTimeout(async () => {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable && pdfUri) {
          try {
            await Sharing.shareAsync(pdfUri, {
              mimeType: 'application/pdf',
              dialogTitle: `Joindre ${document.type === 'devis' ? 'Devis' : 'Facture'} ${document.number} à votre email`,
            });
          } catch (shareError) {
            // Ignorer l'erreur si l'utilisateur annule le partage
            logger.info('ShareService', 'Partage PDF annulé ou échoué', shareError);
          }
        }
      }, 800);
    } else {
      throw new Error('Aucun client email configuré sur cet appareil');
    }
    
    logger.success('ShareService', 'Email ouvert');
    return true;
  } catch (error) {
    logger.error('ShareService', 'Erreur partage email', error);
    throw error;
  }
}

/**
 * Partage par WhatsApp
 * Note: WhatsApp ne supporte pas les pièces jointes via liens profonds
 * On ouvre d'abord WhatsApp avec le message, puis on propose le PDF via le menu de partage
 */
export async function shareViaWhatsApp(document, pdfUri, clientPhone) {
  try {
    const message = generateShareMessage(document);
    
    // Encoder le message pour l'URL WhatsApp
    const encodedMessage = encodeURIComponent(message);
    
    // Format WhatsApp : whatsapp://send?text=...
    // Si numéro fourni : whatsapp://send?phone=...&text=...
    let whatsappUrl;
    
    if (clientPhone) {
      // Nettoyer le numéro (enlever espaces, +, etc.)
      const cleanPhone = clientPhone.replace(/[\s\+\-\(\)]/g, '');
      // Ajouter l'indicatif si absent (France = 33)
      const phoneWithCountry = cleanPhone.startsWith('0') ? `33${cleanPhone.substring(1)}` : cleanPhone;
      whatsappUrl = `whatsapp://send?phone=${phoneWithCountry}&text=${encodedMessage}`;
    } else {
      whatsappUrl = `whatsapp://send?text=${encodedMessage}`;
    }
    
    // Vérifier si WhatsApp est installé
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (!canOpen) {
      // Essayer avec https://wa.me/ (version web)
      if (clientPhone) {
        const cleanPhone = clientPhone.replace(/[\s\+\-\(\)]/g, '');
        const phoneWithCountry = cleanPhone.startsWith('0') ? `33${cleanPhone.substring(1)}` : cleanPhone;
        whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodedMessage}`;
      } else {
        whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
      }
    }
    
    // Ouvrir WhatsApp avec le message
    await Linking.openURL(whatsappUrl);
    
    // Proposer le PDF via le menu de partage natif après un court délai
    // L'utilisateur pourra choisir WhatsApp dans le menu de partage
    setTimeout(async () => {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable && pdfUri) {
        try {
          await Sharing.shareAsync(pdfUri, {
            mimeType: 'application/pdf',
            dialogTitle: `Joindre ${document.type === 'devis' ? 'Devis' : 'Facture'} ${document.number} à votre message WhatsApp`,
          });
        } catch (shareError) {
          // Ignorer l'erreur si l'utilisateur annule le partage
          logger.info('ShareService', 'Partage PDF annulé ou échoué', shareError);
        }
      }
    }, 1500);
    
    logger.success('ShareService', 'WhatsApp ouvert');
    return true;
  } catch (error) {
    logger.error('ShareService', 'Erreur partage WhatsApp', error);
    throw error;
  }
}

/**
 * Partage par SMS
 */
export async function shareViaSMS(document, pdfUri, clientPhone) {
  try {
    const message = generateShareMessage(document);
    
    // Encoder le message pour l'URL SMS
    const encodedMessage = encodeURIComponent(message);
    
    // Format SMS : sms:?body=... ou sms:+33...?body=...
    let smsUrl;
    
    if (clientPhone) {
      const cleanPhone = clientPhone.replace(/[\s\+\-\(\)]/g, '');
      const phoneWithCountry = cleanPhone.startsWith('0') ? `+33${cleanPhone.substring(1)}` : `+${cleanPhone}`;
      smsUrl = `sms:${phoneWithCountry}?body=${encodedMessage}`;
    } else {
      smsUrl = `sms:?body=${encodedMessage}`;
    }
    
    const canOpen = await Linking.canOpenURL(smsUrl);
    if (canOpen) {
      await Linking.openURL(smsUrl);
      
      // Attendre un peu puis proposer le PDF
      setTimeout(async () => {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable && pdfUri) {
          await Sharing.shareAsync(pdfUri, {
            mimeType: 'application/pdf',
            dialogTitle: `Joindre ${document.type === 'devis' ? 'Devis' : 'Facture'} ${document.number}`,
          });
        }
      }, 500);
    } else {
      throw new Error('Impossible d\'ouvrir l\'application SMS');
    }
    
    logger.success('ShareService', 'SMS ouvert');
    return true;
  } catch (error) {
    logger.error('ShareService', 'Erreur partage SMS', error);
    throw error;
  }
}

/**
 * Partage générique (menu natif)
 */
export async function shareGeneric(pdfUri, document) {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: `${document.type === 'devis' ? 'Devis' : 'Facture'} ${document.number}`,
      });
      logger.success('ShareService', 'Partage générique réussi');
      return true;
    } else {
      throw new Error('Le partage n\'est pas disponible sur cet appareil');
    }
  } catch (error) {
    logger.error('ShareService', 'Erreur partage générique', error);
    throw error;
  }
}

/**
 * Télécharge le PDF en local si nécessaire
 */
export async function getLocalPdfUri(document) {
  try {
    // Si déjà un PDF local (généré à la volée)
    if (document.localUri) {
      return document.localUri;
    }
    
    // Si PDF dans Storage, le télécharger
    if (document.pdf_url) {
      const fileName = `${document.type}_${document.number}.pdf`;
      const localUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      logger.info('ShareService', 'Téléchargement PDF', { url: document.pdf_url, localUri });
      
      try {
        const downloadResult = await FileSystem.downloadAsync(document.pdf_url, localUri);
        
        if (downloadResult.status === 200) {
          return localUri;
        } else {
          logger.warn('ShareService', `Téléchargement échoué avec status ${downloadResult.status}`);
          return null; // Retourner null pour permettre le fallback
        }
      } catch (downloadError) {
        logger.warn('ShareService', 'Erreur téléchargement PDF, retour null pour fallback', {
          error: downloadError.message,
          pdf_url: document.pdf_url,
        });
        return null; // Retourner null pour permettre le fallback
      }
    }
    
    return null;
  } catch (error) {
    logger.error('ShareService', 'Erreur récupération PDF', error);
    return null; // Retourner null au lieu de lancer une exception pour permettre le fallback
  }
}

