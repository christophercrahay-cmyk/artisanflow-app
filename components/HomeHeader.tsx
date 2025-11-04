import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeTheme } from '../theme/useSafeTheme';
// import { useWeather } from '../hooks/useWeather'; // Désactivé jusqu'à la build native
import WeatherBadge from './WeatherBadge';

/**
 * Composant header premium pour la page d'accueil
 * Affiche : salutation, heure en temps réel (HH:mm:ss), date longue FR
 * Avec horloge numérique premium animée
 */
export default function HomeHeader() {
  const theme = useSafeTheme();
  const [now, setNow] = useState(new Date());
  
  // Désactiver temporairement la météo jusqu'à la build native
  // const { weather, loading, error } = useWeather();
  const weather = null;
  const loading = false;
  const error = 'Module natif non disponible';

  // Animation pulse pour l'icône (boucle continue)
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Animation fade-in pour le bloc timer (une seule fois)
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Timer : mise à jour toutes les secondes (logique métier conservée)
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    // Cleanup pour éviter les fuites mémoire
    return () => clearInterval(interval);
  }, []);

  // Animation pulse continue de l'icône (très subtile)
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  // Fade-in du bloc timer à l'affichage (une seule fois)
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const getGreeting = () => {
    const hour = now.getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDateLong = (date: Date): string => {
    const formatted = date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    // Première lettre en majuscule
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Couleur dynamique selon l'heure (06:00-18:00 = bleu clair, sinon bleu profond)
  const getTimeColor = (): string => {
    const hour = now.getHours();
    if (hour >= 6 && hour < 18) {
      return '#3B82F6'; // Bleu clair (jour)
    }
    return '#2563EB'; // Bleu profond/électrique (soir/nuit)
  };

  const timeColor = getTimeColor();
  const styles = getStyles(theme, timeColor);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{getGreeting()}</Text>
      
      {/* Ligne heure avec icône - Animation fade-in + pulse */}
      <Animated.View 
        style={[
          styles.timeRow,
          { opacity: fadeAnim }
        ]}
      >
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        >
          <Feather 
            name="clock" 
            size={20} 
            color={timeColor} 
            strokeWidth={2.5} 
          />
        </Animated.View>
        <Text style={styles.timeText}>{formatTime(now)}</Text>
      </Animated.View>

      {/* Date longue */}
      <Text style={styles.dateText}>{formatDateLong(now)}</Text>
      
      {/* Badge météo */}
      <View style={styles.weatherContainer}>
        <WeatherBadge weather={weather} loading={loading} error={error} />
      </View>
    </View>
  );
}

const getStyles = (theme: any, timeColor: string) => StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    ...theme.typography.h1,
    fontSize: 30,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.5,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    marginLeft: 0, // Alignement propre
  },
  timeText: {
    fontSize: 22, // Plus grand que le texte normal
    fontWeight: '700', // Bold pour effet "digit"
    color: timeColor, // Couleur dynamique selon l'heure
    letterSpacing: 2, // Espacement pour effet "digit"
    fontFamily: 'monospace', // Police monospace pour rendu numérique
    marginLeft: theme.spacing.sm, // Petit espace entre icône et texte
    lineHeight: 28, // Hauteur de ligne pour alignement vertical
  },
  dateText: {
    ...theme.typography.bodySmall,
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  weatherContainer: {
    marginTop: theme.spacing.md,
  },
});

