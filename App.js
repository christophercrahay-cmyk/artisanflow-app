import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import AuthScreen from './screens/AuthScreen';
import OnboardingScreen, { useOnboarding } from './screens/OnboardingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatusBar from './components/NetworkStatusBar';
import OfflineIndicator from './components/OfflineIndicator';
import SplashScreen from './components/SplashScreen';
import { useSafeTheme } from './theme/useSafeTheme';
import { onAuthStateChange, getCurrentSession } from './utils/auth';
import { initSentry } from './utils/sentryInit';
import logger from './utils/logger';
import { OfflineManager } from './utils/offlineManager';
import { supabase } from './supabaseClient';
import { initRevenueCat } from './services/payments/revenuecat';

// Initialiser Sentry dès le démarrage
initSentry();

// 🔍 DIAGNOSTIC SUPABASE (à retirer après tests)
console.log('🔍 === DIAGNOSTIC SUPABASE ===');
console.log('Supabase URL:', supabase.supabaseUrl);
console.log('Supabase Key (10 premiers chars):', `${supabase.supabaseKey?.substring(0, 10)  }...`);
console.log('=================================');

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
  const [showSplash, setShowSplash] = useState(true);
  const { isLoading: onboardingLoading, showOnboarding, completeOnboarding } = useOnboarding();

  // Vérifier session au démarrage (une seule fois)
  useEffect(() => {
    let isMounted = true;
    
    getCurrentSession().then((initialSession) => {
      if (!isMounted) {return;}
      
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
        
        // Initialiser RevenueCat après connexion (non-bloquant)
        if (initialSession.user?.id) {
          initRevenueCat(initialSession.user.id).catch((err) => {
            logger.error('App', 'Erreur init RevenueCat (non-bloquant)', err);
            
            // ✅ Mode graceful : app continue de fonctionner
            // Les features seront accessibles (mode essai étendu temporaire)
            if (__DEV__) {
              Alert.alert(
                '⚠️ Erreur de connexion',
                'Impossible de vérifier votre abonnement. Vous pouvez continuer à utiliser l\'app normalement.\n\nErreur: ' + (err?.message || 'Inconnue'),
                [{ text: 'OK' }]
              );
            }
          });
        }
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
        
        // Initialiser RevenueCat après connexion
        if (newSession.user?.id) {
          initRevenueCat(newSession.user.id).catch((err) => {
            if (__DEV__) {
              logger.error('App', 'Erreur init RevenueCat', err);
            }
          });
        }
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

  // ✅ Afficher le SplashScreen animé au démarrage
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

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
