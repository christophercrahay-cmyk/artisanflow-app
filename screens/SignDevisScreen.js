/**
 * SignDevisScreen - Écran public de signature électronique d'un devis
 * Accessible via deep link : /sign/:devisId/:token
 * Signature Électronique Simple (SES) conforme juridiquement
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useSafeTheme } from '../theme/useSafeTheme';
import { validateSignatureToken, markDevisAsSigned } from '../services/devis/signatureService';
import logger from '../utils/logger';

export default function SignDevisScreen({ route, navigation }) {
  const { devisId, token } = route.params || {};
  const theme = useSafeTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [devis, setDevis] = useState(null);
  const [error, setError] = useState(null);

  // Formulaire
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [signatureBase64, setSignatureBase64] = useState(null);

  const webViewRef = useRef(null);

  useEffect(() => {
    validateToken();
  }, [devisId, token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!devisId || !token) {
        setError('Lien de signature invalide');
        setLoading(false);
        return;
      }

      const result = await validateSignatureToken(devisId, token);

      if (!result.valid) {
        setError(result.error || 'Lien de signature invalide ou expiré');
        setDevis(result.devis); // Garder les infos du devis même si invalide
        setLoading(false);
        return;
      }

      setDevis(result.devis);
      
      // Pré-remplir les champs si le devis a déjà des infos
      if (result.devis.signed_by_name) {
        setSignerName(result.devis.signed_by_name);
      }
      if (result.devis.signed_by_email) {
        setSignerEmail(result.devis.signed_by_email);
      }

      setLoading(false);
    } catch (err) {
      logger.error('SignDevisScreen', 'Erreur validation token', err);
      setError('Erreur lors de la validation du lien');
      setLoading(false);
    }
  };

  // HTML pour le canvas de signature
  const signatureHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #fff;
          touch-action: none;
        }
        #signatureCanvas {
          border: 2px dashed #ccc;
          display: block;
          touch-action: none;
        }
        button {
          margin-top: 10px;
          padding: 8px 16px;
          background: #1D4ED8;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <canvas id="signatureCanvas" width="400" height="150"></canvas>
      <button onclick="clearSignature()">Effacer</button>
      <script>
        const canvas = document.getElementById('signatureCanvas');
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        function getEventPos(e) {
          const rect = canvas.getBoundingClientRect();
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
          if (e.touches && e.touches.length > 0) {
            return {
              x: (e.touches[0].clientX - rect.left) * scaleX,
              y: (e.touches[0].clientY - rect.top) * scaleY
            };
          }
          return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
          };
        }

        function startDrawing(e) {
          e.preventDefault();
          isDrawing = true;
          const pos = getEventPos(e);
          lastX = pos.x;
          lastY = pos.y;
        }

        function draw(e) {
          if (!isDrawing) return;
          e.preventDefault();
          const pos = getEventPos(e);
          ctx.beginPath();
          ctx.moveTo(lastX, lastY);
          ctx.lineTo(pos.x, pos.y);
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.stroke();
          lastX = pos.x;
          lastY = pos.y;
        }

        function stopDrawing() {
          if (isDrawing) {
            isDrawing = false;
            const dataURL = canvas.toDataURL('image/png');
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'signature', data: dataURL }));
          }
        }

        function clearSignature() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'cleared' }));
        }

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);
      </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'signature') {
        setSignatureBase64(data.data);
      } else if (data.type === 'cleared') {
        setSignatureBase64(null);
      }
    } catch (err) {
      logger.error('SignDevisScreen', 'Erreur parsing WebView message', err);
    }
  };

  const handleClearSignature = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('clearSignature();');
    }
    setSignatureBase64(null);
  };

  const handleSign = async () => {
    // Validation
    if (!signerName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre nom complet');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signerEmail.trim())) {
      Alert.alert('Erreur', 'Veuillez saisir une adresse email valide');
      return;
    }

    if (!accepted) {
      Alert.alert('Erreur', 'Veuillez accepter les conditions');
      return;
    }

    if (!signatureBase64) {
      Alert.alert('Erreur', 'Veuillez signer le document');
      return;
    }

    try {
      setValidating(true);

      // Enregistrer la signature
      await markDevisAsSigned({
        devisId,
        signatureToken: token,
        signatureImageBase64: signatureBase64,
        signerName: signerName.trim(),
        signerEmail: signerEmail.trim().toLowerCase(),
        signerIp: undefined, // TODO: Récupérer l'IP si nécessaire
      });

      // Afficher l'écran de confirmation
      navigation.replace('SignDevisSuccess', { devisId });
    } catch (err) {
      logger.error('SignDevisScreen', 'Erreur signature', err);
      Alert.alert('Erreur', err.message || 'Impossible de finaliser la signature');
    } finally {
      setValidating(false);
    }
  };

  const canSign = signerName.trim() && signerEmail.trim() && accepted && signatureBase64;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !devis) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Feather name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Lien invalide</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Signature du devis</Text>
            {devis && (
              <View style={styles.devisInfo}>
                <Text style={styles.companyName}>
                  {devis.projects?.clients?.name || 'Client'}
                </Text>
                <Text style={styles.devisNumber}>Devis {devis.numero}</Text>
                <Text style={styles.devisAmount}>
                  Montant TTC : {Number(devis.montant_ttc || 0).toFixed(2)} €
                </Text>
              </View>
            )}
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet *</Text>
              <TextInput
                style={styles.input}
                value={signerName}
                onChangeText={setSignerName}
                placeholder="Votre nom complet"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={signerEmail}
                onChangeText={setSignerEmail}
                placeholder="votre@email.com"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Checkbox */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAccepted(!accepted)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
                {accepted && <Feather name="check" size={16} color="#fff" />}
              </View>
              <Text style={styles.checkboxLabel}>
                Je reconnais avoir lu et accepté le devis ci-dessus.
              </Text>
            </TouchableOpacity>

            {/* Zone de signature */}
            <View style={styles.signatureSection}>
              <Text style={styles.label}>Signez ici *</Text>
              <View style={styles.signatureBox}>
                <WebView
                  ref={webViewRef}
                  source={{ html: signatureHTML }}
                  style={styles.webView}
                  onMessage={handleWebViewMessage}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
              {signatureBase64 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearSignature}
                >
                  <Feather name="x" size={16} color={theme.colors.text} />
                  <Text style={styles.clearButtonText}>Effacer la signature</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Bouton de signature */}
            <TouchableOpacity
              style={[styles.signButton, !canSign && styles.signButtonDisabled]}
              onPress={handleSign}
              disabled={!canSign || validating}
            >
              {validating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Feather name="pen-tool" size={20} color="#fff" />
                  <Text style={styles.signButtonText}>Signer le devis</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    errorTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.error,
      marginTop: 16,
      marginBottom: 8,
    },
    errorText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 16,
    },
    devisInfo: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    companyName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    devisNumber: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    devisAmount: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.accent,
    },
    form: {
      gap: 20,
    },
    inputGroup: {
      gap: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.colors.text,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
    },
    checkboxChecked: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    checkboxLabel: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
    },
    signatureSection: {
      gap: 8,
    },
    signatureBox: {
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: 8,
      overflow: 'hidden',
      minHeight: 200,
    },
    webView: {
      backgroundColor: 'transparent',
      width: '100%',
      height: 200,
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-end',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    clearButtonText: {
      fontSize: 12,
      color: theme.colors.text,
    },
    signButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: theme.colors.accent,
      paddingVertical: 16,
      borderRadius: 8,
      marginTop: 8,
    },
    signButtonDisabled: {
      opacity: 0.5,
    },
    signButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
    },
    button: {
      backgroundColor: theme.colors.accent,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      marginTop: 16,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
    },
  });
}
