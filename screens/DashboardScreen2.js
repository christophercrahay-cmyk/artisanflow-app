/**
 * DashboardScreen 2.0 - Accueil premium
 * Design System 2.0 - Niveau 11/10
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  Animated,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '../theme/theme2';
import { ScreenContainer, SectionTitle, AppCard } from '../components/ui';
import { supabase } from '../supabaseClient';
import { useAppStore } from '../store/useAppStore';
import logger from '../utils/logger';
import EmptyState from '../components/EmptyState';
import HomeHeader from '../components/HomeHeader';

export default function DashboardScreen2({ navigation }) {
  const theme = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    recentPhotos: 0,
    recentDocuments: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentPhotos, setRecentPhotos] = useState([]);

  const styles = useMemo(() => getStyles(theme), [theme]);

  // Animations pour les cartes stats (stagger 50ms)
  const statAnims = useRef([
    { opacity: new Animated.Value(0), translateY: new Animated.Value(10) },
    { opacity: new Animated.Value(0), translateY: new Animated.Value(10) },
    { opacity: new Animated.Value(0), translateY: new Animated.Value(10) },
    { opacity: new Animated.Value(0), translateY: new Animated.Value(10) },
  ]).current;

  useEffect(() => {
    // Animation stagger des cartes stats
    const animations = statAnims.map((anim, index) =>
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 250,
          delay: index * 50, // Stagger 50ms
          useNativeDriver: true,
        }),
        Animated.spring(anim.translateY, {
          toValue: 0,
          tension: 100,
          friction: 8,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(50, animations).start();
  }, []);

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('Dashboard', 'Pas de user connecté');
        setLoading(false);
        return;
      }

      // Charger les projets
      const { data: projects, error: projErr } = await supabase
        .from('projects')
        .select('id, name, status, client_id, created_at')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (projErr) {
        logger.error('Dashboard', 'Erreur chargement projets', projErr);
      }

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

      logger.success('Dashboard', 'Données chargées');
    } catch (err) {
      logger.error('Dashboard', 'Exception chargement', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return { icon: 'play-circle', label: 'Actif', color: '#16A34A' }; // Vert vif
      case 'in_progress':
        return { icon: 'play-circle', label: 'En cours', color: '#16A34A' }; // Vert vif
      case 'planned':
        return { icon: 'clock', label: 'Planifié', color: '#F59E0B' }; // Orange vif
      case 'done':
        return { icon: 'check-circle', label: 'Terminé', color: '#3B82F6' }; // Bleu vif
      default:
        return { icon: 'play-circle', label: 'En cours', color: '#16A34A' }; // Par défaut = En cours (vert)
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
            Chargement...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer 
      scrollable 
      contentStyle={styles.scrollContent}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      {/* Header Premium */}
      <HomeHeader />

      {/* Bloc Stats */}
      <View style={[styles.bloc, { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.xl }]}>
        <SectionTitle title="Vue d'ensemble" emoji="📊" style={styles.sectionTitle} />
        
        <View style={styles.statsGrid}>
          <StatCard
            icon="folder"
            label="Chantiers actifs"
            value={stats.activeProjects}
            color={theme.colors.primary}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('ProjectsList');
            }}
            index={0}
            theme={theme}
            animatedOpacity={statAnims[0].opacity}
            animatedTranslateY={statAnims[0].translateY}
            hasGlow={true} // Glow bleu signature
          />
          <StatCard
            icon="check-circle"
            label="Terminés"
            value={stats.completedProjects}
            color={theme.colors.success}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('ClientsTab');
            }}
            index={1}
            theme={theme}
            animatedOpacity={statAnims[1].opacity}
            animatedTranslateY={statAnims[1].translateY}
          />
          <StatCard
            icon="camera"
            label="Photos"
            value={stats.recentPhotos}
            color={theme.colors.info}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              if (stats.recentPhotos > 0) {
                navigation.navigate('PhotoGallery');
              } else {
                navigation.navigate('CaptureTab');
              }
            }}
            index={2}
            theme={theme}
            animatedOpacity={statAnims[2].opacity}
            animatedTranslateY={statAnims[2].translateY}
          />
          <StatCard
            icon="file-text"
            label="Documents"
            value={stats.recentDocuments}
            color={theme.colors.warning}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('ProTab', { screen: 'Documents' });
            }}
            index={3}
            theme={theme}
            animatedOpacity={statAnims[3].opacity}
            animatedTranslateY={statAnims[3].translateY}
          />
        </View>
      </View>

      {/* Bloc Chantiers en cours */}
      {recentProjects.length > 0 && (
        <View style={[styles.bloc, { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.xl }]}>
          <SectionTitle
            title="Chantiers en cours"
            icon="folder"
            style={styles.sectionTitle}
            action={
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('ClientsTab');
                }}
                style={styles.seeAllButton}
              >
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Voir tout</Text>
                <Feather name="chevron-right" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            }
          />

          <FlatList
            data={recentProjects}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.projectsList}
            renderItem={({ item }) => {
              const statusConfig = getStatusConfig(item.status);
              return (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    useAppStore.getState().setCurrentProject(item);
                    navigation.navigate('ClientsTab', {
                      screen: 'ProjectDetail',
                      params: { projectId: item.id },
                    });
                  }}
                  style={({ pressed }) => [
                    styles.projectCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderRadius: theme.radius.lg,
                      borderColor: theme.colors.border,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    },
                    theme.shadowSoft,
                  ]}
                >
                  <View style={styles.projectCardHeader}>
                    <Feather name="folder" size={24} color={theme.colors.primary} />
                    <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}20` }]}>
                      <Feather name={statusConfig.icon} size={12} color={statusConfig.color} />
                      <Text style={[styles.statusText, { color: statusConfig.color }]}>
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.projectCardTitle, { color: theme.colors.text }]} numberOfLines={2}>
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      )}

      {/* Bloc Photos récentes */}
      {recentPhotos.length > 0 && (
        <View style={[styles.bloc, { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.xl }]}>
          <SectionTitle
            title="Photos récentes"
            icon="image"
            style={styles.sectionTitle}
            action={
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('PhotoGallery');
                }}
                style={styles.seeAllButton}
              >
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Voir tout</Text>
                <Feather name="chevron-right" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            }
          />

          <FlatList
            data={recentPhotos}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.photosList}
            renderItem={({ item }) => (
              <Pressable
                onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
                  navigation.navigate('ClientsTab', {
                    screen: 'ProjectDetail',
                    params: { projectId: item.project_id },
                  });
                }}
                style={({ pressed }) => [
                  styles.photoCard,
                  {
                    borderRadius: theme.radius.md,
                    borderColor: theme.colors.border,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                  theme.shadowSoft,
                ]}
              >
                <Image source={{ uri: item.url }} style={styles.photoImage} />
              </Pressable>
            )}
          />
        </View>
      )}
    </ScreenContainer>
  );
}

// Composant StatCard avec glow bleu sur première carte
function StatCard({ icon, label, value, color, onPress, index, theme, animatedOpacity, animatedTranslateY, hasGlow = false }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (value === 0) return;
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (value === 0) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (value === 0) return;
    onPress?.();
  };

  const styles = getStyles(theme);

  return (
    <Animated.View
      style={{
        opacity: animatedOpacity,
        transform: [{ translateY: animatedTranslateY }, { scale: scaleAnim }],
      }}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={value === 0}
        style={[
          styles.statCard,
          {
            backgroundColor: theme.colors.surfacePremium,
            borderRadius: theme.radius.xl, // 20px
            borderColor: theme.colors.border,
          },
          hasGlow ? theme.glowBlue : theme.shadowSoft, // ✨ Glow bleu signature
          value === 0 && { opacity: 0.6 },
        ]}
      >
        <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
          <Feather name={icon} size={24} color={color} strokeWidth={2.5} />
        </View>
        <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.body,
  },
  bloc: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
    ...theme.shadowSoft,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: theme.spacing.lg,
    borderWidth: 1,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  statValue: {
    fontSize: 32,
    fontWeight: theme.fontWeights.bold,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.small,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  seeAllText: {
    fontSize: theme.typography.small,
    fontWeight: theme.fontWeights.bold,
  },
  projectsList: {
    gap: theme.spacing.md,
  },
  projectCard: {
    width: 200,
    padding: theme.spacing.lg,
    borderWidth: 1,
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
    borderRadius: theme.radius.sm,
    gap: theme.spacing.xs,
  },
  statusText: {
    fontSize: 10,
    fontWeight: theme.fontWeights.bold,
  },
  projectCardTitle: {
    fontSize: theme.typography.body,
    fontWeight: theme.fontWeights.bold,
  },
  photosList: {
    gap: theme.spacing.md,
  },
  photoCard: {
    width: 120,
    height: 120,
    overflow: 'hidden',
    borderWidth: 2,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

