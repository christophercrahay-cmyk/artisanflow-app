/**
 * StatusBadge - Badge de statut avec couleurs sémantiques
 * Design System 2.0
 */

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme/theme2';

/**
 * Obtenir les couleurs selon le type de badge
 */
const getColor = (theme, type) => {
  switch (type) {
    case 'success':
      return { bg: 'rgba(22, 163, 74, 0.15)', fg: '#16A34A' }; // Vert vif
    case 'warning':
      return { bg: 'rgba(245, 158, 11, 0.15)', fg: '#F59E0B' }; // Orange vif
    case 'danger':
      return { bg: 'rgba(220, 38, 38, 0.18)', fg: '#DC2626' }; // Rouge vif
    case 'info':
      return { bg: 'rgba(37, 99, 235, 0.15)', fg: '#3B82F6' }; // Bleu vif
    default:
      return { bg: 'rgba(148, 163, 184, 0.15)', fg: '#94A3B8' }; // Gris clair visible
  }
};

/**
 * Badge de statut réutilisable
 * @param {string} label - Texte du badge
 * @param {string} type - Type : 'success', 'warning', 'danger', 'info', 'default'
 * @param {string} icon - Emoji ou icône (optionnel)
 * @param {object} style - Styles personnalisés
 */
export const StatusBadge = ({ label, type = 'default', icon, style }) => {
  const theme = useThemeColors();
  const { bg, fg } = getColor(theme, type);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderRadius: theme.radius.round,
        },
        style,
      ]}
    >
      {icon && (
        <Text style={[styles.icon, { color: fg }]}>
          {icon}
        </Text>
      )}
      <Text
        style={[
          styles.text,
          {
            color: fg,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  icon: {
    fontSize: 12,
  },
});

export default StatusBadge;

