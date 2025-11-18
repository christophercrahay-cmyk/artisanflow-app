/**
 * PhotoSourceModal - Modal personnalisée pour choisir la source de la photo
 * Remplace l'Alert natif par une interface cohérente avec le design system
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeTheme } from '../theme/useSafeTheme';

/**
 * @param {boolean} visible - Afficher/masquer la modal
 * @param {function} onClose - Callback de fermeture
 * @param {function} onCamera - Callback pour ouvrir la caméra
 * @param {function} onGallery - Callback pour ouvrir la galerie
 */
export default function PhotoSourceModal({ visible, onClose, onCamera, onGallery }) {
  const theme = useSafeTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);

  const handleCamera = () => {
    onCamera();
    onClose();
  };

  const handleGallery = () => {
    onGallery();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.title}>Ajouter une photo</Text>
                <Text style={styles.subtitle}>Choisissez la source</Text>
              </View>

              <View style={styles.options}>
                <TouchableOpacity
                  style={styles.option}
                  onPress={handleCamera}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionIcon, { backgroundColor: theme.colors.accent + '20' }]}>
                    <Feather name="camera" size={24} color={theme.colors.accent} />
                  </View>
                  <Text style={styles.optionText}>Prendre une photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.option}
                  onPress={handleGallery}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionIcon, { backgroundColor: theme.colors.accent + '20' }]}>
                    <Feather name="image" size={24} color={theme.colors.accent} />
                  </View>
                  <Text style={styles.optionText}>Importer depuis la galerie</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const getStyles = (theme, insets) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadowStrong,
  },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h3,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  options: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  cancelButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
  },
  cancelText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});

