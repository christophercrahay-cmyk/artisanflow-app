import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';

export type ToastType = 'error' | 'success' | 'info';

interface AppToastProps {
  visible: boolean;
  type: ToastType;
  message: string;
  onHide: () => void;
  duration?: number;
}

export default function AppToast({
  visible,
  type,
  message,
  onHide,
  duration = 3500,
}: AppToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animation d'entrée
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide après duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  // Configuration selon le type
  const getToastConfig = () => {
    switch (type) {
      case 'error':
        return {
          backgroundColor: '#3B0B0B', // Rouge foncé
          iconColor: COLORS.danger,
          iconName: 'alert-circle' as const,
        };
      case 'success':
        return {
          backgroundColor: '#0B3B2E', // Vert foncé
          iconColor: COLORS.success,
          iconName: 'check-circle' as const,
        };
      case 'info':
        return {
          backgroundColor: '#102542', // Bleu foncé
          iconColor: COLORS.primary,
          iconName: 'information' as const,
        };
      default:
        return {
          backgroundColor: '#1E293B',
          iconColor: COLORS.textPrimary,
          iconName: 'information' as const,
        };
    }
  };

  const config = getToastConfig();
  const bottomOffset = Math.max(insets.bottom, 16) + 80; // 80px pour la bottom tab bar

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: bottomOffset,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.toast, { backgroundColor: config.backgroundColor }]}>
        <MaterialCommunityIcons
          name={config.iconName}
          size={20}
          color={config.iconColor}
          style={styles.icon}
        />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <MaterialCommunityIcons
            name="close"
            size={18}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: 16,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '90%',
    minHeight: 44,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  icon: {
    marginRight: 10,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});

