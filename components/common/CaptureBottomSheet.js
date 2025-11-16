/**
 * CaptureBottomSheet - Bottom sheet réutilisable pour les actions de capture
 * Design System 2.0 - Animations fluides + gestion clavier
 */

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  Animated,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../theme/theme2';

/**
 * @param {boolean} visible - Afficher/masquer la bottom sheet
 * @param {function} onClose - Callback de fermeture
 * @param {React.ReactNode} children - Contenu de la bottom sheet
 * @param {boolean} enableKeyboardAvoid - Activer l'évitement du clavier (pour Note texte)
 */
export default function CaptureBottomSheet({
  visible,
  onClose,
  children,
  enableKeyboardAvoid = false,
}) {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  
  // Animations
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(40)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animation d'ouverture
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheetOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animation de fermeture
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 40,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheetOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const styles = getStyles(theme, insets);

  const sheetContent = (
    <Animated.View
      style={[
        styles.sheet,
        {
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.radius.xxl,
          borderTopRightRadius: theme.radius.xxl,
          transform: [{ translateY: sheetTranslateY }],
          opacity: sheetOpacity,
        },
        theme.shadowStrong,
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </Animated.View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.innerContainer}>
          {/* Fond assombri */}
          <TouchableWithoutFeedback onPress={onClose}>
            <Animated.View
              style={[
                styles.backdrop,
                {
                  opacity: backdropOpacity,
                },
              ]}
            />
          </TouchableWithoutFeedback>

          {/* Feuille */}
          {sheetContent}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getStyles = (theme, insets) => StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    width: '100%',
    maxHeight: '85%',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: Math.max(theme.spacing.xxl, insets.bottom + theme.spacing.md),
    flexGrow: 1,
  },
});

