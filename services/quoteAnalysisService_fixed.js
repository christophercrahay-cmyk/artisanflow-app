// services/quoteAnalysisService.js - VERSION CORRIGÉE

import { OPENAI_CONFIG } from '../config/openai.js';

import { logDebug, logError } from '../utils/logger.js';



const SYSTEM_PROMPT = `Tu es un assistant spécialisé dans l'analyse de notes vocales d'artisans du bâtiment.



MISSION PRINCIPALE : Analyser la transcription et détecter PRÉCISÉMENT le type de contenu.



TYPES DE NOTES (un seul type par analyse) :

1. "prestation" : Toute mention de travaux à réaliser, services, interventions techniques

2. "client_info" : Préférences, goûts, contraintes du client  

3. "note_perso" : Notes personnelles, rappels, mémos de l'artisan



RÈGLES CRITIQUES :

- Si la note mentionne des TRAVAUX, SERVICES ou INTERVENTIONS → type: "prestation"

- Mots-clés prestation : repeindre, installer, poser, remplacer, refaire, changer, réparer, m², mètres, heures, pièces

- Extraire TOUJOURS pour les prestations : categorie, description, quantite, unite, details



FORMAT DE RÉPONSE OBLIGATOIRE (JSON strict) :

{

  "type": "prestation" | "client_info" | "note_perso",

  "data": {

    "categorie": "string (ex: peinture, électricité, plomberie)",

    "description": "string courte et claire",

    "quantite": number | null,

    "unite": "string (m², m, h, pièce, unité)" | null,

    "details": "string avec détails importants" | null

  },

  "confidence": 0-1,

  "summary": "résumé en une phrase"

}`;



export async function analyzeTranscription(transcription) {

  logDebug('[Analyse] Début analyse GPT de la transcription');

  logDebug('[Analyse] Transcription reçue:', transcription);



  try {

    const response = await fetch(`${OPENAI_CONFIG.apiUrl}/chat/completions`, {

      method: 'POST',

      headers: {

        'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`,

        'Content-Type': 'application/json',

      },

      body: JSON.stringify({

        model: OPENAI_CONFIG.models.gpt || 'gpt-4o-mini',

        messages: [

          {

            role: 'system',

            content: SYSTEM_PROMPT

          },

          {

            role: 'user',

            content: `Analyse cette transcription et retourne UNIQUEMENT un JSON valide :

            

"${transcription}"



IMPORTANT : Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`

          }

        ],

        temperature: 0.3, // Basse température pour plus de cohérence

        max_tokens: 500,

        response_format: { type: "json_object" } // Force le format JSON

      }),

    });



    if (!response.ok) {

      const errorData = await response.text();

      throw new Error(`Erreur API OpenAI: ${response.status} - ${errorData}`);

    }



    const data = await response.json();

    logDebug('[Analyse] Réponse OpenAI brute:', JSON.stringify(data, null, 2));



    if (!data.choices?.[0]?.message?.content) {

      throw new Error('Réponse OpenAI vide ou invalide');

    }



    // Parse le JSON de la réponse

    let analysisResult;

    try {

      analysisResult = JSON.parse(data.choices[0].message.content);

      logDebug('[Analyse] JSON parsé avec succès:', analysisResult);

    } catch (parseError) {

      logError('[Analyse] Erreur parsing JSON:', parseError);

      logError('[Analyse] Contenu reçu:', data.choices[0].message.content);

      

      // Fallback : essayer d'extraire le JSON s'il est entouré de texte

      const jsonMatch = data.choices[0].message.content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {

        analysisResult = JSON.parse(jsonMatch[0]);

        logDebug('[Analyse] JSON extrait après nettoyage:', analysisResult);

      } else {

        throw new Error('Impossible de parser la réponse GPT en JSON');

      }

    }



    // Validation de la structure

    if (!analysisResult.type || !['prestation', 'client_info', 'note_perso'].includes(analysisResult.type)) {

      logError('[Analyse] Type invalide ou manquant:', analysisResult.type);

      throw new Error('Type de note invalide dans la réponse GPT');

    }



    // Si c'est une prestation, vérifier qu'on a les données nécessaires

    if (analysisResult.type === 'prestation') {

      if (!analysisResult.data?.description) {

        logError('[Analyse] Prestation sans description:', analysisResult);

        analysisResult.data = analysisResult.data || {};

        analysisResult.data.description = transcription.substring(0, 100);

      }

      

      logDebug('[Analyse] ✅ PRESTATION DÉTECTÉE:', {

        categorie: analysisResult.data.categorie,

        description: analysisResult.data.description,

        quantite: analysisResult.data.quantite,

        unite: analysisResult.data.unite

      });

    }



    return analysisResult;



  } catch (error) {

    logError('[Analyse] Erreur complète:', error);

    

    // Retour d'un objet par défaut en cas d'erreur

    return {

      type: 'note_perso',

      data: {

        description: transcription,

        details: `Erreur analyse: ${error.message}`

      },

      confidence: 0,

      summary: 'Note non analysée (erreur)',

      error: true

    };

  }

}



// Fonction helper pour tester rapidement l'analyse

export async function testAnalysis() {

  const testCases = [

    "Salon à repeindre, environ 20 mètres carrés",

    "Le client préfère du parquet chêne clair",

    "Ne pas oublier RDV mardi 14h",

    "Installation de 3 prises électriques dans la cuisine",

    "Refaire la salle de bain complète, carrelage et plomberie"

  ];



  console.log('🧪 Test de détection des prestations:\n');

  

  for (const test of testCases) {

    console.log(`📝 "${test}"`);

    const result = await analyzeTranscription(test);

    console.log(`   → Type: ${result.type} ${result.type === 'prestation' ? '✅' : '❌'}`);

    if (result.type === 'prestation') {

      console.log(`   → Catégorie: ${result.data.categorie}`);

      console.log(`   → Quantité: ${result.data.quantite} ${result.data.unite || ''}\n`);

    }

    console.log('---');

  }

}
