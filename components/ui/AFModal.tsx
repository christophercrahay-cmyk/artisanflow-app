/**
 * AFModal - Composant modal générique ArtisanFlow
 * 
 * Modal standardisée avec thème dark cohérent pour toute l'application.
 * Remplace toutes les Alert.alert et modales personnalisées.
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { modalComponentStyles } from '../../theme/modalStyles';

interface AFModalProps {
  visible: boolean;
  title: string;
  message?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  children?: React.ReactNode;
  showCancel?: boolean;
}

export default function AFModal({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  danger = false,
  children,
  showCancel = true,
}: AFModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        style={styles.overlay}
        onPress={onCancel}
        activeOpacity={1}
      >
        <Pressable
          style={styles.container}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Titre */}
          <Text style={styles.title}>{title}</Text>

          {/* Message ou contenu personnalisé */}
          {message ? (
            <Text style={styles.message}>{message}</Text>
          ) : null}

          {children ? (
            <View style={styles.childrenContainer}>
              {children}
            </View>
          ) : null}

          {/* Boutons */}
          <View style={styles.buttonsContainer}>
            {showCancel && onCancel ? (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
              </TouchableOpacity>
            ) : null}

            {onConfirm ? (
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  danger && styles.confirmButtonDanger,
                ]}
                onPress={onConfirm}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>{confirmLabel}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...modalComponentStyles.overlay,
  },
  container: {
    ...modalComponentStyles.content,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  title: {
    ...modalComponentStyles.title,
  },
  message: {
    ...modalComponentStyles.message,
  },
  childrenContainer: {
    marginBottom: 24,
  },
  buttonsContainer: {
    ...modalComponentStyles.buttonsRow,
  },
  cancelButton: {
    ...modalComponentStyles.button,
    ...modalComponentStyles.buttonCancel,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  cancelButtonText: {
    ...modalComponentStyles.buttonTextCancel,
  },
  confirmButton: {
    ...modalComponentStyles.button,
    backgroundColor: COLORS.primary,
  },
  confirmButtonDanger: {
    backgroundColor: COLORS.danger,
  },
  confirmButtonText: {
    ...modalComponentStyles.confirmButtonText,
    color: '#FFFFFF',
  },
});

