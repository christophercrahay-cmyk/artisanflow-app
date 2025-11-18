import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkStatusContextType {
  isOffline: boolean;
}

const NetworkStatusContext = createContext<NetworkStatusContextType>({
  isOffline: false,
});

interface NetworkStatusProviderProps {
  children: ReactNode;
}

/**
 * Provider pour le statut réseau global
 * Expose isOffline dans toute l'application
 */
export function NetworkStatusProvider({ children }: NetworkStatusProviderProps) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Vérifier l'état initial
    NetInfo.fetch().then((state) => {
      const offline = !(state.isConnected && state.isInternetReachable);
      setIsOffline(offline);
    });

    // Écouter les changements de réseau
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable);
      setIsOffline(offline);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <NetworkStatusContext.Provider value={{ isOffline }}>
      {children}
    </NetworkStatusContext.Provider>
  );
}

/**
 * Hook pour utiliser le statut réseau depuis n'importe où
 */
export function useNetworkStatus() {
  const context = useContext(NetworkStatusContext);
  if (!context) {
    throw new Error('useNetworkStatus must be used within NetworkStatusProvider');
  }
  return context;
}

