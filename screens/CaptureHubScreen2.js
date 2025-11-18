/**
 * CaptureHubScreen 2.0 - Outil terrain haut de gamme
 * Design System 2.0 - Niveau 11/10
 * Animations différenciées par type de capture
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  TextInput,
  Animated,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Feather } from '@expo/vector-icons';
// import * as Haptics from 'expo-haptics'; // Désactivé temporairement
import { useThemeColors } from '../theme/theme2';
import { ScreenContainer, PrimaryButton } from '../components/ui';
import { COLORS } from '../theme/colors';
import { supabase } from '../supabaseClient';
import logger from '../utils/logger';
import { showSuccess, showError } from '../components/Toast';
import CaptureBottomSheet from '../components/common/CaptureBottomSheet';
import { usePendingCapture } from '../hooks/usePendingCapture';
import { useProjectsList } from '../hooks/useProjectsList';
import { useAttachCaptureToProject } from '../hooks/useAttachCaptureToProject';
import CaptureLinkingSheet from '../components/CaptureLinkingSheet';
import ProjectPickerSheet from '../components/ProjectPickerSheet';
import ClientProjectSelector from '../components/ClientProjectSelector';
import { useFocusEffect } from '@react-navigation/native';
import HomeHeader from '../components/HomeHeader';
import { useNetworkStatus } from '../contexts/NetworkStatusContext';
import { addToQueue } from '../services/offlineQueueService';

export default function CaptureHubScreen2({ navigation }) {
  const theme = useThemeColors();
  const { isOffline } = useNetworkStatus();
  const [activeProject, setActiveProject] = useState(null);
  const [showClientProjectSelector, setShowClientProjectSelector] = useState(false);
  const [currentCaptureType, setCurrentCaptureType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showTextNoteModal, setShowTextNoteModal] = useState(false);
  const [textNote, setTextNote] = useState('');
  const [showVoiceRecordingModal, setShowVoiceRecordingModal] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingIntervalRef = useRef(null);
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    recentPhotos: 0,
    recentDocuments: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const { pendingCapture, createPendingCapture, clearPendingCapture } = usePendingCapture();
  const { projects: allProjects, loading: loadingProjects, refresh: refreshProjects } = useProjectsList();
  const { attachCapture } = useAttachCaptureToProject();
  const [showLinkingSheet, setShowLinkingSheet] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  const styles = useMemo(() => getStyles(theme), [theme]);

  // Animations minimalistes pour les cartes
  const photoScale = useRef(new Animated.Value(1)).current;
  const vocalScale = useRef(new Animated.Value(1)).current;
  const noteScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  // Charger les stats au montage
  useEffect(() => {
    loadStats();
  }, []);

  // Rafraîchir les stats quand l'écran revient au focus
  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingStats(false);
        return;
      }

      // Charger les projets
      const { data: projects } = await supabase
        .from('projects')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('archived', false);

      const active = projects?.filter((p) => p.status === 'in_progress' || !p.status) || [];
      const completed = projects?.filter((p) => p.status === 'done') || [];

      // Charger les photos
      const { data: photos } = await supabase
        .from('project_photos')
        .select('id')
        .eq('user_id', user.id)
        .limit(100);

      // Charger les devis/factures
      const { data: devis } = await supabase
        .from('devis')
        .select('id')
        .eq('user_id', user.id)
        .limit(100);

      const { data: factures } = await supabase
        .from('factures')
        .select('id')
        .eq('user_id', user.id)
        .limit(100);

      setStats({
        activeProjects: active.length,
        completedProjects: completed.length,
        recentPhotos: photos?.length || 0,
        recentDocuments: (devis?.length || 0) + (factures?.length || 0),
      });
    } catch (err) {
      logger.error('CaptureHub', 'Erreur chargement stats', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleActionPress = (action) => {
    if (!activeProject) {
      setCurrentCaptureType(action);
      setShowClientProjectSelector(true);
      return;
    }
    
    if (action === 'photo') {
      handlePhotoCaptureStartDirect();
    } else if (action === 'voice') {
      handleVoiceCaptureStartDirect();
    } else if (action === 'note') {
      setShowTextNoteModal(true);
      setTextNote('');
    }
  };

  const handleClientProjectSelected = (client, project) => {
    setShowClientProjectSelector(false);
    setActiveProject({ ...project, client_id: client.id, clients: { name: client.name } });
    
    setTimeout(() => {
      if (currentCaptureType === 'photo') {
        handlePhotoCaptureStartDirect();
      } else if (currentCaptureType === 'voice') {
        handleVoiceCaptureStartDirect();
      } else if (currentCaptureType === 'note') {
        setShowTextNoteModal(true);
      }
    }, 300);
  };

  const handlePhotoCaptureStartDirect = async () => {
    if (!activeProject) return;
    
    // ✅ Proposer le choix entre Caméra et Galerie
    Alert.alert(
      'Ajouter une photo',
      'Choisissez la source de la photo',
      [
        {
          text: 'Caméra',
          onPress: () => pickPhotoFromCamera(),
        },
        {
          text: 'Galerie',
          onPress: () => pickPhotoFromGallery(),
        },
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ]
    );
  };

  const pickPhotoFromCamera = async () => {
    try {
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
        logger.info('PhotoCapture', 'Capture annulée');
        return;
      }

      await processPhotoCapture(result.assets[0].uri);
      // Rafraîchir les stats après capture
      loadStats();
    } catch (err) {
      logger.error('CaptureHub', 'Erreur capture caméra', err);
      showError('Erreur lors de la capture');
    }
  };

  const pickPhotoFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        logger.warn('PhotoCapture', 'Permission galerie refusée');
        showError('Autorise l\'accès à la galerie');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (result.canceled) {
        logger.info('PhotoCapture', 'Sélection annulée');
        return;
      }

      await processPhotoCapture(result.assets[0].uri);
      // Rafraîchir les stats après capture
      loadStats();
    } catch (err) {
      logger.error('CaptureHub', 'Erreur sélection galerie', err);
      showError('Erreur lors de la sélection');
    }
  };

  const processPhotoCapture = async (fileUri) => {
    const capture = {
      type: 'photo',
      data: { fileUri },
    };
    
    try {
      setUploading(true);
      await attachCapture(capture, activeProject.id, activeProject.client_id, activeProject.name);
      showSuccess(`Photo ajoutée au chantier "${activeProject.name}"`);
      // // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      logger.error('CaptureHub', 'Erreur upload photo', err);
      showError(err?.message || 'Impossible d\'ajouter la photo');
      // // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setUploading(false);
    }
  };

  const handleVoiceCaptureStartDirect = async () => {
    if (!activeProject) return;
    
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

  const startRecording = async () => {
    try {
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setRecordingDuration(0);
      
      const interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      
      recordingIntervalRef.current = interval;
    } catch (err) {
      logger.error('VoiceCapture', 'Erreur démarrage enregistrement', err);
      showError('Impossible de démarrer l\'enregistrement');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      setRecording(null);
      setRecordingDuration(0);
      setShowVoiceRecordingModal(false);
      
      if (activeProject) {
        const capture = {
          type: 'audio',
          data: {
            fileUri: uri,
            durationMs: recordingDuration * 1000,
          },
        };
        
        try {
          setUploading(true);
          await attachCapture(capture, activeProject.id, activeProject.client_id, activeProject.name);
          showSuccess(`Note vocale ajoutée au chantier "${activeProject.name}"`);
          // Rafraîchir les stats après capture
          loadStats();
          // // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (err) {
          logger.error('CaptureHub', 'Erreur upload vocal', err);
          showError(err?.message || 'Impossible d\'ajouter la note vocale');
          // // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
          setUploading(false);
        }
      }
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

    if (activeProject) {
      try {
        setUploading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Non authentifié');

        const noteData = {
          project_id: activeProject.id,
          client_id: activeProject.client_id,
          user_id: user.id,
          type: 'text',
          transcription: noteTextToSave,
        };

        // Si hors ligne, ajouter à la queue
        if (isOffline) {
          await addToQueue({
            type: 'note',
            data: {
              projectId: activeProject.id,
              clientId: activeProject.client_id,
              content: noteTextToSave,
              createdAt: new Date().toISOString(),
            },
          });
          
          setShowTextNoteModal(false);
          setTextNote('');
          showSuccess(`Note sauvegardée (synchronisation en attente)`);
          loadStats();
          return;
        }

        // En ligne, insertion directe
        const { error } = await supabase.from('notes').insert([noteData]).select();
        if (error) throw error;

        setShowTextNoteModal(false);
        setTextNote('');
        showSuccess(`Note ajoutée au chantier "${activeProject.name}"`);
        // Rafraîchir les stats après capture
        loadStats();
        // // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (err) {
        logger.error('CaptureHub', 'Erreur note texte', err);
        showError(err?.message || 'Impossible d\'ajouter la note');
        // // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setUploading(false);
      }
    }
  };

  // Handlers avec animation subtile de pression
  const handlePhotoPress = () => {
    Animated.spring(photoScale, {
      toValue: 0.95,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start(() => {
      photoScale.setValue(1);
      handleActionPress('photo');
    });
  };

  const handleVocalPress = () => {
    Animated.spring(vocalScale, {
      toValue: 0.95,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start(() => {
      vocalScale.setValue(1);
      handleActionPress('voice');
    });
  };

  const handleNotePress = () => {
    Animated.spring(noteScale, {
      toValue: 0.95,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start(() => {
      noteScale.setValue(1);
      handleActionPress('note');
    });
  };

  return (
    <ScreenContainer>
      {/* Header avec salutation */}
      <HomeHeader />

      {/* Carte Chantier actif */}
      <Pressable
        onPress={() => {
          setShowClientProjectSelector(true);
        }}
        style={({ pressed }) => [
          styles.activeProjectCard,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: 16,
            borderColor: theme.colors.border,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
          theme.shadowSoft,
        ]}
      >
        <Feather name="folder" size={20} color={COLORS.iconFolder} strokeWidth={2.5} />
        <View style={styles.selectorText}>
          <Text style={[styles.selectorLabel, { color: theme.colors.textSoft }]}>
            Chantier actif
          </Text>
          {activeProject ? (
            <Text style={[styles.selectorValue, { color: theme.colors.text }]} numberOfLines={1}>
              {activeProject.name}
            </Text>
          ) : (
            <Text style={[styles.selectorPlaceholder, { color: theme.colors.textMuted }]}>
              Sélectionner un chantier
            </Text>
          )}
        </View>
        <Feather name="chevron-right" size={20} color={theme.colors.textMuted} />
      </Pressable>

      {/* Section 1 : Actions de capture avec fond gris */}
      <View style={[styles.sectionContainer, { backgroundColor: theme.colors.surfaceAlt }]}>
        <View style={styles.actionsContainer}>
          {/* Carte Photo */}
          <Pressable onPress={handlePhotoPress} disabled={uploading} style={styles.actionCardWrapper}>
            <Animated.View
              style={[
                styles.actionCard,
                {
                  backgroundColor: theme.colors.surface,
                  transform: [{ scale: photoScale }],
                },
                theme.shadowSoft,
              ]}
            >
              <Feather name="camera" size={28} color={COLORS.primary} strokeWidth={2.5} />
              <Text style={[styles.cardLabel, { color: theme.colors.text }]}>Photo</Text>
            </Animated.View>
          </Pressable>

          {/* Carte Vocal */}
          <Pressable onPress={handleVocalPress} disabled={uploading} style={styles.actionCardWrapper}>
            <Animated.View
              style={[
                styles.actionCard,
                {
                  backgroundColor: theme.colors.surface,
                  transform: [{ scale: vocalScale }],
                },
                theme.shadowSoft,
              ]}
            >
              <Feather name="mic" size={28} color={COLORS.primary} strokeWidth={2.5} />
              <Text style={[styles.cardLabel, { color: theme.colors.text }]}>Vocal</Text>
            </Animated.View>
          </Pressable>

          {/* Carte Note */}
          <Pressable onPress={handleNotePress} disabled={uploading} style={styles.actionCardWrapper}>
            <Animated.View
              style={[
                styles.actionCard,
                {
                  backgroundColor: theme.colors.surface,
                  transform: [{ scale: noteScale }],
                },
                theme.shadowSoft,
              ]}
            >
              <Feather name="edit-3" size={28} color={COLORS.primary} strokeWidth={2.5} />
              <Text style={[styles.cardLabel, { color: theme.colors.text }]}>Note</Text>
            </Animated.View>
          </Pressable>
        </View>
      </View>

      {/* Section 2 : Stats avec fond gris */}
      <View style={[styles.sectionContainer, { backgroundColor: theme.colors.surfaceAlt }]}>
        <View style={styles.statsContainer}>
          {/* Carte Chantiers actifs */}
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }, theme.shadowSoft]}>
            <Feather name="folder" size={20} color={COLORS.iconFolder} strokeWidth={2} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {loadingStats ? '...' : stats.activeProjects}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]} numberOfLines={1}>
              Actifs
            </Text>
          </View>

          {/* Carte Chantiers terminés */}
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }, theme.shadowSoft]}>
            <Feather name="check-circle" size={20} color={theme.colors.success} strokeWidth={2} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {loadingStats ? '...' : stats.completedProjects}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]} numberOfLines={1}>
              Terminés
            </Text>
          </View>

          {/* Carte Photos */}
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }, theme.shadowSoft]}>
            <Feather name="image" size={20} color="#8B5CF6" strokeWidth={2} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {loadingStats ? '...' : stats.recentPhotos}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]} numberOfLines={1}>
              Photos
            </Text>
          </View>

          {/* Carte Documents */}
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }, theme.shadowSoft]}>
            <Feather name="file-text" size={20} color="#FACC15" strokeWidth={2} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {loadingStats ? '...' : stats.recentDocuments}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]} numberOfLines={1}>
              Documents
            </Text>
          </View>
        </View>
      </View>

      {/* Bouton Accès chantier en bas */}
      <View style={styles.bottomButtonContainer}>
        <Pressable
          onPress={() => navigation.navigate('ProjectsList')}
          style={({ pressed }) => [
            styles.accessButton,
            {
              backgroundColor: theme.colors.primary,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
            theme.shadowSoft,
          ]}
        >
          <Feather name="folder" size={20} color={theme.colors.primaryText} strokeWidth={2.5} />
          <Text style={[styles.accessButtonText, { color: theme.colors.primaryText }]}>
            Accès chantier
          </Text>
          <Feather name="chevron-right" size={18} color={theme.colors.primaryText} strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* Overlay uploading */}
      {uploading && (
        <View style={[styles.uploadingOverlay, { backgroundColor: `${theme.colors.background}E6` }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.uploadingText, { color: theme.colors.text }]}>
            Traitement en cours...
          </Text>
        </View>
      )}

      {/* Bottom Sheet Note texte */}
      <CaptureBottomSheet
        visible={showTextNoteModal}
        onClose={() => {
          setShowTextNoteModal(false);
          setTextNote('');
        }}
        enableKeyboardAvoid
      >
        <View style={styles.modalHeader}>
          <Feather name="edit-3" size={24} color={theme.colors.primary} />
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Note texte</Text>
        </View>
        
        <TextInput
          placeholder="Saisissez votre note..."
          placeholderTextColor={theme.colors.textSoft}
          value={textNote}
          onChangeText={setTextNote}
          multiline
          style={[styles.textInput, {
            backgroundColor: theme.colors.surfaceAlt,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            color: theme.colors.text,
          }]}
          autoFocus
        />

        <View style={styles.modalButtons}>
          <PrimaryButton
            title="Continuer"
            onPress={handleTextNoteSave}
            disabled={!textNote.trim()}
            style={styles.modalButton}
          />
          <TouchableOpacity
            onPress={() => {
              // // // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowTextNoteModal(false);
              setTextNote('');
            }}
            style={[styles.cancelButton, {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.round,
            }]}
          >
            <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
              Annuler
            </Text>
          </TouchableOpacity>
        </View>
      </CaptureBottomSheet>

      {/* Bottom Sheet Enregistrement vocal */}
      <CaptureBottomSheet
        visible={showVoiceRecordingModal}
        onClose={() => {
          if (!recording) {
            setShowVoiceRecordingModal(false);
          } else {
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
        enableKeyboardAvoid={false}
      >
        <View style={styles.modalHeader}>
          <Feather name="mic" size={24} color={theme.colors.primary} />
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Enregistrement vocal</Text>
        </View>
        
        <View style={styles.recordingContainer}>
          {!recording ? (
            <TouchableOpacity
              onPress={startRecording}
              style={[styles.recordButton, { backgroundColor: theme.colors.primary }, theme.glowBlue]}
            >
              <Feather name="mic" size={48} color={theme.colors.primaryText} strokeWidth={2.5} />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={stopRecording}
                style={[styles.recordButton, { backgroundColor: theme.colors.danger }, theme.shadowSoft]}
              >
                <Feather name="square" size={48} color={theme.colors.primaryText} strokeWidth={2.5} />
              </TouchableOpacity>
              <Text style={[styles.recordingTime, { color: theme.colors.text }]}>
                {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
              </Text>
              <Text style={[styles.recordingLabel, { color: theme.colors.textMuted }]}>
                Enregistrement en cours...
              </Text>
            </>
          )}
        </View>

        <TouchableOpacity
          onPress={() => {
            if (!recording) {
              // // // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowVoiceRecordingModal(false);
            } else {
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
          style={[styles.cancelButton, {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.round,
          }]}
        >
          <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
            Annuler
          </Text>
        </TouchableOpacity>
      </CaptureBottomSheet>

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
        onCreateProject={() => {}}
        onSelectExistingProject={() => {}}
        loading={uploading}
      />

      <ProjectPickerSheet
        visible={showProjectPicker}
        onClose={() => {
          if (!uploading) {
            setShowProjectPicker(false);
            setShowLinkingSheet(true);
          }
        }}
        onSelectProject={() => {}}
        projects={allProjects}
        loading={loadingProjects || uploading}
      />

      <ClientProjectSelector
        visible={showClientProjectSelector}
        onClose={() => setShowClientProjectSelector(false)}
        onConfirm={handleClientProjectSelected}
        captureType={currentCaptureType}
      />
    </ScreenContainer>
  );
}

const getStyles = (theme) => StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.h1,
    fontWeight: theme.fontWeights.bold,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.body,
    lineHeight: 22,
  },
  activeProjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 0.5,
  },
  selectorText: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: theme.typography.tiny,
    marginBottom: 2,
  },
  selectorValue: {
    fontSize: theme.typography.body,
    fontWeight: theme.fontWeights.semibold,
  },
  selectorClient: {
    fontSize: theme.typography.small,
  },
  selectorPlaceholder: {
    fontSize: theme.typography.body,
    fontStyle: 'italic',
  },
  // Container section avec fond gris
  sectionContainer: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 16,
  },
  // Container en grille horizontale pour les 3 boutons
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  // Wrapper pour chaque carte (pour flex: 1)
  actionCardWrapper: {
    flex: 1,
  },
  // Carte minimaliste compacte optimisée pour grille horizontale
  actionCard: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    gap: 8,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: theme.fontWeights.semibold,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  uploadingText: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.body,
    fontWeight: theme.fontWeights.semibold,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '70%',
    padding: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  modalTitle: {
    fontSize: theme.typography.h2,
    fontWeight: theme.fontWeights.bold,
  },
  textInput: {
    padding: theme.spacing.md,
    fontSize: theme.typography.body,
    marginBottom: theme.spacing.lg,
    textAlignVertical: 'top',
    minHeight: 150,
    maxHeight: 300,
    borderWidth: 1,
  },
  modalButtons: {
    gap: theme.spacing.md,
  },
  modalButton: {
    width: '100%',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: theme.typography.body,
    fontWeight: theme.fontWeights.semibold,
  },
  recordingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingTime: {
    marginTop: theme.spacing.lg,
    fontSize: 24,
    fontWeight: theme.fontWeights.bold,
  },
  recordingLabel: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.small,
  },
  // Container stats en grille horizontale
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  // Carte stat compacte
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: 12,
    minHeight: 80,
  },
  statValue: {
    fontSize: 24,
    fontWeight: theme.fontWeights.bold,
    marginTop: theme.spacing.xs,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: theme.typography.small,
    fontWeight: theme.fontWeights.medium,
  },
  // Container bouton en bas
  bottomButtonContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  // Bouton accès chantier long
  accessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    gap: 12,
  },
  accessButtonText: {
    fontSize: theme.typography.body,
    fontWeight: theme.fontWeights.bold,
  },
});

