// Configuration Sentry pour production
// DSN désactivé par défaut (à configurer via variables d'environnement si nécessaire)

export const SENTRY_CONFIG = {
  dsn: null, // Désactivé par défaut
  environment: __DEV__ ? 'development' : 'production',
  enableInExpoDevelopment: false,
  debug: false,
  tracesSampleRate: 1.0,
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 30000,
};
