// config/openai.js
// ✅ SÉCURISÉ : Plus de clé API côté client
// Les appels OpenAI passent maintenant par les Edge Functions Supabase
// Ce fichier ne contient que la configuration des modèles (pour référence)

export const OPENAI_CONFIG = {
  // ❌ Plus de clé API côté client (sécurisé via Edge Functions)
  apiUrl: 'https://api.openai.com/v1',
  models: {
    whisper: 'whisper-1',
    gpt: 'gpt-4o-mini' // Moins cher, rapide, précis
  }
};

// Note : Les services utilisent maintenant les Edge Functions :
// - services/transcriptionService.js → /functions/v1/transcribe-audio
// - services/transcriptionService.js → /functions/v1/correct-text
// - services/quoteAnalysisService.js → /functions/v1/analyze-note
