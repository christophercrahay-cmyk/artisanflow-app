import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import { supabase } from '../supabaseClient';
import { useAppStore } from '../store/useAppStore';
import { useSafeTheme } from '../theme/useSafeTheme';
import { Feather } from '@expo/vector-icons';
import { showSuccess, showError } from '../components/Toast';

export default function ClientDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const theme = useSafeTheme();
  const { clientId } = route.params;
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showArchived, setShowArchived] = useState(false); // Toggle affichage chantiers archivés

  const styles = useMemo(() => getStyles(theme), [theme]);

  const loadData = useCallback(async () => {
    try {
      const { data: clientData, error: clientErr } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientErr) {
        // PGRST116 = aucune ligne trouvée (client peut avoir été supprimé)
        if (clientErr.code === 'PGRST116') {
          Alert.alert('Client introuvable', 'Ce client n\'existe plus ou a été supprimé');
          navigation.goBack();
          return;
        }
        console.error('Erreur chargement client:', clientErr);
        Alert.alert('Erreur', 'Impossible de charger le client');
        return;
      }
      if (clientData) {
        setClient(clientData);
        useAppStore.getState().setCurrentClient(clientData);
      }

      // Charger tous les projets (archivés ou non) pour permettre le toggle
      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (projErr) {
        console.error('Erreur chargement projets:', projErr);
        Alert.alert('Erreur', 'Impossible de charger les projets');
        return;
      }
      setProjects(projData || []);
    } catch (err) {
      console.error('Exception chargement données:', err);
      Alert.alert('Erreur', 'Erreur lors du chargement');
    }
  }, [clientId]);

  // ✅ Recharger automatiquement quand on revient sur l'écran
  // (par ex. après suppression d'un projet)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleArchiveProject = async (project) => {
    Alert.alert(
      'Archiver le chantier',
      `Voulez-vous archiver "${project.name}" ?\n\nLe chantier sera masqué mais conservé dans l'historique.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Archiver',
          style: 'default',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('projects')
                .update({
                  archived: true,
                  archived_at: new Date().toISOString(),
                })
                .eq('id', project.id);

              if (error) {
                showError('Impossible d\'archiver le chantier');
                return;
              }

              // ✅ Nettoyer le store pour éviter le cache
              useAppStore.getState().clearProject();
              
              showSuccess('Chantier archivé');
              await loadData();
            } catch (err) {
              showError('Erreur lors de l\'archivage');
            }
          },
        },
      ]
    );
  };

  const handleUnarchiveProject = async (project) => {
    Alert.alert(
      'Désarchiver le chantier',
      `Voulez-vous restaurer "${project.name}" ?\n\nLe chantier redeviendra visible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Désarchiver',
          style: 'default',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('projects')
                .update({
                  archived: false,
                  archived_at: null,
                })
                .eq('id', project.id);

              if (error) {
                showError('Impossible de désarchiver le chantier');
                return;
              }

              showSuccess('Chantier restauré');
              await loadData();
            } catch (err) {
              showError('Erreur lors de la restauration');
            }
          },
        },
      ]
    );
  };

  const handleDeleteArchivedProject = async (project) => {
    Alert.alert(
      'Supprimer définitivement',
      `⚠️ ATTENTION : Supprimer "${project.name}" ?\n\nToutes les photos, notes et documents seront DÉFINITIVEMENT supprimés.\n\nCette action est IRRÉVERSIBLE.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', project.id);

              if (error) {
                showError('Impossible de supprimer le chantier');
                return;
              }

              showSuccess('Chantier supprimé définitivement');
              await loadData();
            } catch (err) {
              showError('Erreur lors de la suppression');
            }
          },
        },
      ]
    );
  };

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => {
                // ⚠️ NAVIGATION VERROUILLÉE - NE PAS MODIFIER SANS RAISON VALABLE
                // Si on peut revenir en arrière, utiliser goBack()
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  // Sinon, réinitialiser vers ClientsList
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [
                        {
                          name: 'Main',
                          state: {
                            routes: [
                              {
                                name: 'ClientsTab',
                                state: {
                                  routes: [{ name: 'ClientsList' }],
                                  index: 0,
                                },
                              },
                            ],
                            index: 0,
                          },
                        },
                      ],
                    })
                  );
                }
              }} 
              style={styles.backBtn} 
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={24} color={theme.colors.accent} strokeWidth={2.5} />
              <Text style={styles.backBtnText}>Retour</Text>
            </TouchableOpacity>
            
            <View style={styles.clientHeader}>
              <View style={styles.avatarContainer}>
                <Feather name="user" size={32} color={theme.colors.accent} strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <Text style={styles.detailTitle}>{client?.name || 'Chargement...'}</Text>
                {client?.address ? (
                  <View style={styles.infoRow}>
                    <Feather name="map-pin" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.detailLine}>{client.address}</Text>
                  </View>
                ) : null}
                {client?.phone ? (
                  <View style={styles.infoRow}>
                    <Feather name="phone" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.detailLine}>{client.phone}</Text>
                  </View>
                ) : null}
                {client?.email ? (
                  <View style={styles.infoRow}>
                    <Feather name="mail" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.detailLine}>{client.email}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        }
        data={[1]}
        keyExtractor={() => 'single'}
        renderItem={() => (
          <View style={styles.content}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Feather name="folder" size={20} color={theme.colors.accent} />
                <Text style={styles.sectionTitle}>
                  Chantiers ({showArchived ? projects.filter(p => p.archived).length : projects.filter(p => !p.archived).length})
                </Text>
              </View>
            </View>

            {/* Bouton Nouveau chantier */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                // ✅ Nettoyer le projet en cours avant de créer un nouveau
                useAppStore.getState().clearProject();
                
                // Navigation vers ProjectCreateScreen avec le clientId pré-rempli
                navigation.navigate('ProjectCreate', { clientId: clientId });
              }}
              activeOpacity={0.7}
            >
              <Feather name="plus" size={18} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.addButtonText}>Nouveau chantier</Text>
            </TouchableOpacity>

            {/* Toggle pour afficher les archivés */}
            <TouchableOpacity
              style={[styles.toggleButton, showArchived && styles.toggleButtonActive]}
              onPress={() => setShowArchived(!showArchived)}
              activeOpacity={0.7}
            >
              <Feather 
                name={showArchived ? "eye-off" : "archive"} 
                size={16} 
                color={showArchived ? theme.colors.text : theme.colors.textSecondary} 
              />
              <Text style={[styles.toggleButtonText, showArchived && styles.toggleButtonTextActive]}>
                {showArchived ? '🔓 Masquer les archivés' : '📦 Afficher les archivés'}
              </Text>
            </TouchableOpacity>

            {projects.filter(p => showArchived ? p.archived : !p.archived).map((item) => {
              const statusConfig = getStatusConfig(item.status || item.status_text);
              return (
                <View key={item.id}>
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
                    onLongPress={() => item.archived ? handleUnarchiveProject(item) : handleArchiveProject(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color  }20` }]}>
                        <Feather name={statusConfig.icon} size={14} color={statusConfig.color} />
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                          {statusConfig.label}
                        </Text>
                      </View>
                    </View>
                    {item.address ? (
                      <View style={styles.infoRow}>
                        <Feather name="map-pin" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.cardLine}>{item.address}</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                  
                {/* Badge + Boutons pour les chantiers archivés */}
                {item.archived && (
                  <View style={styles.archivedSection}>
                    <View style={styles.archivedBadge}>
                      <Text style={styles.archivedBadgeText}>📦 Archivé</Text>
                    </View>
                    <View style={styles.archivedActions}>
                      <TouchableOpacity
                        style={styles.unarchiveButton}
                        onPress={() => handleUnarchiveProject(item)}
                        activeOpacity={0.7}
                      >
                        <Feather name="unlock" size={16} color="#FFFFFF" />
                        <Text style={styles.unarchiveButtonText}>Désarchiver</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteArchivedButton}
                        onPress={() => handleDeleteArchivedProject(item)}
                        activeOpacity={0.7}
                      >
                        <Feather name="trash-2" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                </View>
              );
            })}

            {projects.filter(p => showArchived ? p.archived : !p.archived).length === 0 && (
              <View style={styles.emptyContainer}>
                <Feather name="folder-plus" size={48} color={theme.colors.textMuted} />
                <Text style={styles.empty}>Aucun chantier</Text>
              </View>
            )}

            <View style={{ height: insets.bottom }} />
          </View>
        )}
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
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  backBtnText: { 
    ...theme.typography.body,
    fontWeight: '700',
    marginLeft: theme.spacing.xs,
    color: theme.colors.accent,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${theme.colors.accent  }20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTitle: { 
    ...theme.typography.h2,
    fontSize: 24,
    marginBottom: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  detailLine: {
    ...theme.typography.bodySmall,
    marginLeft: theme.spacing.xs,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  sectionHeader: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  addButtonText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  card: {
    ...theme.card,
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  cardTitle: { 
    ...theme.typography.h4,
    fontSize: 18,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: theme.spacing.xs,
  },
  cardLine: {
    ...theme.typography.bodySmall,
    marginLeft: theme.spacing.xs,
  },
  archivedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: theme.borderRadius.md,
    borderBottomRightRadius: theme.borderRadius.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  archivedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.accent,
  },
  toggleButtonText: {
    ...theme.typography.bodySmall,
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  toggleButtonTextActive: {
    color: theme.colors.text,
  },
  archivedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: `${theme.colors.textMuted}25`,
    borderRadius: theme.borderRadius.sm,
  },
  archivedBadgeText: {
    ...theme.typography.bodySmall,
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  unarchiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#16A34A',
    borderRadius: theme.borderRadius.md,
  },
  unarchiveButtonText: {
    ...theme.typography.bodySmall,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deleteArchivedButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: theme.borderRadius.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  empty: { 
    ...theme.typography.bodySmall,
    marginTop: theme.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
    padding: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: { 
    ...theme.typography.h3,
    marginLeft: theme.spacing.sm,
  },
  label: { 
    ...theme.typography.caption,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  input: {
    ...theme.input,
    marginBottom: theme.spacing.md,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  statusButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  statusButtonActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  statusButtonText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  statusButtonTextActive: {
    color: theme.colors.text,
  },
  modalActions: {
    marginTop: theme.spacing.lg,
  },
  saveButton: {
    ...theme.buttons.primary,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  saveButtonText: {
    ...theme.buttons.primaryText,
  },
  cancelButton: {
    ...theme.buttons.secondary,
  },
  cancelButtonText: {
    ...theme.buttons.secondaryText,
    color: theme.colors.error,
  },
});
