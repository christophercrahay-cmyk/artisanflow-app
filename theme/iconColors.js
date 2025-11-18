/**
 * ICON_COLORS - Standardisation des couleurs d'icônes ArtisanFlow
 * 
 * ⚠️ DÉPRÉCIÉ : Utiliser maintenant COLORS depuis theme/colors.ts
 * Ce fichier est conservé pour la rétrocompatibilité.
 * 
 * Toutes les icônes de l'app doivent utiliser COLORS depuis theme/colors.ts
 * pour garantir une cohérence visuelle parfaite sur fond dark.
 */

import { COLORS } from './colors';

// Réexport pour compatibilité avec l'ancien code
export const ICON_COLORS = {
  // Icônes principales (par défaut)
  primary: COLORS.iconPrimary,
  
  // Icônes secondaires (navigation, chevrons, captions)
  secondary: COLORS.iconSecondary,
  
  // Icônes spécifiques
  folder: COLORS.iconFolder,
  active: COLORS.success,
  danger: COLORS.danger,
  archive: COLORS.warning,
  ai: COLORS.ai,
  
  // Couleurs spéciales
  success: COLORS.success,
  warning: COLORS.warning,
  info: COLORS.info,
};

/**
 * Règles d'utilisation :
 * 
 * - Toutes les icônes actuellement en "#000", "black", "#1A1A1A" → ICON_COLORS.primary
 * - Icônes de navigation / chevrons → ICON_COLORS.secondary
 * - Icône dossier chantier → ICON_COLORS.folder
 * - Icônes IA (éclair, robot, génération…) → ICON_COLORS.ai
 * - Icône statut "Actif" → ICON_COLORS.active (déjà géré dans les badges)
 * - Icônes audio/photo/note dans les sections → ICON_COLORS.primary
 * - Icône archive dans les modales → ICON_COLORS.archive
 * - Icône supprimer → ICON_COLORS.danger
 */

