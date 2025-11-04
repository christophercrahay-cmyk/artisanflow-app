import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import logger from '../utils/logger';
import { captureException } from '../utils/sentryInit';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Logger l'erreur
    logger.error('ErrorBoundary', 'Erreur React catchée', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
    });

    // Mettre à jour le state avec les détails
    this.setState({
      error,
      errorInfo,
    });

    // Envoyer à Sentry
    captureException(error, {
      componentStack: errorInfo.componentStack,
      component: 'ErrorBoundary',
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const isDev = __DEV__;

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Feather name="alert-triangle" size={64} color="#DC2626" />
            
            <Text style={styles.title}>Une erreur s'est produite</Text>
            
            <Text style={styles.message}>
              {isDev 
                ? "L'application a rencontré une erreur. Détails ci-dessous :"
                : "Quelque chose s'est mal passé. Veuillez réessayer."
              }
            </Text>

            {isDev && this.state.error && (
              <ScrollView style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Erreur :</Text>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                
                {this.state.errorInfo && (
                  <>
                    <Text style={[styles.errorTitle, { marginTop: 16 }]}>Stack :</Text>
                    <Text style={styles.errorText}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  </>
                )}
              </ScrollView>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={this.resetError}
                activeOpacity={0.8}
              >
                <Feather name="refresh-cw" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Réessayer</Text>
              </TouchableOpacity>

              {isDev && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    console.log('Error details:', this.state.error);
                    console.log('Error info:', this.state.errorInfo);
                  }}
                  activeOpacity={0.8}
                >
                  <Feather name="terminal" size={20} color="#9CA3AF" />
                  <Text style={styles.secondaryButtonText}>Log Console</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    maxWidth: 500,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EAEAEA',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorDetails: {
    backgroundColor: '#1A1D22',
    borderRadius: 12,
    padding: 16,
    maxHeight: 300,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#D1D5DB',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#1D4ED8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#1A1D22',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2E35',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorBoundary;

