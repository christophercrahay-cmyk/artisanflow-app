/**
 * Design System 2.0 - ArtisanFlow
 * Thème adaptatif (dark/light) avec bleu électrique
 * Micro-animations et haptic feedback
 */

import { useColorScheme } from 'react-native';

// ═══════════════════════════════════════════════════════════
// BASE (COMMUN DARK + LIGHT)
// ═══════════════════════════════════════════════════════════

const base = {
  // Espacements (système harmonique)
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  // Rayons de bordure (harmonisés)
  radius: {
    sm: 6,      // Petits badges
    md: 12,     // Inputs, photos
    lg: 16,     // Cartes standard
    xl: 20,     // Grandes cartes, blocs
    xxl: 24,    // Sections premium
    round: 999, // Boutons pill, badges
  },

  // Typographie (échelle harmonique optimisée)
  typography: {
    h1: 28,     // Gros titres
    h2: 20,     // Titres d'écran
    h3: 16,     // Sous-titres
    body: 14,   // Texte principal
    small: 12,  // Texte secondaire
    tiny: 11,   // Captions
  },
  
  // Poids de police
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Letter spacing (pour aérer)
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.3,
    wider: 0.5,
  },

  // Durées d'animation
  animations: {
    fast: 150,
    normal: 250,
    slow: 350,
  },

  // Ombres fortes (cartes premium)
  shadowStrong: {
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },

  // Ombres douces (cartes standard)
  shadowSoft: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  // Ombres légères (badges, chips)
  shadowLight: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // ✨ Glow bleu (signature ArtisanFlow)
  glowBlue: {
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  // ✨ Glow bleu léger (éléments actifs)
  glowBlueLight: {
    shadowColor: '#2563EB',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
};

// ═══════════════════════════════════════════════════════════
// THÈME SOMBRE (DÉFAUT)
// ═══════════════════════════════════════════════════════════

export const darkTheme = {
  ...base,
  mode: 'dark',
  colors: {
    // Fonds
    background: '#020617',        // Fond principal (très sombre)
    surface: '#0B1120',           // Cartes standard
    surfaceAlt: '#111827',        // Surface alternative
    surfacePremium: '#1E293B',    // Cartes premium (gris ardoise)
    
    // Bordures
    border: '#1F2933',            // Bordures principales
    
    // Couleur principale (bleu électrique)
    primary: '#2563EB',           // Bleu électrique
    primarySoft: 'rgba(37, 99, 235, 0.18)', // Bleu transparent (fonds)
    primaryText: '#EFF6FF',       // Texte sur fond bleu
    
    // Textes
    text: '#F9FAFB',              // Texte principal (blanc cassé)
    textMuted: '#9CA3AF',         // Texte secondaire (gris moyen)
    textSoft: '#6B7280',          // Texte désactivé (gris foncé)
    
    // États sémantiques
    success: '#16A34A',           // Vert (succès)
    warning: '#F59E0B',           // Orange (avertissement)
    danger: '#DC2626',            // Rouge (erreur)
    info: '#38BDF8',              // Bleu clair (info)
    
    // Colorisation des prix (IA)
    priceCoherent: '#16A34A',     // Vert (prix cohérent ±10%)
    priceLimit: '#F59E0B',        // Orange (prix limite ±20%)
    priceTooHigh: '#DC2626',      // Rouge (prix trop cher +20%)
    priceTooLow: '#2563EB',       // Bleu (prix trop bas -20%)
    
    // Éléments UI
    divider: '#111827',           // Séparateurs
    chipBackground: 'rgba(15, 23, 42, 0.9)', // Fond chips/badges
  },
};

// ═══════════════════════════════════════════════════════════
// THÈME CLAIR
// ═══════════════════════════════════════════════════════════

export const lightTheme = {
  ...base,
  mode: 'light',
  colors: {
    // Fonds
    background: '#F3F4F6',        // Fond principal (gris très clair)
    surface: '#FFFFFF',           // Cartes standard (blanc)
    surfaceAlt: '#F9FAFB',        // Surface alternative (gris clair)
    surfacePremium: '#E5ECFF',    // Cartes premium (bleu très clair)
    
    // Bordures
    border: '#E5E7EB',            // Bordures principales
    
    // Couleur principale (bleu électrique)
    primary: '#2563EB',           // Bleu électrique
    primarySoft: 'rgba(37, 99, 235, 0.12)', // Bleu transparent (fonds)
    primaryText: '#0B1120',       // Texte sur fond bleu (sombre)
    
    // Textes
    text: '#0F172A',              // Texte principal (presque noir)
    textMuted: '#6B7280',         // Texte secondaire (gris moyen)
    textSoft: '#9CA3AF',          // Texte désactivé (gris clair)
    
    // États sémantiques
    success: '#16A34A',           // Vert (succès)
    warning: '#F59E0B',           // Orange (avertissement)
    danger: '#DC2626',            // Rouge (erreur)
    info: '#0284C7',              // Bleu foncé (info)
    
    // Colorisation des prix (IA)
    priceCoherent: '#16A34A',     // Vert (prix cohérent ±10%)
    priceLimit: '#D97706',        // Orange foncé (prix limite ±20%)
    priceTooHigh: '#B91C1C',      // Rouge foncé (prix trop cher +20%)
    priceTooLow: '#1D4ED8',       // Bleu foncé (prix trop bas -20%)
    
    // Éléments UI
    divider: '#E5E7EB',           // Séparateurs
    chipBackground: '#EEF2FF',    // Fond chips/badges (bleu très clair)
  },
};

// ═══════════════════════════════════════════════════════════
// HOOK : UTILISER LE THÈME ADAPTATIF
// ═══════════════════════════════════════════════════════════

/**
 * Hook pour récupérer le thème adaptatif selon le mode du téléphone
 * @returns {Object} - Thème complet (dark ou light)
 */
export const useThemeColors = () => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  return theme;
};

/**
 * Hook pour récupérer uniquement les couleurs
 * @returns {Object} - Couleurs du thème actif
 */
export const useColors = () => {
  const theme = useThemeColors();
  return theme.colors;
};

export default { darkTheme, lightTheme, useThemeColors, useColors };

