import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { useSafeTheme } from '../theme/useSafeTheme';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

/**
 * Écran de démarrage animé pour ArtisanFlow
 * Animation élégante au lancement de l'application
 */
export default function SplashScreen({ onFinish }) {
  const theme = useSafeTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  // Animations
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Séquence d'animations
    Animated.sequence([
      // 1. Logo apparaît (fade + scale)
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      
      // 2. Texte apparaît (fade + slide up)
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 500,
          delay: 200,
          useNativeDriver: true,
        }),
      ]),
      
      // 3. Barre de progression
      Animated.timing(progressWidth, {
        toValue: width * 0.6, // 60% de la largeur
        duration: 1200,
        useNativeDriver: false,
      }),
      
      // 4. Pause légère
      Animated.delay(300),
      
      // 5. Fade out complet
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animation terminée → afficher l'app
      if (onFinish) {onFinish();}
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      {/* Logo avec animation */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={styles.iconCircle}>
          <Feather 
            name="tool" 
            size={56} 
            color={theme.colors.accent} 
            strokeWidth={2.5}
          />
        </View>
      </Animated.View>

      {/* Texte "ArtisanFlow" avec animation */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <Text style={styles.title}>ArtisanFlow</Text>
        <Text style={styles.subtitle}>Gestion de chantiers pro</Text>
      </Animated.View>

      {/* Barre de progression */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressWidth,
            },
          ]}
        />
      </View>
    </Animated.View>
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
    marginBottom: theme.spacing.xxl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${theme.colors.accent  }15`, // 15% opacity
    borderWidth: 2,
    borderColor: `${theme.colors.accent  }30`,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.h1,
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -1,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  progressContainer: {
    width: width * 0.6,
    height: 3,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: theme.spacing.xl,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 2,
  },
});

