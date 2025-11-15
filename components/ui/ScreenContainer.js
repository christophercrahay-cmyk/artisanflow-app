/**
 * ScreenContainer - Container d'écran avec animation d'ouverture
 * Design System 2.0
 */

import React, { useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Animated, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../../theme/theme2';

/**
 * Container d'écran avec animation d'ouverture (signature ArtisanFlow)
 * @param {ReactNode} children - Contenu de l'écran
 * @param {boolean} scrollable - ScrollView ou View simple
 * @param {object} style - Styles personnalisés
 * @param {object} contentStyle - Styles du contenu
 * @param {boolean} refreshing - État de rafraîchissement
 * @param {function} onRefresh - Fonction appelée lors du pull-to-refresh
 */
export const ScreenContainer = ({ 
  children, 
  scrollable = false, 
  style,
  contentStyle,
  refreshing = false,
  onRefresh,
}) => {
  const theme = useThemeColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    // Animation d'ouverture d'écran (signature ArtisanFlow)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const Container = scrollable ? ScrollView : View;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }, style]}
      edges={['top']}
    >
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}
      >
        <Container
          style={styles.container}
          contentContainerStyle={scrollable ? contentStyle : undefined}
          showsVerticalScrollIndicator={false}
          refreshControl={
            scrollable && onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            ) : undefined
          }
        >
          {children}
        </Container>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

export default ScreenContainer;

