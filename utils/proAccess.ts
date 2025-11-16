/**
 * Gating centralisé pour l'accès Pro
 * Si IAP_ENABLED !== 'true', retourne toujours true (mode dev)
 */

import { NavigationProp } from '@react-navigation/native';
import { hasProAccess } from '../services/payments/revenuecat';

const IAP_ENABLED = process.env.EXPO_PUBLIC_IAP_ENABLED === 'true';

/**
 * Vérifie l'accès Pro et redirige vers le Paywall si nécessaire
 * @param navigation - Navigation React Navigation
 * @param featureName - Nom de la feature (optionnel, pour logs)
 * @returns true si accès autorisé, false sinon
 */
export async function requireProOrPaywall(
  navigation: NavigationProp<any>,
  featureName?: string
): Promise<boolean> {
  if (IAP_ENABLED !== 'true') {
    return true; // Mode dev : accès libre
  }

  const hasAccess = await hasProAccess();

  if (!hasAccess) {
    if (__DEV__) {
      console.log('🔒 Accès réservé aux abonnés Pro :', featureName);
    }
    navigation.navigate('Paywall');
    return false;
  }

  return true;
}

