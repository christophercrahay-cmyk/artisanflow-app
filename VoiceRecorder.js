// VoiceRecorder.js

import React, { useEffect, useRef, useState } from 'react';

import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, ActivityIndicator, TextInput, ScrollView, Animated, Pressable } from 'react-native';

import { useIsFocused } from '@react-navigation/native';

import { Audio } from 'expo-av'; // ✅ Import manquant pour Audio.Recording, Audio.Sound, etc.

import { 
  useAudioRecorder, 
  AudioModule, 
  RecordingPresets,
  useAudioPlayer
} from 'expo-audio';

import { supabase } from './supabaseClient';

import { transcribeAudio, correctNoteText } from './services/transcriptionService';

import { analyzeNote } from './services/quoteAnalysisService';

import { useAppStore } from './store/useAppStore';

import { generateQuoteFromTranscription } from './utils/ai_quote_generator';

import { insertAutoQuote } from './utils/supabase_helpers';

import { handleAPIError } from './utils/errorHandler';

import logger from './utils/logger';
import { showSuccess, showError } from './components/Toast';
import { requireProOrPaywall } from './utils/proAccess';
import { useNavigation } from '@react-navigation/native';
import { TranscriptionFeedback } from './components/TranscriptionFeedback';

export default function VoiceRecorder({ projectId }) {
  const navigation = useNavigation();

  const isFocused = useIsFocused();
  const [recording, setRecording] = useState(null);

  const [recordUri, setRecordUri] = useState(null);

  const [durationMs, setDurationMs] = useState(0);

  const [uploading, setUploading] = useState(false);

  const [transcription, setTranscription] = useState('');

  const [items, setItems] = useState([]);

  const soundRef = useRef(null);

  const [playingId, setPlayingId] = useState(null);

  const [editingId, setEditingId] = useState(null);

  const [editText, setEditText] = useState('');

  // États pour la transcription OpenAI
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionStatus, setTranscriptionStatus] = useState('');
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // État du bouton "Envoyer" : 'empty' | 'ready' | 'success'
  const [sendButtonState, setSendButtonState] = useState('empty');

  const loadNotes = async () => {
    try {
      // ✅ Récupérer l'utilisateur connecté pour isolation multi-tenant
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Erreur', 'Utilisateur non authentifié');
        return;
      }

      const { data, error, status } = await supabase
        .from('notes')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id) // ✅ Filtre obligatoire pour isolation utilisateurs
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error('VoiceRecorder', 'Erreur chargement notes', { status, error });
        Alert.alert('Erreur', 'Impossible de charger les notes');
        return;
      }
      setItems(data || []);
    } catch (err) {
      logger.error('VoiceRecorder', 'Exception chargement notes', err);
      Alert.alert('Erreur', 'Erreur lors du chargement des notes');
    }
  };

  useEffect(() => {
    loadNotes();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [projectId]);

  // Rafraîchir quand l'écran parent devient visible
  useEffect(() => {
    if (isFocused && projectId) {
      loadNotes();
    }
  }, [isFocused, projectId]);

  const startRecording = async () => {
    try {
      logger.info('VoiceRecorder', 'Demande de permission micro...');
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      logger.info('VoiceRecorder', `Permission audio status: ${audioStatus}`);
      
      if (audioStatus !== 'granted') {
        Alert.alert('Micro refusé', 'Active le micro dans les réglages.');
        return;
      }

      logger.info('VoiceRecorder', 'Configuration du mode audio...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      logger.info('VoiceRecorder', 'Création de l\'enregistrement...');
      const recording = new Audio.Recording();

      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      logger.info('VoiceRecorder', 'Démarrage de l\'enregistrement...');
      await recording.startAsync();
      setRecording(recording);

      setRecordUri(null);
      setDurationMs(0);
      setTranscription('');
      setAnalysisResult(null);
      setTranscriptionStatus('');
      setTranscriptionProgress(0);

      logger.success('VoiceRecorder', 'Enregistrement démarré');

    } catch (e) {
      logger.error('VoiceRecorder', 'Erreur démarrage enregistrement', e);
      Alert.alert('Erreur', e?.message || 'Impossible de démarrer.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) {
        logger.warn('VoiceRecorder', 'Aucun enregistrement en cours');
        return;
      }

      logger.info('VoiceRecorder', 'Arrêt de l\'enregistrement...');
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      logger.info('VoiceRecorder', `URI obtenue: ${uri}`);

      const status = await recording.getStatusAsync();
      const duration = status?.durationMillis || 0;
      const durationSeconds = Math.round(duration / 1000);

      setDurationMs(duration);

      // Vérifier durée minimale (2 secondes)
      if (duration < 2000) {
        Alert.alert(
          'Enregistrement trop court',
          `L'enregistrement ne fait que ${durationSeconds} seconde(s).\n\nEnregistrez au moins 2 secondes pour une bonne transcription.`,
          [
            { text: 'Réessayer', onPress: () => setRecording(null) },
            { text: 'Garder quand même', onPress: () => setRecordUri(uri) }
          ]
        );
        setRecording(null);
        return;
      }

      logger.info('VoiceRecorder', `Durée enregistrement: ${durationSeconds}s (${duration}ms)`);

      setRecording(null);
      setRecordUri(uri);
      setSendButtonState('ready'); // ✅ Note prête à envoyer : bouton bleu

      logger.success('VoiceRecorder', `Enregistrement arrêté - Durée: ${durationSeconds}s`);
    } catch (e) {
      logger.error('VoiceRecorder', 'Erreur arrêt enregistrement', e);
      Alert.alert('Erreur', e?.message || 'Stop impossible.');
    }
  };

  const uploadAndSave = async () => {
    if (!recordUri) {return Alert.alert('Aucun enregistrement', 'Enregistre d\'abord.');}

    // Vérifier les sélections dans le store
    const { currentClient, currentProject } = useAppStore.getState();
    if (!currentProject?.id || !currentClient?.id) {
      Alert.alert('Sélection manquante', 'Sélectionne d\'abord un client et un chantier');
      return;
    }

    try {
      setUploading(true);

      logger.info('VoiceRecorder', `Upload du fichier: ${recordUri}`);

      const resp = await fetch(recordUri);
      const arrayBuffer = await resp.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const fileName = `rec_${projectId}_${Date.now()}.m4a`;

      const { data: up, error: upErr } = await supabase
        .storage
        .from('voices')
        .upload(fileName, bytes, { contentType: 'audio/m4a', upsert: false });
      if (upErr) {throw upErr;}

      logger.success('VoiceRecorder', `Upload réussi - Fichier: ${fileName}`, { projectId, clientId: currentClient.id });

      // Le fichier est déjà uploadé, on a le storagePath
      const storagePath = up?.path || fileName;

      // ÉTAPE 1 : Transcription
      setIsTranscribing(true);
      setTranscriptionStatus('Transcription en cours avec Whisper IA...');
      setTranscriptionProgress(10);

      let transcribedText = '';
      let analysis = null;

      try {
        // Vérifier l'accès Pro pour la transcription Whisper
        const ok = await requireProOrPaywall(navigation, 'Notes vocales automatiques');
        if (!ok) {
          setIsTranscribing(false);
          setTranscriptionStatus('');
          setTranscriptionProgress(0);
          return;
        }

        // ÉTAPE 2 : Transcription Whisper (texte brut) via Edge Function
        setTranscriptionProgress(33);
        setTranscriptionStatus('Transcription en cours avec Whisper IA...');
        
        // ✅ Utiliser le storagePath déjà uploadé (plus besoin d'uploader à nouveau)
        const rawText = await transcribeAudio(null, storagePath);
        logger.info('VoiceRecorder', `Transcription brute: ${rawText}`);
        
        // ÉTAPE 3 : Correction orthographique avec GPT
        setTranscriptionProgress(55);
        setTranscriptionStatus('Correction orthographique en cours...');
        
        transcribedText = await correctNoteText(rawText);
        logger.info('VoiceRecorder', `Transcription corrigée: ${transcribedText}`);
        
        // ÉTAPE 4 : Analyse de la note avec GPT
        setTranscriptionProgress(80);
        setTranscriptionStatus('Analyse du contenu par l\'IA...');
        
        if (transcribedText && transcribedText.trim()) {
          analysis = await analyzeNote(transcribedText);
          logger.info('VoiceRecorder', `Analyse: ${JSON.stringify(analysis)}`);
          setAnalysisResult(analysis);
        }
        
        // ÉTAPE 5 : Terminé
        setTranscriptionProgress(100);
        setTranscriptionStatus('Traitement terminé avec succès !');
        
        setTranscription(transcribedText);
        
      } catch (transcribeError) {
        logger.error('VoiceRecorder', 'Erreur transcription/analyse', transcribeError);
        
        const errorInfo = handleAPIError(transcribeError, 'VoiceRecorder');
        
        // Continuer quand même avec une transcription vide
        transcribedText = '';
        analysis = {
          type: 'note_perso',
          note: 'Transcription échouée - À compléter manuellement'
        };
        
        Alert.alert(
          errorInfo.title || 'Erreur de transcription',
          errorInfo.message || 'L\'audio a été sauvegardé mais la transcription a échoué. Vous pouvez réessayer plus tard ou éditer manuellement.',
          errorInfo.retry ? [
            { text: 'OK' },
            { text: 'Réessayer', onPress: () => {
              setTimeout(() => uploadAndSave(), 500);
            }}
          ] : [{ text: 'OK' }]
        );
      } finally {
        setIsTranscribing(false);
        setTranscriptionStatus('');
        setTranscriptionProgress(0);
      }

      // ÉTAPE 3 : Sauvegarder la note vocale
      const { data: { user } } = await supabase.auth.getUser();
      
      const noteData = {
        project_id: currentProject.id,
        client_id: currentClient.id,
        user_id: user?.id,
        type: 'voice',
        storage_path: up?.path || fileName,
        transcription: transcribedText || null,
        analysis_data: analysis ? JSON.stringify(analysis) : null,
      };

      const { error: insErr } = await supabase.from('notes').insert([noteData]);

      if (insErr) {
        logger.error('VoiceRecorder', 'Erreur insertion DB', insErr);
        
        // Vérifier si c'est une erreur de colonne manquante
        const errorMessage = insErr.message || '';
        if (errorMessage.includes('transcription') || errorMessage.includes('analysis_data')) {
          const missingColumns = [];
          if (errorMessage.includes('transcription')) {missingColumns.push('transcription');}
          if (errorMessage.includes('analysis_data')) {missingColumns.push('analysis_data');}
          
          throw new Error(
            `Colonnes manquantes dans Supabase: ${missingColumns.join(', ')}. ` +
            `Exécutez la migration: supabase/migrations_notes_transcription.sql`
          );
        }
        
        // Autre erreur
        throw new Error(`Erreur lors de l'enregistrement: ${errorMessage}`);
      }
      
      logger.success('VoiceRecorder', 'Note sauvegardée en base', { noteId: noteData.project_id });

      // ✅ Rafraîchir la liste des notes
      await loadNotes();

      setRecordUri(null);
      setDurationMs(0);
      setTranscription('');
      setAnalysisResult(null);
      
      // ✅ État "success" : bouton vert pendant 2s
      setSendButtonState('success');
      setTimeout(() => {
        setSendButtonState('empty'); // Retour à l'état vide après 2s
      }, 2000);
      
      // Toast de succès
      showSuccess('Note envoyée avec succès');

      // ÉTAPE 4 : Générer un devis automatiquement si prestation détectée
      let alertTitle = '✅ Note vocale envoyée.';
      let alertMessage = transcribedText ? `Transcription:\n${transcribedText}` : '';
      
      if (analysis && analysis.type === 'prestation' && transcribedText && transcribedText.trim()) {
        logger.info('VoiceRecorder', 'Prestation détectée, génération devis automatique');
        
        try {
          // Utiliser le système existant de génération de devis
          const quoteData = generateQuoteFromTranscription(transcribedText, currentProject.id, currentClient.id, 20);
          
          if (quoteData && quoteData.services && quoteData.services.length > 0) {
            logger.success('VoiceRecorder', `Prestations détectées: ${quoteData.services.length}`, quoteData);
            
            const devisCreated = await insertAutoQuote(
              currentProject.id,
              currentClient.id,
              quoteData.services,
              quoteData.totals,
              transcribedText,
              20
            );
            
            if (devisCreated) {
              logger.success('VoiceRecorder', 'Devis automatique généré', { numero: devisCreated.numero, totals: quoteData.totals });
              alertTitle = '🤖 Devis automatique généré ✅.';
              alertMessage = 
                `Note vocale envoyée ✅.\n\n` +
                `🎯 ${quoteData.services.length} prestation(s) détectée(s)\n\n` +
                `Total HT: ${quoteData.totals.totalHT.toFixed(2)} €\n` +
                `Total TTC: ${quoteData.totals.totalTTC.toFixed(2)} €\n\n` +
                `📄 Devis ${devisCreated.numero} créé.`;
            }
          }
        } catch (quoteError) {
          logger.error('VoiceRecorder', 'Erreur génération devis', quoteError);
          // Ne pas bloquer, juste logger l'erreur
        }
      } else if (analysis && analysis.type === 'client_info') {
        alertTitle = 'ℹ️ Info client enregistrée';
        alertMessage = `Note vocale sauvegardée.\n\nInfo client: ${analysis.info || transcribedText}`;
      }

      Alert.alert(alertTitle, alertMessage);

    } catch (e) {
      logger.error('VoiceRecorder', 'Erreur uploadAndSave', e);
      
      // Message d'erreur plus clair pour l'utilisateur
      let errorMessage = e?.message || 'Upload impossible.';
      if (errorMessage.includes('Colonnes manquantes')) {
        errorMessage = 'Erreur de configuration base de données. Contactez le support.';
      }
      
      showError(errorMessage);
      
      // Ne pas perdre l'enregistrement si c'est juste une erreur DB
      // L'audio a été uploadé, on peut réessayer l'insertion plus tard
      if (recordUri && !errorMessage.includes('Upload')) {
        logger.warn('VoiceRecorder', 'Audio uploadé mais insertion DB échouée', { recordUri });
      }
    } finally {
      setUploading(false);
      setIsTranscribing(false);
      setTranscriptionStatus('');
      setTranscriptionProgress(0);
    }
  };

  const play = async (item) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setPlayingId(null);
      }

      const path = item.storage_path || item.file_path;
      if (!path) {
        throw new Error('Aucun chemin de fichier trouvé');
      }
      const { data: pub } = supabase.storage.from('voices').getPublicUrl(path);
      let url = pub?.publicUrl;
      if (!url) {
        const { data: signed } = await supabase.storage
          .from('voices')
          .createSignedUrl(path, 3600);
        url = signed?.signedUrl;
      }

      const { sound } = await Audio.Sound.createAsync({ uri: url });
      soundRef.current = sound;
      setPlayingId(item.id);
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((s) => {
        if (s.didJustFinish) {
          setPlayingId(null);
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch (e) {
      logger.error('VoiceRecorder', 'Erreur play', e);
      Alert.alert('Lecture impossible', e?.message || 'Erreur de lecture.');
    }
  };

  const saveEdit = async (id, textToSave) => {
    try {
      // Utiliser le texte passé en paramètre (état local) au lieu du state global
      const { error } = await supabase
        .from('notes')
        .update({ transcription: textToSave })
        .eq('id', id);
      if (error) {throw error;}
      setEditingId(null);
      setEditText('');
      await loadNotes();
      showSuccess('Note modifiée ✅');
    } catch (e) {
      showError(e.message || 'Modification impossible');
    }
  };

  // Fonction de suppression d'une note
  const deleteNote = async (noteId, storagePath) => {
    Alert.alert(
      'Supprimer cette note ?',
      'Cette note sera définitivement supprimée du chantier.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              // Supprimer le fichier audio dans Supabase Storage si présent
              if (storagePath) {
                try {
                  const { error: storageError } = await supabase.storage
                    .from('voices')
                    .remove([storagePath]);
                  if (storageError) {
                    logger.warn('VoiceRecorder', 'Erreur suppression storage', storageError);
                    // Continuer même si la suppression du fichier échoue
                  }
                } catch (storageErr) {
                  logger.warn('VoiceRecorder', 'Exception suppression storage', storageErr);
                  // Continuer même si la suppression du fichier échoue
                }
              }

              // Supprimer la note dans la base de données
              const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', noteId);

              if (error) {
                logger.error('VoiceRecorder', 'Erreur suppression note', error);
                throw error;
              }

              logger.success('VoiceRecorder', 'Note supprimée');
              showSuccess('Note supprimée');
              
              // Rafraîchir la liste des notes
              await loadNotes();
            } catch (err) {
              logger.error('VoiceRecorder', 'Exception suppression note', err);
              showError(err.message || 'Impossible de supprimer la note');
            }
          },
        },
      ]
    );
  };

  const Item = ({ item, index }) => {
    const isEditing = editingId === item.id;
    
    // État local pour éviter les re-renders à chaque frappe
    // Le TextInput utilise cet état local, pas le state global
    const [localEditText, setLocalEditText] = useState(item.transcription);
    
    let itemAnalysis = null;
    try {
      if (item.analysis_data) {
        itemAnalysis = JSON.parse(item.analysis_data);
      }
    } catch (e) {
      // Ignorer les erreurs de parsing
    }
    
    // Animation d'apparition pour chaque note
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(20)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      // Stagger : chaque note apparaît avec un délai basé sur son index
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]).start();
    }, [index]);

    const handlePressIn = (buttonScale) => {
      Animated.spring(buttonScale, {
        toValue: 0.95,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = (buttonScale) => {
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }).start();
    };

    const editButtonScale = useRef(new Animated.Value(1)).current;
    const deleteButtonScale = useRef(new Animated.Value(1)).current;
    const playButtonScale = useRef(new Animated.Value(1)).current;
    
    return (
      <Animated.View
        style={[
          styles.itemCard,
          {
            opacity: opacityAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}
      >
        <View style={styles.row}>
          <Text style={styles.durationText}>
            {Math.round((item.duration_ms || 0) / 1000)}s
          </Text>
          <Pressable
            onPress={() => play(item)}
            onPressIn={() => handlePressIn(playButtonScale)}
            onPressOut={() => handlePressOut(playButtonScale)}
          >
            <Animated.View style={[styles.playBtn, { transform: [{ scale: playButtonScale }] }]}>
              <Text style={styles.playBtnText}>
                {playingId === item.id ? '⏸️ Pause' : '▶️ Lire'}
              </Text>
            </Animated.View>
          </Pressable>
        </View>
        
        {item.transcription ? (
          <View style={styles.transcriptionBox}>
            {isEditing ? (
              <>
                <TextInput
                  style={styles.editInput}
                  value={localEditText}
                  onChangeText={setLocalEditText} // ✅ État local : pas de re-render global
                  multiline
                  autoFocus
                  placeholderTextColor="#9CA3AF"
                />
                <View style={styles.editActions}>
                  <TouchableOpacity 
                    onPress={() => {
                      // Sauvegarder avec le texte local
                      saveEdit(item.id, localEditText);
                    }} 
                    style={styles.saveBtn}
                  >
                    <Text style={styles.saveBtnText}>💾 Sauvegarder</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => { 
                      setEditingId(null); 
                      setEditText(''); 
                      setLocalEditText(item.transcription); // Reset local
                    }} 
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelBtnText}>❌ Annuler</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {itemAnalysis && (
                  <View style={styles.analysisBadge}>
                    <Text style={styles.analysisBadgeText}>
                      {itemAnalysis.type === 'prestation' ? '✅ Prestation' : 
                       itemAnalysis.type === 'client_info' ? 'ℹ️ Info client' : 
                       '📝 Note perso'}
                    </Text>
                  </View>
                )}
                <Text style={styles.transcriptionDisplay}>{item.transcription}</Text>
                <View style={styles.editActions}>
                  <Pressable
                    onPress={() => { 
                      setEditingId(item.id); 
                      setEditText(item.transcription);
                      // Pas besoin de setLocalEditText ici, c'est géré dans Item
                    }}
                    onPressIn={() => handlePressIn(editButtonScale)}
                    onPressOut={() => handlePressOut(editButtonScale)}
                  >
                    <Animated.View style={[styles.editBtn, { transform: [{ scale: editButtonScale }] }]}>
                      <Text style={styles.editBtnText}>✏️ Modifier</Text>
                    </Animated.View>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        ) : (
          <Text style={styles.noTranscript}>Pas de transcription</Text>
        )}
        
        {/* Bouton Supprimer : toujours visible, même sans transcription */}
        <View style={styles.editActions}>
          <Pressable
            onPress={() => deleteNote(item.id, item.storage_path)}
            onPressIn={() => handlePressIn(deleteButtonScale)}
            onPressOut={() => handlePressOut(deleteButtonScale)}
          >
            <Animated.View style={[styles.deleteBtn, { transform: [{ scale: deleteButtonScale }] }]}>
              <Text style={styles.deleteBtnText}>🗑️ Supprimer</Text>
            </Animated.View>
          </Pressable>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.box}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Note vocale</Text>
        <View style={styles.whisperBadge}>
          <Text style={styles.whisperBadgeText}>🎤 Transcription IA</Text>
        </View>
      </View>

      <View style={styles.row}>
        {!recording ? (
          <TouchableOpacity onPress={startRecording} style={styles.primary}>
            <Text style={styles.primaryText}>🎙️ Enregistrer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={stopRecording} style={[styles.primary, { backgroundColor: '#DC2626' }]}>
            <Text style={styles.primaryText}>⏹️ Stop</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => {
            // UX : États du bouton selon le contenu
            // - Gris : aucun enregistrement
            // - Bleu : enregistrement prêt
            // - Vert : envoi réussi (2s)
            
            // Validation : si aucune note enregistrée, afficher toast
            if (!recordUri) {
              showError('Aucune note à envoyer.');
              return;
            }
            
            // Si note disponible, exécuter l'upload
            uploadAndSave();
          }}
          style={[
            styles.secondary,
            // États visuels du bouton :
            sendButtonState === 'empty' && !recordUri && { backgroundColor: '#64748B' }, // Gris si vide
            sendButtonState === 'ready' && recordUri && { backgroundColor: '#3B82F6' }, // Bleu si prêt
            sendButtonState === 'success' && { backgroundColor: '#10B981' }, // Vert après succès
            (uploading || isTranscribing) && { opacity: 0.6 }, // Grisé pendant traitement
          ]}
          disabled={uploading || isTranscribing} // Désactiver seulement pendant traitement
        >
          <Text style={styles.secondaryText}>
            {isTranscribing ? '🎤 Transcription…' : uploading ? 'Envoi…' : sendButtonState === 'success' ? '✅ Envoyé' : '☁️ Envoyer'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Nouveau feedback transcription */}
      <TranscriptionFeedback
        isTranscribing={isTranscribing}
        status={transcriptionStatus}
        progress={transcriptionProgress / 100}
      />

      {recordUri && !isTranscribing && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            ✅ Durée: {Math.round(durationMs / 1000)}s • Prêt pour transcription
          </Text>
        </View>
      )}
      
      {transcription && !isTranscribing && (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionLabel}>Transcription:</Text>
          <Text style={styles.transcriptionText}>{transcription}</Text>
          {analysisResult && (
            <View style={styles.analysisContainer}>
              <Text style={styles.analysisLabel}>
                Type: {analysisResult.type === 'prestation' ? '✅ Prestation' : 
                       analysisResult.type === 'client_info' ? 'ℹ️ Info client' : 
                       '📝 Note perso'}
              </Text>
            </View>
          )}
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={({ item, index }) => <Item item={item} index={index} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune note pour ce chantier.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: '#2A2E35' },
  title: { fontWeight: '800', marginBottom: 6, color: '#EAEAEA', fontSize: 16 },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 12, // Augmenté de 8 à 12 pour harmonisation
    gap: 12, // Espacement entre les 2 boutons
  },
  primary: { 
    flex: 1, // Boutons de taille égale
    backgroundColor: '#1D4ED8', 
    paddingVertical: 12, // Augmenté de 8 à 12 pour cohérence
    paddingHorizontal: 16, // Augmenté de 12 à 16
    borderRadius: 10,
    alignItems: 'center', // Centrer le texte
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondary: { 
    flex: 1, // Boutons de taille égale
    backgroundColor: '#3B82F6', // Bleu par défaut (sera override selon état)
    paddingVertical: 12, // Harmonisé avec primary
    paddingHorizontal: 16, // Harmonisé avec primary
    borderRadius: 10,
    alignItems: 'center', // Centrer le texte
  },
  secondaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  playBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#1E3A8A', borderRadius: 8 },
  playBtnText: { color: '#93C5FD', fontWeight: '700' },
  transcriptionContainer: { marginBottom: 12, padding: 12, backgroundColor: '#1A1D22', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#1D4ED8' },
  transcriptionLabel: { fontWeight: '700', marginBottom: 4, color: '#EAEAEA' },
  transcriptionText: { color: '#D1D5DB', fontSize: 14, lineHeight: 20 },
  itemCard: { marginBottom: 12, padding: 12, backgroundColor: '#1A1D22', borderRadius: 8, borderWidth: 1, borderColor: '#2A2E35' },
  transcriptionBox: { marginTop: 8 },
  transcriptionDisplay: { color: '#D1D5DB', fontSize: 14, lineHeight: 20, marginBottom: 8 },
  editInput: { borderWidth: 1, borderColor: '#374151', borderRadius: 8, padding: 8, minHeight: 80, backgroundColor: '#0F1115', color: '#EAEAEA' },
  editActions: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  editBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#1E3A8A', borderRadius: 8 },
  editBtnText: { color: '#93C5FD', fontWeight: '700', fontSize: 12 },
  saveBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#10B981', borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  cancelBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#DC2626', borderRadius: 8 },
  cancelBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  noTranscript: { color: '#6B7280', fontSize: 12, fontStyle: 'italic' },
  aiButton: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#10B981', borderRadius: 8 },
  aiButtonText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  deleteBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#DC2626', borderRadius: 8 },
  deleteBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  durationText: { fontWeight: '700', color: '#D1D5DB' },
  emptyText: { color: '#6B7280', textAlign: 'center', marginTop: 20 },
  infoContainer: { 
    flexDirection: 'row', // Pour aligner icône + texte
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8, // Espacement avec boutons
    marginBottom: 12, // Harmonisé
    padding: 10, // Augmenté de 8 à 10
    backgroundColor: '#1A1D22', 
    borderRadius: 8, // Augmenté de 6 à 8 pour cohérence
    borderWidth: 1,
    borderColor: '#10B981', // Bordure verte (état "prêt")
  },
  infoText: { 
    color: '#D1D5DB', // Plus clair pour meilleure lisibilité
    fontSize: 13, // Augmenté de 12 à 13
    fontWeight: '600', // Plus visible
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  whisperBadge: { backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  whisperBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  transcriptionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderRadius: 10,
  },
  transcriptionStatus: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '600',
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  analysisContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 6,
  },
  analysisLabel: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  analysisBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  analysisBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
  },
});
