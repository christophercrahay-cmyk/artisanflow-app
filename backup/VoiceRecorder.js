// VoiceRecorder.js
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { supabase } from './supabaseClient';

export default function VoiceRecorder({ projectId }) {
  const [perm, setPerm] = useState(null);          // null | 'granted' | 'denied'
  const [isRec, setIsRec] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const recRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setPerm(status);
    })();
  }, []);

  const start = async () => {
    try {
      if (perm !== 'granted') {
        const { status } = await Audio.requestPermissionsAsync();
        setPerm(status);
        if (status !== 'granted') {return;}
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await rec.startAsync();
      recRef.current = rec;
      setIsRec(true);
    } catch (e) {
      console.log(e);
      Alert.alert('Erreur', "Impossible de démarrer l'enregistrement.");
    }
  };

  const stop = async () => {
    try {
      const rec = recRef.current;
      if (!rec) {return;}
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      setIsRec(false);
      recRef.current = null;

      if (!uri) {return Alert.alert('Erreur', 'Aucun fichier audio généré.');}

      setIsUploading(true);
      // Convertir en Blob et envoyer au Storage
      const resp = await fetch(uri);
      const blob = await resp.blob();

      const fileName = `p_${projectId}/${Date.now()}.m4a`;
      const { error: upErr } = await supabase
        .storage
        .from('voices')
        .upload(fileName, blob, { contentType: 'audio/m4a', upsert: true });

      if (upErr) {throw upErr;}

      // Enregistrer la note dans la table notes
      const { error: insErr } = await supabase
        .from('notes')
        .insert([{ project_id: projectId, file_path: fileName }]);

      if (insErr) {throw insErr;}

      Alert.alert('OK', 'Note vocale enregistrée ✅');
    } catch (e) {
      console.log(e);
      Alert.alert('Erreur', e.message || "Échec lors de l'enregistrement.");
    } finally {
      setIsUploading(false);
    }
  };

  // UI très visible
  if (perm === 'denied') {
    return (
      <TouchableOpacity style={[styles.btn, styles.btnWarn]} onPress={async () => {
        const { status } = await Audio.requestPermissionsAsync();
        setPerm(status);
      }}>
        <Text style={styles.btnText}>Autoriser le micro</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.mic, isRec && styles.micOn]}
        onPress={isRec ? stop : start}
        disabled={isUploading}
      >
        <Text style={styles.micIcon}>{isRec ? '■' : '🎙️'}</Text>
      </TouchableOpacity>

      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={styles.label}>
          {isRec ? 'Enregistrement… touchez pour arrêter' : 'Appuyez pour enregistrer une note vocale'}
        </Text>
        {isUploading ? <ActivityIndicator /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  mic: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#1f2937', alignItems: 'center', justifyContent: 'center'
  },
  micOn: { backgroundColor: '#dc2626' },
  micIcon: { fontSize: 26, color: '#fff', fontWeight: '700' },
  label: { color: '#374151', fontSize: 12 },
  btn: {
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10,
    backgroundColor: '#e5e7eb', alignSelf: 'flex-start'
  },
  btnWarn: { backgroundColor: '#fde68a' },
  btnText: { fontWeight: '700', color: '#111827' },
});
