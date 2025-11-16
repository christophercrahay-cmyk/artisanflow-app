import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

/**
 * Error Boundary pour capturer les erreurs React
 * et afficher un écran de fallback élégant
 */
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
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔥 ErrorBoundary caught:', error);
    console.error('📍 Component stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Envoyer à Sentry quand configuré
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack,
    //     },
    //   },
    // });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Feather name="alert-triangle" size={64} color="#EF4444" />
          
          <Text style={styles.title}>Oups ! Une erreur est survenue</Text>
          
          <Text style={styles.message}>
            {this.state.error?.message || 'Erreur inconnue'}
          </Text>

          {__DEV__ && this.state.errorInfo && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Info (dev only):</Text>
              <Text style={styles.debugText} numberOfLines={10}>
                {this.state.errorInfo.componentStack}
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={this.handleReset}
            activeOpacity={0.7}
          >
            <Feather name="refresh-cw" size={20} color="#fff" />
            <Text style={styles.buttonText}>Réessayer</Text>
          </TouchableOpacity>

          {__DEV__ && (
            <Text style={styles.helpText}>
              💡 En développement : vérifiez la console pour plus de détails
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#1A1D22',
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
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  debugContainer: {
    backgroundColor: '#0A0A0A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: '#333',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FBBF24',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#D1D5DB',
    fontFamily: 'monospace',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  helpText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ErrorBoundary;
