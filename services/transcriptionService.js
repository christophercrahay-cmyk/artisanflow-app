// services/transcriptionService.js
// Import conditionnel de la config OpenAI
let OPENAI_CONFIG = { apiKey: null, apiUrl: 'https://api.openai.com/v1', models: { whisper: 'whisper-1', gpt: 'gpt-4o-mini' } };
try {
  const openaiModule = require('../config/openai');
  OPENAI_CONFIG = openaiModule.OPENAI_CONFIG || OPENAI_CONFIG;
} catch (e) {
  // Config absente, utiliser valeurs par défaut
}

/**
 * Transcrit un audio avec Whisper API
 * @param {string} audioUri - Chemin vers le fichier audio M4A
 * @returns {Promise<string>} Texte transcrit
 */
export const transcribeAudio = async (audioUri) => {
  try {
    console.log('[Transcription] Début:', audioUri);
    
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'audio.m4a'
    });
    formData.append('model', OPENAI_CONFIG.models.whisper);
    formData.append('language', 'fr');
    formData.append('response_format', 'json');
    
    const response = await fetch(
      `${OPENAI_CONFIG.apiUrl}/audio/transcriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`,
        },
        body: formData
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Whisper API error: ${error.error?.message || response.status}`);
    }
    
    const data = await response.json();
    console.log('[Transcription] Succès:', data.text);
    
    return data.text;
    
  } catch (error) {
    console.error('[Transcription] Erreur:', error);
    throw error;
  }
};

/**
 * Corrige l'orthographe et la grammaire d'une transcription
 * @param {string} text - Texte brut de Whisper
 * @returns {Promise<string>} Texte corrigé
 */
export const correctNoteText = async (text) => {
  try {
    console.log('[Correction] Texte original:', text);
    
    // Si texte vide ou trop court, retourner tel quel
    if (!text || !text.trim() || text.trim().length < 3) {
      return text;
    }
    
    // Appel à GPT-4o-mini pour correction orthographique
    const response = await fetch(
      `${OPENAI_CONFIG.apiUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OPENAI_CONFIG.models.gpt, // 'gpt-4o-mini'
          messages: [
            {
              role: 'system',
              content: `Tu es un correcteur orthographique pour des notes vocales d'artisans du bâtiment.

RÈGLES STRICTES :
1. Corrige UNIQUEMENT l'orthographe, les accords et la ponctuation
2. NE CHANGE PAS le sens ni la formulation
3. NE REFORMULE PAS les phrases
4. Garde le style oral et naturel
5. Renvoie UNIQUEMENT le texte corrigé, sans explications ni commentaires

Exemples :
- "y faut changer 3 prise dan la cuissine" → "Il faut changer 3 prises dans la cuisine"
- "jai refait lelectricite du salon" → "J'ai refait l'électricité du salon"
- "8 prise 3 interrupteur" → "8 prises, 3 interrupteurs"
- "faut prevoir cable et gaine" → "Il faut prévoir câble et gaine"`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3, // Peu de créativité pour rester fidèle
          max_tokens: 500,
        })
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GPT API error: ${errorData.error?.message || response.status}`);
    }
    
    const data = await response.json();
    const correctedText = data.choices[0]?.message?.content?.trim() || text;
    
    console.log('[Correction] Texte corrigé:', correctedText);
    
    return correctedText;
    
  } catch (error) {
    console.error('[Correction] Erreur:', error);
    // ⚠️ En cas d'erreur, retourner le texte original (pas de blocage)
    console.warn('[Correction] Fallback vers texte original');
    return text;
  }
};

/**
 * Retranscrit un audio existant (si première tentative a échoué)
 */
export const retranscribeNote = async (noteId, audioUri) => {
  try {
    const text = await transcribeAudio(audioUri);
    // Mettre à jour la note dans la DB
    // await updateNoteTranscription(noteId, text);
    return text;
  } catch (error) {
    console.error('[Retranscription] Erreur:', error);
    throw error;
  }
};
