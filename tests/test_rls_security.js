/**
 * Script de test QA pour vérifier la Row Level Security (RLS)
 * 
 * Usage:
 *   node tests/test_rls_security.js
 * 
 * Ou avec npx:
 *   npx tsx tests/test_rls_security.js
 * 
 * Prérequis:
 *   - Installer @supabase/supabase-js: npm install @supabase/supabase-js
 *   - Configurer les variables d'environnement SUPABASE_URL et SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

// Charger les variables d'environnement
dotenv.config();

// Configuration Supabase
let SUPABASE_URL, SUPABASE_ANON_KEY;

// Méthode 1: Essayer de charger depuis config/supabase.js
try {
  // ✅ Fix: Utiliser __dirname directement (compatible Jest)
  const configPath = join(__dirname, '..', 'config', 'supabase.js');
  const configContent = readFileSync(configPath, 'utf8');
  
  // Extraire les valeurs depuis le fichier
  const urlMatch = configContent.match(/url:\s*['"]([^'"]+)['"]/);
  const keyMatch = configContent.match(/anonKey:\s*['"]([^'"]+)['"]/);
  
  if (urlMatch && keyMatch) {
    SUPABASE_URL = urlMatch[1];
    SUPABASE_ANON_KEY = keyMatch[1];
    console.log('✅ Configuration chargée depuis config/supabase.js');
  }
} catch (e) {
  // Ignorer les erreurs d'import
  console.log('ℹ️  config/supabase.js non trouvé, tentative avec variables d\'environnement...');
}

// Méthode 2: Variables d'environnement (fallback)
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  SUPABASE_URL = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    console.log('✅ Configuration chargée depuis variables d\'environnement');
  }
}

// Vérification finale
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('\n❌ Erreur: SUPABASE_URL et SUPABASE_ANON_KEY doivent être définis');
  console.error('\n   Options:');
  console.error('   1. Créez un fichier .env avec:');
  console.error('      SUPABASE_URL=https://votre-projet.supabase.co');
  console.error('      SUPABASE_ANON_KEY=votre-clé-anon');
  console.error('\n   2. Utilisez les variables EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY');
  console.error('\n   3. Assurez-vous que config/supabase.js existe et contient vos clés');
  console.error('\n   💡 Le script essaie automatiquement de charger depuis config/supabase.js');
  process.exit(1);
}

// Créer deux instances Supabase (une par utilisateur)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Compteurs de résultats
const testResults = {
  clients: { pass: 0, fail: 0, tests: [] },
  projects: { pass: 0, fail: 0, tests: [] },
  devis: { pass: 0, fail: 0, tests: [] },
  factures: { pass: 0, fail: 0, tests: [] },
  notes: { pass: 0, fail: 0, tests: [] },
  project_photos: { pass: 0, fail: 0, tests: [] },
  client_photos: { pass: 0, fail: 0, tests: [] },
  brand_settings: { pass: 0, fail: 0, tests: [] },
};

// IDs des données créées pour cleanup
const createdData = {
  userA: { userId: null, clientId: null, projectId: null, devisId: null, factureId: null, noteId: null },
  userB: { userId: null, clientId: null, projectId: null, devisId: null, factureId: null, noteId: null },
};

/**
 * Fonction utilitaire pour logger
 */
function log(message, type = 'info') {
  const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warn' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} ${message}`);
}

/**
 * Fonction utilitaire pour tester et enregistrer
 */
function recordTest(table, testName, passed, error = null) {
  if (passed) {
    testResults[table].pass++;
    testResults[table].tests.push({ name: testName, status: 'PASS' });
    log(`${table}.${testName}: PASS`, 'success');
  } else {
    testResults[table].fail++;
    testResults[table].tests.push({ name: testName, status: 'FAIL', error });
    log(`${table}.${testName}: FAIL ${error ? `- ${error}` : ''}`, 'error');
  }
}

/**
 * ÉTAPE 1: Créer deux utilisateurs de test
 * IMPORTANT: Le script essaie d'utiliser des utilisateurs existants pour éviter l'envoi d'emails
 */
