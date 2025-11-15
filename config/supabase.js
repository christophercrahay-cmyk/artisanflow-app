// Configuration Supabase
// ✅ SÉCURISÉ : Utilise les variables d'environnement
// Pour EAS Build, configurer les secrets : eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "..."

// Valeurs par défaut (fallback si .env non chargé)
const DEFAULT_SUPABASE_URL = 'https://upihalivqstavxijlwaj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaWhhbGl2cXN0YXZ4aWpsd2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjIxMzksImV4cCI6MjA3NzMzODEzOX0.LiTut-3fm7XPAALAi6KQkS1hcwXUctUTPwER9V7cAzs';

export const SUPABASE_CONFIG = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY
};
