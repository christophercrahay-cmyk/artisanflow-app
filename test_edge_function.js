// ============================================
// TEST EDGE FUNCTION IA CONVERSATIONNELLE
// ============================================

const EDGE_FUNCTION_URL = 'https://upihalivqstavxijlwaj.supabase.co/functions/v1/ai-devis-conversational';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaWhhbGl2cXN0YXZ4aWpsd2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjIxMzksImV4cCI6MjA3NzMzODEzOX0.LiTut-3fm7XPAALAi6KQkS1hcwXUctUTPwER9V7cAzs';

console.log('\n🧪 === TEST EDGE FUNCTION IA ===\n');

// Test : Démarrer une session IA
const testData = {
  action: 'start',
  transcription: 'Installation de 8 prises électriques encastrées et 3 interrupteurs dans le salon',
  project_id: 'test-project-123',
  client_id: 'test-client-123',
  user_id: 'test-user-123',
};

console.log('📤 Envoi de la requête...');
console.log('Transcription:', testData.transcription);
console.log('');

fetch(EDGE_FUNCTION_URL, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData),
})
  .then(async (response) => {
    console.log('📥 Réponse reçue - Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Erreur:', errorText);
      return;
    }
    
    const result = await response.json();
    
    console.log('\n✅ SUCCÈS !\n');
    console.log('📊 Résultat :');
    console.log('  Status:', result.status);
    console.log('  Session ID:', result.session_id);
    console.log('  Tour:', result.tour_count);
    console.log('');
    console.log('📝 Devis généré :');
    console.log('  Titre:', result.devis.titre);
    console.log('  Total HT:', `${result.devis.total_ht  }€`);
    console.log('  Total TTC:', `${result.devis.total_ttc  }€`);
    console.log('  Lignes:', result.devis.lignes.length);
    console.log('');
    
    if (result.questions.length > 0) {
      console.log('❓ Questions de l\'IA :');
      result.questions.forEach((q, i) => {
        console.log(`  ${i + 1}. ${q}`);
      });
    } else {
      console.log('✅ Aucune question - Devis complet !');
    }
    
    console.log('\n=================================\n');
  })
  .catch((error) => {
    console.log('❌ Erreur réseau:', error.message);
  });

