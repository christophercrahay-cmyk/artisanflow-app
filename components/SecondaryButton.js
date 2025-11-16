import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeTheme } from '../theme/useSafeTheme';

/**
 * Bouton secondaire (gris) pour actions secondaires
 */
export default function SecondaryButton({ 
  title, 
  onPress, 
  disabled = false, 
  loading = false,
  style,
  textStyle,
}) {
  const theme = useSafeTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: disabled || loading ? 0.6 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.text} size="small" />
      ) : (
        <Text style={[styles.text, { color: theme.colors.text }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 56,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

