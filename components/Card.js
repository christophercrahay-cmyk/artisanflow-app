import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeTheme } from '../theme/useSafeTheme';

/**
 * Carte réutilisable pour afficher du contenu
 */
export default function Card({ children, style, onPress }) {
  const theme = useSafeTheme();
  const Component = onPress ? require('react-native').TouchableOpacity : View;

  return (
    <Component
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Component>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
});

