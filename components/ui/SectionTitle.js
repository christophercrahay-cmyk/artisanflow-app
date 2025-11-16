/**
 * SectionTitle - Titre de section avec icône
 * Design System 2.0
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/theme2';

/**
 * Titre de section réutilisable
 * @param {string} title - Titre de la section
 * @param {string} icon - Nom de l'icône Feather
 * @param {string} emoji - Emoji alternatif
 * @param {ReactNode} action - Bouton d'action (optionnel)
 * @param {object} style - Styles personnalisés
 */
export const SectionTitle = ({ title, icon, emoji, action, style }) => {
  const theme = useThemeColors();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.left}>
        {emoji ? (
          <Text style={styles.emoji}>{emoji}</Text>
        ) : icon ? (
          <Feather name={icon} size={20} color={theme.colors.primary} strokeWidth={2.5} />
        ) : null}
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text,
              letterSpacing: theme.letterSpacing.wide,
            },
          ]}
        >
          {title}
        </Text>
      </View>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  action: {
    // Container pour le bouton d'action
  },
});

export default SectionTitle;

