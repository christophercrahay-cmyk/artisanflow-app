/**
 * TranscriptionFeedback - Feedback visuel durant transcription Whisper
 * Affiche progress bar + statut pour rassurer l'utilisateur
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme2';

interface TranscriptionFeedbackProps {
  isTranscribing: boolean;
  status: string;
  progress: number; // 0-1
}

export function TranscriptionFeedback({
  isTranscribing,
  status,
  progress,
}: TranscriptionFeedbackProps) {
  const theme = useThemeColors();
  const styles = getStyles(theme);

  if (!isTranscribing) return null;

  // Déterminer l'icône selon le statut
  const getIcon = () => {
    if (status.includes('Upload')) return 'upload-cloud';
    if (status.includes('Transcription')) return 'mic';
    if (status.includes('Analyse')) return 'cpu';
    return 'loader';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name={getIcon()} size={24} color={theme.colors.primary} />
        <Text style={styles.title}>Traitement en cours</Text>
      </View>

      <Text style={styles.status}>{status}</Text>

      {/* Progress bar personnalisée (sans librairie externe) */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${Math.round(progress * 100)}%`,
              backgroundColor: theme.colors.primary,
            },
          ]}
        />
      </View>

      <Text style={styles.percentage}>{Math.round(progress * 100)}%</Text>

      <View style={styles.stepsContainer}>
        <StepIndicator
          label="Upload"
          isActive={status.includes('Upload')}
          isCompleted={progress > 0.33}
          theme={theme}
        />
        <StepIndicator
          label="Transcription"
          isActive={status.includes('Transcription')}
          isCompleted={progress > 0.66}
          theme={theme}
        />
        <StepIndicator
          label="Analyse"
          isActive={status.includes('Analyse')}
          isCompleted={progress === 1}
          theme={theme}
        />
      </View>
    </View>
  );
}

interface StepIndicatorProps {
  label: string;
  isActive: boolean;
  isCompleted: boolean;
  theme: any;
}

function StepIndicator({ label, isActive, isCompleted, theme }: StepIndicatorProps) {
  const styles = getStyles(theme);

  return (
    <View style={styles.step}>
      <View
        style={[
          styles.stepCircle,
          isActive && styles.stepCircleActive,
          isCompleted && styles.stepCircleCompleted,
        ]}
      >
        {isCompleted ? (
          <Feather name="check" size={12} color="#FFFFFF" />
        ) : isActive ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <View style={styles.stepDot} />
        )}
      </View>
      <Text
        style={[
          styles.stepLabel,
          isActive && styles.stepLabelActive,
          isCompleted && styles.stepLabelCompleted,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      marginVertical: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.primary + '30',
      ...theme.shadowSoft,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontSize: theme.typography.h3,
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.text,
    },
    status: {
      fontSize: theme.typography.body,
      color: theme.colors.textMuted,
      marginBottom: theme.spacing.md,
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: theme.spacing.sm,
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    percentage: {
      fontSize: theme.typography.small,
      color: theme.colors.primary,
      fontWeight: theme.fontWeights.semibold,
      textAlign: 'right',
      marginBottom: theme.spacing.lg,
    },
    stepsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    step: {
      alignItems: 'center',
      gap: theme.spacing.xs,
      flex: 1,
    },
    stepCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepCircleActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    stepCircleCompleted: {
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.textSoft,
    },
    stepLabel: {
      fontSize: theme.typography.tiny,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    stepLabelActive: {
      color: theme.colors.primary,
      fontWeight: theme.fontWeights.semibold,
    },
    stepLabelCompleted: {
      color: theme.colors.success,
      fontWeight: theme.fontWeights.semibold,
    },
  });


