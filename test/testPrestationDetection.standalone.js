// test/testPrestationDetection.standalone.js
// Version standalone qui peut être exécutée avec Node.js (mock des dépendances React Native)
// Usage: node --experimental-modules test/testPrestationDetection.standalone.js

// Import du service d'analyse (avec mock du logger)
import { OPENAI_CONFIG } from '../config/openai.js';

// Copier la logique de analyzeTranscription ici pour éviter les imports problématiques
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

async function analyzeTranscription(transcription) {
  console.log('[Analyse] Début analyse GPT de la transcription');
  console.log('[Analyse] Transcription reçue:', transcription);

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
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erreur API OpenAI: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('[Analyse] Réponse OpenAI brute:', JSON.stringify(data, null, 2));

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Réponse OpenAI vide ou invalide');
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(data.choices[0].message.content);
      console.log('[Analyse] JSON parsé avec succès:', analysisResult);
    } catch (parseError) {
      console.error('[Analyse] Erreur parsing JSON:', parseError);
      console.error('[Analyse] Contenu reçu:', data.choices[0].message.content);
      
      const jsonMatch = data.choices[0].message.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
        console.log('[Analyse] JSON extrait après nettoyage:', analysisResult);
      } else {
        throw new Error('Impossible de parser la réponse GPT en JSON');
      }
    }

    if (!analysisResult.type || !['prestation', 'client_info', 'note_perso'].includes(analysisResult.type)) {
      console.error('[Analyse] Type invalide ou manquant:', analysisResult.type);
      throw new Error('Type de note invalide dans la réponse GPT');
    }

    if (analysisResult.type === 'prestation') {
      if (!analysisResult.data?.description) {
        console.error('[Analyse] Prestation sans description:', analysisResult);
        analysisResult.data = analysisResult.data || {};
        analysisResult.data.description = transcription.substring(0, 100);
      }
      
      console.log('[Analyse] ✅ PRESTATION DÉTECTÉE:', {
        categorie: analysisResult.data.categorie,
        description: analysisResult.data.description,
        quantite: analysisResult.data.quantite,
        unite: analysisResult.data.unite
      });
    }

    return analysisResult;

  } catch (error) {
    console.error('[Analyse] Erreur complète:', error);
    
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

// Cas de test
const testCases = [
  {
    input: "Il faut repeindre le salon qui fait 20 mètres carrés",
    expectedType: "prestation",
    expectedCategory: "peinture",
    shouldGenerateQuote: true
  },
  {
    input: "Installation de trois prises électriques dans la cuisine avec câblage encastré",
    expectedType: "prestation", 
    expectedCategory: "électricité",
    shouldGenerateQuote: true
  },
  {
    input: "Refaire complètement la salle de bain, carrelage sol et mur plus changement baignoire",
    expectedType: "prestation",
    expectedCategory: "plomberie",
    shouldGenerateQuote: true
  },
  {
    input: "Le client préfère les tons clairs et le parquet en chêne",
    expectedType: "client_info",
    expectedCategory: null,
    shouldGenerateQuote: false
  },
  {
    input: "Rappel: acheter les vis et chevilles pour demain",
    expectedType: "note_perso",
    expectedCategory: null,
    shouldGenerateQuote: false
  },
  {
    input: "Poser du parquet flottant dans les chambres, environ 35 m²",
    expectedType: "prestation",
    expectedCategory: "menuiserie",
    shouldGenerateQuote: true
  },
  {
    input: "Madame Dupont n'aime pas le carrelage blanc",
    expectedType: "client_info",
    expectedCategory: null,
    shouldGenerateQuote: false
  },
  {
    input: "Remplacer le chauffe-eau défectueux par un modèle 200 litres",
    expectedType: "prestation",
    expectedCategory: "plomberie",
    shouldGenerateQuote: true
  }
];

async function runTests() {
  console.log('🧪 TESTS DE DÉTECTION DES PRESTATIONS\n');
  console.log('='.repeat(60));
  
  let successCount = 0;
  let failCount = 0;
  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📝 Test ${i + 1}/${testCases.length}`);
    console.log(`Input: "${testCase.input}"`);
    console.log(`Expected: ${testCase.expectedType}`);
    
    try {
      const result = await analyzeTranscription(testCase.input);
      
      const typeMatch = result.type === testCase.expectedType;
      const categoryMatch = testCase.expectedCategory === null || 
                           result.data?.categorie?.toLowerCase().includes(testCase.expectedCategory);
      
      const success = typeMatch && (testCase.expectedType !== 'prestation' || categoryMatch);
      
      if (success) {
        console.log(`✅ SUCCÈS`);
        successCount++;
      } else {
        console.log(`❌ ÉCHEC`);
        console.log(`   Got type: ${result.type}`);
        console.log(`   Got category: ${result.data?.categorie}`);
        failCount++;
      }
      
      if (result.type === 'prestation') {
        console.log(`   📊 Détails prestation:`);
        console.log(`      - Catégorie: ${result.data?.categorie}`);
        console.log(`      - Description: ${result.data?.description}`);
        console.log(`      - Quantité: ${result.data?.quantite} ${result.data?.unite || ''}`);
        console.log(`      - Devis auto: ${testCase.shouldGenerateQuote ? 'OUI' : 'NON'}`);
      }
      
      results.push({
        ...testCase,
        result,
        success
      });
      
    } catch (error) {
      console.log(`❌ ERREUR: ${error.message}`);
      failCount++;
      results.push({
        ...testCase,
        error: error.message,
        success: false
      });
    }
    
    console.log('-'.repeat(60));
  }
  
  // Résumé
  console.log(`\n${  '='.repeat(60)}`);
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(60));
  console.log(`✅ Réussis: ${successCount}/${testCases.length}`);
  console.log(`❌ Échoués: ${failCount}/${testCases.length}`);
  console.log(`📈 Taux de réussite: ${Math.round(successCount / testCases.length * 100)}%`);
  
  if (failCount > 0) {
    console.log('\n⚠️ TESTS ÉCHOUÉS À RÉVISER:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`- "${r.input}"`);
      if (r.error) {
        console.log(`  Erreur: ${r.error}`);
      } else {
        console.log(`  Attendu: ${r.expectedType}, Reçu: ${r.result?.type}`);
      }
    });
  }
  
  return results;
}

// Lancer les tests
runTests().then(() => {
  console.log('\n✨ Tests terminés');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});
