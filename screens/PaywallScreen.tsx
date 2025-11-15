/**
 * PaywallScreen - Écran d'abonnement Pro
 * Affiche les offres mensuelle/annuelle avec essai gratuit 7 jours
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../theme/theme2';
import {
  getOfferings,
  purchaseMonthly,
  purchaseAnnual,
  restorePurchases,
} from '../services/payments/revenuecat';
import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { showSuccess, showError } from '../components/Toast';
import logger from '../utils/logger';

const IAP_ENABLED = process.env.EXPO_PUBLIC_IAP_ENABLED === 'true';

interface PaywallScreenProps {
  navigation: any;
}

export default function PaywallScreen({ navigation }: PaywallScreenProps) {
  const theme = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');

  const styles = useMemo(() => getStyles(theme), [theme]);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    if (!IAP_ENABLED) {
      setLoading(false);
      return;
    }

    try {
      const offerings = await getOfferings();
      setOffering(offerings);
    } catch (error) {
      logger.error('PaywallScreen', 'Erreur chargement offerings', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!IAP_ENABLED) {
      showSuccess('Essai activé ✅ (mode dev)');
      navigation.goBack();
      return;
    }

    if (!offering) {
      showError('Offre indisponible, réessayez plus tard');
      return;
    }

    try {
      setPurchasing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const success =
        selectedPlan === 'monthly' ? await purchaseMonthly() : await purchaseAnnual();

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showSuccess('Essai activé ✅');
        navigation.goBack();
      } else {
        // User a annulé → pas d'erreur
      }
    } catch (error: any) {
      logger.error('PaywallScreen', 'Erreur achat', error);
      showError(error.message || 'Erreur lors de l\'achat');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setPurchasing(true);
      const success = await restorePurchases();

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showSuccess('Achats restaurés ✅');
        navigation.goBack();
      } else {
        showError('Aucun achat à restaurer');
      }
    } catch (error: any) {
      logger.error('PaywallScreen', 'Erreur restauration', error);
      showError(error.message || 'Erreur lors de la restauration');
    } finally {
      setPurchasing(false);
    }
  };

  const openManageSubscriptions = () => {
    const url =
      Platform.OS === 'ios'
        ? 'https://apps.apple.com/account/subscriptions'
        : 'https://play.google.com/store/account/subscriptions';

    Linking.openURL(url).catch((err) => {
      logger.error('PaywallScreen', 'Erreur ouverture gestion abonnement', err);
      showError('Impossible d\'ouvrir la page de gestion');
    });
  };

  const benefits = [
    { icon: '🤖', text: 'Devis IA illimités' },
    { icon: '🎤', text: 'Notes vocales automatiques' },
    { icon: '📄', text: 'Export PDF professionnel' },
    { icon: '👥', text: 'Gestion clients / chantiers' },
    { icon: '📊', text: 'Suivi paiements' },
    { icon: '💬', text: 'Support prioritaire' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const monthlyPackage = offering?.availablePackages.find((pkg) => pkg.identifier === 'monthly');
  const annualPackage = offering?.availablePackages.find((pkg) => pkg.identifier === 'annual');

  const monthlyPrice = monthlyPackage?.product.priceString || '29,99€';
  const annualPrice = annualPackage?.product.priceString || '299€';
  const annualMonthlyEquivalent = (299 / 12).toFixed(2).replace('.', ',');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Feather name="x" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Titre */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: theme.colors.text }]}>ArtisanFlow</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            L'assistant IA professionnel pour artisans
          </Text>
        </View>

        {/* Bénéfices */}
        <View style={styles.benefitsSection}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>{benefit.icon}</Text>
              <Text style={[styles.benefitText, { color: theme.colors.text }]}>
                {benefit.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Plans */}
        {offering ? (
          <View style={styles.plansSection}>
            {/* Mensuel */}
            <TouchableOpacity
              onPress={() => {
                setSelectedPlan('monthly');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.planCard,
                {
                  backgroundColor:
                    selectedPlan === 'monthly'
                      ? theme.colors.primary + '20'
                      : theme.colors.surfaceAlt,
                  borderColor:
                    selectedPlan === 'monthly' ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <View style={styles.planHeader}>
                <Text style={[styles.planTitle, { color: theme.colors.text }]}>Mensuel</Text>
                {selectedPlan === 'monthly' && (
                  <Feather name="check-circle" size={24} color={theme.colors.primary} />
                )}
              </View>
              <Text style={[styles.planPrice, { color: theme.colors.text }]}>
                {monthlyPrice}/mois
              </Text>
            </TouchableOpacity>

            {/* Annuel */}
            <TouchableOpacity
              onPress={() => {
                setSelectedPlan('annual');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.planCard,
                styles.planCardRecommended,
                {
                  backgroundColor:
                    selectedPlan === 'annual'
                      ? theme.colors.primary + '20'
                      : theme.colors.surfaceAlt,
                  borderColor:
                    selectedPlan === 'annual' ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>Recommandé</Text>
              </View>
              <View style={styles.planHeader}>
                <Text style={[styles.planTitle, { color: theme.colors.text }]}>Annuel</Text>
                {selectedPlan === 'annual' && (
                  <Feather name="check-circle" size={24} color={theme.colors.primary} />
                )}
              </View>
              <Text style={[styles.planPrice, { color: theme.colors.text }]}>
                {annualPrice}/an
              </Text>
              <Text style={[styles.planSavings, { color: theme.colors.success }]}>
                ≈ {annualMonthlyEquivalent}€/mois • 2 mois offerts
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.errorSection}>
            <Feather name="alert-circle" size={48} color={theme.colors.error} />
            <Text style={[styles.errorText, { color: theme.colors.text }]}>
              Offre indisponible
            </Text>
            <Text style={[styles.errorSubtext, { color: theme.colors.textMuted }]}>
              Réessayez plus tard
            </Text>
          </View>
        )}

        {/* Essai gratuit */}
        <Text style={[styles.trialText, { color: theme.colors.textMuted }]}>
          Essai gratuit 7 jours – Annulez quand vous voulez
        </Text>

        {/* Boutons */}
        <View style={styles.buttonsSection}>
          <TouchableOpacity
            onPress={handlePurchase}
            disabled={!offering || purchasing}
            style={[
              styles.primaryButton,
              {
                backgroundColor: offering ? theme.colors.primary : theme.colors.textMuted,
                opacity: purchasing ? 0.6 : 1,
              },
            ]}
          >
            {purchasing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>🚀 Démarrer mon essai gratuit</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRestore}
            disabled={purchasing}
            style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
              🔄 Restaurer mes achats
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={openManageSubscriptions}
            style={styles.manageButton}
          >
            <Text style={[styles.manageButtonText, { color: theme.colors.textMuted }]}>
              ⚙️ Gérer mon abonnement
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mentions légales */}
        <View style={styles.legalSection}>
          <Text style={[styles.legalText, { color: theme.colors.textMuted }]}>
            En vous abonnant, vous acceptez nos{' '}
            <Text
              style={styles.legalLink}
              onPress={() => Linking.openURL('https://christophercrahay-cmyk.github.io/artisanflow-site/cgu.html')}
            >
              Conditions Générales d'Utilisation
            </Text>{' '}
            et notre{' '}
            <Text
              style={styles.legalLink}
              onPress={() => Linking.openURL('https://christophercrahay-cmyk.github.io/artisanflow-site/politique.html')}
            >
              Politique de Confidentialité
            </Text>
            .
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: theme.spacing.xl,
    },
    closeButton: {
      padding: theme.spacing.sm,
    },
    titleSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      textAlign: 'center',
    },
    benefitsSection: {
      marginBottom: theme.spacing.xl,
    },
    benefitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    benefitIcon: {
      fontSize: 24,
      marginRight: theme.spacing.md,
      width: 32,
    },
    benefitText: {
      fontSize: 16,
      flex: 1,
    },
    plansSection: {
      marginBottom: theme.spacing.lg,
    },
    planCard: {
      borderWidth: 2,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      position: 'relative',
    },
    planCardRecommended: {
      marginTop: theme.spacing.md,
    },
    planBadge: {
      position: 'absolute',
      top: -12,
      right: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.round,
    },
    planBadgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    planHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    planTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    planPrice: {
      fontSize: 24,
      fontWeight: '800',
      marginBottom: theme.spacing.xs,
    },
    planSavings: {
      fontSize: 14,
      fontWeight: '600',
    },
    errorSection: {
      alignItems: 'center',
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
    errorText: {
      fontSize: 18,
      fontWeight: '700',
      marginTop: theme.spacing.md,
    },
    errorSubtext: {
      fontSize: 14,
      marginTop: theme.spacing.xs,
    },
    trialText: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    buttonsSection: {
      marginBottom: theme.spacing.xl,
    },
    primaryButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    secondaryButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      borderWidth: 1,
      marginBottom: theme.spacing.sm,
    },
    secondaryButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    manageButton: {
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
    },
    manageButtonText: {
      fontSize: 12,
    },
    legalSection: {
      marginTop: theme.spacing.lg,
    },
    legalText: {
      fontSize: 11,
      textAlign: 'center',
      lineHeight: 16,
    },
    legalLink: {
      textDecorationLine: 'underline',
    },
  });

