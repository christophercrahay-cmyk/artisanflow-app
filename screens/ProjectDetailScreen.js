import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '../supabaseClient';
import { useAppStore } from '../store/useAppStore';
import PhotoUploader from '../PhotoUploader';
import VoiceRecorder from '../VoiceRecorder';
import DevisFactures from '../DevisFactures';
import DevisAIGenerator from '../components/DevisAIGenerator2';
import FactureAIGenerator from '../components/FactureAIGenerator';
import CollapsibleSection from '../components/CollapsibleSection';
import { useSafeTheme } from '../theme/useSafeTheme';
import { Feather } from '@expo/vector-icons';
import logger from '../utils/logger';
import { ICON_COLORS } from '../theme/iconColors';
import { COLORS } from '../theme/colors';
import { modalComponentStyles } from '../theme/modalStyles';
import AFModal from '../components/ui/AFModal';
import { AFInput } from '../components/ui';

// Palette de couleurs locale (pour compatibilité avec le code existant)
const LOCAL_COLORS = {
  background: '#020817',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  blue: '#3B82F6',
  cardBg: 'rgba(15,23,42,0.95)',
  cardBorder: 'rgba(148,163,184,0.18)',
  activeBadgeBg: 'rgba(34,197,94,0.16)',
  activeBadgeText: '#22C55E',
};
import { showSuccess, showError } from '../components/Toast';
import { getCurrentUser } from '../utils/auth';
import { getOrCreateProjectShareLink } from '../services/projectShareService';

