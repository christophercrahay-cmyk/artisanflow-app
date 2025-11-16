import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import conditionnel de la config (peut ne pas exister en production)
let SUPABASE_CONFIG = { url: null, anonKey: null };
try {
  const supabaseModule = require('./config/supabase');
  SUPABASE_CONFIG = supabaseModule.SUPABASE_CONFIG || SUPABASE_CONFIG;
} catch (e) {
  // Config absente, utiliser variables d'environnement
}

// Utiliser variables d'environnement en priorité, puis config file
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || SUPABASE_CONFIG.url;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;

// Validation des clés au démarrage
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '❌ Configuration Supabase manquante !\n\n' +
    'Ajoutez les variables d\'environnement EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY\n' +
    'ou créez le fichier config/supabase.js depuis config/supabase.example.js'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
