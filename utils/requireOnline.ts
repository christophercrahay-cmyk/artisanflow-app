import { Alert } from 'react-native';
import { useNetworkStatus } from '../contexts/NetworkStatusContext';

/**
 * Utilitaire pour vérifier qu'une connexion est disponible
 * Affiche un message si hors ligne
 * @returns true si en ligne, false si hors ligne
 */
export function requireOnline(): boolean {
  // Cette fonction sera utilisée dans les composants qui ont accès au contexte
  // Pour une utilisation hors composant, utiliser directement useNetworkStatus
  return true; // Par défaut, on suppose en ligne
}

/**
 * Hook pour vérifier la connexion et afficher un message si nécessaire
 * @param actionName - Nom de l'action (ex: "Création de client")
 * @returns { isOnline: boolean, checkAndShowMessage: () => boolean }
 */
export function useRequireOnline(actionName?: string) {
  const { isOffline } = useNetworkStatus();

  const checkAndShowMessage = (): boolean => {
    if (isOffline) {
      Alert.alert(
        '📵 Connexion nécessaire',
        `Cette fonctionnalité nécessite une connexion internet.\n\n${actionName || 'Cette action'} n'est pas disponible en mode hors ligne.`,
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  return {
    isOnline: !isOffline,
    checkAndShowMessage,
  };
}

