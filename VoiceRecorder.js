// VoiceRecorder.js

import React, { useEffect, useRef, useState } from 'react';

import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, ActivityIndicator, TextInput } from 'react-native';

import { Audio } from 'expo-av';

import { supabase } from './supabaseClient';

import * as FileSystem from 'expo-file-system';

// Whisper.rn est un module natif - pas disponible dans Expo Go
let initWhisper = null;
try {
  const whisperModule = require('whisper.rn');
  initWhisper = whisperModule.initWhisper;
} catch (e) {
  console.warn('[VoiceRecorder] Whisper.rn non disponible (Expo Go)');
}



export default function VoiceRecorder({ projectId }) {

  const [recording, setRecording] = useState(null);

  const [recordUri, setRecordUri] = useState(null);

  const [durationMs, setDurationMs] = useState(0);

  const [uploading, setUploading] = useState(false);

  const [transcribing, setTranscribing] = useState(false);

  const [transcription, setTranscription] = useState('');

  const [items, setItems] = useState([]);

  const soundRef = useRef(null);

  const [playingId, setPlayingId] = useState(null);

  const whisperContextRef = useRef(null);

  const [editingId, setEditingId] = useState(null);

  const [editText, setEditText] = useState('');



  // Fonction pour télécharger et vérifier le modèle Whisper
  const getWhisperModelPath = async () => {
    try {
      // Chemin local pour le modèle
      const modelName = 'ggml-tiny.en.bin';
      const modelDir = `${FileSystem.documentDirectory}whisper/`;
      const modelPath = `${modelDir}${modelName}`;

      // Créer le dossier si nécessaire
      const dirInfo = await FileSystem.getInfoAsync(modelDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(modelDir, { intermediates: true });
      }

      // Vérifier si le modèle existe déjà
      const modelInfo = await FileSystem.getInfoAsync(modelPath);
      if (!modelInfo.exists) {
        console.log('[VoiceRecorder] Téléchargement du modèle Whisper...');
        // URL du modèle sur Hugging Face
        const modelUrl = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin';
        const downloadResult = await FileSystem.downloadAsync(modelUrl, modelPath);
        console.log('[VoiceRecorder] Modèle téléchargé:', downloadResult.uri);
      } else {
        console.log('[VoiceRecorder] Modèle déjà présent');
      }

      return modelPath;
    } catch (err) {
      console.error('[VoiceRecorder] Erreur modèle Whisper:', err);
      throw err;
    }
  };



  const loadNotes = async () => {
    try {
      const { data, error, status } = await supabase
        .from('notes')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) {
        console.warn('Supabase notes error:', status, error.message);
        return;
      }
      setItems(data || []);
    } catch (err) {
      console.warn('Notes load exception:', err?.message || String(err));
    }
  };



  useEffect(() => {

    loadNotes();

    return () => {

      if (soundRef.current) {

        soundRef.current.unloadAsync();

      }

      // Nettoyer le contexte Whisper
      if (whisperContextRef.current) {

        whisperContextRef.current.release().catch((err) => console.warn('[VoiceRecorder] Erreur release Whisper:', err));

        whisperContextRef.current = null;

      }

    };

  }, [projectId]);



  const startRecording = async () => {

    try {

      console.log('[VoiceRecorder] Demande de permission micro...');

      const { status } = await Audio.requestPermissionsAsync();

      console.log('[VoiceRecorder] Permission status:', status);

      if (status !== 'granted') {

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

      console.log('[VoiceRecorder] Enregistrement démarré ✅');

    } catch (e) {

      console.error('[VoiceRecorder] Erreur startRecording:', e);

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

      setDurationMs(status?.durationMillis || 0);

      setRecording(null);

      setRecordUri(uri);

      console.log('[VoiceRecorder] Enregistrement arrêté ✅, durée:', status?.durationMillis || 0, 'ms');

    } catch (e) {

      console.error('[VoiceRecorder] Erreur stopRecording:', e);

      Alert.alert('Erreur', e?.message || 'Stop impossible.');

    }

  };



  const uploadAndSave = async () => {

    if (!recordUri) return Alert.alert('Aucun enregistrement', 'Enregistre d\'abord.');

    try {

      setUploading(true);

      setTranscribing(true);

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



      // Transcription locale avec Whisper
      let transcribedText = '';
      
      if (initWhisper) {
        try {
          console.log('[VoiceRecorder] Démarrage de la transcription...');
          
          // Initialiser le contexte Whisper si pas déjà fait
          if (!whisperContextRef.current) {
            console.log('[VoiceRecorder] Initialisation du contexte Whisper...');
            const modelPath = await getWhisperModelPath();
            whisperContextRef.current = await initWhisper({
              filePath: modelPath,
              useGpu: true,
            });
          }

          // Transcrire l'audio
          const { promise } = whisperContextRef.current.transcribe(recordUri, {
            language: 'en', // Anglais pour tiny.en
          });

          const result = await promise;
          transcribedText = result.result || '';
          console.log('[VoiceRecorder] Transcription obtenue:', transcribedText);
          
          setTranscription(transcribedText);

        } catch (transcribeErr) {
          console.error('[VoiceRecorder] Erreur transcription:', transcribeErr);
          // On continue même si la transcription échoue
          Alert.alert('Transcription', 'Impossible de transcrire l\'audio. L\'enregistrement sera quand même sauvegardé.');
        } finally {
          setTranscribing(false);
        }
      } else {
        console.log('[VoiceRecorder] Whisper indisponible (mode Expo Go)');
        setTranscribing(false);
      }



      // Préparer les données pour l'insertion
      // IMPORTANT: Exécute le SQL dans Supabase pour créer/ajouter storage_path et transcription !
      // SQL: ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS storage_path TEXT;
      // SQL: ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS transcription TEXT;
      const noteData = {
        project_id: projectId,
        type: 'voice',
        storage_path: up?.path || fileName,
        transcription: transcribedText || null,
      };

      const { error: insErr } = await supabase.from('notes').insert([noteData]);

      if (insErr) {
        console.error('[VoiceRecorder] Structure table notes:', insErr.message);
        throw new Error(`Colonne manquante dans Supabase. Exécute: ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS transcription TEXT;`);
      }



      setRecordUri(null);

      setDurationMs(0);

      setTranscription('');

      await loadNotes();

      Alert.alert('OK', transcribedText ? 'Note vocale envoyée ✅\n\nTranscription: ' + transcribedText : 'Note vocale envoyée ✅');

    } catch (e) {

      console.error('[VoiceRecorder] Erreur uploadAndSave:', e);

      Alert.alert('Erreur', e?.message || 'Upload impossible.');

    } finally {

      setUploading(false);

      setTranscribing(false);

    }

  };



  const play = async (item) => {

    try {

      if (soundRef.current) {

        await soundRef.current.unloadAsync();

        soundRef.current = null;

        setPlayingId(null);

      }

      // URL publique si bucket public, sinon URL signée 1h en fallback
      // Utiliser storage_path ou file_path selon ce qui existe
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
    
    return (
      <View style={styles.itemCard}>
        <View style={styles.row}>
          <Text style={{ fontWeight: '700' }}>
            {Math.round((item.duration_ms || 0) / 1000)}s
          </Text>
          <TouchableOpacity onPress={() => play(item)} style={styles.playBtn}>
            <Text style={{ color: '#1D4ED8', fontWeight: '700' }}>
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
                <Text style={styles.transcriptionDisplay}>{item.transcription}</Text>
                <TouchableOpacity onPress={() => { setEditingId(item.id); setEditText(item.transcription); }} style={styles.editBtn}>
                  <Text style={styles.editBtnText}>✏️ Modifier</Text>
                </TouchableOpacity>
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

      <Text style={styles.title}>Note vocale</Text>

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

          disabled={!recordUri || uploading || transcribing}

        >

          <Text style={styles.secondaryText}>
            {transcribing ? '🎤 Transcription…' : uploading ? 'Envoi…' : '☁️ Envoyer'}
          </Text>

        </TouchableOpacity>

      </View>



      {transcribing && (
        <View style={styles.transcribingContainer}>
          <ActivityIndicator size="small" color="#1D4ED8" />
          <Text style={styles.transcribingText}>Transcription en cours...</Text>
        </View>
      )}

      {transcription && !transcribing && (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionLabel}>Transcription:</Text>
          <Text style={styles.transcriptionText}>{transcription}</Text>
        </View>
      )}



      <FlatList

        data={items}

        keyExtractor={(it) => String(it.id)}

        renderItem={({ item }) => <Item item={item} />}

        ListEmptyComponent={<Text style={{ color: '#666' }}>Aucune note pour ce chantier.</Text>}

      />

    </View>

  );

}



const styles = StyleSheet.create({

  box: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: '#eee' },

  title: { fontWeight: '800', marginBottom: 6 },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },

  primary: { backgroundColor: '#1D4ED8', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },

  primaryText: { color: '#fff', fontWeight: '700' },

  secondary: { backgroundColor: '#E5E7EB', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },

  secondaryText: { color: '#111827', fontWeight: '700' },

  playBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#EFF6FF', borderRadius: 8 },

  transcribingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingVertical: 8 },

  transcribingText: { marginLeft: 8, color: '#666', fontSize: 14 },

  transcriptionContainer: { marginBottom: 12, padding: 12, backgroundColor: '#F3F4F6', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#1D4ED8' },

  transcriptionLabel: { fontWeight: '700', marginBottom: 4, color: '#111827' },

  transcriptionText: { color: '#374151', fontSize: 14, lineHeight: 20 },

  itemCard: { marginBottom: 12, padding: 12, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee' },

  transcriptionBox: { marginTop: 8 },

  transcriptionDisplay: { color: '#374151', fontSize: 14, lineHeight: 20, marginBottom: 8 },

  editInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, minHeight: 80, backgroundColor: '#fff' },

  editActions: { flexDirection: 'row', gap: 8, marginTop: 8 },

  editBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#EFF6FF', borderRadius: 8, marginTop: 8 },

  editBtnText: { color: '#1D4ED8', fontWeight: '700', fontSize: 12 },

  saveBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#10B981', borderRadius: 8 },

  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  cancelBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#EF4444', borderRadius: 8 },

  cancelBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  noTranscript: { color: '#999', fontSize: 12, fontStyle: 'italic' },

});
