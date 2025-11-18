/**
 * AFDialog - Composant de dialogue custom dark pour ArtisanFlow
 * 
 * Remplace les Alert.alert et modals gris système par un rendu cohérent
 * avec le thème dark premium de l'application.
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../theme/colors';

interface DialogAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface AFDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  actions: DialogAction[];
  onRequestClose?: () => void;
}

export default function AFDialog({
  visible,
  title,
  message,
  actions,
  onRequestClose,
}: AFDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={onRequestClose}
        activeOpacity={1}
      >
        <Pressable
          style={styles.container}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Titre */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          {message ? (
            <Text style={styles.message}>{message}</Text>
          ) : null}

          {/* Zone boutons */}
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => {
              const variant = action.variant || 'secondary';
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    variant === 'primary' && styles.buttonPrimary,
                    variant === 'secondary' && styles.buttonSecondary,
                    variant === 'danger' && styles.buttonDanger,
                  ]}
                  onPress={action.onPress}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.buttonLabel,
                      variant === 'primary' && styles.buttonLabelPrimary,
                      variant === 'secondary' && styles.buttonLabelSecondary,
                      variant === 'danger' && styles.buttonLabelDanger,
                    ]}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 420,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: COLORS.background, // '#020617'
    borderWidth: 1,
    borderColor: COLORS.borderSubtle, // '#111827'
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary, // '#F9FAFB'
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: COLORS.textSecondary, // '#E5E7EB'
    marginBottom: 24,
    lineHeight: 22,
  },
  actionsContainer: {
    marginTop: 8,
    gap: 8,
  },
  button: {
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary, // '#3B82F6'
  },
  buttonSecondary: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
  },
  buttonDanger: {
    backgroundColor: COLORS.danger, // '#DC2626'
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonLabelPrimary: {
    color: '#FFFFFF',
  },
  buttonLabelSecondary: {
    color: COLORS.textSecondary, // '#E5E7EB'
  },
  buttonLabelDanger: {
    color: '#FFFFFF',
  },
});

