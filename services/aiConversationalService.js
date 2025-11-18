// ============================================
// SERVICE : IA CONVERSATIONNELLE DEVIS
// ============================================
// Gère les appels à l'Edge Function Supabase
// pour la génération de devis IA avec Q/R
// ============================================

import { supabase } from '../supabaseClient';

// ✅ SÉCURISÉ : URL construite depuis le client Supabase
const getEdgeFunctionUrl = () => {
  const supabaseUrl = supabase.supabaseUrl;
  if (!supabaseUrl) {
    throw new Error('URL Supabase non disponible dans le client');
  }
  return `${supabaseUrl}/functions/v1/ai-devis-conversational`;
};

/**
 * Démarrer une nouvelle session de devis IA
 * @param {string} transcription - Transcription de la note vocale (optionnel si notes fourni)
 * @param {Array} notes - Tableau de notes du chantier (optionnel si transcription fournie)
 * @param {string} projectId - ID du projet
 * @param {string} clientId - ID du client
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} - { status, devis, questions, session_id, tour_count }
 */
export async function startDevisSession(transcription, projectId, clientId, userId, notes = null) {
  try {
    console.log('🚀 Démarrage session IA conversationnelle...');

    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await fetch(getEdgeFunctionUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        action: 'start',
        transcription,
        notes,
        project_id: projectId,
        client_id: clientId,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors du démarrage de la session');
    }

    const result = await response.json();
    console.log('✅ Session démarrée:', result.session_id);
    console.log(`📊 Status: ${result.status}, Questions: ${result.questions.length}`);

    return result;
  } catch (error) {
    console.error('❌ Erreur startDevisSession:', error);
    throw error;
  }
}

/**
 * Répondre aux questions de l'IA
 * @param {string} sessionId - ID de la session
 * @param {string[]} reponses - Réponses de l'artisan aux questions
 * @returns {Promise<Object>} - { status, devis, questions, session_id, tour_count }
 */
export async function answerQuestions(sessionId, reponses) {
  try {
    console.log('💬 Envoi des réponses pour session:', sessionId);

    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await fetch(getEdgeFunctionUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        action: 'answer',
        session_id: sessionId,
        reponses,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de l\'envoi des réponses');
    }

    const result = await response.json();
    console.log(`✅ Réponses traitées - Tour ${result.tour_count}`);
    console.log(`📊 Status: ${result.status}, Questions: ${result.questions.length}`);

    return result;
  } catch (error) {
    console.error('❌ Erreur answerQuestions:', error);
    throw error;
  }
}

/**
 * Finaliser le devis (forcer le statut "ready")
 * @param {string} sessionId - ID de la session
 * @returns {Promise<Object>} - { status, devis, questions, session_id, tour_count }
 */
export async function finalizeDevis(sessionId) {
  try {
    console.log('✅ Finalisation du devis pour session:', sessionId);

    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await fetch(getEdgeFunctionUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        action: 'finalize',
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la finalisation');
    }

    const result = await response.json();
    console.log('✅ Devis finalisé');

    return result;
  } catch (error) {
    console.error('❌ Erreur finalizeDevis:', error);
    throw error;
  }
}

/**
 * Créer un devis définitif dans la BDD à partir du devis IA validé
 * @param {string} sessionId - ID de la session
 * @param {Object} devisData - Données du devis IA
 * @param {string} projectId - ID du projet
 * @param {string} clientId - ID du client
 * @returns {Promise<Object>} - Devis créé
 */
export async function createDevisFromAI(sessionId, devisData, projectId, clientId) {
  try {
    console.log('💾 Création du devis définitif...');

    // Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Générer le numéro de devis (unique par utilisateur)
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const numero = `DE-${year}-${random}`;

    // Créer le devis principal
    const { data: devis, error: devisError } = await supabase
      .from('devis')
      .insert({
        project_id: projectId,
        client_id: clientId,
        user_id: user.id, // ✅ Nécessaire pour RLS
        numero,
        montant_ht: devisData.total_ht,
        tva_percent: devisData.tva_pourcent,
        montant_ttc: devisData.total_ttc,
        statut: 'edition',
        notes: devisData.description,
        transcription: `Généré par IA - Session: ${sessionId}`,
      })
      .select()
      .single();

    if (devisError) {
      throw new Error(`Erreur création devis: ${devisError.message}`);
    }

    console.log('✅ Devis créé:', devis.numero);

    // Créer les lignes de devis
    if (devisData.lignes && devisData.lignes.length > 0) {
      const lignes = devisData.lignes.map((ligne, index) => ({
        devis_id: devis.id,
        description: ligne.description,
        quantite: ligne.quantite,
        unite: ligne.unite,
        prix_unitaire: ligne.prix_unitaire,
        prix_total: ligne.prix_total,
        ordre: index + 1,
      }));

      const { error: lignesError } = await supabase
        .from('devis_lignes')
        .insert(lignes);

      if (lignesError) {
        console.error('⚠️ Erreur création lignes:', lignesError.message);
        // On continue quand même (le devis principal est créé)
      } else {
        console.log(`✅ ${lignes.length} lignes créées`);
      }
    }

    // Marquer la session comme validée
    await supabase
      .from('devis_ai_sessions')
      .update({ status: 'validated' })
      .eq('id', sessionId);

    // 🧠 Apprentissage IA : mettre à jour le profil de l'artisan
    try {
      const { updateAIProfileFromDevis } = require('./aiLearningService');
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        await updateAIProfileFromDevis(devis.id, user.id);
        console.log('✅ Profil IA mis à jour');
      }
    } catch (learningError) {
      // Ne pas bloquer la création du devis si l'apprentissage échoue
      console.warn('[AILearning] Erreur apprentissage (non bloquant):', learningError);
    }

    return devis;
  } catch (error) {
    console.error('❌ Erreur createDevisFromAI:', error);
    throw error;
  }
}

