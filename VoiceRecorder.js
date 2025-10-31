// VoiceRecorder.js

import React, { useEffect, useRef, useState } from 'react';

import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';

import { Audio } from 'expo-av';

import { supabase } from './supabaseClient';



export default function VoiceRecorder({ projectId }) {

  const [recording, setRecording] = useState(null);

  const [recordUri, setRecordUri] = useState(null);

  const [durationMs, setDurationMs] = useState(0);

  const [uploading, setUploading] = useState(false);

  const [items, setItems] = useState([]);

  const soundRef = useRef(null);

  const [playingId, setPlayingId] = useState(null);



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

    if (!recordUri) return Alert.alert('Aucun enregistrement', 'Enregistre d’abord.');

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



      // Préparer les données pour l'insertion
      // IMPORTANT: Exécute le SQL dans Supabase pour créer/ajouter storage_path !
      // SQL: ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS storage_path TEXT;
      const noteData = {
        project_id: projectId,
        type: 'voice',
        storage_path: up?.path || fileName,
      };

      const { error: insErr } = await supabase.from('notes').insert([noteData]);

      if (insErr) {
        console.error('[VoiceRecorder] Structure table notes:', insErr.message);
        throw new Error(`Colonne manquante dans Supabase. Exécute: ALTER TABLE public.notes ADD COLUMN storage_path TEXT;`);
      }



      setRecordUri(null);

      setDurationMs(0);

      await loadNotes();

      Alert.alert('OK', 'Note vocale envoyée ✅');

    } catch (e) {

      console.error('[VoiceRecorder] Erreur uploadAndSave:', e);

      Alert.alert('Erreur', e?.message || 'Upload impossible.');

    } finally {

      setUploading(false);

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



  const Item = ({ item }) => (

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

  );



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

          disabled={!recordUri || uploading}

        >

          <Text style={styles.secondaryText}>{uploading ? 'Envoi…' : '☁️ Envoyer'}</Text>

        </TouchableOpacity>

      </View>



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

});
