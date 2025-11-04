import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeTheme } from '../theme/useSafeTheme';
import { getWeatherIcon } from '../services/weatherService';

/**
 * Composant badge météo pour afficher la température et l'icône
 */
export default function WeatherBadge({ weather, loading, error }) {
  const theme = useSafeTheme();
  const styles = getStyles(theme);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={theme.colors.textSecondary} />
      </View>
    );
  }

  if (error || !weather) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Météo indisponible</Text>
      </View>
    );
  }

  const iconName = getWeatherIcon(weather.icon);

  return (
    <View style={styles.container}>
      <Feather 
        name={iconName} 
        size={18} 
        color={theme.colors.accent} 
        strokeWidth={2}
      />
      <Text style={styles.tempText}>{weather.temp}°C</Text>
      {weather.city && (
        <Text style={styles.cityText}>{weather.city}</Text>
      )}
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: '#1E293B', // Fond premium pour cartes
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border, // #334155
    alignSelf: 'flex-start',
  },
  tempText: {
    ...theme.typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  cityText: {
    ...theme.typography.bodySmall,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  errorText: {
    ...theme.typography.bodySmall,
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});

