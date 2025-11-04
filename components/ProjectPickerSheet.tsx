import React, { useState, useMemo } from 'react';
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
  const styles = getStyles(theme, insets);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) {
      // Trier par statut (actifs en premier)
      return [...projects].sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        return 0;
      });
    }

    const query = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.clients?.name?.toLowerCase().includes(query) ||
        p.address?.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  const handleSelect = (project: ProjectWithClient) => {
    if (projects.length === 0) {
      showError('Aucun chantier trouvé. Créez-en un d\'abord.');
      return;
    }
    onSelectProject(project);
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
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              disabled={loading}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={20} color={theme.colors.accent} strokeWidth={2.5} />
            </TouchableOpacity>
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
                      <View style={styles.projectContent}>
                        <View style={styles.projectHeader}>
                          <Feather
                            name={item.status === 'active' ? 'folder' : 'folder-check'}
                            size={20}
                            color={item.status === 'active' ? theme.colors.accent : theme.colors.textSecondary}
                            strokeWidth={2}
                          />
                          <Text style={styles.projectName}>{item.name}</Text>
                        </View>
                        {item.clients?.name && (
                          <Text style={styles.clientName}>Client: {item.clients.name}</Text>
                        )}
                        {item.address && (
                          <Text style={styles.projectAddress} numberOfLines={1}>
                            {item.address}
                          </Text>
                        )}
                      </View>
                      <Feather name="chevron-right" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                  style={styles.list}
                  contentContainerStyle={styles.listContent}
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
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  projectContent: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  projectName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    fontSize: 16,
  },
  clientName: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs / 2,
  },
  projectAddress: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    fontSize: 12,
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

