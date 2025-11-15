// utils/errorHandler.js

export const handleAPIError = (error, context) => {
  console.error(`[${context}] Erreur:`, error);
  
  if (error.message?.includes('quota')) {
    return {
      title: 'Quota dépassé',
      message: 'Votre quota d\'API OpenAI est dépassé. Veuillez vérifier votre compte.',
      retry: false
    };
  }
  
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return {
      title: 'Pas de connexion',
      message: 'Vérifiez votre connexion internet et réessayez.',
      retry: true
    };
  }
  
  if (error.message?.includes('401') || error.message?.includes('API key')) {
    return {
      title: 'Erreur d\'authentification',
      message: 'Clé API invalide. Vérifiez votre configuration dans config/openai.js',
      retry: false
    };
  }
  
  return {
    title: 'Erreur',
    message: 'Une erreur est survenue. Réessayez plus tard.',
    retry: true
  };
};
