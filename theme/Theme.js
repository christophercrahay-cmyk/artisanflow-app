/**
 * Thème professionnel unifié pour ArtisanFlow
 * Design sombre optimisé pour usage terrain (plein soleil)
 * Palette : Bleu principal (#1D4ED8) + Gris neutres + Accent vert (succès)
 */

export const Theme = {
  // Couleurs - Palette unifiée
  colors: {
    // Fond principal
    background: '#0F1115',
    
    // Surfaces (gris neutres)
    surface: '#1A1D22',
    surfaceElevated: '#252A32',
    
    // Bordures (gris neutres)
    border: '#2A2E35',
    borderLight: '#1E2126',
    
    // Textes (contrastés pour lisibilité plein soleil)
    text: '#F9FAFB',        // Blanc cassé (meilleur contraste)
    textSecondary: '#D1D5DB', // Gris clair (meilleur contraste)
    textMuted: '#9CA3AF',      // Gris moyen
    
    // Accents - Bleu principal professionnel
    accent: '#1D4ED8',      // Bleu professionnel (cohérent partout)
    accentLight: '#60A5FA', // Bleu clair (hover, états actifs)
    accentDark: '#1E3A8A',  // Bleu foncé (boutons pressés)
    accentHover: '#2563EB', // Bleu hover
    
    // États sémantiques (une seule couleur d'accent max)
    success: '#10B981',     // Vert (succès, validation)
    successLight: '#34D399',
    error: '#EF4444',       // Rouge (erreur)
    warning: '#F59E0B',     // Orange (avertissement)
    info: '#3B82F6',        // Bleu info (complémentaire)
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.75)', // Plus opaque pour meilleur contraste
    
    // Gris neutres (palette cohérente)
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
  },

  // Espacements (optimisés pour mobile)
  spacing: {
    xs: 4,      // 4px  - Très petit espacement
    sm: 8,      // 8px  - Petit espacement
    md: 12,     // 12px - Espacement moyen (augmenté de 16→12 pour mobile)
    lg: 16,     // 16px - Espacement large (augmenté de 24→16)
    xl: 24,     // 24px - Espacement très large (augmenté de 32→24)
    xxl: 32,    // 32px - Espacement extra large (augmenté de 48→32)
    xxxl: 48,   // 48px - Espacement maximum (pour sections importantes)
  },

  // Rayons de bordure
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 999,
  },

  // Ombres
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },

  // Typographie (contrastes optimisés pour plein soleil)
  typography: {
    fontFamily: 'System', // Poppins/Inter sera chargé via expo-font si disponible
    h1: {
      fontSize: 32,
      fontWeight: '800',
      color: '#F9FAFB', // Meilleur contraste
      letterSpacing: -0.5,
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700',
      color: '#F9FAFB', // Meilleur contraste
      letterSpacing: -0.3,
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '700',
      color: '#F9FAFB', // Meilleur contraste
      letterSpacing: -0.2,
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      color: '#F9FAFB', // Meilleur contraste
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      color: '#F9FAFB', // Meilleur contraste
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      color: '#D1D5DB', // Meilleur contraste que #9CA3AF
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '500',
      color: '#D1D5DB', // Meilleur contraste
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      lineHeight: 16,
    },
  },

  // Boutons (couleurs unifiées)
  buttons: {
    primary: {
      backgroundColor: '#1D4ED8', // Bleu principal unifié
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      ...{
        shadowColor: '#1D4ED8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
      },
    },
    primaryText: {
      color: '#F9FAFB', // Meilleur contraste
      fontSize: 16,
      fontWeight: '700',
    },
    secondary: {
      backgroundColor: '#1A1D22',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#2A2E35',
    },
    secondaryText: {
      color: '#F9FAFB', // Meilleur contraste
      fontSize: 16,
      fontWeight: '600',
    },
    outline: {
      backgroundColor: 'transparent',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#1D4ED8', // Bleu principal unifié
    },
    outlineText: {
      color: '#1D4ED8', // Bleu principal unifié
      fontSize: 16,
      fontWeight: '700',
    },
  },

  // Cartes
  card: {
    backgroundColor: '#1A1D22',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2E35',
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
  },

  // Inputs
  input: {
    backgroundColor: '#252A32',
    borderWidth: 1,
    borderColor: '#2A2E35',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#EAEAEA',
    minHeight: 56,
  },

  // Icônes (couleurs unifiées)
  icon: {
    size: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 32,
      xl: 48,
    },
    color: {
      active: '#1D4ED8',    // Bleu principal unifié
      inactive: '#9CA3AF',  // Gris neutre
      accent: '#60A5FA',    // Bleu clair
    },
    strokeWidth: 2.5, // Épaisseur uniforme Feather
  },

  // Barres
  tabBar: {
    backgroundColor: '#1A1D22',
    borderTopWidth: 1,
    borderTopColor: '#2A2E35',
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  header: {
    backgroundColor: '#1A1D22',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2E35',
    height: 60,
  },
};

export default Theme;

