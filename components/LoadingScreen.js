import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useSafeTheme } from '../theme/useSafeTheme';
import { Feather } from '@expo/vector-icons';

/**
 * Écran de chargement avec animation pulse
 * Affiche le logo/text et un message de chargement
 */
export default function LoadingScreen({ message = 'Chargement du chantier...' }) {
  const theme = useSafeTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const styles = useMemo(() => getStyles(theme), [theme]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    
    animation.start();

    return () => {
      animation.stop();
    };
  }, [scale]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale }] }]}>
        <Feather 
          name="tool" 
          size={64} 
          color={theme.colors.accent} 
          strokeWidth={2}
        />
        <Text style={styles.logoText}>ArtisanFlow</Text>
      </Animated.View>
      
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  logoText: {
    ...theme.typography.h1,
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    letterSpacing: -0.5,
  },
  message: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});

