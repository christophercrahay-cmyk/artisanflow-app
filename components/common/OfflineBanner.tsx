import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetworkStatus } from '../../contexts/NetworkStatusContext';
import { useSafeTheme } from '../../theme/useSafeTheme';

/**
 * Bannière "Mode hors ligne"
 * S'affiche en haut de l'écran quand l'app est hors ligne
 */
export default function OfflineBanner() {
  const { isOffline } = useNetworkStatus();
  const theme = useSafeTheme();

  if (!isOffline) {
    return null;
  }

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        📵 Mode hors ligne – vos données seront synchronisées automatiquement.
      </Text>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: '#F59E0B', // Orange doux
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

