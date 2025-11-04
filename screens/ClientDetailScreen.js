import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectAddress, setNewProjectAddress] = useState('');
  const [newProjectStatus, setNewProjectStatus] = useState('planned');
  const [creatingProject, setCreatingProject] = useState(false);

  const styles = useMemo(() => getStyles(theme), [theme]);

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    try {
      const { data: clientData, error: clientErr } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientErr) {
        console.error('Erreur chargement client:', clientErr);
        Alert.alert('Erreur', 'Impossible de charger le client');
        return;
      }
      if (clientData) {
        setClient(clientData);
        useAppStore.getState().setCurrentClient(clientData);
      }

      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', clientId)
        .eq('archived', false) // Filtrer les projets non-archivés par défaut
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
  };

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

  const createProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert('Erreur', 'Le nom du chantier est obligatoire');
      return;
    }

    try {
      setCreatingProject(true);

      // Récupérer l'utilisateur connecté pour RLS
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const projectAddress = newProjectAddress.trim() || null;
      const projectStatus = newProjectStatus || 'planned';

      const { error } = await supabase.from('projects').insert([
        {
          name: newProjectName.trim(),
          address: projectAddress,
          client_id: clientId,
          user_id: user.id, // Nécessaire pour RLS
          status: projectStatus,
          status_text: projectStatus,
          archived: false, // Nouveau projet non-archivé par défaut
        },
      ]);

      if (error) {
        console.error('🔴 [CreateProject] Erreur DB:', error);
        throw error;
      }

      console.log('✅ [CreateProject] Chantier créé');

      // Reset
      setNewProjectName('');
      setNewProjectAddress('');
      setNewProjectStatus('planned');
      setShowNewProjectModal(false);
      
      // Refresh
      await loadData();
      Alert.alert('✅ Succès', 'Chantier créé avec succès');
    } catch (err) {
      console.error('🔴 [CreateProject] Exception:', err);
      Alert.alert('Erreur', err.message || 'Impossible de créer le chantier');
    } finally {
      setCreatingProject(false);
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
        return { icon: 'help-circle', label: status, color: theme.colors.textSecondary };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
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
              <Feather name="folder" size={20} color={theme.colors.accent} />
              <Text style={styles.sectionTitle}>Chantiers ({projects.length})</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setNewProjectAddress(client?.address || '');
                  setShowNewProjectModal(true);
                }}
                activeOpacity={0.7}
              >
                <Feather name="plus" size={18} color={theme.colors.text} strokeWidth={2.5} />
                <Text style={styles.addButtonText}>Nouveau</Text>
              </TouchableOpacity>
            </View>

            {projects.map((item) => {
              const statusConfig = getStatusConfig(item.status || item.status_text);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
                  onLongPress={() => handleArchiveProject(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
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
              );
            })}

            {projects.length === 0 && (
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

      {/* Modal création chantier - VERSION SIMPLIFIÉE */}
      <Modal
        visible={showNewProjectModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewProjectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.text, marginBottom: 20 }}>
                Nouveau chantier
              </Text>
              
              <TextInput
                placeholder="Nom du chantier *"
                placeholderTextColor={theme.colors.textMuted}
                value={newProjectName}
                onChangeText={setNewProjectName}
                style={{
                  backgroundColor: theme.colors.surfaceElevated,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: theme.colors.text,
                  marginBottom: 16,
                }}
                autoFocus
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={createProject}
                  disabled={creatingProject}
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.accent,
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    opacity: creatingProject ? 0.6 : 1,
                  }}
                >
                  {creatingProject ? (
                    <ActivityIndicator color={theme.colors.text} />
                  ) : (
                    <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 16 }}>
                      Créer
                    </Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => {
                    setShowNewProjectModal(false);
                    setNewProjectName('');
                    setNewProjectAddress('');
                    setNewProjectStatus('planned');
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.surface,
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 16 }}>
                    Annuler
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: theme.colors.accent + '20',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h4,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.md,
  },
  addButtonText: {
    ...theme.typography.body,
    fontWeight: '700',
    marginLeft: theme.spacing.xs,
    color: theme.colors.text,
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
