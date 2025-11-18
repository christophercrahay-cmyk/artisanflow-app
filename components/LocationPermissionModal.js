/**
 * LocationPermissionModal - Modal d'explication pour la permission de géolocalisation
 * Explique pourquoi la localisation est utile avant de demander la permission
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
 * @param {function} onAllow - Callback quand l'utilisateur accepte
 * @param {function} onDeny - Callback quand l'utilisateur refuse
 */
export default function LocationPermissionModal({ visible, onClose, onAllow, onDeny }) {
  const theme = useSafeTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets);

  const handleAllow = () => {
    onAllow();
    onClose();
  };

  const handleDeny = () => {
    onDeny();
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
              <View style={styles.iconContainer}>
                <Feather name="map-pin" size={48} color={theme.colors.accent} />
              </View>

              <View style={styles.content}>
                <Text style={styles.title}>Géolocaliser vos photos ?</Text>
                <Text style={styles.description}>
                  ArtisanFlow peut enregistrer l'emplacement GPS de vos photos de chantier.
                  Cela vous permet de :
                </Text>
                
                <View style={styles.benefits}>
                  <View style={styles.benefit}>
                    <Feather name="check-circle" size={16} color={theme.colors.accent} />
                    <Text style={styles.benefitText}>Tagger automatiquement vos photos aux chantiers</Text>
                  </View>
                  <View style={styles.benefit}>
                    <Feather name="check-circle" size={16} color={theme.colors.accent} />
                    <Text style={styles.benefitText}>Retrouver facilement où chaque photo a été prise</Text>
                  </View>
                  <View style={styles.benefit}>
                    <Feather name="check-circle" size={16} color={theme.colors.accent} />
                    <Text style={styles.benefitText}>Organiser vos photos par localisation</Text>
                  </View>
                </View>

                <Text style={styles.note}>
                  Vous pouvez toujours refuser et ajouter des photos sans géolocalisation.
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.allowButton]}
                  onPress={handleAllow}
                  activeOpacity={0.7}
                >
                  <Text style={styles.allowButtonText}>Autoriser</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.denyButton]}
                  onPress={handleDeny}
                  activeOpacity={0.7}
                >
                  <Text style={styles.denyButtonText}>Refuser</Text>
                </TouchableOpacity>
              </View>
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  content: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h3,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  benefits: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  benefitText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
    lineHeight: 20,
  },
  note: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 12,
  },
  actions: {
    gap: theme.spacing.md,
  },
  button: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  allowButton: {
    backgroundColor: theme.colors.accent,
  },
  allowButtonText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: '#fff',
  },
  denyButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  denyButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});

