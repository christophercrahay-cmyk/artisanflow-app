// test/testPrestationDetection.js

// Script de test pour vérifier que la détection de prestations fonctionne



import { analyzeTranscription } from '../services/quoteAnalysisService_fixed.js';



// Cas de test avec les résultats attendus

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

      

      // Afficher les détails si c'est une prestation

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

  

  // Afficher les échecs pour analyse

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



// Lancer les tests si exécuté directement

if (require.main === module) {

  runTests().then(() => {

    console.log('\n✨ Tests terminés');

  }).catch(error => {

    console.error('💥 Erreur fatale:', error);

  });

}



export default runTests;
