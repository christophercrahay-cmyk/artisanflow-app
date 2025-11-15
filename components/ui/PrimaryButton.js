/**
 * PrimaryButton - Bouton principal avec animations + haptic feedback
 * Design System 2.0
 */

import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
// import * as Haptics from 'expo-haptics'; // Désactivé temporairement
import { useThemeColors } from '../../theme/theme2';

/**
 * Bouton principal avec micro-animations et haptic feedback
 * @param {string} title - Texte du bouton
 * @param {function} onPress - Callback au clic
 * @param {string} icon - Emoji ou icône (optionnel)
 * @param {boolean} disabled - Désactivé
 * @param {boolean} loading - État de chargement
 * @param {object} style - Styles personnalisés
 */
export const PrimaryButton = ({ 
  title, 
  onPress, 
  icon, 
  disabled = false,
  loading = false,
  style,
}) => {
  const theme = useThemeColors();

  const handlePress = () => {
    if (!disabled && !loading) {
      // Haptic feedback premium (désactivé temporairement)
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress?.();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled || loading
            ? theme.colors.primarySoft
            : theme.colors.primary,
          borderRadius: theme.radius.round,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          opacity: pressed ? 0.9 : 1,
          shadowColor: theme.colors.primary,
        },
        theme.shadowSoft,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.primaryText} size="small" />
      ) : (
        <>
          {icon && (
            <Text style={[styles.icon, { color: theme.colors.primaryText }]}>
              {icon}
            </Text>
          )}
          <Text
            style={[
              styles.text,
              {
                color: theme.colors.primaryText,
              },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
  icon: {
    fontSize: 16,
  },
});

export default PrimaryButton;

