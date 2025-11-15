// ============================================
// SERVICE : APPRENTISSAGE IA PERSONNALISÉ
// ============================================
// Ce service permet à l'IA d'apprendre automatiquement
// les prix moyens de chaque artisan à partir de ses devis.
// 
// Fonctionnement :
// 1. Après chaque création de devis, on analyse les lignes
// 2. On extrait les types de postes (prise, interrupteur, etc.)
// 3. On met à jour les moyennes de prix par type
// 4. Le profil IA s'enrichit au fil du temps
// 
// Résultat : Devis IA de plus en plus précis et personnalisés
// ============================================

import { supabase } from '../supabaseClient';

/**
 * Normalise une description de ligne de devis en clé simple
 * @param {string} description - Description de la ligne (ex: "Prise électrique encastrée")
 * @returns {string} Clé normalisée (ex: "prise_electrique")
 */
function normalizeKey(description) {
  if (!description || typeof description !== 'string') {
    return 'autre';
  }

  // Convertir en minuscules et supprimer les accents
  let normalized = description
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Détecter les mots-clés principaux
  const keywords = {
    // Électricité
    prise: 'prise_electrique',
    interrupteur: 'interrupteur',
    tableau: 'tableau_electrique',
    disjoncteur: 'disjoncteur',
    cable: 'cable',
    gaine: 'gaine',
    spot: 'spot',
    luminaire: 'luminaire',
    
    // Plomberie
    robinet: 'robinet',
    lavabo: 'lavabo',
    evier: 'evier',
    douche: 'douche',
    baignoire: 'baignoire',
    wc: 'wc',
    tuyau: 'tuyau',
    
    // Menuiserie
    porte: 'porte',
    fenetre: 'fenetre',
    placard: 'placard',
    parquet: 'parquet',
    
    // Peinture
    peinture: 'peinture',
    enduit: 'enduit',
    
    // Plâtrerie
    placo: 'placo',
    ba13: 'placo',
    plaque: 'placo',
    
    // Main d'œuvre
    'main d': 'main_oeuvre',
    'main-d': 'main_oeuvre',
    heure: 'main_oeuvre',
    jour: 'main_oeuvre',
    journee: 'main_oeuvre',
  };

  // Chercher le premier mot-clé trouvé
  for (const [keyword, key] of Object.entries(keywords)) {
    if (normalized.includes(keyword)) {
      return key;
    }
  }

  // Si aucun mot-clé trouvé, retourner "autre"
  return 'autre';
}

/**
 * Récupère ou crée le profil IA d'un utilisateur
 * @param {string} userId - UUID de l'utilisateur
 * @returns {Promise<Object>} Profil IA
 */
