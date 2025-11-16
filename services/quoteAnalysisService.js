// services/quoteAnalysisService.js
// Import conditionnel de la config OpenAI
let OPENAI_CONFIG = { apiKey: null, apiUrl: 'https://api.openai.com/v1', models: { whisper: 'whisper-1', gpt: 'gpt-4o-mini' } };
try {
  const openaiModule = require('../config/openai');
  OPENAI_CONFIG = openaiModule.OPENAI_CONFIG || OPENAI_CONFIG;
} catch (e) {
  // Config absente, utiliser valeurs par défaut
}

/**
 * Analyse une note vocale et détermine :
 * - Si c'est une prestation facturable
 * - Si c'est une info client
 * - Si c'est une note perso
 */
export const analyzeNote = async (noteText) => {
  try {
    console.log('[Analyse] Texte:', noteText);
    
    const response = await fetch(
      `${OPENAI_CONFIG.apiUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: OPENAI_CONFIG.models.gpt,
          messages: [
            {
              role: 'system',
              content: `Tu es un assistant IA pour artisans du bâtiment en France.
MISSION : Analyser une note vocale et déterminer son type.

TYPES POSSIBLES :
1. "prestation" : Travaux facturables (peinture, électricité, plomberie, etc.)
2. "client_info" : Préférences/détails du client (couleur, matériaux, style, etc.)
3. "note_perso" : Notes personnelles de l'artisan (RDV, rappels, outils, etc.)

POUR LES PRESTATIONS, EXTRAIRE :
- categorie : Type de travaux (Peinture, Électricité, Plomberie, Maçonnerie, Menuiserie, Carrelage, Plâtrerie, etc.)
- description : Description courte et claire
- quantite : Nombre/Surface (extraire uniquement si mentionné)
- unite : m², m, pièce, h, unité, ml, etc.
- details : Détails importants (nb couches, type matériau, etc.)

EXEMPLES :
Note: "Salon à repeindre, 20m², deux couches, peinture blanche mate"
→ Type: prestation
→ Données: {
  "categorie": "Peinture",
  "description": "Peinture salon",
  "quantite": 20,
  "unite": "m²",
  "details": "2 couches, blanc mat"
}

Note: "3 prises électriques à installer dans la cuisine"
→ Type: prestation
→ Données: {
  "categorie": "Électricité",
  "description": "Installation prises cuisine",
  "quantite": 3,
  "unite": "pièce",
  "details": "cuisine"
}

Note: "Le client préfère du parquet en chêne clair"
→ Type: client_info
→ Données: {
  "info": "Préfère parquet chêne clair"
}

Note: "RDV mardi prochain à 14h"
→ Type: note_perso
→ Données: {
  "note": "RDV mardi 14h"
}

Note: "J'ai oublié mon mètre laser"
→ Type: note_perso
→ Données: {
  "note": "Oublié mètre laser"
}

IMPORTANT :
- Retourne UNIQUEMENT un JSON valide
- Pas de texte avant ou après le JSON
- Si incertain sur la quantité, ne pas inventer, mettre null`
            },
            {
              role: 'user',
              content: noteText
            }
          ],
          temperature: 0.3,
          response_format: { type: "json_object" }
        })
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GPT API error: ${error.error?.message || response.status}`);
    }
    
    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    console.log('[Analyse] Résultat:', result);
    return result;
    
  } catch (error) {
    console.error('[Analyse] Erreur:', error);
    // En cas d'erreur, considérer comme note perso par défaut
    return {
      type: 'note_perso',
      note: noteText
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
