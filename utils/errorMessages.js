/**
 * Messages d'erreur clairs et utiles pour l'utilisateur
 */

export function getErrorMessage(error, context = '') {
  // Si c'est déjà un message clair, le retourner tel quel
  if (typeof error === 'string') {
    return error;
  }

  // Erreur Supabase
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        return 'Aucun résultat trouvé';
      case '23505':
        return 'Cette donnée existe déjà';
      case '23503':
        return 'Impossible de supprimer : cette donnée est utilisée ailleurs';
      case '42501':
        return 'Vous n\'avez pas les permissions nécessaires';
      case 'PGRST301':
        return 'Erreur de connexion à la base de données';
      default:
        return error.message || 'Une erreur est survenue';
    }
  }

  // Erreur réseau
  if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
    return 'Problème de connexion internet. Vérifiez votre réseau.';
  }

  // Erreur timeout
  if (error?.message?.includes('timeout')) {
    return 'La requête a pris trop de temps. Réessayez.';
  }

  // Message d'erreur générique mais utile
  if (error?.message) {
    // Nettoyer les messages techniques
    const cleanMessage = error.message
      .replace(/Error: /g, '')
      .replace(/\[.*?\]/g, '')
      .trim();
    
    if (cleanMessage.length > 0 && cleanMessage.length < 100) {
      return cleanMessage;
    }
  }

  // Message par défaut selon le contexte
  const contextMessages = {
    'save': 'Impossible de sauvegarder. Vérifiez vos données.',
    'delete': 'Impossible de supprimer. Réessayez plus tard.',
    'load': 'Impossible de charger les données. Vérifiez votre connexion.',
    'upload': 'Impossible d\'envoyer le fichier. Vérifiez votre connexion.',
    'auth': 'Problème d\'authentification. Reconnectez-vous.',
  };

  return contextMessages[context] || 'Une erreur est survenue. Réessayez.';
}

/**
 * Message de confirmation avant suppression
 */
export function getDeleteConfirmationMessage(itemName, itemType = 'élément') {
  return `Voulez-vous vraiment supprimer "${itemName}" ?\n\nCette action est irréversible.`;
}

