/**
 * OnboardingPaywallScreen - Premier lancement
 * Explique l'essai gratuit 7 jours et les fonctionnalités
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../theme/theme2';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger';

interface OnboardingPaywallScreenProps {
  navigation: any;
}

export default function OnboardingPaywallScreen({ navigation }: OnboardingPaywallScreenProps) {
  const theme = useThemeColors();

  const handleStart = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Marquer l'onboarding comme vu
      await AsyncStorage.setItem('onboarding_paywall_seen', 'true');
      logger.info('OnboardingPaywall', 'Onboarding marqué comme vu');
      
      // Rediriger vers le paywall
      navigation.replace('Paywall');
    } catch (err) {
      logger.error('OnboardingPaywall', 'Erreur sauvegarde AsyncStorage', err);
      // Continuer quand même
      navigation.replace('Paywall');
    }
  };

  const handleSkip = async () => {
    try {
      // Marquer l'onboarding comme vu
      await AsyncStorage.setItem('onboarding_paywall_seen', 'true');
      logger.info('OnboardingPaywall', 'Onboarding ignoré');
      
      // Retour à l'app (sans paywall)
      navigation.goBack();
    } catch (err) {
      logger.error('OnboardingPaywall', 'Erreur sauvegarde AsyncStorage', err);
      navigation.goBack();
    }
  };

  const features = [
    {
      icon: 'mic',
      color: '#7C3AED',
      title: 'Notes vocales IA',
      desc: 'Dictez, l\'IA transcrit automatiquement',
    },
    {
      icon: 'cpu',
      color: '#2563EB',
      title: 'Devis en 30 secondes',
      desc: 'Génération automatique avec GPT-4',
    },
    {
      icon: 'file',
      color: '#16A34A',
      title: 'PDF professionnels',
      desc: 'Export et partage en un clic',
    },
    {
      icon: 'users',
      color: '#F59E0B',
      title: 'Gestion complète',
      desc: 'Clients, chantiers, photos, documents',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Bienvenue sur{'\n'}ArtisanFlow 👋
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            L'assistant IA qui fait gagner{'\n'}2h/jour aux artisans
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {features.map((feature, index) => (
            <View
              key={index}
              style={[styles.feature, { backgroundColor: theme.colors.surfaceAlt }]}
            >
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: feature.color + '20' },
                ]}
              >
                <Feather name={feature.icon as any} size={28} color={feature.color} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDesc, { color: theme.colors.textMuted }]}>
                  {feature.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Trial badge */}
        <View style={[styles.trial, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.primary }]}>
          <Feather name="gift" size={32} color={theme.colors.primary} />
          <View style={styles.trialText}>
            <Text style={[styles.trialTitle, { color: theme.colors.text }]}>
              7 jours d'essai gratuit
            </Text>
            <Text style={[styles.trialSubtitle, { color: theme.colors.textMuted }]}>
              Puis 19,99€/mois • Résiliable à tout moment
            </Text>
          </View>
        </View>

        {/* Boutons */}
        <TouchableOpacity
          onPress={handleStart}
          style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.primaryButtonText}>Démarrer mon essai gratuit</Text>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
        >
          <Text style={[styles.skipButtonText, { color: theme.colors.textMuted }]}>
            Passer pour l'instant
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 32,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  features: {
    gap: 16,
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  trial: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 16,
    marginBottom: 32,
    borderWidth: 2,
  },
  trialText: {
    flex: 1,
  },
  trialTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  trialSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});


