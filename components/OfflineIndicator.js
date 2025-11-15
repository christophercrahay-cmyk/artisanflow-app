import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeTheme } from '../theme/useSafeTheme';
import { Feather } from '@expo/vector-icons';
import { useNetworkStatus } from '../utils/offlineManager';

/**
 * Indicateur visuel du statut réseau
 * S'affiche en haut de l'écran quand hors ligne
 */
export default function OfflineIndicator() {
  const theme = useSafeTheme();
  const isOnline = useNetworkStatus();
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  React.useEffect(() => {
    if (!isOnline) {
      // Afficher l'indicateur
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      // Masquer l'indicateur
      Animated.spring(slideAnim, {
        toValue: -100,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }
  }, [isOnline]);

  if (isOnline) {return null;}

  const styles = getStyles(theme);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Feather name="wifi-off" size={18} color={theme.colors.text} />
      <Text style={styles.text}>Mode hors ligne - Synchronisation en attente</Text>
    </Animated.View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.warning,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    zIndex: 1000,
    ...theme.shadows.md,
  },
  text: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '600',
  },
});

