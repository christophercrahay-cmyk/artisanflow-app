/**
 * RevenueCat Service - Gestion des abonnements
 * Mode dev : si IAP_ENABLED !== 'true', toutes les fonctions retournent sans effet
 */

import Purchases, {
  CustomerInfo,
  Offerings,
  PurchasesOffering,
  PurchasesPackage,
  PurchasesError,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import logger from '../../utils/logger';

const IAP_ENABLED = process.env.EXPO_PUBLIC_IAP_ENABLED === 'true';

// Cache pour hasProAccess (30s)
let proAccessCache: { value: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 30000; // 30s

/**
 * Initialise RevenueCat avec l'API key appropriée
 */
export async function initRevenueCat(userId?: string): Promise<void> {
  if (!IAP_ENABLED) {
    if (__DEV__) {
      logger.warn('RevenueCat', 'IAP désactivé (mode dev)');
    }
    return;
  }

  try {
    const apiKey =
      Platform.OS === 'ios'
        ? process.env.EXPO_PUBLIC_RC_API_KEY_IOS
        : process.env.EXPO_PUBLIC_RC_API_KEY_ANDROID;

    if (!apiKey) {
      throw new Error(`RC_API_KEY_${Platform.OS.toUpperCase()} manquant`);
    }

    await Purchases.configure({
      apiKey,
      appUserID: userId,
    });

    // Listener pour les changements d'entitlement
    Purchases.addCustomerInfoUpdateListener((customerInfo: CustomerInfo) => {
      const hasAccess = customerInfo.entitlements.active['pro_access'] !== undefined;
      if (__DEV__) {
        logger.info('RevenueCat', `Entitlement changé - Pro: ${hasAccess}`);
      }
      // Invalider le cache
      proAccessCache = null;
    });

    if (__DEV__) {
      logger.success('RevenueCat', 'Initialisé');
    }
  } catch (error) {
    if (__DEV__) {
      logger.error('RevenueCat', 'Erreur initialisation', error);
    }
    throw error;
  }
}

/**
 * Récupère l'offering "default" (monthly + annual)
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!IAP_ENABLED) {
    return null;
  }

  try {
    const offerings: Offerings = await Purchases.getOfferings();
    return offerings.current || null;
  } catch (error) {
    if (__DEV__) {
      logger.error('RevenueCat', 'Erreur getOfferings', error);
    }
    return null;
  }
}

/**
 * Vérifie si l'utilisateur a l'accès Pro
 * Cache 30s pour éviter le spam SDK
 */
export async function hasProAccess(): Promise<boolean> {
  if (!IAP_ENABLED) {
    return true; // Mode dev : accès libre
  }

  // Vérifier le cache
  if (proAccessCache) {
    const now = Date.now();
    if (now - proAccessCache.timestamp < CACHE_DURATION) {
      return proAccessCache.value;
    }
  }

  try {
    const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
    const hasAccess = customerInfo.entitlements.active['pro_access'] !== undefined;

    // Mettre en cache
    proAccessCache = {
      value: hasAccess,
      timestamp: Date.now(),
    };

    return hasAccess;
  } catch (error) {
    if (__DEV__) {
      logger.error('RevenueCat', 'Erreur hasProAccess', error);
    }
    return false;
  }
}

/**
 * Achat abonnement mensuel
 */
export async function purchaseMonthly(): Promise<boolean> {
  if (!IAP_ENABLED) {
    return true; // Mode dev : succès simulé
  }

  try {
    const offering = await getOfferings();
    if (!offering) {
      throw new Error('Offering indisponible');
    }

    const monthlyPackage = offering.availablePackages.find(
      (pkg: PurchasesPackage) => pkg.identifier === 'monthly'
    );

    if (!monthlyPackage) {
      throw new Error('Package monthly introuvable');
    }

    const { customerInfo } = await Purchases.purchasePackage(monthlyPackage);
    const hasAccess = customerInfo.entitlements.active['pro_access'] !== undefined;

    // Invalider le cache
    proAccessCache = null;

    return hasAccess;
  } catch (error: any) {
    if (error.userCancelled) {
      // User a annulé → pas d'erreur, juste false
      return false;
    }

    if (__DEV__) {
      logger.error('RevenueCat', 'Erreur purchaseMonthly', error);
    }
    throw error;
  }
}

/**
 * Achat abonnement annuel
 */
export async function purchaseAnnual(): Promise<boolean> {
  if (!IAP_ENABLED) {
    return true; // Mode dev : succès simulé
  }

  try {
    const offering = await getOfferings();
    if (!offering) {
      throw new Error('Offering indisponible');
    }

    const annualPackage = offering.availablePackages.find(
      (pkg: PurchasesPackage) => pkg.identifier === 'annual'
    );

    if (!annualPackage) {
      throw new Error('Package annual introuvable');
    }

    const { customerInfo } = await Purchases.purchasePackage(annualPackage);
    const hasAccess = customerInfo.entitlements.active['pro_access'] !== undefined;

    // Invalider le cache
    proAccessCache = null;

    return hasAccess;
  } catch (error: any) {
    if (error.userCancelled) {
      // User a annulé → pas d'erreur, juste false
      return false;
    }

    if (__DEV__) {
      logger.error('RevenueCat', 'Erreur purchaseAnnual', error);
    }
    throw error;
  }
}

/**
 * Restaure les achats précédents
 */
export async function restorePurchases(): Promise<boolean> {
  if (!IAP_ENABLED) {
    return true; // Mode dev : succès simulé
  }

  try {
    const customerInfo: CustomerInfo = await Purchases.restorePurchases();
    const hasAccess = customerInfo.entitlements.active['pro_access'] !== undefined;

    // Invalider le cache
    proAccessCache = null;

    return hasAccess;
  } catch (error) {
    if (__DEV__) {
      logger.error('RevenueCat', 'Erreur restorePurchases', error);
    }
    return false;
  }
}

