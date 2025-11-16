import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useSafeTheme } from '../../theme/useSafeTheme';

/**
 * Skeleton Card générique avec animation de pulse
 */
export default function SkeletonCard({ 
  height = 120, 
  marginBottom = 12,
  children 
}) {
  const theme = useSafeTheme();
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const styles = getStyles(theme, height, marginBottom);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      {children}
    </Animated.View>
  );
}

/**
 * Skeleton pour une ligne de texte
 */
export function SkeletonLine({ width = '100%', height = 16, marginBottom = 8 }) {
  const theme = useSafeTheme();
  
  return (
    <View
      style={{
        width,
        height,
        marginBottom,
        backgroundColor: theme.colors.border,
        borderRadius: 4,
      }}
    />
  );
}

/**
 * Skeleton pour un cercle (avatar, icône)
 */
export function SkeletonCircle({ size = 40, marginRight = 12 }) {
  const theme = useSafeTheme();
  
  return (
    <View
      style={{
        width: size,
        height: size,
        marginRight,
        backgroundColor: theme.colors.border,
        borderRadius: size / 2,
      }}
    />
  );
}

const getStyles = (theme, height, marginBottom) => StyleSheet.create({
  container: {
    height,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});

