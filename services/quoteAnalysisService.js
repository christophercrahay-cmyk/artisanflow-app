// services/quoteAnalysisService.js
// ✅ SÉCURISÉ : Utilise Edge Functions Supabase au lieu d'appeler OpenAI directement

import { supabase } from '../supabaseClient';

/**
 * Analyse une note vocale et détermine :
 * - Si c'est une prestation facturable
 * - Si c'est une info client
 * - Si c'est une note perso
 * 
 * @param {string} noteText - Texte de la note à analyser
 * @returns {Promise<Object>} Résultat de l'analyse (type, categorie, description, etc.)
 */
export const analyzeNote = async (noteText) => {
  try {
    if (!noteText || typeof noteText !== 'string' || !noteText.trim()) {
      // Texte vide → note perso par défaut
      return {
        type: 'note_perso',
        note: noteText || '',
      };
    }

    console.log('[Analyse] Texte:', noteText.substring(0, 50) + '...');

    // Récupérer la session d'authentification
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.warn('[Analyse] Utilisateur non authentifié, retour type par défaut');
      return {
        type: 'note_perso',
        note: noteText,
      };
    }

    // Appel Edge Function
    const supabaseUrl = supabase.supabaseUrl;
    if (!supabaseUrl) {
      throw new Error('URL Supabase non disponible dans le client');
    }

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/analyze-note`;
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        noteText: noteText,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'ANALYZE_FAILED', message: response.statusText }));
      const errorMessage = errorData.message || errorData.error || `Erreur ${response.status}`;
      // En cas d'erreur, considérer comme note perso par défaut (pas de throw)
      console.warn(`[Analyse] Erreur Edge Function: ${errorMessage}`);
      return {
        type: 'note_perso',
        note: noteText || '',
      };
    }

    const result = await response.json();
    
    // S'assurer que le type est valide
    if (!result.type || !['prestation', 'client_info', 'note_perso'].includes(result.type)) {
      result.type = 'note_perso';
    }
    
    console.log('[Analyse] ✅ Résultat:', result.type);
    return result;
    
  } catch (error) {
    console.error('[Analyse] Erreur:', error);
    // En cas d'erreur, considérer comme note perso par défaut
    return {
      type: 'note_perso',
      note: noteText || '',
    };
  }
};

/**
 * Analyse toutes les notes d'un chantier et génère un devis structuré
 */
export const generateQuoteFromNotes = async (notes) => {
  try {
    const prestations = [];
    const clientInfos = [];
    const notesPerso = [];
    
    // Analyser chaque note
    for (const note of notes) {
      if (!note.texte) {continue;}
      
      const analysis = await analyzeNote(note.texte);
      
      if (analysis.type === 'prestation') {
        prestations.push({
          id: note.id,
          ...analysis,
          date: note.date
        });
      } else if (analysis.type === 'client_info') {
        clientInfos.push({
          id: note.id,
          info: analysis.info,
          date: note.date
        });
      } else {
        notesPerso.push({
          id: note.id,
          note: analysis.note,
          date: note.date
        });
      }
    }
    
    return {
      prestations,
      clientInfos,
      notesPerso
    };
    
  } catch (error) {
    console.error('[Génération devis] Erreur:', error);
    throw error;
  }
};
