import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { signIn, signUp } from '../utils/auth';
import logger from '../utils/logger';
import { useSafeTheme } from '../theme/useSafeTheme';
import { Feather } from '@expo/vector-icons';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const theme = useSafeTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const styles = useMemo(() => getStyles(theme), [theme]);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Champs requis', 'Remplissez tous les champs');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Mot de passe trop court', 'Minimum 6 caractères');
      return;
    }

    try {
      setLoading(true);

      if (isSignUp) {
        const { user, session } = await signUp(email.trim(), password);
        if (user && !session) {
          Alert.alert('Vérifiez votre email', 'Un lien de confirmation a été envoyé');
        } else if (session) {
          Alert.alert('✅ Compte créé', 'Vous êtes connecté !');
        }
      } else {
        await signIn(email.trim(), password);
        Alert.alert('✅ Connecté', 'Bienvenue !');
      }
      
      // La session sera détectée par le guard global
    } catch (err) {
      console.error('Erreur auth:', err);
      Alert.alert('Erreur', err.message || 'Opération impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          {/* Logo ArtisanFlow */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/artisanflow-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>ArtisanFlow</Text>
            <Text style={styles.tagline}>Simplifiez vos chantiers.</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.title}>
              {isSignUp ? 'Créer un compte' : 'Connexion'}
            </Text>

            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={theme.colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor={theme.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.text} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isSignUp ? 'Créer' : 'Se connecter'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                setIsSignUp(!isSignUp);
                setEmail('');
                setPassword('');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.switchButtonText}>
                {isSignUp
                  ? 'Déjà un compte ? Se connecter'
                  : 'Pas de compte ? Créer un compte'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logo: {
    width: 180,
    height: 120,
    marginBottom: theme.spacing.md,
  },
  appName: {
    ...theme.typography.h1,
    marginTop: theme.spacing.sm,
  },
  tagline: {
    ...theme.typography.bodySecondary,
    marginTop: theme.spacing.xs,
    fontSize: 16,
    color: theme.colors.textSecondary || '#9CA3AF',
  },
  form: {
    gap: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
    minHeight: 56,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
  },
  primaryButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 18,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    ...theme.typography.h4,
    color: theme.colors.text,
  },
  switchButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  switchButtonText: {
    ...theme.typography.bodySecondary,
    color: theme.colors.accentLight,
  },
});

