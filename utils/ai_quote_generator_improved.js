// utils/ai_quote_generator.js - VERSION AMÉLIORÉE

import { supabase } from '../supabaseClient';

import { logDebug, logError } from './logger';



// Tarifs par défaut par catégorie (à personnaliser selon l'artisan)

const DEFAULT_RATES = {

  peinture: { rate: 35, unit: 'm²', label: 'Peinture murs et plafonds' },

  electricite: { rate: 65, unit: 'h', label: 'Travaux électriques' },

  plomberie: { rate: 70, unit: 'h', label: 'Travaux plomberie' },

  menuiserie: { rate: 45, unit: 'm²', label: 'Pose parquet/menuiserie' },

  carrelage: { rate: 55, unit: 'm²', label: 'Pose carrelage' },

  maconnerie: { rate: 80, unit: 'h', label: 'Travaux maçonnerie' },

  demolition: { rate: 40, unit: 'm³', label: 'Démolition' },

  divers: { rate: 50, unit: 'forfait', label: 'Travaux divers' }

};



/**

 * Génère un devis à partir d'une transcription analysée

 * @param {string} transcription - Texte transcrit de la note vocale

 * @param {string} projectId - ID du chantier

 * @param {string} clientId - ID du client

 * @param {Object} analysisData - Données de l'analyse GPT (optionnel)

 * @returns {Object|null} - Devis généré ou null si échec

 */

export async function generateQuoteFromTranscription(transcription, projectId, clientId, analysisData = null) {

  logDebug('[QuoteGenerator] Début génération devis');

  logDebug('[QuoteGenerator] Transcription:', transcription);

  logDebug('[QuoteGenerator] Analysis data:', analysisData);



  try {

    // Si on n'a pas de données d'analyse, on essaie de parser la transcription directement

    let prestationData = analysisData;

    

    if (!prestationData || !prestationData.categorie) {

      logDebug('[QuoteGenerator] Pas de donnees d\'analyse, parsing direct de la transcription');

      prestationData = parseTranscriptionFallback(transcription);

    }



    // Validation des données minimum requises

    if (!prestationData.description) {

      logError('[QuoteGenerator] Description manquante');

      return null;

    }



    // Normaliser la catégorie pour correspondre aux tarifs

    const categorieNormalized = normalizeCategory(prestationData.categorie);

    const rateInfo = DEFAULT_RATES[categorieNormalized] || DEFAULT_RATES.divers;



    // Calculer le prix

    const quantity = prestationData.quantite || 1;

    const pricePerUnit = rateInfo.rate;

    const totalHT = quantity * pricePerUnit;

    const tva = totalHT * 0.20; // TVA 20%

    const totalTTC = totalHT + tva;



    // Créer la structure du devis

    const quote = {

      client_id: clientId,

      project_id: projectId,

      numero: generateQuoteNumber(),

      date: new Date().toISOString().split('T')[0],

      services: [

        {

          description: prestationData.description,

          categorie: prestationData.categorie || categorieNormalized,

          quantite: quantity,

          unite: prestationData.unite || rateInfo.unit,

          prix_unitaire: pricePerUnit,

          total: totalHT,

          details: prestationData.details || ''

        }

      ],

      total_ht: totalHT,

      tva: tva,

      total_ttc: totalTTC,

      status: 'brouillon',

      notes: `Devis généré automatiquement depuis note vocale: "${transcription.substring(0, 100)}..."`,

      created_from_voice: true,

      voice_transcription: transcription

    };



    logDebug('[QuoteGenerator] Devis préparé:', quote);



    // Récupérer l'utilisateur connecté pour RLS
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logError('[QuoteGenerator] Utilisateur non authentifié');
      throw new Error('Utilisateur non authentifié');
    }

    // Ajouter user_id pour RLS
    quote.user_id = user.id;

    // Sauvegarder en base de données

    const { data, error } = await supabase

      .from('devis')

      .insert([quote])

      .select()

      .single();



    if (error) {

      logError('[QuoteGenerator] Erreur sauvegarde devis:', error);

      throw error;

    }



    logDebug('[QuoteGenerator] ✅ Devis sauvegardé avec succès:', data.id);

    return data;



  } catch (error) {

    logError('[QuoteGenerator] Erreur génération devis:', error);

    return null;

  }

}



