import React, { useState, useMemo, useEffect } from 'react';
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
import { Project } from '../types';
import { showError } from '../components/Toast';
import { getLastProject, saveLastProject } from '../utils/lastProjectStorage';

interface ProjectWithClient extends Project {
  clients?: { name: string } | null;
}

interface ProjectPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectProject: (project: ProjectWithClient) => void;
  projects: ProjectWithClient[];
  loading?: boolean;
}

/**
 * Bottom sheet pour sélectionner un chantier existant
 */
export default function ProjectPickerSheet({
  visible,
  onClose,
  onSelectProject,
  projects,
  loading = false,
}: ProjectPickerSheetProps) {
  const theme = useSafeTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [lastProjectId, setLastProjectId] = useState<string | null>(null);
  const styles = getStyles(theme, insets);

  // Charger le dernier chantier sélectionné au montage
  useEffect(() => {
    getLastProject().then(setLastProjectId);
  }, []);

  const filteredProjects = useMemo(() => {
    // Fonction pour déterminer si un projet est actif
    const isActive = (status: string | undefined) => {
      return status === 'active' || status === 'in_progress' || !status;
    };

    let filtered = projects;
    
    // Appliquer la recherche si nécessaire
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.clients?.name?.toLowerCase().includes(query) ||
          p.address?.toLowerCase().includes(query)
      );
    }

    // Trier avec priorité au dernier chantier utilisé
    return [...filtered].sort((a, b) => {
      // Priorité 1 : Dernier chantier sélectionné en premier
      if (lastProjectId) {
        if (a.id === lastProjectId) return -1;
        if (b.id === lastProjectId) return 1;
      }

      // Priorité 2 : Statut (actifs en premier)
      const aActive = isActive(a.status);
      const bActive = isActive(b.status);
      
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      
      // Priorité 3 : Date (plus récent en premier)
      const aDate = new Date(a.created_at || 0).getTime();
      const bDate = new Date(b.created_at || 0).getTime();
      return bDate - aDate;
    });
  }, [projects, searchQuery, lastProjectId]);

  const handleSelect = async (project: ProjectWithClient) => {
    if (projects.length === 0) {
      showError('Aucun chantier trouvé. Créez-en un d\'abord.');
      return;
    }
    
    // Sauvegarder comme dernier chantier utilisé
    await saveLastProject(project.id);
    setLastProjectId(project.id);
    
    onSelectProject(project);
  };

  const getStatusEmoji = (status: string | undefined) => {
    if (status === 'in_progress' || status === 'active' || !status) return '🟢'; // Actif
    if (status === 'planned') return '🟠'; // En attente
    if (status === 'done') return '⚪'; // Terminé
    return '🔵'; // Autre
  };

  const getStatusLabel = (status: string | undefined) => {
    if (status === 'in_progress' || status === 'active' || !status) return 'Actif';
    if (status === 'planned') return 'En attente';
    if (status === 'done') return 'Terminé';
    return 'Autre';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={loading ? undefined : onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 📂 Titre avec icône */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              disabled={loading}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={20} color={theme.colors.accent} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.titleIcon}>📂</Text>
            <Text style={styles.title}>Sélectionner un chantier</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.accent} />
              <Text style={styles.loadingText}>Chargement des chantiers...</Text>
            </View>
          ) : (
            <>
              <TextInput
                placeholder="Rechercher un chantier..."
                placeholderTextColor={theme.colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {filteredProjects.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Feather name="folder-x" size={48} color={theme.colors.textMuted} />
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'Aucun chantier trouvé' : 'Aucun chantier disponible'}
                  </Text>
                  {!searchQuery && (
                    <Text style={styles.emptySubtext}>
                      Créez un nouveau chantier depuis le bouton précédent
                    </Text>
                  )}
                </View>
              ) : (
                <FlatList
                  data={filteredProjects}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.projectItem}
                      onPress={() => handleSelect(item)}
                      activeOpacity={0.7}
                      disabled={loading}
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
                            <Text style={styles.lastUsedBadge}>Dernier utilisé</Text>
                          )}
                        </View>
                        <View style={styles.projectMeta}>
                          {item.clients?.name && (
                            <Text style={styles.clientName}>{item.clients.name}</Text>
                          )}
                          <Text style={styles.statusBadge}>
                            {getStatusEmoji(item.status)} {getStatusLabel(item.status)}
                          </Text>
                        </View>
                        {item.address && (
                          <Text style={styles.projectAddress} numberOfLines={1}>
                            📍 {item.address}
                          </Text>
                        )}
                      </View>
                      <Feather name="chevron-right" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                  style={styles.list}
                  contentContainerStyle={styles.listContent}
                  ListFooterComponent={
                    <TouchableOpacity
                      style={styles.createButton}
                      onPress={onClose}
                      activeOpacity={0.7}
                    >
                      <Feather name="plus" size={20} color={theme.colors.accent} strokeWidth={2.5} />
                      <Text style={styles.createButtonText}>Créer un nouveau chantier</Text>
                    </TouchableOpacity>
                  }
                />
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme: any, insets: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
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
  },
  titleIcon: {
    fontSize: 24,
    marginRight: theme.spacing.xs,
  },
  title: {
    ...theme.typography.h3,
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.sm,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827', // Fond gris anthracite
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
    backgroundColor: theme.colors.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  projectIcon: {
    fontSize: 24,
  },
  projectContent: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  projectName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text, // Blanc pur
    fontSize: 16,
  },
  lastUsedBadge: {
    ...theme.typography.bodySmall,
    fontSize: 11,
    color: theme.colors.warning,
    backgroundColor: theme.colors.warning + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: theme.spacing.xs,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  clientName: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  statusBadge: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  projectAddress: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.accent + '15', // Bleu clair sur fond sombre
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.accent + '30',
  },
  createButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.accent, // Bleu #3B82F6
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    fontWeight: '600',
  },
  emptySubtext: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
});

