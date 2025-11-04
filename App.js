import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import AuthScreen from './screens/AuthScreen';
import OnboardingScreen, { useOnboarding } from './screens/OnboardingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatusBar from './components/NetworkStatusBar';
import OfflineIndicator from './components/OfflineIndicator';
import { useSafeTheme } from './theme/useSafeTheme';
import { onAuthStateChange, getCurrentSession } from './utils/auth';
import { initSentry } from './utils/sentryInit';
import logger from './utils/logger';
import { OfflineManager } from './utils/offlineManager';
import { supabase } from './supabaseClient';

// Initialiser Sentry dès le démarrage
initSentry();

// Thème personnalisé pour NavigationContainer
const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0F1115',
    card: '#1A1D22',
    border: '#2A2E35',
    text: '#F9FAFB', // Couleur unifiée
    primary: '#1D4ED8', // Bleu principal unifié
    notification: '#1D4ED8',
  },
};

export default function App() {
  const theme = useSafeTheme();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isLoading: onboardingLoading, showOnboarding, completeOnboarding } = useOnboarding();

  // Vérifier session au démarrage (une seule fois)
  useEffect(() => {
    let isMounted = true;
    
    getCurrentSession().then((initialSession) => {
      if (!isMounted) return;
      
      logger.info('App', `Session initiale: ${initialSession ? 'connecté' : 'non connecté'}`);
      setSession(initialSession);
      setLoading(false);
      
      // Si connecté, traiter la queue d'uploads au démarrage
      if (initialSession) {
        setTimeout(() => {
          OfflineManager.processQueue(supabase).then((result) => {
            if (result.processed > 0) {
              logger.success('App', `${result.processed} upload(s) synchronisé(s)`);
            }
          });
        }, 2000); // Attendre 2s que l'app soit prête
      }
    });

    return () => {
      isMounted = false;
    };
  }, []); // Exécuté une seule fois au montage

  // Écouter changements auth (une seule fois)
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((event, newSession) => {
      logger.info('App', `Auth event: ${event}`);
      setSession(newSession);
      
      // Traiter la queue quand l'utilisateur se connecte
      if (newSession && event === 'SIGNED_IN') {
        setTimeout(() => {
          OfflineManager.processQueue(supabase);
        }, 2000);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []); // Exécuté une seule fois au montage

  // Vérifier le réseau périodiquement et traiter la queue
  useEffect(() => {
    const networkInterval = setInterval(async () => {
      const currentSession = await getCurrentSession(); // Récupérer la session actuelle
      const isOnline = await OfflineManager.isOnline();
      if (isOnline && currentSession) {
        const queue = await OfflineManager.getQueue();
        if (queue.length > 0) {
          OfflineManager.processQueue(supabase);
        }
      }
    }, 10000); // Toutes les 10 secondes

    return () => {
      clearInterval(networkInterval);
    };
  }, []); // Exécuté une seule fois au montage

  if (loading || onboardingLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  // Afficher l'onboarding au premier lancement (après connexion)
  if (session && showOnboarding) {
    return (
      <ErrorBoundary>
        <SafeAreaProvider>
          <OnboardingScreen onComplete={completeOnboarding} />
        </SafeAreaProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer theme={CustomDarkTheme}>
          {session ? <AppNavigator /> : <AuthScreen />}
          <NetworkStatusBar />
          <OfflineIndicator />
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