/**

 * Parsing de secours si l'analyse GPT n'est pas disponible

 */

function parseTranscriptionFallback(transcription) {

  const text = transcription.toLowerCase();

  

  // Détecter la catégorie par mots-clés

  let categorie = 'divers';

  if (text.includes('pein') || text.includes('enduit')) {categorie = 'peinture';}

  else if (text.includes('électr') || text.includes('prise') || text.includes('câbl')) {categorie = 'electricite';}

  else if (text.includes('plomb') || text.includes('tuyau') || text.includes('robinet')) {categorie = 'plomberie';}

  else if (text.includes('parquet') || text.includes('menuise')) {categorie = 'menuiserie';}

  else if (text.includes('carrel')) {categorie = 'carrelage';}

  

  // Extraire les quantités (recherche de nombres)

  const quantityMatch = text.match(/(\d+(?:[,\.]\d+)?)\s*(m²|m2|mètre|metre|heure|h|pièce|piece|unité|unite)/i);

  let quantite = 1;

  let unite = 'forfait';

  

  if (quantityMatch) {

    quantite = parseFloat(quantityMatch[1].replace(',', '.'));

    unite = normalizeUnit(quantityMatch[2]);

  }



  // Extraire une description (premiers 100 caractères nettoyés)

  const description = transcription

    .replace(/[.,!?]/g, '')

    .trim()

    .substring(0, 100);



  return {

    categorie,

    description,

    quantite,

    unite,

    details: transcription

  };

}



/**

 * Normalise la catégorie pour correspondre aux clés de DEFAULT_RATES

 */

function normalizeCategory(category) {

  if (!category) {return 'divers';}

  

  const normalized = category.toLowerCase()

    .replace(/é/g, 'e')

    .replace(/è/g, 'e')

    .replace(/ç/g, 'c')

    .replace(/à/g, 'a')

    .replace(/\s+/g, '');

  

  // Mapping des variations possibles

  const categoryMap = {

    'peinture': 'peinture',

    'electricite': 'electricite',

    'electrique': 'electricite',

    'plomberie': 'plomberie',

    'plombier': 'plomberie',

    'menuiserie': 'menuiserie',

    'parquet': 'menuiserie',

    'carrelage': 'carrelage',

    'carreleur': 'carrelage',

    'maconnerie': 'maconnerie',

    'macon': 'maconnerie',

    'demolition': 'demolition'

  };



  // Chercher une correspondance

  for (const [key, value] of Object.entries(categoryMap)) {

    if (normalized.includes(key)) {

      return value;

    }

  }



  return 'divers';

}



/**

 * Normalise les unités

 */

function normalizeUnit(unit) {

  if (!unit) {return 'forfait';}

  

  const unitLower = unit.toLowerCase();

  

  if (unitLower.includes('m²') || unitLower.includes('m2') || unitLower.includes('metre carre')) {

    return 'm²';

  }

  if (unitLower.includes('mètre') || unitLower.includes('metre') || unitLower === 'm') {

    return 'm';

  }

  if (unitLower.includes('heure') || unitLower === 'h') {

    return 'h';

  }

  if (unitLower.includes('pièce') || unitLower.includes('piece')) {

    return 'pièce';

  }

  if (unitLower.includes('unité') || unitLower.includes('unite')) {

    return 'unité';

  }

  

  return unit;

}



/**

 * Génère un numéro de devis unique

 */

function generateQuoteNumber() {

  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, '0');

  const day = String(date.getDate()).padStart(2, '0');

  const random = Math.floor(Math.random() * 1000);

  

  return `DEV-${year}${month}${day}-${String(random).padStart(3, '0')}`;

}



/**

 * Fonction helper pour insérer rapidement un devis auto

 */

export async function insertAutoQuote(transcription, projectId, clientId) {

  logDebug('[QuoteGenerator] insertAutoQuote appelé');

  

  // Analyse rapide de la transcription

  const analysisData = parseTranscriptionFallback(transcription);

  

  // Générer le devis

  return await generateQuoteFromTranscription(

    transcription,

    projectId,

    clientId,

    analysisData

  );

}



export default {

  generateQuoteFromTranscription,

  insertAutoQuote,

  parseTranscriptionFallback,

  DEFAULT_RATES

};