/**
 * Démarrer une nouvelle session de facture IA
 * @param {string} transcription - Transcription de la note vocale (optionnel si notes fourni)
 * @param {Array} notes - Tableau de notes du chantier (optionnel si transcription fournie)
 * @param {string} projectId - ID du projet
 * @param {string} clientId - ID du client
 * @param {string} userId - ID de l'utilisateur
 * @param {string} devisId - ID du devis lié (optionnel)
 * @returns {Promise<Object>} - { status, facture, questions, session_id, tour_count }
 */
export async function startFactureSession(transcription, projectId, clientId, userId, notes = null, devisId = null) {
  try {
    console.log('🚀 Démarrage session IA facture...');

    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      throw new Error('Utilisateur non authentifié');
    }

    // Utiliser la même Edge Function mais avec type=facture
    const response = await fetch(getEdgeFunctionUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        action: 'start',
        type: 'facture', // Différencier facture de devis
        transcription,
        notes,
        project_id: projectId,
        client_id: clientId,
        user_id: userId,
        devis_id: devisId, // Lien avec devis si disponible
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors du démarrage de la session facture');
    }

    const result = await response.json();
    console.log('✅ Session facture démarrée:', result.session_id);
    console.log(`📊 Status: ${result.status}, Questions: ${result.questions?.length || 0}`);

    return result;
  } catch (error) {
    console.error('❌ Erreur startFactureSession:', error);
    throw error;
  }
}

/**
 * Créer une facture définitif dans la BDD à partir de la facture IA validée
 * @param {string} sessionId - ID de la session
 * @param {Object} factureData - Données de la facture IA
 * @param {string} projectId - ID du projet
 * @param {string} clientId - ID du client
 * @param {string} devisId - ID du devis lié (optionnel)
 * @returns {Promise<Object>} - Facture créée
 */
export async function createFactureFromAI(sessionId, factureData, projectId, clientId, devisId = null) {
  try {
    console.log('💾 Création de la facture définitive...');

    // Récupérer l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Récupérer les paramètres entreprise pour le préfixe facture
    const { data: settings } = await supabase
      .from('brand_settings')
      .select('facture_prefix')
      .eq('user_id', user.id)
      .maybeSingle();

    const prefix = settings?.facture_prefix || 'FA';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const numero = `${prefix}-${year}-${random}`;

    // Créer la facture principale
    const { data: facture, error: factureError } = await supabase
      .from('factures')
      .insert({
        project_id: projectId,
        client_id: clientId,
        devis_id: devisId, // Lien avec devis si disponible
        user_id: user.id, // ✅ Nécessaire pour RLS
        numero,
        montant_ht: factureData.total_ht,
        tva_percent: factureData.tva_pourcent,
        montant_ttc: factureData.total_ttc,
        statut: 'edition',
        notes: factureData.description,
        transcription: `Générée par IA - Session: ${sessionId}`,
      })
      .select()
      .single();

    if (factureError) {
      throw new Error(`Erreur création facture: ${factureError.message}`);
    }

    console.log('✅ Facture créée:', facture.numero);

    // Note: Les lignes de facture ne sont pas encore implémentées dans le schéma
    // La facture est créée avec les totaux calculés
    // Les lignes détaillées pourront être ajoutées plus tard si nécessaire

    // Marquer la session comme validée (utiliser la même table devis_ai_sessions ou créer facture_ai_sessions)
    // Pour l'instant, on utilise devis_ai_sessions avec un type
    await supabase
      .from('devis_ai_sessions')
      .update({ status: 'validated', type: 'facture' })
      .eq('id', sessionId);

    // 🧠 Apprentissage IA : mettre à jour le profil de l'artisan (même logique que devis)
    try {
      const { updateAIProfileFromDevis } = require('./aiLearningService');
      if (user?.id) {
        // Utiliser la même fonction d'apprentissage (les prix sont similaires)
        await updateAIProfileFromDevis(facture.id, user.id);
        console.log('✅ Profil IA mis à jour');
      }
    } catch (learningError) {
      // Ne pas bloquer la création de la facture si l'apprentissage échoue
      console.warn('[AILearning] Erreur apprentissage (non bloquant):', learningError);
    }

    return facture;
  } catch (error) {
    console.error('❌ Erreur createFactureFromAI:', error);
    throw error;
  }
}

