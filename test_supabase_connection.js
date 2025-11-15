// ============================================
// TEST CONNEXION SUPABASE
// ============================================
// Script pour tester la connexion Supabase
// avant de rebuild l'app
// ============================================

const { createClient } = require('@supabase/supabase-js');

// Importer la config
const { SUPABASE_CONFIG } = require('./config/supabase');

console.log('\n🔍 === TEST CONNEXION SUPABASE ===\n');

// Afficher la config
console.log('📋 Configuration :');
console.log('  URL:', SUPABASE_CONFIG.url);
console.log('  Key (10 premiers chars):', `${SUPABASE_CONFIG.anonKey?.substring(0, 10)  }...`);
console.log('');

// Créer le client
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Test 1 : Ping Supabase
console.log('🧪 Test 1 : Ping Supabase...');
supabase
  .from('profiles')
  .select('count', { count: 'exact', head: true })
  .then(({ error, count }) => {
    if (error) {
      console.log('  ❌ Erreur:', error.message);
    } else {
      console.log(`  ✅ Connexion OK ! (${  count  } profils dans la BDD)`);
    }
  })
  .catch((err) => {
    console.log('  ❌ Erreur réseau:', err.message);
  })
  .finally(() => {
    // Test 2 : Test création de compte (simulation)
    console.log('\n🧪 Test 2 : Simulation création de compte...');
    supabase.auth
      .signUp({
        email: `test-${  Date.now()  }@artisanflow.app`,
        password: 'Test1234',
      })
      .then(({ data, error }) => {
        if (error) {
          console.log('  ❌ Erreur:', error.message);
        } else {
          console.log('  ✅ Création de compte OK !');
          console.log('  User ID:', data.user?.id);
          
          // Supprimer le compte de test
          console.log('\n🧹 Nettoyage du compte de test...');
          // Note: Nécessite les droits admin pour supprimer
        }
      })
      .catch((err) => {
        console.log('  ❌ Erreur réseau:', err.message);
      })
      .finally(() => {
        console.log('\n=================================\n');
        process.exit(0);
      });
  });

