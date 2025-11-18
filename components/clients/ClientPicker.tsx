import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Pressable,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../../theme/theme2';
import { COLORS } from '../../theme/colors';
import SearchBar from '../SearchBar';
import { Client } from '../../types';

interface ClientPickerProps {
  visible: boolean;
  clients: Client[];
  selectedClientId?: string | null;
  onSelectClient: (client: Client) => void;
  onClose: () => void;
  onCreateNew?: () => void;
  autoFocusSearch?: boolean;
}

export default function ClientPicker({
  visible,
  clients,
  selectedClientId,
  onSelectClient,
  onClose,
  onCreateNew,
  autoFocusSearch = false,
}: ClientPickerProps) {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  // Fonction de normalisation pour recherche insensible à la casse et aux accents
  const normalize = useCallback((value?: string | null) => {
    if (!value) return '';
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // suppression accents
      .trim();
  }, []);

  // Filtrer les clients selon la recherche
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    
    const q = normalize(searchQuery);
    
    return clients.filter((client) => {
      const name = normalize(client.name);
      const address = normalize(client.address);
      const email = normalize(client.email);
      const phone = normalize(client.phone?.toString());
      const city = normalize(client.city);
      const postalCode = normalize(client.postalCode);
      
      return (
        name.includes(q) ||
        address.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        city.includes(q) ||
        postalCode.includes(q)
      );
    });
  }, [clients, searchQuery, normalize]);

  const handleSelectClient = useCallback((client: Client) => {
    Keyboard.dismiss();
    onSelectClient(client);
    setSearchQuery('');
    onClose();
  }, [onSelectClient, onClose]);

  const handleCreateNew = useCallback(() => {
    Keyboard.dismiss();
    setSearchQuery('');
    onClose();
    onCreateNew?.();
  }, [onClose, onCreateNew]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    setSearchQuery('');
    onClose();
  }, [onClose]);

  const styles = getStyles(theme, insets);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Sélectionner un client</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Feather name="x" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Rechercher un client…"
                showClearButton={true}
              />
            </View>

            {/* Liste des clients */}
            {filteredClients.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather name="users" size={48} color={COLORS.iconSecondary} />
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? 'Aucun client ne correspond à votre recherche'
                    : 'Aucun client disponible'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredClients}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  const isSelected = selectedClientId === item.id;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.clientItem,
                        isSelected && styles.clientItemSelected,
                      ]}
                      onPress={() => handleSelectClient(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.clientInfo}>
                        <Text style={styles.clientName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {(item.address || item.city) && (
                          <Text style={styles.clientSubtext} numberOfLines={1}>
                            {[item.address, item.city].filter(Boolean).join(', ')}
                          </Text>
                        )}
                      </View>
                      {isSelected && (
                        <Feather
                          name="check-circle"
                          size={20}
                          color={COLORS.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                onScrollBeginDrag={Keyboard.dismiss}
              />
            )}

            {/* Bouton créer nouveau client */}
            {onCreateNew && (
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateNew}
                  activeOpacity={0.7}
                >
                  <Feather name="user-plus" size={18} color={COLORS.primary} />
                  <Text style={styles.createButtonText}>+ Créer un nouveau client</Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const getStyles = (theme: any, insets: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '50%',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  clientItemSelected: {
    backgroundColor: theme.colors.primarySoft || 'rgba(37, 99, 235, 0.18)',
    borderColor: COLORS.primary,
  },
  clientInfo: {
    flex: 1,
    marginRight: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  clientSubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Math.max(insets.bottom, 16),
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

