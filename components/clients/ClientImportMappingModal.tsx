/**
 * Modale de mapping des colonnes pour l'import de clients
 * Permet à l'utilisateur de corriger/adapter le mapping automatique
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useSafeTheme } from '../../theme/useSafeTheme';
import { ClientFieldMapping, NormalizedHeader } from '../../utils/clientImportMapping';

interface Props {
  visible: boolean;
  headers: NormalizedHeader[];
  autoMapping: ClientFieldMapping;
  onCancel: () => void;
  onConfirm: (mapping: ClientFieldMapping) => void;
}

const FIELD_LABELS: Record<keyof ClientFieldMapping, string> = {
  name: 'Nom',
  phone: 'Téléphone',
  email: 'Email',
  address: 'Adresse',
  postalCode: 'Code postal',
  city: 'Ville',
};

const REQUIRED_FIELDS: (keyof ClientFieldMapping)[] = ['name'];

export default function ClientImportMappingModal({
  visible,
  headers,
  autoMapping,
  onCancel,
  onConfirm,
}: Props) {
  const themeRaw = useSafeTheme();
  
  // S'assurer que le thème est valide avec des valeurs par défaut
  const theme = themeRaw || {
    colors: {
      surface: '#FFFFFF',
      surfaceAlt: '#F5F5F5',
      text: '#000000',
      textMuted: '#666666',
      border: '#E0E0E0',
      error: '#FF0000',
      primary: '#007AFF',
    },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16 },
    radius: { md: 8, lg: 16 },
  };

  const styles = getStyles(theme);

  const [mapping, setMapping] = useState<ClientFieldMapping>(autoMapping || {});

  // Réinitialiser le mapping quand autoMapping change
  useEffect(() => {
    if (visible && autoMapping) {
      setMapping({ ...autoMapping });
    }
  }, [visible, autoMapping]);

  // Vérifier que headers est valide
  if (!headers || headers.length === 0) {
    console.error('ClientImportMappingModal: headers vide ou invalide');
    return null;
  }

  const handleConfirm = () => {
    // Vérifier que le nom est mappé
    if (!mapping.name) {
      return;
    }
    onConfirm(mapping);
  };

  const canConfirm = !!mapping.name;

  const updateMapping = (field: keyof ClientFieldMapping, value: string | undefined) => {
    setMapping((prev) => ({
      ...prev,
      [field]: value === '__IGNORE__' ? undefined : value,
    }));
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable
          style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <SafeAreaView edges={['bottom']} style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Associer les colonnes du fichier
              </Text>
              <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                <Feather name="x" size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.description, { color: theme.colors.textMuted }]}>
              Nous avons pré-rempli les correspondances, vous pouvez les ajuster avant l'import.
            </Text>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Champs de mapping */}
              {(Object.keys(FIELD_LABELS) as Array<keyof ClientFieldMapping>).map((field) => {
                const isRequired = REQUIRED_FIELDS.includes(field);
                const currentValue = mapping[field] || '__IGNORE__';

                return (
                  <View key={field} style={styles.fieldContainer}>
                    <View style={styles.fieldHeader}>
                      <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>
                        {FIELD_LABELS[field]}
                        {isRequired && (
                          <Text style={[styles.required, { color: theme.colors.error }]}> *</Text>
                        )}
                      </Text>
                    </View>

                    <View style={[styles.pickerContainer, { backgroundColor: theme.colors.surfaceAlt }]}>
                      <Picker
                        selectedValue={currentValue}
                        onValueChange={(value) => updateMapping(field, value)}
                        style={[styles.picker, { color: theme.colors.text }]}
                        dropdownIconColor={theme.colors.textMuted}
                      >
                        <Picker.Item label="-- Ignorer --" value="__IGNORE__" />
                        {headers.map((header) => (
                          <Picker.Item
                            key={header.index}
                            label={header.original}
                            value={header.original}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={onCancel}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  {
                    backgroundColor: canConfirm ? theme.colors.primary : theme.colors.textMuted,
                    opacity: canConfirm ? 1 : 0.5,
                  },
                ]}
                onPress={handleConfirm}
                disabled={!canConfirm}
              >
                <Feather name="check" size={18} color="#FFFFFF" />
                <Text style={styles.confirmButtonText}>Importer</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: theme.radius?.lg || 16,
      borderTopRightRadius: theme.radius?.lg || 16,
      maxHeight: '90%',
    },
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing?.lg || 16,
      paddingTop: theme.spacing?.lg || 16,
      paddingBottom: theme.spacing?.md || 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border || theme.colors.textMuted + '30',
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      flex: 1,
    },
    closeButton: {
      padding: theme.spacing?.xs || 4,
    },
    description: {
      fontSize: 14,
      lineHeight: 20,
      paddingHorizontal: theme.spacing?.lg || 16,
      paddingBottom: theme.spacing?.lg || 16,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: theme.spacing?.lg || 16,
    },
    fieldContainer: {
      marginBottom: theme.spacing?.lg || 16,
    },
    fieldHeader: {
      marginBottom: theme.spacing?.sm || 8,
    },
    fieldLabel: {
      fontSize: 16,
      fontWeight: '600',
    },
    required: {
      fontSize: 16,
      fontWeight: '700',
    },
    pickerContainer: {
      borderRadius: theme.radius?.md || 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border || theme.colors.textMuted + '30',
    },
    picker: {
      height: 50,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing?.md || 12,
      paddingHorizontal: theme.spacing?.lg || 16,
      paddingTop: theme.spacing?.md || 12,
      paddingBottom: theme.spacing?.lg || 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border || theme.colors.textMuted + '30',
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing?.xs || 4,
      paddingVertical: theme.spacing?.md || 12,
      borderRadius: theme.radius?.md || 8,
    },
    cancelButton: {
      borderWidth: 1,
    },
    confirmButton: {
      // backgroundColor défini dynamiquement
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    confirmButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });

