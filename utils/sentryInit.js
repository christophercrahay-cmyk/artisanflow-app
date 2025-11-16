import * as Sentry from '@sentry/react-native';
import logger from './logger';

// Import conditionnel de la config Sentry (peut ne pas exister en production)
let SENTRY_CONFIG = { dsn: null, enableInExpoDevelopment: false };
try {
  const sentryModule = require('../config/sentry');
  SENTRY_CONFIG = sentryModule.SENTRY_CONFIG || SENTRY_CONFIG;
} catch (e) {
  // Config Sentry absente (normal si fichier dans .gitignore)
  if (__DEV__) {
    console.log('[Sentry] Config file not found, Sentry disabled');
  }
}

/**
 * Initialise Sentry
 */
export function initSentry() {
  // Ne pas initialiser si pas de DSN ou en dev Expo
  if (!SENTRY_CONFIG || !SENTRY_CONFIG.dsn) {
    // Ne pas afficher de warning en développement, c'est normal
    if (!__DEV__) {
      logger.warn('Sentry', 'DSN manquant - Sentry non initialisé');
    }
    return;
  }

  if (__DEV__ && !SENTRY_CONFIG.enableInExpoDevelopment) {
    logger.info('Sentry', 'Désactivé en développement');
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_CONFIG.dsn,
      environment: SENTRY_CONFIG.environment,
      debug: SENTRY_CONFIG.debug,
      tracesSampleRate: SENTRY_CONFIG.tracesSampleRate || 1.0,
      enableAutoSessionTracking: SENTRY_CONFIG.enableAutoSessionTracking !== false,
      sessionTrackingIntervalMillis: SENTRY_CONFIG.sessionTrackingIntervalMillis || 30000,
      
      // Intégrations
      integrations: [
        new Sentry.ReactNativeTracing({
          // Traces pour les interactions utilisateur
          tracingOrigins: ['localhost', /^\//],
          routingInstrumentation: Sentry.routingInstrumentation,
        }),
      ],

      // Avant d'envoyer un événement, on peut le modifier
      beforeSend(event, hint) {
        // Filtrer les erreurs non critiques en dev
        if (__DEV__ && event.level === 'warning') {
          return null;
        }

        // Ajouter des données custom
        if (event.user) {
          // Ne pas logger les infos sensibles
          delete event.user.email;
          delete event.user.ip_address;
        }

        return event;
      },
    });

    logger.success('Sentry', 'Initialisé avec succès');
  } catch (error) {
    logger.error('Sentry', 'Erreur initialisation', error);
  }
}

/**
 * Capture une exception dans Sentry
 */
export function captureException(error, context = {}) {
  if (!SENTRY_CONFIG.dsn) {return;}

  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
}

/**
 * Capture un message dans Sentry
 */
export function captureMessage(message, level = 'info', context = {}) {
  if (!SENTRY_CONFIG.dsn) {return;}

  Sentry.captureMessage(message, {
    level,
    contexts: {
      custom: context,
    },
  });
}

/**
 * Définit l'utilisateur actuel
 */
export function setUser(user) {
  if (!SENTRY_CONFIG.dsn) {return;}

  Sentry.setUser({
    id: user.id,
    username: user.name || user.email,
    // Ne pas envoyer d'infos sensibles
  });
}

/**
 * Nettoie l'utilisateur
 */
export function clearUser() {
  if (!SENTRY_CONFIG.dsn) {return;}

  Sentry.setUser(null);
}

/**
 * Ajoute un breadcrumb (trace d'activité)
 */
export function addBreadcrumb(message, category, data = {}, level = 'info') {
  if (!SENTRY_CONFIG.dsn) {return;}

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
}

export default Sentry;

