import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../supabaseClient';
import { useSafeTheme } from '../theme/useSafeTheme';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import logger from '../utils/logger';
import EmptyState from '../components/EmptyState';
import HomeHeader from '../components/HomeHeader';

export default function DashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const theme = useSafeTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    recentPhotos: 0,
    recentDocuments: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentPhotos, setRecentPhotos] = useState([]);

  const styles = useMemo(() => getStyles(theme), [theme]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('Dashboard', 'Pas de user connecté');
        setLoading(false);
        return;
      }

      // Charger les projets (non-archivés uniquement)
      const { data: projects, error: projErr } = await supabase
        .from('projects')
        .select('id, name, status, client_id, created_at')
        .eq('user_id', user.id)
        .eq('archived', false) // Filtrer les projets archivés
        .order('created_at', { ascending: false })
        .limit(10);

      if (projErr) {
        logger.error('Dashboard', 'Erreur chargement projets', projErr);
      }

      // Calculer les stats
      const active = projects?.filter((p) => p.status === 'in_progress' || !p.status) || [];
      const completed = projects?.filter((p) => p.status === 'done') || [];

      // Charger les photos récentes
      const { data: photos, error: photosErr } = await supabase
        .from('project_photos')
        .select('id, url, project_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(8);

      if (photosErr) {
        logger.error('Dashboard', 'Erreur chargement photos', photosErr);
      }

      // Charger les devis/factures récents
      const { data: devis, error: devisErr } = await supabase
        .from('devis')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (devisErr) {
        logger.error('Dashboard', 'Erreur chargement devis', devisErr);
      }

      const { data: factures, error: factErr } = await supabase
        .from('factures')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (factErr) {
        logger.error('Dashboard', 'Erreur chargement factures', factErr);
      }

      setStats({
        activeProjects: active.length,
        completedProjects: completed.length,
        recentPhotos: photos?.length || 0,
        recentDocuments: (devis?.length || 0) + (factures?.length || 0),
      });

      setRecentProjects(projects?.slice(0, 5) || []);
      setRecentPhotos(photos?.slice(0, 8) || []);

      const finalStats = {
        activeProjects: active.length,
        completedProjects: completed.length,
        recentPhotos: photos?.length || 0,
        recentDocuments: (devis?.length || 0) + (factures?.length || 0),
      };
      logger.success('Dashboard', 'Données chargées', finalStats);
    } catch (err) {
      logger.error('Dashboard', 'Exception chargement', err);
    } finally {
      setLoading(false);
    }
  };


  const getStatusConfig = (status) => {
    switch (status) {
      case 'planned':
        return { icon: 'clock', label: 'Planifié', color: theme.colors.warning };
      case 'in_progress':
        return { icon: 'play-circle', label: 'En cours', color: theme.colors.accent };
      case 'done':
        return { icon: 'check-circle', label: 'Terminé', color: theme.colors.success };
      default:
        return { icon: 'folder', label: 'En cours', color: theme.colors.accent };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Premium avec timer */}
        <HomeHeader />

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            icon="folder"
            label="Chantiers actifs"
            value={stats.activeProjects}
            color={theme.colors.accent}
            onPress={() => navigation.navigate('ClientsTab')}
          />
          <StatCard
            icon="check-circle"
            label="Terminés"
            value={stats.completedProjects}
            color={theme.colors.success}
            onPress={() => navigation.navigate('ClientsTab')}
          />
          <StatCard
            icon="camera"
            label="Photos"
            value={stats.recentPhotos}
            color={theme.colors.info}
            onPress={() => navigation.navigate('CaptureTab')}
          />
          <StatCard
            icon="file-text"
            label="Documents"
            value={stats.recentDocuments}
            color={theme.colors.warning}
            onPress={() => navigation.navigate('ProTab')}
          />
        </View>

        {/* Chantiers en cours */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="folder" size={20} color={theme.colors.accent} />
            <Text style={styles.sectionTitle}>Chantiers en cours</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ClientsTab')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>Voir tout</Text>
              <Feather name="chevron-right" size={16} color={theme.colors.accent} />
            </TouchableOpacity>
          </View>

          {recentProjects.length === 0 ? (
            <EmptyState
              icon="folder-plus"
              title="Aucun chantier"
              subtitle="Créez votre premier chantier pour commencer"
              buttonText="Nouveau chantier"
              onButtonPress={() => navigation.navigate('ClientsTab')}
            />
          ) : (
            <FlatList
              data={recentProjects}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.projectsList}
              renderItem={({ item }) => {
                const statusConfig = getStatusConfig(item.status);
                return (
                  <TouchableOpacity
                    style={styles.projectCard}
                    onPress={() => {
                      useAppStore.getState().setCurrentProject(item);
                      navigation.navigate('ClientsTab', {
                        screen: 'ProjectDetail',
                        params: { projectId: item.id },
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.projectCardHeader}>
                      <Feather name="folder" size={24} color={theme.colors.accent} />
                      <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
                        <Feather name={statusConfig.icon} size={12} color={statusConfig.color} />
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                          {statusConfig.label}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.projectCardTitle} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>

        {/* Photos récentes */}
        {recentPhotos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="image" size={20} color={theme.colors.accent} />
              <Text style={styles.sectionTitle}>Photos récentes</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('CaptureTab')}
                style={styles.seeAllButton}
              >
                <Text style={styles.seeAllText}>Voir tout</Text>
                <Feather name="chevron-right" size={16} color={theme.colors.accent} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={recentPhotos}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.photoCard}
                  onPress={async () => {
                    // Charger le projet complet pour le store
                    try {
                      const { data: project } = await supabase
                        .from('projects')
                        .select('*')
                        .eq('id', item.project_id)
                        .single();
                      if (project) {
                        useAppStore.getState().setCurrentProject(project);
                      }
                    } catch (err) {
                      console.error('Erreur chargement projet:', err);
                    }
                    // Naviguer vers le projet
                    navigation.navigate('ClientsTab', {
                      screen: 'ProjectDetail',
                      params: { projectId: item.project_id },
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: item.url }} style={styles.photoImage} />
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Composant StatCard
function StatCard({ icon, label, value, color, onPress }) {
  const theme = useSafeTheme();
  const styles = getStyles(theme);

  return (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Feather name={icon} size={24} color={color} strokeWidth={2.5} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1E293B', // Premium dark gray
    borderRadius: 16, // Plus arrondi
    padding: theme.spacing.lg,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#334155', // Bordure fine discrète
    ...theme.shadows.lg, // Ombre plus prononcée pour effet "flottant"
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  statValue: {
    ...theme.typography.h2,
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h4,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  seeAllText: {
    ...theme.typography.caption,
    color: theme.colors.accent,
    fontWeight: '700',
  },
  projectsList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  projectCard: {
    width: 200,
    backgroundColor: '#1E293B', // Premium dark gray
    borderRadius: 16,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#334155',
    ...theme.shadows.md,
    marginRight: theme.spacing.md,
  },
  projectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  projectCardTitle: {
    ...theme.typography.body,
    fontWeight: '700',
  },
  photosList: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  photoCard: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#334155',
    ...theme.shadows.lg,
    marginRight: theme.spacing.md,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

