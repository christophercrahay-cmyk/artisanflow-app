// VoiceRecorder.js

import React, { useEffect, useRef, useState } from 'react';

import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, ActivityIndicator, TextInput, ScrollView } from 'react-native';

import { Audio } from 'expo-av';

import { supabase } from './supabaseClient';

import { transcribeAudio } from './services/transcriptionService';

import { analyzeNote } from './services/quoteAnalysisService';

import { useAppStore } from './store/useAppStore';

import { generateQuoteFromTranscription } from './utils/ai_quote_generator';

import { insertAutoQuote } from './utils/supabase_helpers';

import { handleAPIError } from './utils/errorHandler';

import logger from './utils/logger';
import { showSuccess, showError } from './components/Toast';

export default function VoiceRecorder({ projectId }) {

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

  const loadNotes = async () => {
    try {
      const { data, error, status } = await supabase
        .from('notes')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erreur chargement notes:', status, error.message);
        Alert.alert('Erreur', 'Impossible de charger les notes');
        return;
      }
      setItems(data || []);
    } catch (err) {
      console.error('Exception chargement notes:', err);
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

  const startRecording = async () => {
    try {
      console.log('[VoiceRecorder] Demande de permission micro...');
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      console.log('[VoiceRecorder] Permission audio status:', audioStatus);
      
      if (audioStatus !== 'granted') {
        Alert.alert('Micro refusé', 'Active le micro dans les réglages.');
        return;
      }

      console.log('[VoiceRecorder] Configuration du mode audio...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('[VoiceRecorder] Création de l\'enregistrement...');
      const recording = new Audio.Recording();

      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      console.log('[VoiceRecorder] Démarrage de l\'enregistrement...');
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
        console.warn('[VoiceRecorder] Aucun enregistrement en cours');
        return;
      }

      console.log('[VoiceRecorder] Arrêt de l\'enregistrement...');
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('[VoiceRecorder] URI obtenue:', uri);

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

      console.log(`[VoiceRecorder] Durée enregistrement: ${durationSeconds}s (${duration}ms)`);

      setRecording(null);
      setRecordUri(uri);

      logger.success('VoiceRecorder', `Enregistrement arrêté - Durée: ${durationSeconds}s`);
    } catch (e) {
      logger.error('VoiceRecorder', 'Erreur arrêt enregistrement', e);
      Alert.alert('Erreur', e?.message || 'Stop impossible.');
    }
  };

  const uploadAndSave = async () => {
    if (!recordUri) return Alert.alert('Aucun enregistrement', 'Enregistre d\'abord.');

    // Vérifier les sélections dans le store
    const { currentClient, currentProject } = useAppStore.getState();
    if (!currentProject?.id || !currentClient?.id) {
      Alert.alert('Sélection manquante', 'Sélectionne d\'abord un client et un chantier');
      return;
    }

    try {
      setUploading(true);

      console.log('[VoiceRecorder] Upload du fichier:', recordUri);

      const resp = await fetch(recordUri);
      const arrayBuffer = await resp.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const fileName = `rec_${projectId}_${Date.now()}.m4a`;

      const { data: up, error: upErr } = await supabase
        .storage
        .from('voices')
        .upload(fileName, bytes, { contentType: 'audio/m4a', upsert: false });
      if (upErr) throw upErr;

      logger.success('VoiceRecorder', `Upload réussi - Fichier: ${fileName}`, { projectId, clientId: currentClient.id });

      // ÉTAPE 1 : Transcription avec OpenAI Whisper
      setIsTranscribing(true);
      setTranscriptionStatus('🎤 Transcription en cours...');
      setTranscriptionProgress(30);

      let transcribedText = '';
      let analysis = null;

      try {
        transcribedText = await transcribeAudio(recordUri);
        console.log('[VoiceRecorder] Transcription:', transcribedText);
        
        setTranscriptionProgress(60);
        setTranscriptionStatus('🧠 Analyse de la note...');
        
        // ÉTAPE 2 : Analyse de la note avec GPT
        if (transcribedText && transcribedText.trim()) {
          analysis = await analyzeNote(transcribedText);
          console.log('[VoiceRecorder] Analyse:', analysis);
          setAnalysisResult(analysis);
        }
        
        setTranscriptionProgress(100);
        setTranscriptionStatus('✅ Terminé !');
        
        setTranscription(transcribedText);
        
      } catch (transcribeError) {
        console.error('[VoiceRecorder] Erreur transcription/analyse:', transcribeError);
        
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
          if (errorMessage.includes('transcription')) missingColumns.push('transcription');
          if (errorMessage.includes('analysis_data')) missingColumns.push('analysis_data');
          
          throw new Error(
            `Colonnes manquantes dans Supabase: ${missingColumns.join(', ')}. ` +
            `Exécutez la migration: supabase/migrations_notes_transcription.sql`
          );
        }
        
        // Autre erreur
        throw new Error(`Erreur lors de l'enregistrement: ${errorMessage}`);
      }
      
      logger.success('VoiceRecorder', 'Note sauvegardée en base', { noteId: noteData.project_id });

      setRecordUri(null);
      setDurationMs(0);
      setTranscription('');
      setAnalysisResult(null);

      await loadNotes();

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
          console.error('[VoiceRecorder] Erreur génération devis:', quoteError);
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
      let { data: pub } = supabase.storage.from('voices').getPublicUrl(path);
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
      console.error('[VoiceRecorder] Erreur play:', e);
      Alert.alert('Lecture impossible', e?.message || 'Erreur de lecture.');
    }
  };

  const saveEdit = async (id) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ transcription: editText })
        .eq('id', id);
      if (error) throw error;
      setEditingId(null);
      setEditText('');
      await loadNotes();
      Alert.alert('OK', 'Note modifiée ✅');
    } catch (e) {
      Alert.alert('Erreur', e.message || 'Modification impossible');
    }
  };

  const Item = ({ item }) => {
    const isEditing = editingId === item.id;
    let itemAnalysis = null;
    try {
      if (item.analysis_data) {
        itemAnalysis = JSON.parse(item.analysis_data);
      }
    } catch (e) {
      // Ignorer les erreurs de parsing
    }
    
    return (
      <View style={styles.itemCard}>
        <View style={styles.row}>
          <Text style={styles.durationText}>
            {Math.round((item.duration_ms || 0) / 1000)}s
          </Text>
          <TouchableOpacity onPress={() => play(item)} style={styles.playBtn}>
            <Text style={styles.playBtnText}>
              {playingId === item.id ? '⏸️ Pause' : '▶️ Lire'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {item.transcription ? (
          <View style={styles.transcriptionBox}>
            {isEditing ? (
              <>
                <TextInput
                  style={styles.editInput}
                  value={editText}
                  onChangeText={setEditText}
                  multiline
                  autoFocus
                  placeholderTextColor="#9CA3AF"
                />
                <View style={styles.editActions}>
                  <TouchableOpacity onPress={() => saveEdit(item.id)} style={styles.saveBtn}>
                    <Text style={styles.saveBtnText}>💾 Sauvegarder</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setEditingId(null); setEditText(''); }} style={styles.cancelBtn}>
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
                  <TouchableOpacity onPress={() => { setEditingId(item.id); setEditText(item.transcription); }} style={styles.editBtn}>
                    <Text style={styles.editBtnText}>✏️ Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={async () => {
                      const { currentClient, currentProject } = useAppStore.getState();
                      if (!currentProject?.id || !currentClient?.id) {
                        Alert.alert('Sélection manquante', 'Sélectionne d\'abord un client et un chantier');
                        return;
                      }

                      try {
                        const quoteData = generateQuoteFromTranscription(
                          item.transcription,
                          currentProject.id,
                          currentClient.id,
                          20
                        );

                        if (quoteData && quoteData.services && quoteData.services.length > 0) {
                          const devis = await insertAutoQuote(
                            currentProject.id,
                            currentClient.id,
                            quoteData.services,
                            quoteData.totals,
                            item.transcription,
                            20
                          );

                          if (devis) {
                            Alert.alert(
                              '🎯 Devis automatique généré ✅',
                              `${quoteData.services.length} prestation(s) détectée(s)\n\n` +
                              `Total HT: ${quoteData.totals.totalHT.toFixed(2)} €\n` +
                              `Total TTC: ${quoteData.totals.totalTTC.toFixed(2)} €\n\n` +
                              `📄 Devis ${devis.numero} créé.`
                            );
                          } else {
                            Alert.alert('Erreur', 'Impossible de créer le devis');
                          }
                        } else {
                          Alert.alert('ℹ️ Info', 'Aucune prestation détectée dans cette transcription.');
                        }
                      } catch (err) {
                        console.error('[VoiceRecorder] Erreur génération devis:', err);
                        Alert.alert('Erreur', err.message || 'Génération échouée');
                      }
                    }}
                    style={styles.aiButton}
                  >
                    <Text style={styles.aiButtonText}>🧠 Générer Devis IA</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ) : (
          <Text style={styles.noTranscript}>Pas de transcription</Text>
        )}
      </View>
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
          onPress={uploadAndSave}
          style={[styles.secondary, !recordUri && { opacity: 0.5 }]}
          disabled={!recordUri || uploading || isTranscribing}
        >
          <Text style={styles.secondaryText}>
            {isTranscribing ? '🎤 Transcription…' : uploading ? 'Envoi…' : '☁️ Envoyer'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Overlay de transcription en cours */}
      {isTranscribing && (
        <View style={styles.transcriptionOverlay}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.transcriptionStatus}>
            {transcriptionStatus}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${transcriptionProgress}%` }
              ]} 
            />
          </View>
        </View>
      )}

      {recordUri && !isTranscribing && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Durée: {Math.round(durationMs / 1000)}s • Prêt pour transcription
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
        renderItem={({ item }) => <Item item={item} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune note pour ce chantier.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: '#2A2E35' },
  title: { fontWeight: '800', marginBottom: 6, color: '#EAEAEA', fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  primary: { backgroundColor: '#1D4ED8', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondary: { backgroundColor: '#2A2E35', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  secondaryText: { color: '#EAEAEA', fontWeight: '700' },
  playBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#1E3A8A', borderRadius: 8 },
  playBtnText: { color: '#93C5FD', fontWeight: '700' },
  transcriptionContainer: { marginBottom: 12, padding: 12, backgroundColor: '#1A1D22', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#1D4ED8' },
  transcriptionLabel: { fontWeight: '700', marginBottom: 4, color: '#EAEAEA' },
  transcriptionText: { color: '#D1D5DB', fontSize: 14, lineHeight: 20 },
  itemCard: { marginBottom: 12, padding: 12, backgroundColor: '#1A1D22', borderRadius: 8, borderWidth: 1, borderColor: '#2A2E35' },
  transcriptionBox: { marginTop: 8 },
  transcriptionDisplay: { color: '#D1D5DB', fontSize: 14, lineHeight: 20, marginBottom: 8 },
  editInput: { borderWidth: 1, borderColor: '#374151', borderRadius: 8, padding: 8, minHeight: 80, backgroundColor: '#0F1115', color: '#EAEAEA' },
  editActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  editBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#1E3A8A', borderRadius: 8 },
  editBtnText: { color: '#93C5FD', fontWeight: '700', fontSize: 12 },
  saveBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#10B981', borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  cancelBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#DC2626', borderRadius: 8 },
  cancelBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  noTranscript: { color: '#6B7280', fontSize: 12, fontStyle: 'italic' },
  aiButton: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#10B981', borderRadius: 8 },
  aiButtonText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  durationText: { fontWeight: '700', color: '#D1D5DB' },
  emptyText: { color: '#6B7280', textAlign: 'center', marginTop: 20 },
  infoContainer: { marginBottom: 8, padding: 8, backgroundColor: '#1A1D22', borderRadius: 6 },
  infoText: { color: '#9CA3AF', fontSize: 12, textAlign: 'center' },
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
