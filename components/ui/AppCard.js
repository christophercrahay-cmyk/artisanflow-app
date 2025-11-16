/**
 * AppCard - Carte réutilisable avec thème adaptatif
 * Design System 2.0
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme/theme2';

/**
 * Carte réutilisable avec support premium
 * @param {ReactNode} children - Contenu de la carte
 * @param {boolean} premium - Style premium (fond + bordure)
 * @param {object} style - Styles personnalisés
 */
export const AppCard = ({ children, premium = false, style }) => {
  const theme = useThemeColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: premium
            ? theme.colors.surfacePremium
            : theme.colors.surface,
          borderRadius: theme.radius.lg,
          borderColor: theme.colors.border,
        },
        theme.shadowSoft,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
});

export default AppCard;