async function createTestUsers() {
  log('Création/Recherche des utilisateurs de test...', 'info');
  log('ℹ️  Le script privilégie les utilisateurs existants pour éviter l\'envoi d\'emails', 'info');
  
  const userAEmail = 'test1@artisanflow.com';
  const userBEmail = 'test2@artisanflow.com';
  const password = 'motdepasse123';

  try {
    // Supprimer les utilisateurs existants si nécessaire (optionnel)
    // Note: Cela nécessite des permissions admin, peut être commenté
    // await supabaseAdmin.auth.admin.deleteUser(userAId);
    // await supabaseAdmin.auth.admin.deleteUser(userBId);

    // Créer ou se connecter avec userA
    // IMPORTANT: Ne pas envoyer d'email de confirmation pour éviter les problèmes de délivrabilité
    let userAId = null;
    try {
      // Essayer d'abord de se connecter (si l'utilisateur existe déjà)
      const { data: signInCheck, error: signInCheckError } = await supabaseAdmin.auth.signInWithPassword({
        email: userAEmail,
        password: password,
      });

      if (signInCheck?.user) {
        userAId = signInCheck.user.id;
        createdData.userA.userId = userAId;
        log(`UserA trouvé (utilisateur existant): ${userAEmail} (${userAId})`, 'success');
      }
    } catch (e) {
      // Utilisateur n'existe pas, on va le créer
    }

    // Si l'utilisateur n'existe pas, créer sans envoyer d'email
    if (!userAId) {
      try {
        const { data: dataA, error: errorA } = await supabaseAdmin.auth.signUp({
          email: userAEmail,
          password: password,
          options: {
            // Désactiver l'envoi d'email de confirmation
            emailRedirectTo: undefined,
            // Ne pas envoyer d'email
            data: { skip_email_confirmation: true },
          },
        });

        if (errorA && !errorA.message.includes('already registered') && !errorA.message.includes('User already registered')) {
          throw errorA;
        }

        if (dataA?.user) {
          userAId = dataA.user.id;
          log(`UserA créé: ${userAEmail} (${userAId})`, 'success');
          log(`ℹ️  Note: Aucun email n'a été envoyé (pour éviter les problèmes de délivrabilité)`, 'info');
        }
      } catch (e) {
        // Vérifier si c'est une erreur d'email invalide
        if (e.message && e.message.includes('invalid')) {
          log(`⚠️  Email considéré comme invalide: ${userAEmail}`, 'warn');
          log(`   Créez manuellement l'utilisateur dans Supabase Dashboard:`, 'warn');
          log(`   Authentication > Users > Add User`, 'warn');
          log(`   Email: ${userAEmail}, Password: ${password}`, 'warn');
        } else {
          log(`⚠️  Impossible de créer userA: ${e.message}`, 'warn');
        }
        log(`   Tentative de connexion avec l'utilisateur existant...`, 'info');
      }
    }

    // Si toujours pas trouvé, essayer de se connecter (dernière tentative)
    if (!userAId) {
      try {
        const { data: signInA, error: signInErrorA } = await supabaseAdmin.auth.signInWithPassword({
          email: userAEmail,
          password: password,
        });
        
        if (signInErrorA) {
          if (signInErrorA.message.includes('Email not confirmed')) {
            log(`\n⚠️  ERREUR: Email non confirmé pour userA`, 'error');
            log(`\n📋 Solutions:`, 'info');
            log(`   1. Désactivez la vérification email dans Supabase Dashboard:`, 'info');
            log(`      Authentication > Settings > Email Auth > Désactiver "Confirm email"`, 'info');
            log(`   2. Confirmez manuellement l'email dans:`, 'info');
            log(`      Authentication > Users > ${userAEmail} > Confirm email`, 'info');
            log(`   3. Consultez tests/FIX_EMAIL_CONFIRMATION.md pour plus de détails\n`, 'info');
            throw new Error('Email non confirmé pour userA. Consultez tests/FIX_EMAIL_CONFIRMATION.md pour résoudre ce problème.');
          } else if (signInErrorA.message.includes('Invalid login credentials') || signInErrorA.message.includes('invalid_credentials')) {
            log(`\n⚠️  ERREUR: Utilisateur ${userAEmail} non trouvé ou mot de passe incorrect`, 'error');
            log(`\n📋 Solutions:`, 'info');
            log(`   1. Créez l'utilisateur manuellement dans Supabase Dashboard:`, 'info');
            log(`      Authentication > Users > Add User`, 'info');
            log(`      Email: ${userAEmail}`, 'info');
            log(`      Password: ${password}`, 'info');
            log(`      Auto Confirm User: ✅ (coché)`, 'info');
            log(`   2. Ou désactivez la vérification email et réessayez`, 'info');
            log(`   3. Consultez tests/AVOID_EMAIL_ISSUES.md pour plus de détails\n`, 'info');
            throw new Error(`Utilisateur ${userAEmail} non trouvé. Créez-le manuellement dans Supabase Dashboard.`);
          }
          throw signInErrorA;
        }
        userAId = signInA.user.id;
        createdData.userA.userId = userAId;
        log(`UserA connecté: ${userAEmail} (${userAId})`, 'success');
      } catch (e) {
        if (e.message && !e.message.includes('non trouvé') && !e.message.includes('non confirmé')) {
          throw e;
        }
        // Re-lancer l'erreur avec le message approprié
        throw e;
      }
    } else {
      createdData.userA.userId = userAId;
    }

    // Créer ou se connecter avec userB
    // IMPORTANT: Ne pas envoyer d'email de confirmation pour éviter les problèmes de délivrabilité
    let userBId = null;
    try {
      // Essayer d'abord de se connecter (si l'utilisateur existe déjà)
      const { data: signInCheckB, error: signInCheckErrorB } = await supabaseAdmin.auth.signInWithPassword({
        email: userBEmail,
        password: password,
      });

      if (signInCheckB?.user) {
        userBId = signInCheckB.user.id;
        createdData.userB.userId = userBId;
        log(`UserB trouvé (utilisateur existant): ${userBEmail} (${userBId})`, 'success');
      }
    } catch (e) {
      // Utilisateur n'existe pas, on va le créer
    }

    // Si l'utilisateur n'existe pas, créer sans envoyer d'email
    if (!userBId) {
      try {
        const { data: dataB, error: errorB } = await supabaseAdmin.auth.signUp({
          email: userBEmail,
          password: password,
          options: {
            // Désactiver l'envoi d'email de confirmation
            emailRedirectTo: undefined,
            // Ne pas envoyer d'email
            data: { skip_email_confirmation: true },
          },
        });

        if (errorB && !errorB.message.includes('already registered') && !errorB.message.includes('User already registered')) {
          throw errorB;
        }

        if (dataB?.user) {
          userBId = dataB.user.id;
          log(`UserB créé: ${userBEmail} (${userBId})`, 'success');
          log(`ℹ️  Note: Aucun email n'a été envoyé (pour éviter les problèmes de délivrabilité)`, 'info');
        }
      } catch (e) {
        // Vérifier si c'est une erreur d'email invalide
        if (e.message && e.message.includes('invalid')) {
          log(`⚠️  Email considéré comme invalide: ${userBEmail}`, 'warn');
          log(`   Créez manuellement l'utilisateur dans Supabase Dashboard:`, 'warn');
          log(`   Authentication > Users > Add User`, 'warn');
          log(`   Email: ${userBEmail}, Password: ${password}`, 'warn');
        } else {
          log(`⚠️  Impossible de créer userB: ${e.message}`, 'warn');
        }
        log(`   Tentative de connexion avec l'utilisateur existant...`, 'info');
      }
    }

    // Si toujours pas trouvé, essayer de se connecter (dernière tentative)
    if (!userBId) {
      try {
        const { data: signInB, error: signInErrorB } = await supabaseAdmin.auth.signInWithPassword({
          email: userBEmail,
          password: password,
        });
        
        if (signInErrorB) {
          if (signInErrorB.message.includes('Email not confirmed')) {
            log(`\n⚠️  ERREUR: Email non confirmé pour userB`, 'error');
            log(`\n📋 Solutions:`, 'info');
            log(`   1. Désactivez la vérification email dans Supabase Dashboard:`, 'info');
            log(`      Authentication > Settings > Email Auth > Désactiver "Confirm email"`, 'info');
            log(`   2. Confirmez manuellement l'email dans:`, 'info');
            log(`      Authentication > Users > ${userBEmail} > Confirm email`, 'info');
            log(`   3. Consultez tests/FIX_EMAIL_CONFIRMATION.md pour plus de détails\n`, 'info');
            throw new Error('Email non confirmé pour userB. Consultez tests/FIX_EMAIL_CONFIRMATION.md pour résoudre ce problème.');
          } else if (signInErrorB.message.includes('Invalid login credentials') || signInErrorB.message.includes('invalid_credentials')) {
            log(`\n⚠️  ERREUR: Utilisateur ${userBEmail} non trouvé ou mot de passe incorrect`, 'error');
            log(`\n📋 Solutions:`, 'info');
            log(`   1. Créez l'utilisateur manuellement dans Supabase Dashboard:`, 'info');
            log(`      Authentication > Users > Add User`, 'info');
            log(`      Email: ${userBEmail}`, 'info');
            log(`      Password: ${password}`, 'info');
            log(`      Auto Confirm User: ✅ (coché)`, 'info');
            log(`   2. Ou désactivez la vérification email et réessayez`, 'info');
            log(`   3. Consultez tests/AVOID_EMAIL_ISSUES.md pour plus de détails\n`, 'info');
            throw new Error(`Utilisateur ${userBEmail} non trouvé. Créez-le manuellement dans Supabase Dashboard.`);
          }
          throw signInErrorB;
        }
        userBId = signInB.user.id;
        createdData.userB.userId = userBId;
        log(`UserB connecté: ${userBEmail} (${userBId})`, 'success');
      } catch (e) {
        if (e.message && !e.message.includes('non trouvé') && !e.message.includes('non confirmé')) {
          throw e;
        }
        // Re-lancer l'erreur avec le message approprié
        throw e;
      }
    } else {
      createdData.userB.userId = userBId;
    }

    return { userA: createdData.userA.userId, userB: createdData.userB.userId };
  } catch (error) {
    log(`Erreur création utilisateurs: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * ÉTAPE 2: Créer des données de test pour chaque utilisateur
 */
async function createTestData(userId, userLabel) {
  log(`\n📝 Création données test pour ${userLabel}...`, 'info');

  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Se connecter avec l'utilisateur
  const email = userLabel === 'userA' ? 'test1@artisanflow.com' : 'test2@artisanflow.com';
  const { data: { user }, error: authError } = await supabaseUser.auth.signInWithPassword({
    email: email,
    password: 'motdepasse123',
  });

  if (authError) {
    if (authError.message.includes('Email not confirmed')) {
      throw new Error(`Email non confirmé pour ${userLabel}. Veuillez confirmer l'email dans Supabase Dashboard (Authentication > Users) ou désactiver la vérification email dans Authentication > Settings > Email Auth.`);
    }
    throw new Error(`Erreur authentification ${userLabel}: ${authError.message}`);
  }

  if (!user) {
    throw new Error(`Utilisateur non trouvé pour ${userLabel}`);
  }

  try {
    // 1. Créer un client
    const clientName = userLabel === 'userA' ? 'Client_Test_A' : 'Client_Test_B';
    const { data: clientData, error: clientError } = await supabaseUser
      .from('clients')
      .insert([{
        name: clientName,
        email: `client_${userLabel}@demo.com`,
        phone: '0123456789',
        address: `Adresse ${clientName}`,
        user_id: user.id,
      }])
      .select()
      .single();

    if (clientError) {throw clientError;}
    const clientId = clientData.id;
    createdData[userLabel].clientId = clientId;
    log(`Client créé: ${clientName} (${clientId})`, 'success');

    // 2. Créer un projet
    const projectName = userLabel === 'userA' ? 'Projet_Test_A' : 'Projet_Test_B';
    const { data: projectData, error: projectError } = await supabaseUser
      .from('projects')
      .insert([{
        name: projectName,
        address: `Adresse ${projectName}`,
        client_id: clientId,
        user_id: user.id,
        status: 'active',
        status_text: 'active',
      }])
      .select()
      .single();

    if (projectError) {throw projectError;}
    const projectId = projectData.id;
    createdData[userLabel].projectId = projectId;
    log(`Projet créé: ${projectName} (${projectId})`, 'success');

    // 3. Créer un devis
    const devisNumero = userLabel === 'userA' ? 'DEVIS-TEST-A-001' : 'DEVIS-TEST-B-001';
    const { data: devisData, error: devisError } = await supabaseUser
      .from('devis')
      .insert([{
        numero: devisNumero,
        client_id: clientId,
        project_id: projectId,
        montant_ht: 500,
        tva_percent: 20,
        montant_ttc: 600,
        statut: 'brouillon',
        notes: `Devis test ${userLabel}`,
        user_id: user.id,
      }])
      .select()
      .single();

    if (devisError) {throw devisError;}
    const devisId = devisData.id;
    createdData[userLabel].devisId = devisId;
    log(`Devis créé: ${devisNumero} (${devisId})`, 'success');

    // 4. Créer une facture
    const factureNumero = userLabel === 'userA' ? 'FA-TEST-A-001' : 'FA-TEST-B-001';
    const { data: factureData, error: factureError } = await supabaseUser
      .from('factures')
      .insert([{
        numero: factureNumero,
        client_id: clientId,
        project_id: projectId,
        devis_id: devisId,
        montant_ht: 500,
        tva_percent: 20,
        montant_ttc: 600,
        statut: 'brouillon',
        notes: `Facture test ${userLabel}`,
        user_id: user.id,
      }])
      .select()
      .single();

    if (factureError) {throw factureError;}
    const factureId = factureData.id;
    createdData[userLabel].factureId = factureId;
    log(`Facture créée: ${factureNumero} (${factureId})`, 'success');

    // 5. Créer une note
    const { data: noteData, error: noteError } = await supabaseUser
      .from('notes')
      .insert([{
        project_id: projectId,
        client_id: clientId,
        type: 'text',
        transcription: `Note test ${userLabel}`,
        user_id: user.id,
      }])
      .select()
      .single();

    if (noteError) {throw noteError;}
    const noteId = noteData.id;
    createdData[userLabel].noteId = noteId;
    log(`Note créée: ${noteId}`, 'success');

    return { clientId, projectId, devisId, factureId, noteId };
  } catch (error) {
    log(`Erreur création données ${userLabel}: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * ÉTAPE 3: Vérifier les accès croisés
 */
async function testCrossAccess() {
  log('\n🔒 Test des accès croisés...', 'info');

  const supabaseUserA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const supabaseUserB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Connecter userA
  await supabaseUserA.auth.signInWithPassword({
    email: 'test1@artisanflow.com',
    password: 'motdepasse123',
  });

  // Connecter userB
  await supabaseUserB.auth.signInWithPassword({
    email: 'test2@artisanflow.com',
    password: 'motdepasse123',
  });

  // TEST 1: userA ne doit PAS voir les clients de userB
  const { data: clientsBFromA, error: error1 } = await supabaseUserA
    .from('clients')
    .select('*')
    .eq('name', 'Client_Test_B');

  const passed1 = !error1 && (!clientsBFromA || clientsBFromA.length === 0);
  recordTest('clients', 'userA ne voit pas les clients de userB', passed1, error1?.message);

  // TEST 2: userB ne doit PAS voir les clients de userA
  const { data: clientsAFromB, error: error2 } = await supabaseUserB
    .from('clients')
    .select('*')
    .eq('name', 'Client_Test_A');

  const passed2 = !error2 && (!clientsAFromB || clientsAFromB.length === 0);
  recordTest('clients', 'userB ne voit pas les clients de userA', passed2, error2?.message);

  // TEST 3: userA ne doit PAS voir les devis de userB
  const { data: devisBFromA, error: error3 } = await supabaseUserA
    .from('devis')
    .select('*')
    .eq('numero', 'DEVIS-TEST-B-001');

  const passed3 = !error3 && (!devisBFromA || devisBFromA.length === 0);
  recordTest('devis', 'userA ne voit pas les devis de userB', passed3, error3?.message);

  // TEST 4: userB ne doit PAS voir les devis de userA
  const { data: devisAFromB, error: error4 } = await supabaseUserB
    .from('devis')
    .select('*')
    .eq('numero', 'DEVIS-TEST-A-001');

  const passed4 = !error4 && (!devisAFromB || devisAFromB.length === 0);
  recordTest('devis', 'userB ne voit pas les devis de userA', passed4, error4?.message);

  // TEST 5: userA ne doit PAS voir les projets de userB
  const { data: projectsBFromA, error: error5 } = await supabaseUserA
    .from('projects')
    .select('*')
    .eq('name', 'Projet_Test_B');

  const passed5 = !error5 && (!projectsBFromA || projectsBFromA.length === 0);
  recordTest('projects', 'userA ne voit pas les projets de userB', passed5, error5?.message);

  // TEST 6: userA ne doit PAS voir les factures de userB
  const { data: facturesBFromA, error: error6 } = await supabaseUserA
    .from('factures')
    .select('*')
    .eq('numero', 'FA-TEST-B-001');

  const passed6 = !error6 && (!facturesBFromA || facturesBFromA.length === 0);
  recordTest('factures', 'userA ne voit pas les factures de userB', passed6, error6?.message);

  // TEST 7: userA ne doit PAS voir les notes de userB
  const { data: notesBFromA, error: error7 } = await supabaseUserA
    .from('notes')
    .select('*')
    .eq('transcription', 'Note test userB');

  const passed7 = !error7 && (!notesBFromA || notesBFromA.length === 0);
  recordTest('notes', 'userA ne voit pas les notes de userB', passed7, error7?.message);

  // TEST 8: userA doit voir ses propres données
  const { data: ownClients, error: error8 } = await supabaseUserA
    .from('clients')
    .select('*')
    .eq('name', 'Client_Test_A');

  const passed8 = !error8 && ownClients && ownClients.length > 0;
  recordTest('clients', 'userA voit ses propres clients', passed8, error8?.message);
}

/**
 * ÉTAPE 4: Tester l'insertion sans user_id (doit échouer)
 */
async function testInsertWithoutUserId() {
  log('\n🚫 Test insertion sans user_id (doit échouer)...', 'info');

  const supabaseUserA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  await supabaseUserA.auth.signInWithPassword({
    email: 'test1@artisanflow.com',
    password: 'motdepasse123',
  });

  // TEST: Insertion client sans user_id
  const { error: error1 } = await supabaseUserA
    .from('clients')
    .insert([{
      name: 'Client_Sans_UserID',
      email: 'sans_userid@test.com',
      // user_id manquant intentionnellement
    }]);

  const passed1 = error1 && error1.message.includes('row-level security');
  recordTest('clients', 'Insertion sans user_id doit échouer', passed1, 
    passed1 ? null : `Erreur attendue mais reçue: ${error1?.message || 'aucune erreur'}`);

  // TEST: Insertion devis sans user_id
  const { error: error2 } = await supabaseUserA
    .from('devis')
    .insert([{
      numero: 'DEVIS-SANS-USERID',
      montant_ht: 100,
      tva_percent: 20,
      montant_ttc: 120,
      // user_id manquant intentionnellement
    }]);

  const passed2 = error2 && error2.message.includes('row-level security');
  recordTest('devis', 'Insertion sans user_id doit échouer', passed2,
    passed2 ? null : `Erreur attendue mais reçue: ${error2?.message || 'aucune erreur'}`);
}

/**
 * ÉTAPE 5: Nettoyer les données de test (optionnel)
 */
async function cleanup() {
  log('\n🧹 Nettoyage des données de test...', 'info');
  
  // Note: En production, vous pourriez vouloir supprimer les données de test
  // Pour l'instant, on les laisse pour inspection manuelle
  log('Données de test conservées pour inspection manuelle', 'warn');
  log('Pour nettoyer manuellement, supprimez les utilisateurs test1@artisanflow.com et test2@artisanflow.com', 'warn');
}

/**
 * Afficher le résumé final
 */
function printSummary() {
  console.log(`\n${  '='.repeat(60)}`);
  console.log('📊 RÉSUMÉ DES TESTS RLS');
  console.log('='.repeat(60));

  const tables = Object.keys(testResults);
  let totalPass = 0;
  let totalFail = 0;

  tables.forEach(table => {
    const { pass, fail, tests } = testResults[table];
    totalPass += pass;
    totalFail += fail;

    const status = fail === 0 ? '✅' : '❌';
    console.log(`\n${status} ${table.toUpperCase()}`);
    console.log(`   PASS: ${pass} | FAIL: ${fail}`);
    
    tests.forEach(test => {
      const icon = test.status === 'PASS' ? '✅' : '❌';
      console.log(`   ${icon} ${test.name}`);
      if (test.error) {
        console.log(`      Erreur: ${test.error}`);
      }
    });
  });

  console.log(`\n${  '='.repeat(60)}`);
  console.log(`📈 TOTAL: ${totalPass} PASS | ${totalFail} FAIL`);
  console.log('='.repeat(60));

  if (totalFail === 0) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS ! La RLS est correctement configurée.');
  } else {
    console.log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ. Vérifiez la configuration RLS.');
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🔒 Démarrage des tests RLS pour ArtisanFlow\n');

  try {
    // Étape 1: Créer les utilisateurs
    await createTestUsers();

    // Étape 2: Créer les données de test
    await createTestData(createdData.userA.userId, 'userA');
    await createTestData(createdData.userB.userId, 'userB');

    // Étape 3: Tester les accès croisés
    await testCrossAccess();

    // Étape 4: Tester l'insertion sans user_id
    await testInsertWithoutUserId();

    // Étape 5: Nettoyage (optionnel)
    await cleanup();

    // Résumé final
    printSummary();

  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE:', error);
    printSummary();
    process.exit(1);
  }
}

// Exécuter les tests
main();

