/**
 * OpenAI Usage Tracker
 * Enregistre les tokens utilisés dans Supabase pour monitoring
 */

import { supabase } from '../supabaseClient';
import logger from './logger';

/**
 * Enregistre l'utilisation de Whisper
 * @param {string} userId - ID utilisateur
 * @param {number} audioDurationSeconds - Durée audio en secondes
 * @param {string} projectId - ID projet (optionnel)
 * @param {string} noteId - ID note (optionnel)
 */
export async function trackWhisperUsage(userId, audioDurationSeconds, projectId = null, noteId = null) {
  try {
    // Whisper facture à la minute (environ 150 tokens par minute d'audio)
    const estimatedTokens = Math.ceil(audioDurationSeconds / 60) * 150;
    
    // Coût : 0.006$ / minute = 0.6 centimes / minute
    const estimatedCostCents = Math.ceil(audioDurationSeconds / 60 * 0.6);

    const { error } = await supabase.from('openai_usage').insert([{
      user_id: userId,
      service: 'whisper',
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: estimatedTokens,
      estimated_cost_cents: estimatedCostCents,
      project_id: projectId,
      note_id: noteId,
      model_version: 'whisper-1',
      duration_ms: audioDurationSeconds * 1000,
    }]);

    if (error) {
      logger.error('OpenAITracker', 'Erreur tracking Whisper', error);
    } else {
      logger.info('OpenAITracker', `Whisper tracked: ${estimatedTokens} tokens, ${estimatedCostCents} centimes`);
    }
  } catch (err) {
    logger.error('OpenAITracker', 'Exception tracking Whisper', err);
  }
}

/**
 * Enregistre l'utilisation de GPT-4o-mini
 * @param {string} userId - ID utilisateur
 * @param {number} promptTokens - Tokens input
 * @param {number} completionTokens - Tokens output
 * @param {string} projectId - ID projet (optionnel)
 * @param {string} devisId - ID devis (optionnel)
 * @param {number} durationMs - Durée appel en ms
 */
export async function trackGPT4MiniUsage(userId, promptTokens, completionTokens, projectId = null, devisId = null, durationMs = null) {
  try {
    const totalTokens = promptTokens + completionTokens;
    
    // Coût GPT-4o-mini :
    // Input : 0.15$ / 1M tokens = 0.000015$ par token = 0.0015 centime
    // Output : 0.60$ / 1M tokens = 0.000060$ par token = 0.0060 centime
    const estimatedCostCents = Math.ceil(
      (promptTokens * 0.0015) + (completionTokens * 0.0060)
    );

    const { error } = await supabase.from('openai_usage').insert([{
      user_id: userId,
      service: 'gpt-4o-mini',
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens,
      estimated_cost_cents: estimatedCostCents,
      project_id: projectId,
      devis_id: devisId,
      model_version: 'gpt-4o-mini',
      duration_ms: durationMs,
    }]);

    if (error) {
      logger.error('OpenAITracker', 'Erreur tracking GPT-4o-mini', error);
    } else {
      logger.info('OpenAITracker', `GPT-4o-mini tracked: ${totalTokens} tokens, ${estimatedCostCents} centimes`);
    }
  } catch (err) {
    logger.error('OpenAITracker', 'Exception tracking GPT-4o-mini', err);
  }
}

/**
 * Récupère les stats d'utilisation du mois en cours
 * @param {string} userId - ID utilisateur
 * @returns {Promise<Object>} Stats mensuelles
 */
export async function getCurrentMonthUsage(userId) {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('openai_usage')
      .select('service, total_tokens, estimated_cost_cents')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    if (error) {
      throw error;
    }

    // Agréger par service
    const stats = {
      whisper: { calls: 0, tokens: 0, cost: 0 },
      'gpt-4o-mini': { calls: 0, tokens: 0, cost: 0 },
      total: { calls: 0, tokens: 0, cost: 0 },
    };

    (data || []).forEach(row => {
      if (stats[row.service]) {
        stats[row.service].calls += 1;
        stats[row.service].tokens += row.total_tokens || 0;
        stats[row.service].cost += row.estimated_cost_cents || 0;
      }
      stats.total.calls += 1;
      stats.total.tokens += row.total_tokens || 0;
      stats.total.cost += row.estimated_cost_cents || 0;
    });

    return stats;
  } catch (err) {
    logger.error('OpenAITracker', 'Erreur récupération stats', err);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur a dépassé le quota mensuel
 * @param {string} userId - ID utilisateur
 * @param {number} maxCostCents - Quota max en centimes (ex: 1000 = 10€)
 * @returns {Promise<boolean>} true si quota dépassé
 */
export async function hasExceededQuota(userId, maxCostCents = 1000) {
  try {
    const stats = await getCurrentMonthUsage(userId);
    if (!stats) return false;

    const exceeded = stats.total.cost >= maxCostCents;
    
    if (exceeded) {
      logger.warn('OpenAITracker', `Quota dépassé pour user ${userId}: ${stats.total.cost} centimes / ${maxCostCents}`);
    }

    return exceeded;
  } catch (err) {
    logger.error('OpenAITracker', 'Erreur vérification quota', err);
    return false;
  }
}

/**
 * Formate les stats pour affichage UI
 * @param {Object} stats - Stats depuis getCurrentMonthUsage()
 * @returns {string} Texte formaté
 */
export function formatUsageStats(stats) {
  if (!stats) return 'Stats indisponibles';

  const costEuros = (stats.total.cost / 100).toFixed(2);
  return `${stats.total.calls} appels • ${(stats.total.tokens / 1000).toFixed(1)}k tokens • ${costEuros}€`;
}


