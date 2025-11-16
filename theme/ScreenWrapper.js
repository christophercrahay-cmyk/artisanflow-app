import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeTheme } from './useSafeTheme';

/**
 * Wrapper réutilisable pour tous les écrans
 * Applique automatiquement le thème sombre + safe areas
 */
export default function ScreenWrapper({ children, style }) {
  const insets = useSafeAreaInsets();
  const theme = useSafeTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }, style]} edges={['top']}>
      {children}
      <View style={{ height: insets.bottom }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

