// ============================================
// VOICE RECORDER SIMPLE
// ============================================
// Version simplifiée de VoiceRecorder
// Pour répondre vocalement aux questions IA
// ============================================

import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Feather } from '@expo/vector-icons';
import { transcribeAudio } from '../services/transcriptionService';
import { useSafeTheme } from '../theme/useSafeTheme';

export default function VoiceRecorderSimple({ onTranscriptionComplete, onCancel }) {
  const theme = useSafeTheme();
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordUri, setRecordUri] = useState(null);
  const [transcription, setTranscription] = useState('');

  const styles = getStyles(theme);

  // Démarrer l'enregistrement
  const startRecording = async () => {
    try {
      console.log('🎤 Demande permission micro...');
      const { status } = await Audio.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Autorisez le micro pour enregistrer');
        return;
      }

      console.log('🎤 Configuration audio...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      console.log('🎤 Démarrage enregistrement...');
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      
      setRecording(recording);
      setIsRecording(true);
      setRecordUri(null);
      setTranscription('');

      console.log('✅ Enregistrement démarré');

      // ✅ LIMITE : Arrêt automatique après 5 minutes (sécurité Whisper : max 25MB)
      const MAX_DURATION_MS = 5 * 60 * 1000; // 5 minutes
      setTimeout(async () => {
        if (recording && isRecording) {
          console.log('⏱️ Limite de 5 minutes atteinte, arrêt automatique');
          await stopRecording();
          Alert.alert(
            'Durée maximale atteinte',
            'Enregistrement limité à 5 minutes pour garantir la qualité de la transcription.',
            [{ text: 'OK' }]
          );
        }
      }, MAX_DURATION_MS);
    } catch (error) {
      console.error('❌ Erreur démarrage:', error);
      Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement');
    }
  };

  // Arrêter l'enregistrement
  const stopRecording = async () => {
    try {
      if (!recording) {return;}

      console.log('⏹️ Arrêt enregistrement...');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      const status = await recording.getStatusAsync();
      const duration = status?.durationMillis || 0;
      const durationSeconds = Math.round(duration / 1000);

      console.log(`✅ Enregistrement arrêté - Durée: ${durationSeconds}s`);

      // Vérifier durée minimale
      if (duration < 1000) {
        Alert.alert('Trop court', 'Enregistrez au moins 1 seconde');
        setRecording(null);
        setIsRecording(false);
        return;
      }

      setRecording(null);
      setIsRecording(false);
      setRecordUri(uri);

      // Transcrire automatiquement
      await transcribeRecording(uri);

    } catch (error) {
      console.error('❌ Erreur arrêt:', error);
      Alert.alert('Erreur', 'Impossible d\'arrêter l\'enregistrement');
    }
  };

  // Transcrire l'audio
  const transcribeRecording = async (uri) => {
    try {
      setIsTranscribing(true);
      console.log('🤖 Transcription Whisper...');

      const text = await transcribeAudio(uri);
      
      console.log('✅ Transcription:', text);
      setTranscription(text);

    } catch (error) {
      console.error('❌ Erreur transcription:', error);
      Alert.alert('Erreur', 'Impossible de transcrire l\'audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Valider la transcription
  const handleValidate = () => {
    if (!transcription) {
      Alert.alert('Erreur', 'Aucune transcription disponible');
      return;
    }
    onTranscriptionComplete(transcription);
  };

  // Réenregistrer
  const handleRetry = () => {
    setRecordUri(null);
    setTranscription('');
    startRecording();
  };

  return (
    <View style={styles.container}>
      {/* État : Prêt à enregistrer */}
      {!isRecording && !recordUri && !isTranscribing && (
        <TouchableOpacity
          style={[styles.button, styles.buttonRecord]}
          onPress={startRecording}
        >
          <Feather name="mic" size={32} color="#fff" />
          <Text style={styles.buttonText}>Appuyez pour répondre</Text>
        </TouchableOpacity>
      )}

      {/* État : En cours d'enregistrement */}
      {isRecording && (
        <TouchableOpacity
          style={[styles.button, styles.buttonRecording]}
          onPress={stopRecording}
        >
          <View style={styles.recordingIndicator} />
          <Text style={styles.buttonText}>Enregistrement... (appuyez pour arrêter)</Text>
        </TouchableOpacity>
      )}

      {/* État : Transcription en cours */}
      {isTranscribing && (
        <View style={styles.transcribingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.transcribingText}>Transcription en cours...</Text>
        </View>
      )}

      {/* État : Transcription terminée */}
      {transcription && !isTranscribing && (
        <View style={styles.resultContainer}>
          <View style={styles.transcriptionCard}>
            <Feather name="check-circle" size={20} color={theme.colors.success} />
            <Text style={styles.transcriptionText}>{transcription}</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={handleRetry}
            >
              <Feather name="rotate-ccw" size={18} color={theme.colors.text} />
              <Text style={styles.actionButtonTextSecondary}>Réenregistrer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={handleValidate}
            >
              <Feather name="check" size={18} color="#fff" />
              <Text style={styles.actionButtonTextPrimary}>Valider</Text>
            </TouchableOpacity>
          </View>

          {onCancel && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      padding: theme.spacing.lg,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      gap: theme.spacing.md,
    },
    buttonRecord: {
      backgroundColor: '#EF4444',
      ...theme.shadows.lg,
    },
    buttonRecording: {
      backgroundColor: '#DC2626',
      ...theme.shadows.lg,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
    recordingIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#fff',
    },
    transcribingContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    },
    transcribingText: {
      marginTop: theme.spacing.md,
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    resultContainer: {
      gap: theme.spacing.md,
    },
    transcriptionCard: {
      flexDirection: 'row',
      backgroundColor: `${theme.colors.success  }20`,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.sm,
    },
    transcriptionText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.sm,
    },
    actionButtonSecondary: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    actionButtonTextSecondary: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    actionButtonPrimary: {
      backgroundColor: theme.colors.success,
    },
    actionButtonTextPrimary: {
      fontSize: 14,
      fontWeight: '700',
      color: '#fff',
    },
    cancelButton: {
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    cancelButtonText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
  });

