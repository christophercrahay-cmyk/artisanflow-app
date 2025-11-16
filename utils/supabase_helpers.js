// utils/supabase_helpers.js
// Fonctions helper pour les opérations Supabase

import { supabase } from '../supabaseClient';
import { generateQuoteNumber } from './ai_quote_generator';

/**
 * Insère un devis automatique dans Supabase
 * @param {string} projectId - UUID du chantier
 * @param {string} clientId - UUID du client
 * @param {Array} services - Tableau de prestations
 * @param {Object} totals - { totalHT, tva, totalTTC }
 * @param {string} transcription - Le texte source (optionnel)
 * @param {number} tvaPercent - Pourcentage de TVA
 * @returns {Promise<Object|null>} Le devis créé ou null en cas d'erreur
 */
export async function insertAutoQuote(projectId, clientId, services, totals, transcription = null, tvaPercent = 20) {
  try {
    // Validation des paramètres
    if (!totals || typeof totals !== 'object') {
      console.error('[insertAutoQuote] Totals invalide:', totals);
      throw new Error('Totals manquant ou invalide');
    }
    
    if (!totals.totalHT || !totals.totalTTC) {
      console.error('[insertAutoQuote] Totals incomplet:', totals);
      throw new Error('Totals incomplet (totalHT ou totalTTC manquant)');
    }
    
    // Récupérer l'utilisateur connecté pour RLS
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {throw new Error('Utilisateur non authentifié');}
    
    const numero = generateQuoteNumber();

    // Date de validité par défaut : 30 jours
    const dateValidite = new Date();
    dateValidite.setDate(dateValidite.getDate() + 30);

    const devisData = {
      project_id: projectId,
      client_id: clientId,
      user_id: user.id, // Nécessaire pour RLS
      numero,
      date_validite: dateValidite.toISOString().split('T')[0], // Format YYYY-MM-DD
      montant_ht: totals.totalHT,
      tva_percent: tvaPercent,
      montant_ttc: totals.totalTTC,
      statut: 'brouillon',
      notes: `Devis généré automatiquement à partir de la note vocale. ${services.length} prestation(s) détectée(s).`,
      transcription: transcription || null,
    };
    
    console.log('[insertAutoQuote] Données à insérer:', devisData);

    const { data, error } = await supabase.from('devis').insert([devisData]).select();

    if (error) {
      console.error('[insertAutoQuote] Erreur Supabase:', error);
      throw error;
    }

    console.log('[insertAutoQuote] Devis créé:', data[0]);
    return data[0];
  } catch (err) {
    console.error('[insertAutoQuote] Exception:', err);
    return null;
  }
}

/**
 * Met à jour un devis existant
 * @param {string} devisId - UUID du devis
 * @param {Object} updates - Champs à mettre à jour
 * @returns {Promise<Object|null>} Le devis mis à jour ou null en cas d'erreur
 */
export async function updateQuote(devisId, updates) {
  try {
    const { data, error } = await supabase
      .from('devis')
      .update(updates)
      .eq('id', devisId)
      .select();

    if (error) {
      console.error('[updateQuote] Erreur Supabase:', error);
      throw error;
    }

    return data[0];
  } catch (err) {
    console.error('[updateQuote] Exception:', err);
    return null;
  }
}

/**
 * Supprime un devis
 * @param {string} devisId - UUID du devis
 * @returns {Promise<boolean>} true si supprimé, false en cas d'erreur
 */
export async function deleteQuote(devisId) {
  try {
    const { error } = await supabase.from('devis').delete().eq('id', devisId);

    if (error) {
      console.error('[deleteQuote] Erreur Supabase:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('[deleteQuote] Exception:', err);
    return false;
  }
}

