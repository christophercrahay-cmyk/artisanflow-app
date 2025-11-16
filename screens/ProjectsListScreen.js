import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';
import { useSafeTheme } from '../theme/useSafeTheme';
import { getCurrentUser } from '../utils/auth';
import logger from '../utils/logger';
import EmptyState from '../components/EmptyState';
import { showError } from '../components/Toast';

export default function ProjectsListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const theme = useSafeTheme();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'done', 'archived'

  const styles = useMemo(() => getStyles(theme), [theme]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        logger.warn('ProjectsList', 'Pas de user connecté');
        return;
      }

      logger.info('ProjectsList', `Chargement chantiers pour user: ${user.id}`);

      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          address,
          status,
          archived,
          created_at,
          clients!inner(
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('ProjectsList', 'Erreur chargement chantiers', error);
        showError('Impossible de charger les chantiers');
        return;
      }

      logger.info('ProjectsList', `${data?.length || 0} chantiers chargés`);
      setProjects(data || []);
    } catch (err) {
      logger.error('ProjectsList', 'Exception chargement chantiers', err);
      showError('Erreur lors du chargement des chantiers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Rafraîchir automatiquement quand on revient sur l'écran
  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [])
  );

  const getStatusEmoji = (status) => {
    if (status === 'in_progress' || status === 'active' || !status) {return '🟢';}
    if (status === 'planned') {return '🟠';}
    if (status === 'done') {return '✅';}
    return '🔵';
  };

  const getStatusLabel = (status) => {
    if (status === 'in_progress' || status === 'active' || !status) {return 'Actif';}
    if (status === 'planned') {return 'En attente';}
    if (status === 'done') {return 'Terminé';}
    return status;
  };

  const getStatusColor = (status) => {
    if (status === 'in_progress' || status === 'active' || !status) {return '#16A34A';} // Vert
    if (status === 'planned') {return '#F59E0B';} // Orange
    if (status === 'done') {return '#3B82F6';} // Bleu
    return theme.colors.textMuted; // Gris par défaut
  };

  const filteredProjects = useMemo(() => {
    let result = projects;

    // Filtrer par statut
    if (filterStatus === 'active') {
      result = result.filter(p => !p.archived && (p.status === 'active' || p.status === 'in_progress' || !p.status));
    } else if (filterStatus === 'done') {
      result = result.filter(p => !p.archived && p.status === 'done');
    } else if (filterStatus === 'archived') {
      result = result.filter(p => p.archived === true);
    } else {
      // 'all' : seulement non archivés par défaut
      result = result.filter(p => !p.archived);
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.address && p.address.toLowerCase().includes(query)) ||
        (p.clients?.name && p.clients.name.toLowerCase().includes(query))
      );
    }

    return result;
  }, [projects, searchQuery, filterStatus]);

  const renderProject = ({ item }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.projectInfo}>
        <View style={styles.projectHeader}>
          <Feather name="folder" size={18} color={theme.colors.accent} />
          <Text style={styles.projectName}>{item.name}</Text>
          <Text style={styles.statusEmoji}>{getStatusEmoji(item.status)}</Text>
        </View>
        
        <View style={styles.projectMeta}>
          <Feather name="user" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.clientName}>{item.clients?.name || 'Client inconnu'}</Text>
        </View>

        {item.address && (
          <View style={styles.projectRow}>
            <Feather name="map-pin" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.projectAddress} numberOfLines={1}>{item.address}</Text>
          </View>
        )}

        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>{getStatusLabel(item.status)}</Text>
        </View>

        {item.archived && (
          <View style={[styles.statusBadge, styles.archivedBadge]}>
            <Text style={styles.archivedBadgeText}>📦 Archivé</Text>
          </View>
        )}
      </View>

      <Feather name="chevron-right" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const filterButtons = [
    { key: 'all', label: 'Tous', icon: 'list' },
    { key: 'active', label: 'Actifs', icon: 'play-circle' },
    { key: 'done', label: 'Terminés', icon: 'check-circle' },
    { key: 'archived', label: 'Archivés', icon: 'archive' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Chargement des chantiers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header fixe */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Chantiers</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('ClientsTab', { screen: 'ClientsList' })} 
          style={styles.addButton}
        >
          <Feather name="plus" size={24} color={theme.colors.accent} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un chantier..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        {filterButtons.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              filterStatus === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus(filter.key)}
            activeOpacity={0.7}
          >
            <Feather
              name={filter.icon}
              size={16}
              color={filterStatus === filter.key ? theme.colors.text : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === filter.key && styles.filterButtonTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <Feather name="folder" size={16} color={theme.colors.textSecondary} />
        <Text style={styles.statsText}>
          {filteredProjects.length} chantier{filteredProjects.length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Liste chantiers */}
      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        ListEmptyComponent={
          <EmptyState
            icon="folder-x"
            title={searchQuery ? "Aucun chantier trouvé" : filterStatus === 'archived' ? "Aucun chantier archivé" : "Aucun chantier"}
            subtitle={searchQuery ? "Essayez une autre recherche" : "Créez votre premier chantier depuis un client"}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          filteredProjects.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h2,
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    height: 48,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  filterButtonText: {
    ...theme.typography.bodySmall,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  filterButtonTextActive: {
    color: theme.colors.text,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  statsText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  projectInfo: {
    flex: 1,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  projectName: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    fontSize: 16,
    flex: 1,
  },
  statusEmoji: {
    fontSize: 14,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  clientName: {
    ...theme.typography.bodySmall,
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  projectAddress: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xs,
  },
  statusBadgeText: {
    ...theme.typography.bodySmall,
    fontSize: 11,
    fontWeight: '700',
  },
  archivedBadge: {
    backgroundColor: `${theme.colors.textMuted  }20`,
  },
  archivedBadgeText: {
    color: theme.colors.textMuted,
  },
});

