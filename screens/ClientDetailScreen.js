// Refactor 2025-11 - Fiche client premium + actions tel/email/adresse
// Palette uniforme : fond #020817, texte #F9FAFB, secondaire #9CA3AF, bleu #3B82F6
import React, { useEffect, useState, useMemo, useCallback } from 'react';

// Palette de couleurs uniforme
const COLORS = {
  background: '#020817',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  blue: '#3B82F6',
  cardBg: 'rgba(15,23,42,0.95)',
  cardBorder: 'rgba(148,163,184,0.18)',
  activeBadgeBg: 'rgba(34,197,94,0.16)',
  activeBadgeText: '#22C55E',
};
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Linking,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import { supabase } from '../supabaseClient';
import { useAppStore } from '../store/useAppStore';
import { useSafeTheme } from '../theme/useSafeTheme';
import { Feather } from '@expo/vector-icons';
import { showSuccess, showError } from '../components/Toast';
import AFModal from '../components/ui/AFModal';

export default function ClientDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const theme = useSafeTheme();
  const { clientId } = route.params;
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showArchived, setShowArchived] = useState(false); // Toggle affichage chantiers archivés
  // États pour les modales
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToAction, setProjectToAction] = useState(null);

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
          showError('Ce client n\'existe plus ou a été supprimé');
          navigation.goBack();
          return;
        }
        console.error('Erreur chargement client:', clientErr);
        showError('Impossible de charger le client');
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
        showError('Impossible de charger les projets');
        return;
      }
      setProjects(projData || []);
    } catch (err) {
      console.error('Exception chargement données:', err);
      showError('Erreur lors du chargement');
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
    setProjectToAction(project);
    setShowArchiveModal(true);
  };

  const confirmArchive = async () => {
    const project = projectToAction;
    setShowArchiveModal(false);
    setProjectToAction(null);

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
  };

  const handleUnarchiveProject = async (project) => {
    setProjectToAction(project);
    setShowUnarchiveModal(true);
  };

  const confirmUnarchive = async () => {
    const project = projectToAction;
    setShowUnarchiveModal(false);
    setProjectToAction(null);

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
  };

  const handleDeleteArchivedProject = async (project) => {
    setProjectToAction(project);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const project = projectToAction;
    setShowDeleteModal(false);
    setProjectToAction(null);

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
  };

  // Actions cliquables : téléphone, email, adresse
  const handleCall = useCallback((phone) => {
    if (!phone) return;
    const cleaned = phone.toString().replace(/[\s\.]/g, '');
    const url = `tel:${cleaned}`;
    Linking.openURL(url).catch((err) => {
      console.warn('Erreur ouverture téléphone', err);
    });
  }, []);

  const handleEmail = useCallback((email) => {
    if (!email) return;
    const url = `mailto:${email}`;
    Linking.openURL(url).catch((err) => {
      console.warn('Erreur ouverture email', err);
    });
  }, []);

  const handleAddress = useCallback((address) => {
    if (!address) return;
    const query = encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch((err) => {
      console.warn('Erreur ouverture Google Maps', err);
    });
  }, []);

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
              <Feather name="arrow-left" size={24} color={COLORS.blue} strokeWidth={2.5} />
              <Text style={styles.backBtnText}>Retour</Text>
            </TouchableOpacity>
            
            {/* Bloc identité client premium */}
            <View style={styles.clientIdentityBlock}>
              <View style={styles.avatarContainer}>
                <Feather name="user" size={32} color={COLORS.blue} strokeWidth={2.5} />
              </View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{client?.name || 'Chargement...'}</Text>
                
                {/* Adresse cliquable */}
                {client?.address ? (
                  <Pressable
                    onPress={() => handleAddress(client.address)}
                    style={({ pressed }) => [
                      styles.infoRowPressable,
                      pressed && styles.infoRowPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Ouvrir l'adresse dans Google Maps: ${client.address}`}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="map-pin" size={16} color={COLORS.blue} />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Adresse</Text>
                      <Text style={styles.infoValue}>{client.address}</Text>
                    </View>
                  </Pressable>
                ) : null}
                
                {/* Téléphone cliquable */}
                {client?.phone ? (
                  <Pressable
                    onPress={() => handleCall(client.phone)}
                    style={({ pressed }) => [
                      styles.infoRowPressable,
                      pressed && styles.infoRowPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Appeler ${client.phone}`}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="phone" size={16} color={COLORS.blue} />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Téléphone</Text>
                      <Text style={styles.infoValue}>{client.phone}</Text>
                    </View>
                  </Pressable>
                ) : null}
                
                {/* Email cliquable */}
                {client?.email ? (
                  <Pressable
                    onPress={() => handleEmail(client.email)}
                    style={({ pressed }) => [
                      styles.infoRowPressable,
                      pressed && styles.infoRowPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Envoyer un email à ${client.email}`}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="mail" size={16} color={COLORS.blue} />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Email</Text>
                      <Text style={styles.infoValue}>{client.email}</Text>
                    </View>
                  </Pressable>
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
                <Feather name="folder" size={20} color={COLORS.blue} />
                <Text style={styles.sectionTitle}>
                  Chantiers ({showArchived ? projects.filter(p => p.archived).length : projects.filter(p => !p.archived).length})
                </Text>
              </View>
            </View>

            {/* Message si aucun chantier */}
            {projects.filter(p => showArchived ? p.archived : !p.archived).length === 0 && (
              <Text style={styles.noProjectsText}>
                Aucun chantier pour ce client pour l'instant.
              </Text>
            )}

            {/* Bouton Nouveau chantier premium */}
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
              <Feather name="folder-plus" size={18} color="#FFFFFF" strokeWidth={2.5} />
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
                color={showArchived ? COLORS.textPrimary : COLORS.textSecondary} 
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
                      <View style={[
                        styles.statusBadge,
                        (statusConfig.label === 'Actif' || statusConfig.label === 'En cours') 
                          ? styles.activeBadge 
                          : { backgroundColor: `${statusConfig.color}25` }
                      ]}>
                        <Feather 
                          name={statusConfig.icon} 
                          size={14} 
                          color={(statusConfig.label === 'Actif' || statusConfig.label === 'En cours') 
                            ? COLORS.activeBadgeText 
                            : statusConfig.color} 
                        />
                        <Text style={[
                          styles.statusText,
                          (statusConfig.label === 'Actif' || statusConfig.label === 'En cours')
                            ? { color: COLORS.activeBadgeText }
                            : { color: statusConfig.color }
                        ]}>
                          {statusConfig.label}
                        </Text>
                      </View>
                    </View>
                    {item.address ? (
                      <View style={styles.infoRow}>
                        <Feather name="map-pin" size={14} color={COLORS.textSecondary} />
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
                <Feather name="folder-plus" size={48} color={COLORS.textSecondary} />
                <Text style={styles.empty}>Aucun chantier</Text>
              </View>
            )}

            <View style={{ height: insets.bottom }} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Modales */}
      <AFModal
        visible={showArchiveModal}
        title="Archiver le chantier"
        message={projectToAction ? `Voulez-vous archiver "${projectToAction.name}" ?\n\nLe chantier sera masqué mais conservé dans l'historique.` : ''}
        onCancel={() => {
          setShowArchiveModal(false);
          setProjectToAction(null);
        }}
        onConfirm={confirmArchive}
        confirmLabel="Archiver"
        cancelLabel="Annuler"
      />

      <AFModal
        visible={showUnarchiveModal}
        title="Désarchiver le chantier"
        message={projectToAction ? `Voulez-vous restaurer "${projectToAction.name}" ?\n\nLe chantier redeviendra visible.` : ''}
        onCancel={() => {
          setShowUnarchiveModal(false);
          setProjectToAction(null);
        }}
        onConfirm={confirmUnarchive}
        confirmLabel="Désarchiver"
        cancelLabel="Annuler"
      />

      <AFModal
        visible={showDeleteModal}
        title="Supprimer définitivement"
        message={projectToAction ? `⚠️ ATTENTION : Supprimer "${projectToAction.name}" ?\n\nToutes les photos, notes et documents seront DÉFINITIVEMENT supprimés.\n\nCette action est IRRÉVERSIBLE.` : ''}
        onCancel={() => {
          setShowDeleteModal(false);
          setProjectToAction(null);
        }}
        onConfirm={confirmDelete}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        danger={true}
      />
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background,
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
    color: COLORS.blue,
  },
  clientIdentityBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(15,23,42,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: theme.spacing.md,
  },
  infoRowPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingVertical: 6,
  },
  infoRowPressed: {
    opacity: 0.7,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  sectionHeader: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  noProjectsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: theme.spacing.md,
    fontStyle: 'italic',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.blue,
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 14,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  addButtonText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  cardTitle: { 
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
  },
  activeBadge: {
    backgroundColor: COLORS.activeBadgeBg,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  cardLine: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  archivedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: COLORS.cardBg,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
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
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: theme.spacing.md,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.blue,
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toggleButtonTextActive: {
    color: COLORS.textPrimary,
  },
  archivedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: `${COLORS.textSecondary}25`,
    borderRadius: 12,
  },
  archivedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
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
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: theme.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: { 
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  label: { 
    fontSize: 12,
    marginBottom: theme.spacing.sm,
    color: COLORS.textPrimary,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  statusButtonActive: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  statusButtonText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusButtonTextActive: {
    color: COLORS.textPrimary,
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
