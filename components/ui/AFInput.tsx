/**
 * AFInput - Composant input générique ArtisanFlow
 * 
 * Input standardisé avec thème dark premium pour toute l'application.
 * Remplace tous les TextInput avec un style uniforme.
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Platform,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

interface AFInputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Feather.glyphMap;
  error?: string;
  containerStyle?: ViewStyle;
}

export default function AFInput({
  label,
  icon,
  error,
  containerStyle,
  placeholder,
  placeholderTextColor = COLORS.textMuted,
  style,
  onFocus,
  onBlur,
  ...textInputProps
}: AFInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}
      
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
          error && styles.containerError,
        ]}
      >
        {icon ? (
          <Feather
            name={icon}
            size={18}
            color={isFocused ? COLORS.primary : COLORS.textMuted}
            style={styles.icon}
          />
        ) : null}
        
        <TextInput
          {...textInputProps}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          style={[
            styles.textInput,
            icon && styles.textInputWithIcon,
            style,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </View>
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  container: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  containerFocused: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  containerError: {
    borderColor: COLORS.danger,
  },
  icon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    padding: 0, // Important pour éviter les problèmes de padding sur Android
  },
  textInputWithIcon: {
    // Pas de changement, juste pour la clarté
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 6,
    marginLeft: 4,
  },
});

