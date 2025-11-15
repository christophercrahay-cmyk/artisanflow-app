// Configuration Sentry - TEMPLATE
// 1. Copier ce fichier vers config/sentry.js
// 2. Remplacer YOUR_SENTRY_DSN par votre DSN Sentry
// 3. Ne jamais commiter config/sentry.js

export const SENTRY_CONFIG = {
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production',
  enableInExpoDevelopment: false,
  debug: __DEV__,
};

