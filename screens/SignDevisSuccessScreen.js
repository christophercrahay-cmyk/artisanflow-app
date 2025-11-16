/**
 * SignDevisSuccessScreen - Écran de confirmation après signature réussie
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useSafeTheme } from '../theme/useSafeTheme';

export default function SignDevisSuccessScreen({ route, navigation }) {
  const { devisId } = route.params || {};
  const theme = useSafeTheme();
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="check-circle" size={64} color={theme.colors.success || '#10b981'} />
        </View>
        <Text style={styles.title}>Merci !</Text>
        <Text style={styles.message}>
          Votre devis a été signé avec succès.
        </Text>
        <Text style={styles.subMessage}>
          L'artisan recevra une notification et une copie PDF signée du devis.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={styles.buttonText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function getStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    iconContainer: {
      marginBottom: 24,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    message: {
      fontSize: 18,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    subMessage: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 20,
    },
    button: {
      backgroundColor: theme.colors.accent,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 8,
      minWidth: 200,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
      textAlign: 'center',
    },
  });
}

