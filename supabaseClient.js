import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_CONFIG } from './config/supabase';

// Validation des clés au démarrage
if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
  throw new Error(
    '❌ Configuration Supabase manquante !\n\n' +
    'Créez le fichier config/supabase.js depuis config/supabase.example.js\n' +
    'et ajoutez vos clés Supabase.'
  );
}

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