export default function ProjectDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const theme = useSafeTheme();
  const { projectId } = route.params;
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [notesRefreshKey, setNotesRefreshKey] = useState(0);
  const [showTextNoteModal, setShowTextNoteModal] = useState(false);
  const [textNote, setTextNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  const styles = useMemo(() => getStyles(theme), [theme]);

  useEffect(() => {
    loadData();
  }, [projectId]);

  // Rafraîchir automatiquement quand l'écran devient visible
  useFocusEffect(
    useCallback(() => {
      loadData();
      // Forcer le rafraîchissement de VoiceRecorder
      setNotesRefreshKey(prev => prev + 1);
    }, [])
  );

  const loadData = async () => {
    try {
      // ✅ Vérifier que l'utilisateur est connecté
      const user = await getCurrentUser();
      if (!user) {
        logger.warn('ProjectDetail', 'Pas de user connecté');
        showError('Utilisateur non authentifié');
        return;
      }

      // ✅ Charger le projet avec vérification user_id pour isolation multi-tenant
      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id) // ✅ Filtre obligatoire pour isolation utilisateurs
        .single();

      if (projErr) {
        // PGRST116 = aucune ligne trouvée (projet n'existe pas ou n'appartient pas à l'utilisateur)
        if (projErr.code === 'PGRST116') {
          logger.warn('ProjectDetail', 'Projet non trouvé ou accès non autorisé');
          showError('Projet non trouvé ou accès non autorisé');
          navigation.goBack(); // Retourner en arrière si accès non autorisé
          return;
        }
        logger.error('ProjectDetail', 'Erreur chargement projet', projErr);
        showError('Impossible de charger le projet');
        return;
      }
      
      if (!projData) {
        logger.warn('ProjectDetail', 'Projet non trouvé');
        showError('Projet non trouvé');
        navigation.goBack();
        return;
      }

      // ✅ Vérifier que le projet appartient bien à l'utilisateur (double vérification)
      if (projData.user_id !== user.id) {
        logger.warn('ProjectDetail', 'Tentative d\'accès non autorisé', { 
          projectUserId: projData.user_id, 
          currentUserId: user.id 
        });
        showError('Accès non autorisé à ce projet');
        navigation.goBack();
        return;
      }
      
      setProject(projData);
      useAppStore.getState().setCurrentProject(projData);
      
      if (projData.client_id) {
        const { data: clientData, error: clientErr } = await supabase
          .from('clients')
          .select('*')
          .eq('id', projData.client_id)
          .eq('user_id', user.id) // ✅ Filtre obligatoire pour isolation utilisateurs
          .single();
        
        if (clientErr) {
          // PGRST116 = aucune ligne trouvée (client peut ne plus exister)
          if (clientErr.code === 'PGRST116') {
            logger.warn('ProjectDetail', 'Client non trouvé (peut avoir été supprimé)');
          } else {
            logger.error('ProjectDetail', 'Erreur chargement client', clientErr);
          }
        } else if (clientData) {
          setClient(clientData);
          useAppStore.getState().setCurrentClient(clientData);
        }
      }
    } catch (err) {
      logger.error('ProjectDetail', 'Exception chargement données', err);
      showError('Erreur lors du chargement');
    }
  };


  const handleChangeStatus = async (newStatus) => {
    try {
      logger.info('ProjectDetail', `Changement statut vers: ${newStatus}`);
      
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);
      
      if (error) {
        logger.error('ProjectDetail', 'Erreur changement statut', error);
        throw error;
      }
      
      // Mettre à jour le state local
      setProject({ ...project, status: newStatus });
      
      const statusLabels = {
        active: 'Actif',
        in_progress: 'En cours',
        planned: 'Planifié',
        done: 'Terminé',
      };
      
      showSuccess(`Statut changé : ${statusLabels[newStatus] || newStatus}`);
      setShowStatusModal(false);
      
      logger.success('ProjectDetail', 'Statut changé', { newStatus });
    } catch (err) {
      logger.error('ProjectDetail', 'Exception changement statut', err);
      showError('Impossible de changer le statut');
    }
  };

  const handleArchiveProject = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          archived: true,
          archived_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      if (error) {
        showError('Impossible d\'archiver le chantier');
        return;
      }

      // ✅ Nettoyer le store pour éviter le cache
      useAppStore.getState().clearProject();
      
      showSuccess('Chantier archivé');
      setShowArchiveModal(false);
      navigation.goBack();
    } catch (err) {
      showError('Erreur lors de l\'archivage');
    }
  };

  const handleUnarchiveProject = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          archived: false,
          archived_at: null,
        })
        .eq('id', projectId);

      if (error) {
        showError('Impossible de désarchiver le chantier');
        return;
      }

      showSuccess('Chantier restauré');
      setShowUnarchiveModal(false);
      await loadData(); // Recharger pour mettre à jour l'affichage
    } catch (err) {
      showError('Erreur lors de la restauration');
    }
  };

  const handleDeleteProject = () => {
    // Fermer le menu et ouvrir la modal de confirmation moderne
    setShowProjectMenu(false);
    setTimeout(() => setShowDeleteConfirmModal(true), 300);
  };

  const confirmDeleteProject = async () => {
    try {
      setDeletingProject(true);
      
      // Suppression en cascade via le store Zustand
      // ✅ Supprime en DB ET met à jour le state global
      await useAppStore.getState().deleteProject(projectId);

      logger.success('ProjectDetail', 'Projet supprimé', { projectId });
      
      // Fermer la modal
      setShowDeleteConfirmModal(false);
      setDeletingProject(false);
      
      // Toast de succès
      showSuccess('Chantier supprimé avec succès');
      
      // Retour à l'écran précédent (liste rafraîchie automatiquement)
      setTimeout(() => navigation.goBack(), 300);
    } catch (err) {
      logger.error('ProjectDetail', 'Exception suppression', err);
      setDeletingProject(false);
      showError(err.message || 'Erreur lors de la suppression. Veuillez réessayer.');
    }
  };

  const handleAddTextNote = async () => {
    if (!textNote.trim()) {
      showError('Saisissez votre note');
      return;
    }

    // Ne pas vider le texte en cas d'erreur
    const noteTextToSave = textNote.trim();

    try {
      setSavingNote(true);
      logger.info('ProjectDetail', 'Enregistrement note texte', { projectId });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {throw new Error('Utilisateur non authentifié');}

      const noteData = {
        project_id: projectId,
        client_id: project?.client_id,
        user_id: user.id,
        type: 'text',
        transcription: noteTextToSave, // Utiliser transcription pour les notes texte aussi
      };

      // ✅ Utiliser .select() pour récupérer la note insérée
      const { data, error } = await supabase
        .from('notes')
        .insert([noteData])
        .select();

      if (error) {
        logger.error('ProjectDetail', 'Erreur insertion note', error);
        throw error;
      }

      logger.success('ProjectDetail', 'Note texte enregistrée');
      
      // ✅ Forcer le rechargement de VoiceRecorder en changeant sa clé
      setNotesRefreshKey(prev => prev + 1);
      
      // Reset et fermer modal
      setShowTextNoteModal(false);
      setTextNote('');
      
      // ✅ Afficher toast APRÈS fermeture modal
      setTimeout(() => {
        showSuccess(`Note ajoutée au chantier "${project.name}"`);
      }, 300);
    } catch (err) {
      logger.error('ProjectDetail', 'Exception note texte', err);
      showError(err.message || 'Erreur lors de l\'enregistrement de la note. Vérifiez votre connexion.');
      // Ne pas vider textNote en cas d'erreur pour que l'utilisateur ne perde pas son texte
    } finally {
      setSavingNote(false);
    }
  };

  const handleShare = async () => {
    try {
      setShareLoading(true);
      logger.info('ProjectDetail', 'Génération lien de partage', { projectId });

      const url = await getOrCreateProjectShareLink(projectId);

      // Copier l'URL dans le presse-papier
      await Clipboard.setStringAsync(url);

      // Afficher un message de succès avec option de partage
      Alert.alert(
        'Lien de partage généré',
        `Le lien a été copié dans le presse-papier.\n\n${url}\n\nVous pouvez maintenant le partager via SMS, Email, WhatsApp, etc.`,
        [
          {
            text: 'Partager maintenant',
            onPress: async () => {
              // Essayer d'ouvrir le menu de partage natif via SMS (qui accepte le texte)
              const message = `Voici le lien de suivi de votre chantier : ${url}`;
              const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
              const canOpen = await Linking.canOpenURL(smsUrl);
              if (canOpen) {
                await Linking.openURL(smsUrl);
              } else {
                // Fallback : afficher le message
                showSuccess('Lien copié ! Collez-le dans votre application de messagerie.');
              }
            },
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );

      logger.success('ProjectDetail', 'Lien de partage généré et copié', { url });
    } catch (error) {
      logger.error('ProjectDetail', 'Erreur partage chantier', error);
      showError(error.message || 'Impossible de générer le lien de partage pour le moment.');
    } finally {
      setShareLoading(false);
    }
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

  if (!project) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Bouton retour même pendant le chargement */}
        <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              // Pendant le chargement, naviguer vers la liste des clients
              navigation.dispatch(
                CommonActions.navigate({
                  name: 'Main',
                  params: {
                    screen: 'ClientsTab',
                    params: {
                      screen: 'ClientsList',
                    },
                  },
                })
              );
            }}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color={LOCAL_COLORS.textPrimary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loading}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(project.status || project.status_text);

  // ⚠️ NAVIGATION VERROUILLÉE - NE PAS MODIFIER SANS RAISON VALABLE
  // Fonction pour gérer le retour : toujours vers le client ou la liste
  // Utilise goBack() si possible, sinon reset() pour éviter les boucles
  const handleGoBack = () => {
    // Si on peut revenir en arrière dans le stack actuel, utiliser goBack()
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    // Sinon, réinitialiser la navigation vers le bon écran
    if (project?.client_id) {
      // Réinitialiser vers ClientDetail dans ClientsTab
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            {
              name: 'Main',
              state: {
                routes: [
                  {
                    name: 'ClientsTab',
                    state: {
                      routes: [
                        { name: 'ClientsList' },
                        {
                          name: 'ClientDetail',
                          params: { clientId: project.client_id },
                        },
                      ],
                      index: 1,
                    },
                  },
                ],
                index: 0,
              },
            },
          ],
        })
      );
    } else {
      // Réinitialiser vers ClientsList
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
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Bouton retour */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoBack}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={24} color={ICON_COLORS.primary} strokeWidth={2.5} />
            </TouchableOpacity>
            
            {/* Carte header chantier premium */}
            <View style={styles.projectCard}>
              <View style={styles.projectCardContent}>
                <Feather name="folder" size={28} color={ICON_COLORS.folder} strokeWidth={2.5} />
                <View style={styles.projectCardText}>
                  <View style={styles.projectCardHeader}>
                    <Text style={styles.projectCardTitle}>{project.name}</Text>
                    <TouchableOpacity
                      style={styles.menuIconButton}
                      onPress={() => setShowProjectMenu(true)}
                      activeOpacity={0.7}
                    >
                      <Feather name="more-vertical" size={20} color={ICON_COLORS.primary} strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                  {project.address ? (
                    <Text style={styles.projectCardInfo}>{project.address}</Text>
                  ) : null}
                  {client ? (
                    <Text style={styles.projectCardInfo}>{client.name}</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.projectCardFooter}>
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
                      ? LOCAL_COLORS.activeBadgeText
                      : statusConfig.color} 
                  />
                  <Text style={[
                    styles.statusText,
                    (statusConfig.label === 'Actif' || statusConfig.label === 'En cours')
                      ? { color: LOCAL_COLORS.activeBadgeText }
                      : { color: statusConfig.color }
                  ]}>
                    {statusConfig.label}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        }
        data={[1]}
        keyExtractor={() => 'single'}
        renderItem={() => (
          <View style={styles.content}>
            {/* Photos de chantier - Menu déroulant */}
            <CollapsibleSection
              title="Photos de chantier"
              icon="image"
              defaultExpanded={false}
            >
              <PhotoUploader projectId={projectId} />
            </CollapsibleSection>

            {/* Journal de bord - Menu déroulant */}
            <CollapsibleSection
              title="Journal de bord"
              icon="book-open"
              defaultExpanded={false}
            >
              <View style={styles.journalSection}>
                <Text style={styles.journalSubtitle}>
                  Capturez les événements de ce chantier
                </Text>
                <TouchableOpacity
                  style={styles.addNoteButton}
                  onPress={() => setShowTextNoteModal(true)}
                  activeOpacity={0.7}
                >
                  <Feather name="edit-3" size={18} color={ICON_COLORS.primary} strokeWidth={2.5} />
                  <Text style={styles.addNoteButtonText}>Ajouter une note texte</Text>
                </TouchableOpacity>
              </View>
            </CollapsibleSection>

            {/* Notes vocales - Menu déroulant */}
            <CollapsibleSection
              title="Notes vocales"
              icon="mic"
              defaultExpanded={false}
            >
              <VoiceRecorder key={notesRefreshKey} projectId={projectId} />
            </CollapsibleSection>

            {/* 🤖 Générateur Devis IA */}
            <View style={styles.aiGeneratorSection}>
              <Text style={styles.sectionTitle}>
                <Feather name="zap" size={18} color={COLORS.ai} />
                {' '}Devis IA
              </Text>
              <DevisAIGenerator 
                projectId={projectId} 
                clientId={project?.client_id}
                onDevisCreated={loadData}
                navigation={navigation}
              />
            </View>

            {/* 🤖 Générateur Facture IA */}
            <View style={styles.aiGeneratorSection}>
              <Text style={styles.sectionTitle}>
                <Feather name="zap" size={18} color={COLORS.ai} />
                {' '}Facture IA
              </Text>
              <FactureAIGenerator 
                projectId={projectId} 
                clientId={project?.client_id}
                onFactureCreated={loadData}
                navigation={navigation}
              />
            </View>

            {/* Section Devis & Factures */}
            <View style={styles.devisFacturesSection}>
              <DevisFactures projectId={projectId} clientId={project?.client_id} type="devis" />
            </View>

            <View style={styles.devisFacturesSection}>
              <DevisFactures projectId={projectId} clientId={project?.client_id} type="facture" />
            </View>
            <View style={{ height: insets.bottom }} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* ✨ Modal menu projet (Archiver / Supprimer) - Refonte */}
      <Modal
        visible={showProjectMenu}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowProjectMenu(false)}
      >
        <Pressable 
          style={styles.menuOverlay} 
          onPress={() => setShowProjectMenu(false)}
        >
          <Pressable style={styles.menuContent} onPress={(e) => e.stopPropagation()}>
            {/* Titre de la modal */}
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Actions du chantier</Text>
              {project?.name && (
                <Text style={styles.menuSubtitle}>{project.name}</Text>
              )}
            </View>

            {/* Phrase d'avertissement court */}
            <Text style={styles.menuWarning}>
              Les photos, notes et documents liés seront affectés.
            </Text>

            {/* Bouton Changer Statut */}
            <TouchableOpacity
              style={[styles.menuButton, styles.menuStatusButton]}
              onPress={() => {
                setShowProjectMenu(false);
                setTimeout(() => setShowStatusModal(true), 300);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.menuButtonIcon}>
                <Feather name="edit-3" size={20} color={ICON_COLORS.primary} strokeWidth={2.5} />
              </View>
              <Text style={styles.menuButtonText}>Changer le statut</Text>
            </TouchableOpacity>

            {/* Bouton Partager avec le client */}
            <TouchableOpacity
              style={[styles.menuButton, styles.menuShareButton]}
              onPress={async () => {
                setShowProjectMenu(false);
                setTimeout(() => handleShare(), 300);
              }}
              activeOpacity={0.7}
              disabled={shareLoading}
            >
              <View style={styles.menuButtonIcon}>
                {shareLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Feather name="share-2" size={20} color="#FFFFFF" strokeWidth={2.5} />
                )}
              </View>
              <Text style={styles.menuButtonText}>
                {shareLoading ? 'Génération...' : 'Partager avec le client'}
              </Text>
            </TouchableOpacity>

            {/* Bouton Archiver / Désarchiver selon le statut */}
            {project?.archived ? (
              <TouchableOpacity
                style={[styles.menuButton, styles.menuUnarchiveButton]}
                onPress={() => {
                  setShowProjectMenu(false);
                  setTimeout(() => setShowUnarchiveModal(true), 300);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.menuButtonIcon}>
                  <Feather name="archive" size={20} color={ICON_COLORS.archive} strokeWidth={2.5} />
                </View>
                <Text style={styles.menuButtonText}>🔓 Désarchiver</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.menuButton, styles.menuArchiveButton]}
                onPress={() => {
                  setShowProjectMenu(false);
                  setTimeout(() => setShowArchiveModal(true), 300);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.menuButtonIcon}>
                  <Feather name="archive" size={20} color={ICON_COLORS.archive} strokeWidth={2.5} />
                </View>
                <Text style={styles.menuButtonText}>📦 Archiver</Text>
              </TouchableOpacity>
            )}
            
            {/* Bouton Supprimer */}
            <TouchableOpacity
              style={[styles.menuButton, styles.menuDeleteButton]}
              onPress={() => {
                setShowProjectMenu(false);
                setTimeout(() => handleDeleteProject(), 300);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.menuButtonIcon}>
                <Feather name="trash-2" size={20} color={ICON_COLORS.danger} strokeWidth={2.5} />
              </View>
              <Text style={styles.menuButtonText}>Supprimer</Text>
            </TouchableOpacity>

            {/* Bouton Annuler */}
            <TouchableOpacity
              style={[styles.menuButton, styles.menuCancelButton]}
              onPress={() => setShowProjectMenu(false)}
              activeOpacity={0.7}
            >
              <View style={styles.menuButtonIcon}>
                <Feather name="x" size={20} color={ICON_COLORS.secondary} strokeWidth={2.5} />
              </View>
              <Text style={styles.menuButtonText}>Annuler</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal note texte */}
      <Modal
        visible={showTextNoteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (!savingNote) {
            setShowTextNoteModal(false);
            setTextNote('');
          }
        }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '80%' }]}>
              <View style={styles.modalHeader}>
                <Feather name="edit-3" size={24} color={ICON_COLORS.primary} />
                <Text style={styles.modalTitle}>Note texte</Text>
              </View>
              
              <AFInput
                icon="file-text"
                placeholder="Saisissez votre note..."
                value={textNote}
                onChangeText={setTextNote}
                multiline
                numberOfLines={8}
                editable={!savingNote}
                containerStyle={{
                  marginBottom: 16,
                  minHeight: 150,
                }}
                style={{
                  minHeight: 150,
                  maxHeight: 300,
                  textAlignVertical: 'top',
                }}
                autoFocus
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={handleAddTextNote}
                  disabled={savingNote || !textNote.trim()}
                  style={[styles.generateButton, (savingNote || !textNote.trim()) && { opacity: 0.6 }]}
                  activeOpacity={0.7}
                >
                  {savingNote ? (
                    <ActivityIndicator color={ICON_COLORS.primary} />
                  ) : (
                    <>
                      <Feather name="check-circle" size={20} color={ICON_COLORS.primary} />
                      <Text style={styles.generateButtonText}>Enregistrer</Text>
                    </>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => {
                    if (!savingNote) {
                      setShowTextNoteModal(false);
                      setTextNote('');
                    }
                  }}
                  disabled={savingNote}
                  style={[styles.cancelModalButton, savingNote && { opacity: 0.6 }]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelModalText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ✨ Modal Changement Statut */}
      <Modal
        visible={showStatusModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStatusModal(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setShowStatusModal(false)}>
          <Pressable style={styles.statusModalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.statusModalHeader}>
              <Feather name="edit-3" size={24} color={theme.colors.accent} />
              <Text style={styles.statusModalTitle}>Changer le statut</Text>
            </View>

            <Text style={styles.statusModalSubtitle}>
              Chantier : {project?.name}
            </Text>

            {/* Options de statut */}
            <View style={styles.statusOptions}>
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  (project?.status === 'in_progress' || project?.status === 'active') && styles.statusOptionActive,
                ]}
                onPress={() => handleChangeStatus('in_progress')}
                activeOpacity={0.7}
              >
                <Text style={styles.statusEmoji}>🟢</Text>
                <View style={styles.statusOptionText}>
                  <Text style={styles.statusOptionTitle}>En cours</Text>
                  <Text style={styles.statusOptionDescription}>Travaux en cours</Text>
                </View>
                {(project?.status === 'in_progress' || project?.status === 'active') && (
                  <Feather name="check" size={20} color={ICON_COLORS.primary} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusOption,
                  project?.status === 'planned' && styles.statusOptionActive,
                ]}
                onPress={() => handleChangeStatus('planned')}
                activeOpacity={0.7}
              >
                <Text style={styles.statusEmoji}>🟠</Text>
                <View style={styles.statusOptionText}>
                  <Text style={styles.statusOptionTitle}>Planifié</Text>
                  <Text style={styles.statusOptionDescription}>En attente de démarrage</Text>
                </View>
                {project?.status === 'planned' && (
                  <Feather name="check" size={20} color={ICON_COLORS.primary} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusOption,
                  project?.status === 'done' && styles.statusOptionActive,
                ]}
                onPress={() => handleChangeStatus('done')}
                activeOpacity={0.7}
              >
                <Text style={styles.statusEmoji}>✅</Text>
                <View style={styles.statusOptionText}>
                  <Text style={styles.statusOptionTitle}>Terminé</Text>
                  <Text style={styles.statusOptionDescription}>Travaux terminés</Text>
                </View>
                {project?.status === 'done' && (
                  <Feather name="check" size={20} color={ICON_COLORS.primary} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.statusCancelButton}
              onPress={() => setShowStatusModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.statusCancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ✨ Modal de confirmation de suppression (2ème étape) */}
      <AFModal
        visible={showDeleteConfirmModal}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer le chantier "${project?.name}" ?\n\nCette action est définitive. Toutes les photos, notes et documents associés seront effacés définitivement.`}
        onCancel={() => {
          if (!deletingProject) {
            setShowDeleteConfirmModal(false);
          }
        }}
        onConfirm={confirmDeleteProject}
        confirmLabel={deletingProject ? 'Suppression...' : 'Supprimer définitivement'}
        cancelLabel="Annuler"
        danger={true}
      />

      {/* Modal confirmation archivage */}
      <AFModal
        visible={showArchiveModal}
        title="Archiver le chantier"
        message={`Voulez-vous archiver "${project?.name}" ?\n\nLe chantier sera masqué mais conservé dans l'historique.`}
        onCancel={() => setShowArchiveModal(false)}
        onConfirm={handleArchiveProject}
        confirmLabel="Archiver"
        cancelLabel="Annuler"
      />

      {/* Modal confirmation désarchivage */}
      <AFModal
        visible={showUnarchiveModal}
        title="Désarchiver le chantier"
        message={`Voulez-vous restaurer "${project?.name}" ?\n\nLe chantier redeviendra visible dans vos listes.`}
        onCancel={() => setShowUnarchiveModal(false)}
        onConfirm={handleUnarchiveProject}
        confirmLabel="Désarchiver"
        cancelLabel="Annuler"
      />
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: LOCAL_COLORS.background,
  },
  loading: { 
    ...theme.typography.body,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceAlt || theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  projectCard: {
    backgroundColor: LOCAL_COLORS.cardBg,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: LOCAL_COLORS.cardBorder,
    marginBottom: theme.spacing.md,
  },
  projectCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  projectCardText: {
    flex: 1,
  },
  projectCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  projectCardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: LOCAL_COLORS.textPrimary,
    flex: 1,
  },
  projectCardInfo: {
    fontSize: 14,
    color: LOCAL_COLORS.textSecondary,
    marginTop: 2,
  },
  projectCardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
  },
  activeBadge: {
    backgroundColor: LOCAL_COLORS.activeBadgeBg,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 0,
  },
  menuIconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  // ✨ Styles pour la modal menu refonte (utilise modalStyles centralisés)
  menuOverlay: {
    ...modalComponentStyles.overlay,
    padding: theme.spacing.lg,
  },
  menuContent: {
    backgroundColor: '#0F172A', // Utilise la couleur du thème modal
    borderRadius: 20,
    width: '85%',
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    ...theme.shadows.xl,
  },
  menuHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  menuTitle: {
    ...modalComponentStyles.title,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  menuSubtitle: {
    ...modalComponentStyles.message,
    fontSize: 14,
    textAlign: 'center',
  },
  menuWarning: {
    ...modalComponentStyles.message,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  // Boutons en pleine largeur (réduits de 20%)
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',        // Alignement vertical parfait
    justifyContent: 'center',    // Centrage horizontal
    paddingVertical: 13,         // Réduit de 16 à 13 (~20%)
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: theme.spacing.sm,
    width: '100%',
  },
  menuButtonIcon: {
    width: 20,                   // Container fixe pour icône
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,              // Espace fixe de 8px
  },
  menuStatusButton: {
    backgroundColor: '#3B82F6', // Bleu
  },
  menuShareButton: {
    backgroundColor: '#10B981', // Vert
  },
  menuArchiveButton: {
    backgroundColor: '#F59E0B', // Orange
  },
  menuUnarchiveButton: {
    backgroundColor: '#16A34A', // Vert
  },
  menuDeleteButton: {
    backgroundColor: '#EF4444', // Rouge
  },
  menuCancelButton: {
    backgroundColor: '#374151', // Gris bleuté
    marginBottom: 16, // Respiration en bas de la modal
  },
  // ✨ Styles modal changement statut (utilise modalStyles centralisés)
  statusModalContent: {
    ...modalComponentStyles.content,
    marginHorizontal: 20,
    maxWidth: 500,
    alignSelf: 'center',
    width: '90%',
  },
  statusModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  statusModalTitle: {
    ...modalComponentStyles.title,
  },
  statusModalSubtitle: {
    ...modalComponentStyles.message,
    marginBottom: 20,
  },
  statusOptions: {
    gap: 10,
    marginBottom: 20,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  statusOptionActive: {
    borderColor: theme.colors.accent,
    backgroundColor: `${theme.colors.accent  }15`,
  },
  statusEmoji: {
    fontSize: 24,
  },
  statusOptionText: {
    flex: 1,
  },
  statusOptionTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  statusOptionDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  statusCancelButton: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusCancelButtonText: {
    ...modalComponentStyles.buttonTextCancel,
  },
  menuButtonText: {
    ...theme.typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // Blanc pur
    textAlign: 'center',
    lineHeight: 20,              // Alignement vertical avec icône
  },
  // ✨ Styles pour la modal de confirmation de suppression (utilise modalStyles centralisés)
  deleteModalOverlay: {
    ...modalComponentStyles.overlay,
    padding: 24,
  },
  deleteModalContainer: {
    ...modalComponentStyles.content,
    width: '85%',
    alignItems: 'center',
  },
  deleteModalIconContainer: {
    width: 88, // +10% de 80px
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EF4444' + '15', // Rouge 15% opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  deleteModalTitle: {
    ...modalComponentStyles.title,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  deleteModalSubtitle: {
    ...modalComponentStyles.message,
    fontSize: 14,
    color: COLORS.warning,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontWeight: '600',
  },
  deleteModalMessage: {
    ...modalComponentStyles.message,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
  },
  deleteModalProjectName: {
    fontWeight: '700',
    color: theme.colors.text,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 14, // Légèrement plus compact
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  deleteModalCancelButton: {
    backgroundColor: '#3B82F6', // Bleu clair (accent)
  },
  deleteModalConfirmButton: {
    backgroundColor: '#EF4444', // Rouge
  },
  deleteModalCancelText: {
    ...modalComponentStyles.confirmButtonText,
    color: '#FFFFFF',
  },
  deleteModalConfirmText: {
    ...modalComponentStyles.buttonTextDanger,
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  aiGeneratorSection: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  devisFacturesSection: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  journalSection: {
    paddingTop: theme.spacing.sm,
  },
  journalTitle: {
    ...theme.typography.h4,
    marginLeft: theme.spacing.sm,
  },
  journalSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  addNoteButton: {
    backgroundColor: `${theme.colors.accent  }20`,
    borderWidth: 1,
    borderColor: `${theme.colors.accent  }40`,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  addNoteButtonText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalOverlay: {
    ...modalComponentStyles.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    maxHeight: '90%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalTitle: {
    ...modalComponentStyles.title,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  generateButtonText: {
    ...modalComponentStyles.confirmButtonText,
    color: '#FFFFFF',
  },
  cancelModalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  cancelModalText: {
    ...modalComponentStyles.buttonTextCancel,
  },
});
