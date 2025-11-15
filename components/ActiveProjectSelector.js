import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useSafeTheme } from '../theme/useSafeTheme';
import { supabase } from '../supabaseClient';
import { saveLastProject, getLastProject } from '../utils/lastProjectStorage';
import logger from '../utils/logger';

/**
 * Sélecteur de chantier actif pour l'écran Capture
 * Permet de choisir le chantier AVANT de capturer
 */
export default function ActiveProjectSelector({ onProjectSelected, selectedProject }) {
  const theme = useSafeTheme();
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastProjectId, setLastProjectId] = useState(null);

  const styles = getStyles(theme, insets);

  useEffect(() => {
    getLastProject().then(setLastProjectId);
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {return;}

      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          address,
          status,
          created_at,
          clients (
            name
          )
        `)
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('ActiveProjectSelector', 'Erreur chargement projets', error);
        return;
      }

      setProjects(data || []);
    } catch (err) {
      logger.error('ActiveProjectSelector', 'Exception', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    loadProjects();
  };

  const handleSelectProject = async (project) => {
    await saveLastProject(project.id);
    setLastProjectId(project.id);
    onProjectSelected(project);
    setShowModal(false);
  };

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) {return true;}
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.clients?.name?.toLowerCase().includes(query) ||
      p.address?.toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    // Dernier utilisé en premier
    if (lastProjectId) {
      if (a.id === lastProjectId) {return -1;}
      if (b.id === lastProjectId) {return 1;}
    }
    // Puis actifs avant terminés
    const aActive = a.status === 'in_progress' || a.status === 'active' || !a.status;
    const bActive = b.status === 'in_progress' || b.status === 'active' || !b.status;
    if (aActive && !bActive) {return -1;}
    if (!aActive && bActive) {return 1;}
    return 0;
  });

  const getStatusEmoji = (status) => {
    if (status === 'in_progress' || status === 'active' || !status) {return '🟢';}
    if (status === 'planned') {return '🟠';}
    if (status === 'done') {return '⚪';}
    return '🔵';
  };

  return (
    <>
      {/* Barre de sélection chantier actif */}
      <TouchableOpacity
        style={styles.selector}
        onPress={handleOpenModal}
        activeOpacity={0.7}
      >
        <View style={styles.selectorContent}>
          <Feather name="folder" size={20} color={theme.colors.accent} strokeWidth={2.5} />
          <View style={styles.selectorTextContainer}>
            <Text style={styles.selectorLabel}>Chantier actif</Text>
            {selectedProject ? (
              <>
                <Text style={styles.selectorValue}>{selectedProject.name}</Text>
                {selectedProject.clients?.name && (
                  <Text style={styles.selectorClient}>{selectedProject.clients.name}</Text>
                )}
              </>
            ) : (
              <Text style={styles.selectorPlaceholder}>Sélectionner un chantier</Text>
            )}
          </View>
        </View>
        <Feather name="chevron-down" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      {/* Modal de sélection */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📂 Sélectionner un chantier</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Feather name="x" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Rechercher un chantier..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.accent} />
              </View>
            ) : filteredProjects.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather name="folder-x" size={48} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>Aucun chantier trouvé</Text>
                <Text style={styles.emptySubtext}>Créez un chantier depuis l'onglet Clients</Text>
              </View>
            ) : (
              <FlatList
                data={filteredProjects}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.projectItem}
                    onPress={() => handleSelectProject(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.projectIconContainer}>
                      <Text style={styles.projectIcon}>
                        {item.id === lastProjectId ? '⭐' : '📁'}
                      </Text>
                    </View>
                    <View style={styles.projectContent}>
                      <View style={styles.projectHeader}>
                        <Text style={styles.projectName}>{item.name}</Text>
                        {item.id === lastProjectId && (
                          <Text style={styles.lastUsedBadge}>Dernier</Text>
                        )}
                      </View>
                      <View style={styles.projectMeta}>
                        {item.clients?.name && (
                          <Text style={styles.clientName}>{item.clients.name}</Text>
                        )}
                        <Text style={styles.statusBadge}>
                          {getStatusEmoji(item.status)}
                        </Text>
                      </View>
                    </View>
                    <Feather name="chevron-right" size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const getStyles = (theme, insets) => StyleSheet.create({
  selector: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  selectorTextContainer: {
    flex: 1,
  },
  selectorLabel: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  selectorValue: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    fontSize: 15,
  },
  selectorClient: {
    ...theme.typography.bodySmall,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  selectorPlaceholder: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: theme.spacing.lg,
    paddingBottom: insets.bottom + theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
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
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  projectIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: `${theme.colors.accent  }15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  projectIcon: {
    fontSize: 24,
  },
  projectContent: {
    flex: 1,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  projectName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    fontSize: 16,
  },
  lastUsedBadge: {
    ...theme.typography.bodySmall,
    fontSize: 11,
    color: theme.colors.warning,
    backgroundColor: `${theme.colors.warning  }15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clientName: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  statusBadge: {
    fontSize: 14,
  },
  loadingContainer: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
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