async function getOrCreateProfile(userId) {
  try {
    // Essayer de récupérer le profil existant
    const { data: profile, error: selectError } = await supabase
      .from('ai_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    // Si le profil existe, le retourner
    if (profile) {
      return profile;
    }

    // Sinon, créer un nouveau profil
    const { data: newProfile, error: insertError } = await supabase
      .from('ai_profiles')
      .insert({
        user_id: userId,
        avg_prices: {},
        experience_score: 0,
        total_devis: 0,
        total_lignes: 0,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log('[AILearning] ✅ Nouveau profil IA créé pour user:', userId);
    return newProfile;

  } catch (error) {
    console.error('[AILearning] Erreur getOrCreateProfile:', error);
    throw error;
  }
}

/**
 * Met à jour le profil IA d'un artisan après création d'un devis
 * @param {string} devisId - UUID du devis
 * @param {string} userId - UUID de l'utilisateur
 * @returns {Promise<void>}
 */
export async function updateAIProfileFromDevis(devisId, userId) {
  try {
    console.log('[AILearning] 🧠 Début apprentissage pour devis:', devisId);

    // 1. Récupérer les lignes du devis
    const { data: lignes, error: lignesError } = await supabase
      .from('devis_lignes')
      .select('*')
      .eq('devis_id', devisId);

    if (lignesError) {
      throw lignesError;
    }

    // Si aucune ligne, ne rien faire
    if (!lignes || lignes.length === 0) {
      console.log('[AILearning] ℹ️ Aucune ligne pour ce devis, apprentissage ignoré');
      return;
    }

    console.log(`[AILearning] 📊 ${lignes.length} lignes à analyser`);

    // 2. Récupérer ou créer le profil IA
    const profile = await getOrCreateProfile(userId);

    // 3. Mettre à jour les moyennes de prix
    const avgPrices = { ...(profile.avg_prices || {}) };

    lignes.forEach((ligne) => {
      // Normaliser la description en clé
      const key = normalizeKey(ligne.description);
      console.log(`[AILearning] 📝 "${ligne.description}" → clé: "${key}"`);

      const prixUnitaire = parseFloat(ligne.prix_unitaire) || 0;

      // Ignorer les prix à 0 ou négatifs
      if (prixUnitaire <= 0) {
        console.log(`[AILearning] ⚠️ Prix invalide ignoré: ${prixUnitaire}`);
        return;
      }

      // Si la clé n'existe pas, l'initialiser
      if (!avgPrices[key]) {
        avgPrices[key] = {
          avg: prixUnitaire,
          count: 1,
          min: prixUnitaire,
          max: prixUnitaire,
        };
      } else {
        // Sinon, mettre à jour la moyenne
        const current = avgPrices[key];
        const newCount = current.count + 1;
        const newAvg = (current.avg * current.count + prixUnitaire) / newCount;

        avgPrices[key] = {
          avg: newAvg,
          count: newCount,
          min: Math.min(current.min, prixUnitaire),
          max: Math.max(current.max, prixUnitaire),
        };
      }

      console.log(`[AILearning] ✅ "${key}" mis à jour:`, avgPrices[key]);
    });

    // 4. Calculer le nouveau score d'expérience
    const newTotalDevis = profile.total_devis + 1;
    const newTotalLignes = profile.total_lignes + lignes.length;
    const newExperienceScore = Math.min(100, newTotalDevis * 5); // 5 points par devis, max 100

    // 5. Mettre à jour le profil en base
    const { error: updateError } = await supabase
      .from('ai_profiles')
      .update({
        avg_prices: avgPrices,
        total_devis: newTotalDevis,
        total_lignes: newTotalLignes,
        experience_score: newExperienceScore,
        last_updated: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (updateError) {
      throw updateError;
    }

    console.log('[AILearning] ✅ Profil IA mis à jour:', {
      userId,
      totalDevis: newTotalDevis,
      totalLignes: newTotalLignes,
      experienceScore: newExperienceScore,
      prixAppris: Object.keys(avgPrices).length,
    });

  } catch (error) {
    // ⚠️ Ne pas faire planter l'app si l'apprentissage échoue
    console.error('[AILearning] ❌ Erreur apprentissage:', error);
    // On log l'erreur mais on ne la propage pas
  }
}

/**
 * Récupère le profil IA d'un utilisateur
 * @param {string} userId - UUID de l'utilisateur
 * @returns {Promise<Object|null>} Profil IA ou null si inexistant
 */
export async function getAIProfile(userId) {
  try {
    const { data: profile, error } = await supabase
      .from('ai_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return profile;
  } catch (error) {
    console.error('[AILearning] Erreur getAIProfile:', error);
    return null;
  }
}

/**
 * Récupère le prix moyen d'un type de poste pour un utilisateur
 * @param {string} userId - UUID de l'utilisateur
 * @param {string} description - Description du poste (ex: "Prise électrique")
 * @returns {Promise<number|null>} Prix moyen ou null si inexistant
 */
export async function getAveragePrice(userId, description) {
  try {
    const profile = await getAIProfile(userId);
    
    if (!profile || !profile.avg_prices) {
      return null;
    }

    const key = normalizeKey(description);
    const priceData = profile.avg_prices[key];

    if (!priceData || !priceData.avg) {
      return null;
    }

    return priceData.avg;
  } catch (error) {
    console.error('[AILearning] Erreur getAveragePrice:', error);
    return null;
  }
}

/**
 * Exporte la fonction normalizeKey pour tests
 * @param {string} description - Description à normaliser
 * @returns {string} Clé normalisée
 */
export { normalizeKey };

