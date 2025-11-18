import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeTheme } from '../theme/useSafeTheme';
import { supabase } from '../supabaseClient';

/**
 * Composant header premium pour la page d'accueil
 * Affiche : salutation uniquement
 */
export default function HomeHeader() {
  const theme = useSafeTheme();
  const [userName, setUserName] = useState<string | null>(null);

  // Charger le prénom depuis les paramètres (brand_settings)
  const loadFirstName = React.useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserName(null);
        return;
      }
      
      // Récupérer le prénom depuis brand_settings
      const { data: settings, error } = await supabase
        .from('brand_settings')
        .select('first_name')
        .eq('user_id', user.id)
        .maybeSingle(); // Utiliser maybeSingle() pour gérer l'absence de données
      
      if (error) {
        // Si la colonne n'existe pas encore, l'erreur sera ignorée
        if (error.code !== 'PGRST116') {
          console.warn('[HomeHeader] Erreur chargement prénom:', error.message);
        }
        setUserName(null);
        return;
      }
      
      if (settings?.first_name) {
        setUserName(settings.first_name.trim());
      } else {
        setUserName(null);
      }
    } catch (err) {
      console.error('[HomeHeader] Exception chargement prénom:', err);
      setUserName(null);
    }
  }, []);

  // Charger au montage
  useEffect(() => {
    loadFirstName();
  }, [loadFirstName]);

  // Recharger quand l'écran devient visible (après modification des paramètres)
  useFocusEffect(
    React.useCallback(() => {
      loadFirstName();
    }, [loadFirstName])
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const styles = getStyles(theme);

  // Construire le message de salutation avec le nom
  const greetingText = userName 
    ? `${getGreeting()}, ${userName}`
    : getGreeting();

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{greetingText}</Text>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
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
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '400',
  },
});

