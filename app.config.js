/**
 * Configuration Expo dynamique pour ArtisanFlow
 * Gère les versions STABLE et DEV avec des identifiants différents
 */

const IS_DEV = process.env.EAS_BUILD_PROFILE === 'development';

module.exports = {
  expo: {
    // Nom de l'app : "ArtisanFlow Dev" en DEV, "ArtisanFlow" en production
    name: IS_DEV ? 'ArtisanFlow Dev' : 'ArtisanFlow',
    
    slug: 'artisanflow-3rgvrambzo0tk8d1ddx2',
    version: '1.0.1',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    primaryColor: '#1D4ED8',
    description: 'Application de gestion pour artisans du bâtiment : clients, chantiers, photos, notes vocales avec transcription IA, devis et factures.',
    
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            minSdkVersion: 24,
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            ndkVersion: '24.0.8215888',
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
          },
          ios: {
            deploymentTarget: '15.1',
          },
        },
      ],
      'expo-asset',
      'expo-mail-composer',
    ],
    
    splash: {
      image: './assets/artisanflow-home-logo.png',
      resizeMode: 'contain',
      backgroundColor: '#0D0F18',
    },
    
    assetBundlePatterns: ['assets/**/*'],
    
    ios: {
      supportsTablet: true,
      // Bundle identifier différent pour DEV
      bundleIdentifier: IS_DEV ? 'com.artisanflow.dev' : 'com.acontrecourant.artisanflow',
      buildNumber: '2',
      splash: {
        image: './assets/artisanflow-home-logo.png',
        resizeMode: 'contain',
        backgroundColor: '#0D0F18',
      },
      infoPlist: {
        NSMicrophoneUsageDescription: 'ArtisanFlow enregistre des notes vocales pour documenter vos chantiers.',
        NSCameraUsageDescription: 'ArtisanFlow prend des photos pour documenter vos chantiers et suivre l\'avancement des travaux.',
        NSLocationWhenInUseUsageDescription: 'ArtisanFlow utilise votre position pour géolocaliser vos photos de chantier et afficher la météo locale.',
        NSLocationAlwaysAndWhenInUseUsageDescription: 'ArtisanFlow utilise votre position pour géolocaliser vos photos de chantier et afficher la météo locale.',
        NSPhotoLibraryUsageDescription: 'ArtisanFlow accède à votre galerie pour sélectionner des photos de chantier.',
        NSPhotoLibraryAddUsageDescription: 'ArtisanFlow sauvegarde les photos de chantier dans votre galerie.',
      },
    },
    
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0F1115',
      },
      splash: {
        image: './assets/artisanflow-home-logo.png',
        resizeMode: 'contain',
        backgroundColor: '#0D0F18',
      },
      edgeToEdgeEnabled: true,
      permissions: [
        'RECORD_AUDIO',
        'CAMERA',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
      ],
      // Package différent pour DEV : permet l'installation en parallèle
      package: IS_DEV ? 'com.artisanflow.dev' : 'com.acontrecourant.artisanflow',
      scheme: 'artisanflow',
      versionCode: 2,
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.acontrecourant.artisanflow',
      blockedPermissions: ['android.permission.ACCESS_BACKGROUND_LOCATION'],
      config: {
        googleMaps: {
          apiKey: '',
        },
      },
    },
    
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    
    extra: {
      eas: {
        projectId: 'ef12de05-654e-4cc5-be14-26fc25571879',
      },
      // Base URL pour les liens de partage de chantier
      // Peut être surchargée par EXPO_PUBLIC_SHARE_BASE_URL
      shareBaseUrl: process.env.EXPO_PUBLIC_SHARE_BASE_URL || 'https://artisanflow.fr',
    },
    
    owner: 'chriskreepz',
    
    updates: {
      fallbackToCacheTimeout: 0,
      url: 'https://u.expo.dev/ef12de05-654e-4cc5-be14-26fc25571879',
    },
    
    runtimeVersion: {
      policy: 'appVersion',
    },
  },
};

