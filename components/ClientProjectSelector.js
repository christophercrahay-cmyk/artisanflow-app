import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useSafeTheme } from '../theme/useSafeTheme';
import { supabase } from '../supabaseClient';
import { saveLastProject } from '../utils/lastProjectStorage';
import logger from '../utils/logger';

/**
 * Sélecteur Client puis Chantier en 2 étapes
 * Étape 1 : Choisir le client
 * Étape 2 : Choisir le chantier de ce client
 */
export default function ClientProjectSelector({ 
  visible, 
  onClose, 
  onConfirm,
  captureType 
}) {
  const theme = useSafeTheme();
  const insets = useSafeAreaInsets();
  
  const [step, setStep] = useState(1); // 1 = client, 2 = chantier
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const styles = getStyles(theme, insets);

  useEffect(() => {
    if (visible) {
      loadClients();
      setStep(1);
      setSelectedClient(null);
      setSelectedProject(null);
      setSearchQuery('');
    }
  }, [visible]);

  const loadClients = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {return;}

      const { data, error } = await supabase
        .from('clients')
        .select('id, name, address, phone, email')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) {
        logger.error('ClientProjectSelector', 'Erreur chargement clients', error);
        return;
      }

      setClients(data || []);
    } catch (err) {
      logger.error('ClientProjectSelector', 'Exception chargement clients', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async (clientId) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, address, status, created_at')
        .eq('client_id', clientId)
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('ClientProjectSelector', 'Erreur chargement projets', error);
        return;
      }

      setProjects(data || []);
    } catch (err) {
      logger.error('ClientProjectSelector', 'Exception chargement projets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setSearchQuery('');
    loadProjects(client.id);
    setStep(2); // Passer à l'étape chantier
  };

  const handleSelectProject = async (project) => {
    setSelectedProject(project);
    await saveLastProject(project.id);
    onConfirm(selectedClient, project);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedClient(null);
      setSelectedProject(null);
      setProjects([]);
    } else {
      onClose();
    }
  };

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) {return clients;}
    const query = searchQuery.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.address?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) {return projects;}
    const query = searchQuery.toLowerCase();
    return projects.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.address?.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  const getStatusEmoji = (status) => {
    if (status === 'in_progress' || status === 'active' || !status) {return '🟢';}
    if (status === 'planned') {return '🟠';}
    if (status === 'done') {return '⚪';}
    return '🔵';
  };

  const getCaptureLabel = () => {
    if (captureType === 'photo') {return 'cette photo';}
    if (captureType === 'audio' || captureType === 'voice') {return 'cette note vocale';}
    if (captureType === 'note') {return 'cette note';}
    return 'cette capture';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Feather 
                name={step === 1 ? "x" : "arrow-left"} 
                size={24} 
                color={theme.colors.text} 
                strokeWidth={2.5} 
              />
            </TouchableOpacity>
            <Text style={styles.title}>
              {step === 1 ? '👤 Sélectionner un client' : '📂 Sélectionner un chantier'}
            </Text>
          </View>

          {step === 2 && selectedClient && (
            <View style={styles.breadcrumb}>
              <Text style={styles.breadcrumbText}>
                Client : {selectedClient.name}
              </Text>
            </View>
          )}

          {/* Barre de recherche */}
          <TextInput
            placeholder={step === 1 ? "Rechercher un client..." : "Rechercher un chantier..."}
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.accent} />
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : step === 1 ? (
            // ÉTAPE 1 : LISTE DES CLIENTS
            filteredClients.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather name="users" size={48} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>Aucun client trouvé</Text>
                <Text style={styles.emptySubtext}>
                  Créez un client depuis l'onglet Clients
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredClients}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => handleSelectClient(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconContainer}>
                      <Text style={styles.icon}>👤</Text>
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.address && (
                        <Text style={styles.itemSubtext} numberOfLines={1}>
                          📍 {item.address}
                        </Text>
                      )}
                      {item.phone && (
                        <Text style={styles.itemSubtext}>📞 {item.phone}</Text>
                      )}
                    </View>
                    <Feather name="chevron-right" size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContent}
              />
            )
          ) : (
            // ÉTAPE 2 : LISTE DES CHANTIERS DU CLIENT
            filteredProjects.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather name="folder-x" size={48} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>Aucun chantier pour ce client</Text>
                <Text style={styles.emptySubtext}>
                  Créez un chantier pour {selectedClient?.name}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredProjects}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => handleSelectProject(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconContainer}>
                      <Text style={styles.icon}>📁</Text>
                    </View>
                    <View style={styles.itemContent}>
                      <View style={styles.projectHeader}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.statusEmoji}>{getStatusEmoji(item.status)}</Text>
                      </View>
                      {item.address && (
                        <Text style={styles.itemSubtext} numberOfLines={1}>
                          📍 {item.address}
                        </Text>
                      )}
                    </View>
                    <Feather name="chevron-right" size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContent}
              />
            )
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const getStyles = (theme, insets) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: theme.spacing.lg,
    paddingBottom: insets.bottom + theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  backButton: {
    marginRight: theme.spacing.md,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  breadcrumb: {
    backgroundColor: `${theme.colors.accent  }15`,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
  },
  breadcrumbText: {
    ...theme.typography.bodySmall,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: theme.spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: `${theme.colors.accent  }15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  itemContent: {
    flex: 1,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    fontSize: 16,
  },
  statusEmoji: {
    fontSize: 14,
  },
  itemSubtext: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  loadingContainer: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  emptySubtext: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});

