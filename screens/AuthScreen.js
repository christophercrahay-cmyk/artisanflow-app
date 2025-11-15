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
  const [showPassword, setShowPassword] = useState(false);

  const styles = useMemo(() => getStyles(theme), [theme]);

  const handleAuth = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Champs requis', 'Remplissez tous les champs');
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Mot de passe trop court', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setLoading(true);

      if (isSignUp) {
        // Inscription : workflow propre
        const { user, session, error } = await signUp(email.trim(), password);
        
        if (error) {
          // Gestion des erreurs spécifiques
          if (error.message.includes('already registered') || error.message.includes('User already registered')) {
            Alert.alert(
              'Compte existant',
              'Cet email est déjà utilisé. Essayez de vous connecter.',
              [
                { text: 'OK', onPress: () => setIsSignUp(false) }
              ]
            );
            return;
          }
          throw error;
        }

        if (user && !session) {
          // Email de confirmation requis
          Alert.alert(
            '📧 Vérifiez votre email',
            `Un lien de confirmation a été envoyé à ${  email.trim()  }.\n\nCliquez sur le lien pour confirmer votre compte, puis reconnectez-vous.`,
            [{ text: 'OK' }]
          );
        } else if (session) {
          // Auto-confirm activé, connexion directe
          Alert.alert('✅ Compte créé', 'Bienvenue sur ArtisanFlow !');
          // La session sera détectée automatiquement par App.js
        }
      } else {
        // Connexion : simple et directe
        const { error } = await signIn(email.trim(), password);
        
        if (error) {
          // Gestion des erreurs spécifiques
          if (error.message.includes('Email not confirmed')) {
            Alert.alert(
              'Email non confirmé',
              'Veuillez confirmer votre email avant de vous connecter.\n\nVérifiez votre boîte de réception.',
              [{ text: 'OK' }]
            );
            return;
          }
          
          if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
            Alert.alert(
              'Identifiants incorrects',
              'L\'email ou le mot de passe est incorrect.\n\nVérifiez vos identifiants ou créez un compte.',
              [
                { text: 'OK' },
                { text: 'Créer un compte', onPress: () => setIsSignUp(true), style: 'default' }
              ]
            );
            return;
          }
          
          throw error;
        }
        
        // Connexion réussie - pas besoin d'alert, la session sera détectée automatiquement
        // La navigation se fera automatiquement via App.js qui détecte la session
      }
      
    } catch (err) {
      logger.error('AuthScreen', 'Erreur auth', err);
      
      // Messages d'erreur plus clairs
      let errorMessage = err.message || 'Une erreur est survenue';
      
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'La connexion a expiré. Réessayez.';
      }
      
      Alert.alert('Erreur', errorMessage);
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
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                activeOpacity={0.7}
              >
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
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
  eyeButton: {
    padding: theme.spacing.xs,
  },
});

