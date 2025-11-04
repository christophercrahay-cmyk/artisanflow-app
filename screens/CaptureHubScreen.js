import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { supabase } from '../supabaseClient';
import { useAppStore } from '../store/useAppStore';
import * as FileSystem from 'expo-file-system';
import { useSafeTheme } from '../theme/useSafeTheme';
import { Feather } from '@expo/vector-icons';
import logger from '../utils/logger';
import { showSuccess, showError } from '../components/Toast';
import { usePendingCapture } from '../hooks/usePendingCapture';
import { useProjectsList } from '../hooks/useProjectsList';
import { useAttachCaptureToProject } from '../hooks/useAttachCaptureToProject';
import CaptureLinkingSheet from '../components/CaptureLinkingSheet';
import ProjectPickerSheet from '../components/ProjectPickerSheet';

export default function CaptureHubScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const theme = useSafeTheme();
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showTextNoteModal, setShowTextNoteModal] = useState(false);
  const [textNote, setTextNote] = useState('');
  
  // Nouveau système avec hooks
  const { pendingCapture, createPendingCapture, clearPendingCapture } = usePendingCapture();
  const { projects: allProjects, loading: loadingProjects, refresh: refreshProjects } = useProjectsList();
  const { attachCapture } = useAttachCaptureToProject();
  const [showLinkingSheet, setShowLinkingSheet] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  
  // États pour l'enregistrement vocal amélioré
  const [showVoiceRecordingModal, setShowVoiceRecordingModal] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingIntervalRef = useRef(null);

  const styles = useMemo(() => getStyles(theme), [theme]);

  useEffect(() => {
    loadClients();
    
    // Cleanup du timer d'enregistrement
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Erreur chargement clients:', error);
        showError('Impossible de charger les clients');
        return;
      }
      setClients(data || []);
    } catch (err) {
      console.error('Exception chargement clients:', err);
    }
  };

  const loadProjects = async (clientId) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', clientId)
        .eq('archived', false) // Filtrer les projets archivés
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Erreur chargement projets:', error);
        return;
      }
      setProjects(data || []);
    } catch (err) {
      console.error('Exception chargement projets:', err);
    }
  };

  const handleActionPress = (action) => {
    // Pour photo et vocal, on capture d'abord, puis on demande le chantier
    if (action === 'photo' || action === 'voice') {
      if (action === 'photo') {
        handlePhotoCaptureStart();
      } else if (action === 'voice') {
        handleVoiceCaptureStart();
      }
      return;
    }
    
    // Pour note texte, on ouvre directement le modal de saisie
    // (le choix du chantier se fera après)
    setShowTextNoteModal(true);
    setTextNote('');
  };


  // Nouvelle fonction : démarre la capture photo
  const handlePhotoCaptureStart = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      logger.warn('PhotoCapture', 'Permission caméra refusée');
      showError('Autorise l\'accès à la caméra');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled) {
      logger.info('PhotoCapture', 'Capture annulée par utilisateur');
      showError('❌ Capture annulée');
      return;
    }

    // Créer une capture en attente avec le nouveau système
    createPendingCapture('photo', {
      fileUri: result.assets[0].uri,
    });
    
    // Charger les projets et ouvrir le bottom sheet
    await refreshProjects();
    setShowLinkingSheet(true);
  };

  // Gestionnaires pour les actions du bottom sheet
  const handleCreateProject = () => {
    setShowLinkingSheet(false);
    navigation.navigate('ProjectCreate', { initialCapture: pendingCapture });
    clearPendingCapture();
  };

  const handleSelectExistingProject = () => {
    if (allProjects.length === 0) {
      showError('Aucun chantier trouvé. Créez-en un d\'abord.');
      // Rediriger vers la création
      setShowLinkingSheet(false);
      navigation.navigate('ProjectCreate', { initialCapture: pendingCapture });
      clearPendingCapture();
      return;
    }
    setShowLinkingSheet(false);
    setShowProjectPicker(true);
  };

  const handleProjectSelected = async (project) => {
    if (!pendingCapture) return;

    try {
      setUploading(true);
      setShowProjectPicker(false);
      
      await attachCapture(pendingCapture, project.id, project.client_id, project.name);
      
      clearPendingCapture();
    } catch (err) {
      logger.error('CaptureHub', 'Erreur attachement', err);
      showError(err?.message || 'Impossible d\'attacher la capture');
    } finally {
      setUploading(false);
    }
  };

  // Nouvelle fonction : démarre l'enregistrement vocal (ouvre le bottom sheet)
  const handleVoiceCaptureStart = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      logger.warn('VoiceCapture', 'Permission micro refusée');
      showError('Active le micro dans les réglages');
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    setShowVoiceRecordingModal(true);
    setRecordingDuration(0);
  };

  // Démarrer l'enregistrement
  const startRecording = async () => {
    try {
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setRecordingDuration(0);
      
      // Timer pour afficher la durée
      const interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      
      // Stocker l'interval pour le nettoyer
      recordingIntervalRef.current = interval;
    } catch (err) {
      logger.error('VoiceCapture', 'Erreur démarrage enregistrement', err);
      showError('Impossible de démarrer l\'enregistrement');
    }
  };

  // Arrêter l'enregistrement
  const stopRecording = async () => {
    if (!recording) return;

    try {
      // Nettoyer le timer
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      // Créer une capture en attente avec le nouveau système
      createPendingCapture('audio', {
        fileUri: uri,
        durationMs: recordingDuration * 1000, // Convertir en millisecondes
      });
      
      setRecording(null);
      setRecordingDuration(0);
      setShowVoiceRecordingModal(false);
      
      // Charger les projets et ouvrir le bottom sheet
      await refreshProjects();
      setShowLinkingSheet(true);
    } catch (err) {
      logger.error('VoiceCapture', 'Erreur arrêt enregistrement', err);
      showError('Erreur lors de l\'arrêt de l\'enregistrement');
      setRecording(null);
      setRecordingDuration(0);
    }
  };



  const handleTextNoteSave = async () => {
    if (!textNote.trim()) {
      showError('Saisissez votre note');
      return;
    }

    const noteTextToSave = textNote.trim();

    // Créer une capture en attente pour la note
    createPendingCapture('note', {
      content: noteTextToSave,
    });

    // Fermer le modal de note et ouvrir le bottom sheet d'association
    setShowTextNoteModal(false);
    setTextNote('');
    
    // Charger les projets et ouvrir le bottom sheet
    await refreshProjects();
    setShowLinkingSheet(true);
  };

  const handleClientSelect = (clientId) => {
    setSelectedClientId(clientId);
    setSelectedProjectId(null);
    loadProjects(clientId);
  };

  // Cette fonction n'est plus utilisée avec le nouveau système
  // Conservée pour compatibilité avec l'ancien modal de sélection (note texte uniquement)
  const handleProjectSelect = async (projectId) => {
    // Cette fonction n'est plus utilisée dans le nouveau flux
    // Le nouveau système utilise directement le bottom sheet d'association
  };

  const renderClient = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        { borderBottomColor: theme.colors.border },
        selectedClientId === item.id && { 
          backgroundColor: theme.colors.accent + '20',
          borderBottomColor: theme.colors.accent,
        },
      ]}
      onPress={() => handleClientSelect(item.id)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.modalItemText(theme),
          selectedClientId === item.id && styles.modalItemTextSelected(theme),
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProject = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        { borderBottomColor: theme.colors.border },
        selectedProjectId === item.id && { 
          backgroundColor: theme.colors.accent + '20',
          borderBottomColor: theme.colors.accent,
        },
      ]}
      onPress={() => handleProjectSelect(item.id)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.modalItemText(theme),
          selectedProjectId === item.id && styles.modalItemTextSelected(theme),
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title(theme)}>Capture</Text>
        <Text style={styles.subtitle(theme)}>
          Capturez instantanément vos données de chantier
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton(theme), uploading && { opacity: 0.6 }]}
          onPress={() => handleActionPress('photo')}
          disabled={uploading}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <Feather name="camera" size={32} color={theme.colors.accent} strokeWidth={2.5} />
          </View>
          <Text style={styles.actionLabel(theme)}>Photo</Text>
          <Text style={styles.actionSubtitle(theme)}>Prenez une photo du chantier</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton(theme), uploading && { opacity: 0.6 }]}
          onPress={() => handleActionPress('voice')}
          disabled={uploading}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <Feather name="mic" size={32} color={theme.colors.accent} strokeWidth={2.5} />
          </View>
          <Text style={styles.actionLabel(theme)}>Vocal</Text>
          <Text style={styles.actionSubtitle(theme)}>Dictez une note rapide</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton(theme), uploading && { opacity: 0.6 }]}
          onPress={() => handleActionPress('note')}
          disabled={uploading}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <Feather name="edit-3" size={32} color={theme.colors.accent} strokeWidth={2.5} />
          </View>
          <Text style={styles.actionLabel(theme)}>Note</Text>
          <Text style={styles.actionSubtitle(theme)}>Écrivez un rappel</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: insets.bottom }} />

      {/* Overlay uniquement pour photo/vocal, pas pour note texte */}
      {uploading && !showTextNoteModal && (
        <View style={styles.uploadingOverlay(theme)}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.uploadingText(theme)}>Traitement en cours...</Text>
        </View>
      )}

      {/* Modale sélection */}
      <Modal
        visible={showSelectionModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent(theme)}>
            <View style={styles.modalHeader}>
              <Feather 
                name={!selectedClientId ? "users" : "folder"} 
                size={24} 
                color={theme.colors.accent} 
              />
              <Text style={styles.modalTitle(theme)}>
                {!selectedClientId
                  ? 'Sélectionnez un client'
                  : 'Sélectionnez un chantier'}
              </Text>
            </View>

            {!selectedClientId ? (
              <FlatList
                data={clients}
                keyExtractor={(item) => item.id}
                renderItem={renderClient}
                ListEmptyComponent={
                  <Text style={styles.empty(theme)}>Aucun client</Text>
                }
              />
            ) : (
              <FlatList
                data={projects}
                keyExtractor={(item) => item.id}
                renderItem={renderProject}
                ListEmptyComponent={
                  <Text style={styles.empty(theme)}>Aucun chantier</Text>
                }
              />
            )}

            <TouchableOpacity
              style={styles.modalCloseButton(theme)}
              onPress={() => setShowSelectionModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal note texte */}
      <Modal
        visible={showTextNoteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowTextNoteModal(false);
          setTextNote('');
        }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent(theme), { maxHeight: '80%' }]}>
              <View style={styles.modalHeader}>
                <Feather name="edit-3" size={24} color={theme.colors.accent} />
                <Text style={styles.modalTitle(theme)}>Note texte</Text>
              </View>
              
              <TextInput
                placeholder="Saisissez votre note..."
                placeholderTextColor={theme.colors.textMuted}
                value={textNote}
                onChangeText={setTextNote}
                multiline
                numberOfLines={8}
                editable={true}
                style={{
                  backgroundColor: theme.colors.surfaceElevated,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: theme.colors.text, // Texte blanc visible
                  marginBottom: 16,
                  textAlignVertical: 'top',
                  minHeight: 150,
                  maxHeight: 300,
                }}
                autoFocus
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={handleTextNoteSave}
                  disabled={!textNote.trim()}
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.accent,
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    opacity: !textNote.trim() ? 0.6 : 1,
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 16 }}>
                    Continuer
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => {
                    setShowTextNoteModal(false);
                    setTextNote('');
                  }}
                  disabled={false}
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.surface,
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    opacity: 1,
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 16 }}>
                    Annuler
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal enregistrement vocal amélioré */}
      <Modal
        visible={showVoiceRecordingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (!recording) {
            setShowVoiceRecordingModal(false);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent(theme), { maxHeight: '60%' }]}>
            <View style={styles.modalHeader}>
              <Feather name="mic" size={24} color={theme.colors.accent} />
              <Text style={styles.modalTitle(theme)}>Enregistrement vocal</Text>
            </View>
            
            <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl }}>
              {!recording ? (
                <TouchableOpacity
                  onPress={startRecording}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: theme.colors.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...theme.shadows.lg,
                  }}
                  activeOpacity={0.8}
                >
                  <Feather name="mic" size={48} color={theme.colors.text} strokeWidth={2.5} />
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={stopRecording}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 60,
                      backgroundColor: theme.colors.error,
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...theme.shadows.lg,
                    }}
                    activeOpacity={0.8}
                  >
                    <Feather name="square" size={48} color={theme.colors.text} strokeWidth={2.5} />
                  </TouchableOpacity>
                  <Text style={{ marginTop: theme.spacing.lg, fontSize: 24, fontWeight: '700', color: theme.colors.text }}>
                    {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                  </Text>
                  <Text style={{ marginTop: theme.spacing.xs, color: theme.colors.textSecondary }}>
                    Enregistrement en cours...
                  </Text>
                </>
              )}
            </View>

            <TouchableOpacity
              onPress={() => {
                if (!recording) {
                  setShowVoiceRecordingModal(false);
                } else {
                  // Annuler l'enregistrement en cours
                  if (recordingIntervalRef.current) {
                    clearInterval(recordingIntervalRef.current);
                    recordingIntervalRef.current = null;
                  }
                  recording.stopAndUnloadAsync().catch(() => {});
                  setRecording(null);
                  setRecordingDuration(0);
                  setShowVoiceRecordingModal(false);
                  showError('Enregistrement annulé');
                }
              }}
              style={styles.modalCloseButton(theme)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom sheet d'association de capture */}
      <CaptureLinkingSheet
        visible={showLinkingSheet}
        onClose={() => {
          if (!uploading) {
            setShowLinkingSheet(false);
            clearPendingCapture();
            showError('❌ Capture annulée');
          }
        }}
        capture={pendingCapture}
        onCreateProject={handleCreateProject}
        onSelectExistingProject={handleSelectExistingProject}
        loading={uploading}
      />

      {/* Bottom sheet de sélection de projet */}
      <ProjectPickerSheet
        visible={showProjectPicker}
        onClose={() => {
          if (!uploading) {
            setShowProjectPicker(false);
            setShowLinkingSheet(true);
          }
        }}
        onSelectProject={handleProjectSelected}
        projects={allProjects}
        loading={loadingProjects || uploading}
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
    marginBottom: theme.spacing.xl,
  },
  title: (theme) => ({
    ...theme.typography.h1,
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  }),
  subtitle: (theme) => ({
    ...theme.typography.bodySmall,
    lineHeight: 22,
  }),
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
  },
  actionButton: (theme) => ({
    width: 110,
    height: 140,
    backgroundColor: '#1E293B', // Premium dark gray
    borderRadius: 20, // Plus arrondi
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.accent + '40',
    ...theme.shadows.lg, // Ombre plus prononcée
    paddingVertical: theme.spacing.md,
  }),
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  actionLabel: (theme) => ({
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  }),
  actionSubtitle: (theme) => ({
    ...theme.typography.bodySmall,
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xs,
  }),
  uploadingOverlay: (theme) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 17, 21, 0.85)', // Overlay plus sombre
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  }),
  uploadingText: (theme) => ({
    marginTop: theme.spacing.lg,
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
  }),
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: (theme) => ({
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '70%',
    padding: theme.spacing.lg,
  }),
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: (theme) => ({
    ...theme.typography.h4,
    marginLeft: theme.spacing.sm,
  }),
  modalItem: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
  },
  modalItemText: (theme) => ({
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  }),
  modalItemTextSelected: (theme) => ({
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.accent,
  }),
  modalCloseButton: (theme) => ({
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: 'transparent', // Bouton outline
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border, // Bordure gris clair
  }),
  modalCloseText: {
    color: theme.colors.textSecondary, // Texte gris au lieu de rouge
    fontWeight: '600',
    fontSize: 16,
  },
  empty: (theme) => ({
    textAlign: 'center',
    ...theme.typography.bodySmall,
    marginTop: theme.spacing.xl,
  }),
});
