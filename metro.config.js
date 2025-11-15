// Configuration Metro pour Expo
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configuration du resolver pour gérer les modules natifs
config.resolver = {
  ...config.resolver,
  // Désactiver les exports stricts pour compatibilité avec les modules natifs
  // comme whisper.rn qui n'ont pas de champ "exports" dans leur package.json
  unstable_enablePackageExports: false,
  
  // Ajouter un alias si nécessaire pour whisper.rn
  extraNodeModules: {
    ...config.resolver.extraNodeModules,
  },
};

module.exports = config;

