import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useSafeTheme } from '../theme/useSafeTheme';
import { PendingCapture } from '../types/capture';
import { showError } from '../components/Toast';

interface CaptureLinkingSheetProps {
  visible: boolean;
  onClose: () => void;
  capture: PendingCapture | null;
  onCreateProject: () => void;
  onSelectExistingProject: () => void;
  loading?: boolean;
}

/**
 * Bottom sheet pour associer une capture à un chantier
 */
export default function CaptureLinkingSheet({
  visible,
  onClose,
  capture,
  onCreateProject,
  onSelectExistingProject,
  loading = false,
}: CaptureLinkingSheetProps) {
  const theme = useSafeTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);

  if (!capture) return null;

  const getCaptureTypeLabel = () => {
    switch (capture.type) {
      case 'photo':
        return 'cette photo';
      case 'audio':
        return 'cette note vocale';
      case 'note':
        return 'cette note';
      default:
        return 'cette capture';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={loading ? undefined : onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Feather name="folder" size={24} color={theme.colors.accent} strokeWidth={2.5} />
            <Text style={styles.title}>Associer à un chantier</Text>
          </View>

          <Text style={styles.subtitle}>
            Que souhaitez-vous faire avec {getCaptureTypeLabel()} ?
          </Text>

          <View style={styles.buttonsContainer}>
            {/* Bouton créer nouveau chantier */}
            <TouchableOpacity
              onPress={onCreateProject}
              disabled={loading}
              style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
              activeOpacity={0.8}
            >
              <Feather name="plus-circle" size={24} color={theme.colors.text} strokeWidth={2.5} />
              <Text style={styles.buttonTextPrimary}>Créer un nouveau chantier</Text>
            </TouchableOpacity>

            {/* Bouton ajouter à chantier existant */}
            <TouchableOpacity
              onPress={onSelectExistingProject}
              disabled={loading}
              style={[styles.button, styles.buttonSecondary, loading && styles.buttonDisabled]}
              activeOpacity={0.8}
            >
              <Feather name="folder" size={24} color={theme.colors.accent} strokeWidth={2.5} />
              <Text style={styles.buttonTextSecondary}>Ajouter à un chantier</Text>
            </TouchableOpacity>
          </View>

          {/* Bouton annuler */}
          <TouchableOpacity
            onPress={onClose}
            disabled={loading}
            style={[styles.cancelButton, loading && styles.buttonDisabled]}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={theme.colors.accent} />
              <Text style={styles.loadingText}>Traitement en cours...</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme: any, insets: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: insets.bottom + theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.md,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.accent,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonTextPrimary: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    fontSize: 16,
  },
  buttonTextSecondary: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.accent,
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
});

