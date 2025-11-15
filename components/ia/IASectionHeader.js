/**
 * IASectionHeader - Header pour sections IA
 * Design System 2.0
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme/theme2';

/**
 * Header pour sections IA avec style premium
 * @param {string} title - Titre principal
 * @param {string} subtitle - Sous-titre (optionnel)
 * @param {string} icon - Emoji ou icône (optionnel)
 */
export const IASectionHeader = ({ title, subtitle, icon = '🤖' }) => {
  const theme = useThemeColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.primarySoft,
          borderRadius: theme.radius.lg,
          borderColor: theme.colors.primary,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.primary,
          },
        ]}
      >
        {icon} ASSISTANT IA
      </Text>
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.text,
          },
        ]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.textMuted,
            },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
  },
});

export default IASectionHeader;

