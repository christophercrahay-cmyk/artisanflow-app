import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme2';
import { AFInput } from '../ui';
import { Client } from '../../types';

interface ClientSelectorFieldProps {
  label: string;
  selectedClient: Client | null;
  onPress: () => void;
  required?: boolean;
}

export default function ClientSelectorField({
  label,
  selectedClient,
  onPress,
  required = false,
}: ClientSelectorFieldProps) {
  const theme = useThemeColors();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.touchable}
      >
        <View pointerEvents="none">
          <AFInput
            icon="user"
            placeholder="Sélectionner un client"
            value={selectedClient?.name || ''}
            editable={false}
            style={styles.input}
          />
        </View>
        <View style={styles.chevronContainer}>
          <Feather
            name="chevron-down"
            size={20}
            color={COLORS.iconSecondary}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: COLORS.danger,
  },
  touchable: {
    position: 'relative',
  },
  input: {
    paddingRight: 40, // Espace pour le chevron
  },
  chevronContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
    pointerEvents: 'none',
  },
});

