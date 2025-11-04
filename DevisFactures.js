import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { supabase } from './supabaseClient';
import * as FileSystem from 'expo-file-system';
import { useAppStore } from './store/useAppStore';

// Whisper.rn est un module natif - pas disponible dans Expo Go
let initWhisper = null;
let isWhisperAvailable = false;
try {
  // Import dynamique pour éviter les warnings de résolution de module
  const whisperModule = require('whisper.rn');
  if (whisperModule && whisperModule.initWhisper) {
    initWhisper = whisperModule.initWhisper;
    isWhisperAvailable = true;
    console.log('[DevisFactures] ✅ Whisper.rn disponible - Transcription activée');
  }
} catch (e) {
  // Normal en Expo Go - le module natif n'est pas disponible
  // Silencieux en production pour éviter les warnings inutiles
  if (__DEV__) {
    console.warn('[DevisFactures] ⚠️ Whisper.rn non disponible (Expo Go) - Transcription désactivée');
  }
}

export default function DevisFactures({ projectId, clientId, type = 'devis' }) {
  // type = 'devis' ou 'facture'
  const isDevis = type === 'devis';
  
  const [items, setItems] = useState([]);
  const [recording, setRecording] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // États pour le formulaire
  const [numero, setNumero] = useState('');
  const [montant, setMontant] = useState('');
  const [tva, setTva] = useState('20');
  const [notes, setNotes] = useState('');
  const [transcription, setTranscription] = useState('');
  const [statut, setStatut] = useState(isDevis ? 'brouillon' : 'brouillon');
  const [dateValidite, setDateValidite] = useState('');
  
  const whisperContextRef = useRef(null);
  const soundRef = useRef(null);

  useEffect(() => {
    loadItems();
  }, [projectId]);

  useEffect(() => {
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
      if (whisperContextRef.current) {
        whisperContextRef.current.release().catch((err) => 
          console.warn('[DevisFactures] Erreur release Whisper:', err)
        );
      }
    };
  }, []);

  const loadItems = async () => {
    try {
      const tableName = isDevis ? 'devis' : 'factures';
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(`Erreur chargement ${type}:`, error);
        Alert.alert('Erreur', `Impossible de charger les ${type}s`);
        return;
      }
      setItems(data || []);
    } catch (err) {
      console.error(`Exception chargement ${type}:`, err);
      Alert.alert('Erreur', `Erreur lors du chargement des ${type}s`);
    }
  };

  const generateNumero = () => {
    const prefix = isDevis ? 'DE' : 'FA';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${random}`;
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setNumero('');
    setMontant('');
    setTva('20');
    setNotes('');
    setTranscription('');
    setDateValidite('');
    setStatut(isDevis ? 'brouillon' : 'brouillon');
  };

  const calculateMontantTTC = () => {
    const montantHT = parseFloat(montant) || 0;
    const tvaPercent = parseFloat(tva) || 0;
    return montantHT * (1 + tvaPercent / 100);
  };

  const saveItem = async () => {
    if (!numero.trim()) {
      Alert.alert('Champs requis', 'Le numéro est obligatoire.');
      return;
    }
    
    const montantHT = parseFloat(montant);
    if (isNaN(montantHT) || montantHT <= 0) {
      Alert.alert('Montant invalide', 'Le montant doit être supérieur à 0.');
      return;
    }

    // Vérifier les sélections dans le store
    const { currentClient, currentProject } = useAppStore.getState();
    if (!currentClient?.id) {
      Alert.alert('Client manquant', 'Sélectionne un client');
      return;
    }

    try {
      setUploading(true);
      
      // Récupérer l'utilisateur connecté pour RLS
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');
      
      const tvaPercent = parseFloat(tva) || 0;
      const montantTTC = montantHT * (1 + tvaPercent / 100);

      const tableName = isDevis ? 'devis' : 'factures';
      const data = {
        project_id: currentProject?.id ?? null,
        client_id: currentClient.id,
        user_id: user.id, // Nécessaire pour RLS
        numero: numero.trim(),
        montant_ht: montantHT,
        tva_percent: tvaPercent,
        montant_ttc: montantTTC,
        statut: statut,
        notes: notes.trim() || null,
        transcription: transcription.trim() || null,
      };

      if (isDevis && dateValidite) {
        data.date_validite = dateValidite;
      } else if (!isDevis && dateValidite) {
        data.date_echeance = dateValidite;
      }

      let error;
      if (editingId) {
        const { error: updateError } = await supabase
          .from(tableName)
          .update(data)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from(tableName).insert([data]);
        error = insertError;
      }

      if (error) throw error;

      Alert.alert('OK', editingId ? `${isDevis ? 'Devis' : 'Facture'} modifié ✅` : `${isDevis ? 'Devis' : 'Facture'} créé ✅`);
      resetForm();
      await loadItems();
    } catch (err) {
      console.error(`Erreur sauvegarde ${type}:`, err);
      Alert.alert('Erreur', err.message || 'Impossible de sauvegarder');
    } finally {
      setUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Micro refusé', 'Active le micro dans les réglages.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
        // Options audio standard - expo-av gère mieux avec des valeurs standard
        await recording.prepareToRecordAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
      await recording.startAsync();
      setRecording(recording);
    } catch (e) {
      console.error('Erreur startRecording:', e);
      Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      setTranscribing(true);
      let transcribedText = '';

      if (initWhisper) {
        try {
          if (!whisperContextRef.current) {
            // Modèle ggml-base.bin : plus précis pour le français (140MB vs 75MB pour tiny)
            // Le modèle "base" est beaucoup plus fiable pour distinguer voix vs bruits
            const modelName = 'ggml-base.bin';
            const modelDir = `${FileSystem.documentDirectory}whisper/`;
            const modelPath = `${modelDir}${modelName}`;
            
            const dirInfo = await FileSystem.getInfoAsync(modelDir);
            if (!dirInfo.exists) {
              await FileSystem.makeDirectoryAsync(modelDir, { intermediates: true });
            }
            
            const modelInfo = await FileSystem.getInfoAsync(modelPath);
            if (!modelInfo.exists) {
              console.log('[DevisFactures] 📥 Téléchargement du modèle Whisper ggml-base.bin (140MB - plus précis pour le français)...');
              const modelUrl = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin';
              await FileSystem.downloadAsync(modelUrl, modelPath);
              console.log('[DevisFactures] ✅ Modèle téléchargé');
            } else {
              console.log('[DevisFactures] ✅ Modèle ggml-base.bin déjà présent');
            }

            whisperContextRef.current = await initWhisper({
              filePath: modelPath,
              useGpu: true,
            });
          }

          const { promise } = whisperContextRef.current.transcribe(uri, { language: 'fr' });
          const result = await promise;
          transcribedText = result.result || '';
            
            // Filtrer les transcriptions invalides (bruits, sons non-parlés)
            if (transcribedText && transcribedText.trim()) {
              const cleanText = transcribedText.trim();
              
              // Rejeter les transcriptions entre crochets (bruits non-parlés comme [BANG], [Musique], etc.)
              const isBracketedNoise = /^\[.+\]$/.test(cleanText);
              
              // Rejeter si trop court ou uniquement des ponctuations
              const isTooShort = cleanText.length < 3;
              const isOnlyPunctuation = /^[^\w\s]*$/.test(cleanText);
              
              // Liste de mots de bruit connus que Whisper peut transcrire (même sans crochets)
              const noiseWords = ['bang', 'clap', 'tap', 'click', 'beep', 'buzz', 'hum', 'hiss'];
              const isNoiseWord = noiseWords.some(noise => cleanText.toLowerCase() === noise);
              
              const hasValidContent = !isBracketedNoise && !isTooShort && !isOnlyPunctuation && !isNoiseWord;
              
              if (hasValidContent) {
                setTranscription(cleanText);
              } else {
                console.warn('[DevisFactures] Transcription invalide rejetée:', cleanText);
                Alert.alert(
                  'Transcription invalide',
                  `La transcription obtenue semble être un bruit ou un son non-parlé: "${cleanText}"\n\nVous pouvez l'ignorer ou transcrire manuellement.`
                );
                transcribedText = ''; // Ne pas utiliser cette transcription
              }
            }
        } catch (transcribeErr) {
          console.error('Erreur transcription:', transcribeErr);
        }
      }

      setRecording(null);
      Alert.alert('OK', transcribedText ? `Transcription: ${transcribedText}` : 'Enregistrement terminé');
    } catch (e) {
      console.error('Erreur stopRecording:', e);
    } finally {
      setTranscribing(false);
    }
  };

  const deleteItem = async (id) => {
    Alert.alert('Confirmer', `Supprimer ce ${type} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            const tableName = isDevis ? 'devis' : 'factures';
            const { error } = await supabase.from(tableName).delete().eq('id', id);
            if (error) {
              console.error(`Erreur suppression ${type}:`, error);
              Alert.alert('Erreur', `Impossible de supprimer le ${type}`);
              return;
            }
            await loadItems();
            Alert.alert('OK', `${isDevis ? 'Devis' : 'Facture'} supprimé(e) ✅`);
          } catch (err) {
            console.error(`Exception suppression ${type}:`, err);
            Alert.alert('Erreur', 'Erreur lors de la suppression');
          }
        },
      },
    ]);
  };

  const editItem = (item) => {
    setEditingId(item.id);
    setNumero(item.numero);
    setMontant(item.montant_ht.toString());
    setTva(item.tva_percent.toString());
    setNotes(item.notes || '');
    setTranscription(item.transcription || '');
    setStatut(item.statut);
    setDateValidite(isDevis ? item.date_validite || '' : item.date_echeance || '');
    setShowForm(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => editItem(item)}
      onLongPress={() => deleteItem(item.id)}
    >
      <Text style={styles.itemNumero}>{item.numero}</Text>
      <Text style={styles.itemMontant}>{item.montant_ttc.toFixed(2)} € TTC</Text>
      <Text style={styles.itemStatut}>
        Statut: {item.statut.charAt(0).toUpperCase() + item.statut.slice(1)}
      </Text>
      {item.transcription && (
        <Text style={styles.itemTranscription} numberOfLines={2}>
          💬 {item.transcription}
        </Text>
      )}
    </TouchableOpacity>
  );

  const statutOptions = isDevis
    ? ['brouillon', 'envoye', 'accepte', 'refuse']
    : ['brouillon', 'envoye', 'paye', 'impayee'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isDevis ? '📋 Devis' : '🧾 Factures'}
        </Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            if (!showForm) {
              setNumero(generateNumero());
              setShowForm(true);
            }
          }}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Numéro"
            placeholderTextColor="#9CA3AF"
            value={numero}
            onChangeText={setNumero}
            editable={!editingId}
          />
          
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 2 }]}
              placeholder="Montant HT (€)"
              placeholderTextColor="#9CA3AF"
              value={montant}
              onChangeText={setMontant}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="TVA %"
              placeholderTextColor="#9CA3AF"
              value={tva}
              onChangeText={setTva}
              keyboardType="numeric"
            />
          </View>

          {montant && (
            <Text style={styles.montantTTC}>
              TTC: {calculateMontantTTC().toFixed(2)} €
            </Text>
          )}

          <TextInput
            style={styles.input}
            placeholder={isDevis ? 'Date validité (YYYY-MM-DD)' : 'Date échéance (YYYY-MM-DD)'}
            placeholderTextColor="#9CA3AF"
            value={dateValidite}
            onChangeText={setDateValidite}
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Statut</Text>
            <View style={styles.statutContainer}>
              {statutOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.statutBtn, statut === opt && styles.statutBtnActive]}
                  onPress={() => setStatut(opt)}
                >
                  <Text style={[styles.statutBtnText, statut === opt && styles.statutBtnTextActive]}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Notes"
            placeholderTextColor="#9CA3AF"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />

          {transcription && (
            <View style={styles.transcriptionBox}>
              <Text style={styles.transcriptionLabel}>Transcription:</Text>
              <Text style={styles.transcriptionText}>{transcription}</Text>
            </View>
          )}

          <View style={styles.voiceRow}>
            {!isWhisperAvailable && (
              <Text style={styles.whisperWarning}>
                ⚠️ Transcription désactivée (Expo Go). Build natif requis pour activer.
              </Text>
            )}
            {!recording ? (
              <TouchableOpacity onPress={startRecording} style={styles.voiceBtn}>
                <Text style={styles.voiceBtnText}>
                  🎙️ {isWhisperAvailable ? 'Enregistrer note vocale' : 'Enregistrer (sans transcription)'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={stopRecording} style={[styles.voiceBtn, styles.voiceBtnStop]}>
                <Text style={styles.voiceBtnText}>⏹️ Arrêter</Text>
              </TouchableOpacity>
            )}
          </View>

          {transcribing && (
            <View style={styles.transcribingContainer}>
              <ActivityIndicator size="small" color="#60A5FA" />
              <Text style={styles.transcribingText}>Transcription en cours...</Text>
            </View>
          )}

          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.saveBtn, uploading && { opacity: 0.6 }]}
              onPress={saveItem}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {editingId ? '💾 Modifier' : '💾 Créer'}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
              <Text style={styles.cancelBtnText}>❌ Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun {type} pour ce chantier</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: '#2A2E35' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '800', color: '#EAEAEA' },
  addBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1D4ED8', alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  form: { backgroundColor: '#1A1D22', padding: 16, borderRadius: 12, marginBottom: 16 },
  input: { height: 48, borderWidth: 1, borderColor: '#374151', borderRadius: 8, paddingHorizontal: 12, marginBottom: 12, backgroundColor: '#0F1115', color: '#EAEAEA' },
  row: { flexDirection: 'row', gap: 8 },
  textArea: { height: 100, textAlignVertical: 'top' },
  montantTTC: { fontSize: 16, fontWeight: '700', color: '#93C5FD', marginBottom: 8 },
  pickerContainer: { marginBottom: 12 },
  pickerLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#EAEAEA' },
  statutContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  statutBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#2A2E35' },
  statutBtnActive: { backgroundColor: '#1D4ED8' },
  statutBtnText: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  statutBtnTextActive: { color: '#fff' },
  transcriptionBox: { backgroundColor: '#1A1D22', padding: 12, borderRadius: 8, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#1D4ED8' },
  transcriptionLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4, color: '#EAEAEA' },
  transcriptionText: { fontSize: 14, color: '#D1D5DB' },
  voiceRow: { marginBottom: 12 },
  voiceBtn: { backgroundColor: '#1D4ED8', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  voiceBtnStop: { backgroundColor: '#DC2626' },
  voiceBtnText: { color: '#fff', fontWeight: '700' },
  transcribingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  transcribingText: { marginLeft: 8, color: '#9CA3AF' },
  formActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  saveBtn: { flex: 1, backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  cancelBtn: { flex: 1, backgroundColor: '#DC2626', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { color: '#fff', fontWeight: '700' },
  itemCard: { backgroundColor: '#1A1D22', borderWidth: 1, borderColor: '#2A2E35', borderRadius: 12, padding: 16, marginBottom: 12 },
  itemNumero: { fontSize: 16, fontWeight: '700', marginBottom: 4, color: '#EAEAEA' },
  itemMontant: { fontSize: 18, fontWeight: '800', color: '#10B981', marginBottom: 4 },
  itemStatut: { fontSize: 14, color: '#9CA3AF', marginBottom: 4 },
  itemTranscription: { fontSize: 13, color: '#D1D5DB', marginTop: 4 },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 20 },
  whisperWarning: { fontSize: 12, color: '#FBBF24', marginBottom: 8, fontStyle: 'italic' },
});

