// config/openai.js
// ✅ SÉCURISÉ : Utilise les variables d'environnement

export const OPENAI_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY, // ✅ Variable d'environnement
  apiUrl: 'https://api.openai.com/v1',
  models: {
    whisper: 'whisper-1',
    gpt: 'gpt-4o-mini' // Moins cher, rapide, précis
  }
};
