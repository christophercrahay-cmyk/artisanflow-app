/**
 * CameraPreviewModal - Modal de prévisualisation après capture photo
 * Permet de voir la photo avant validation et de la reprendre si nécessaire
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSafeTheme } from '../theme/useSafeTheme';

const { width, height } = Dimensions.get('window');

/**
 * @param {boolean} visible - Afficher/masquer la modal
 * @param {string} photoUri - URI de la photo capturée
 * @param {function} onConfirm - Callback quand l'utilisateur valide la photo
 * @param {function} onRetake - Callback quand l'utilisateur veut reprendre la photo
 * @param {function} onClose - Callback de fermeture
 */
export default function CameraPreviewModal({ visible, photoUri, onConfirm, onRetake, onClose }) {
  const theme = useSafeTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);

  if (!visible || !photoUri) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Image preview */}
        <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="contain" />

        {/* Header avec bouton fermer */}
        <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Feather name="x" size={24} color={theme.colors.text} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Footer avec boutons */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.md }]}>
          <TouchableOpacity
            style={[styles.button, styles.retakeButton]}
            onPress={onRetake}
            activeOpacity={0.7}
          >
            <Feather name="refresh-cw" size={20} color={theme.colors.text} strokeWidth={2.5} />
            <Text style={styles.retakeButtonText}>Reprendre</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={onConfirm}
            activeOpacity={0.7}
          >
            <Feather name="check" size={20} color="#fff" strokeWidth={2.5} />
            <Text style={styles.confirmButtonText}>Valider</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    width: width,
    height: height,
    position: 'absolute',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    zIndex: 1,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    zIndex: 1,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    minHeight: 56,
  },
  retakeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  retakeButtonText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: theme.colors.accent,
  },
  confirmButtonText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: '#fff',
    fontSize: 16,
  },
});

