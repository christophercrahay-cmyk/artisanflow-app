// components/VoiceRecorder.js - EXTRAIT CORRIGÉ (partie détection)

import React, { useState, useEffect } from 'react';

import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

import { Audio } from 'expo-av';

import { analyzeTranscription } from '../services/quoteAnalysisService_fixed';

import { generateQuoteFromTranscription } from '../utils/ai_quote_generator';

import { insertAutoQuote } from '../utils/supabase_helpers';

import { logDebug, logError } from '../utils/logger';



// ... (autres imports et configuration)



export default function VoiceRecorder({ projectId, clientId }) {

  const [recording, setRecording] = useState(null);

  const [recordUri, setRecordUri] = useState(null);

  const [transcription, setTranscription] = useState('');

  const [isTranscribing, setIsTranscribing] = useState(false);

  const [analysisResult, setAnalysisResult] = useState(null);

  const [transcriptionProgress, setTranscriptionProgress] = useState(0);



  // ... (autres états et useEffect)



  const uploadAndSave = async () => {

    if (!recordUri) {

      Alert.alert('Erreur', 'Aucun enregistrement à envoyer');

      return;

    }



    setIsTranscribing(true);

    setTranscriptionProgress(10);



    try {

      // 1. Upload audio vers Supabase

      logDebug('[VoiceRecorder] Upload audio...');

      const audioPath = await uploadAudioToSupabase(recordUri, projectId);

      setTranscriptionProgress(30);



      // 2. Transcription avec Whisper

      logDebug('[VoiceRecorder] Transcription Whisper...');

      const transcriptionText = await transcribeAudio(recordUri);

      setTranscription(transcriptionText);

      setTranscriptionProgress(60);



      // 3. Analyse GPT pour détection du type

      logDebug('[VoiceRecorder] Analyse GPT...');

      const analysis = await analyzeTranscription(transcriptionText);

      setAnalysisResult(analysis);

      setTranscriptionProgress(80);

      

      // LOG IMPORTANT pour debug

      console.log('🔍 [VoiceRecorder] Analyse complète reçue:', JSON.stringify(analysis, null, 2));

      console.log('🔍 [VoiceRecorder] Type détecté:', analysis.type);

      console.log('🔍 [VoiceRecorder] Data:', analysis.data);



      // 4. Sauvegarde en base de données

      const noteData = {

        project_id: projectId,

        client_id: clientId,

        user_id: userId, // à récupérer du store/auth

        type: 'voice',

        storage_path: audioPath,

        transcription: transcriptionText,

        analysis_data: JSON.stringify(analysis), // IMPORTANT: Sauvegarder l'analyse complète

        created_at: new Date().toISOString(),

        duration_ms: audioDuration // à calculer

      };



      const { data: savedNote, error: saveError } = await supabase

        .from('notes')

        .insert([noteData])

        .select()

        .single();



      if (saveError) throw saveError;

      

      setTranscriptionProgress(90);



      // 5. DÉTECTION PRESTATION ET GÉNÉRATION DEVIS

      // Vérification améliorée avec multiple conditions

      const isPrestation = 

        analysis.type === 'prestation' || 

        (analysis.data && analysis.data.categorie) ||

        (analysis.data && analysis.data.description && 

         (analysis.data.quantite || analysis.data.unite));



      logDebug(`[VoiceRecorder] Est-ce une prestation ? ${isPrestation}`);

      

      if (isPrestation) {

        logDebug('[VoiceRecorder] ✅ PRESTATION DÉTECTÉE - Génération du devis...');

        

        try {

          // Préparer les données pour la génération du devis

          const quoteData = {

            categorie: analysis.data?.categorie || 'Travaux divers',

            description: analysis.data?.description || transcriptionText.substring(0, 100),

            quantite: analysis.data?.quantite || 1,

            unite: analysis.data?.unite || 'forfait',

            details: analysis.data?.details || '',

            transcription: transcriptionText

          };



          logDebug('[VoiceRecorder] Données pour devis:', quoteData);



          // Générer le devis

          const quoteGenerated = await generateQuoteFromTranscription(

            transcriptionText,

            projectId,

            clientId,

            quoteData

          );



          if (quoteGenerated) {

            logDebug('[VoiceRecorder] ✅ Devis généré avec succès');

            Alert.alert(

              '✅ Prestation détectée',

              `Un devis a été automatiquement créé pour : ${quoteData.description}`,

              [{ text: 'OK', onPress: () => refreshNotes() }]

            );

          } else {

            logDebug('[VoiceRecorder] ⚠️ Échec génération devis');

          }

        } catch (quoteError) {

          logError('[VoiceRecorder] Erreur génération devis:', quoteError);

          Alert.alert(

            'Note enregistrée',

            'La prestation a été détectée mais le devis n\'a pas pu être généré automatiquement.',

            [{ text: 'OK' }]

          );

        }

      } else {

        // Pas une prestation

        const typeLabel = analysis.type === 'client_info' ? 'Info client' : 'Note personnelle';

        Alert.alert(

          'Note enregistrée',

          `Type : ${typeLabel}\n${analysis.summary || transcriptionText.substring(0, 100)}`,

          [{ text: 'OK' }]

        );

      }



      setTranscriptionProgress(100);

      

      // Reset après succès

      setTimeout(() => {

        setRecordUri(null);

        setTranscription('');

        setAnalysisResult(null);

        setIsTranscribing(false);

        setTranscriptionProgress(0);

        refreshNotes(); // Recharger la liste des notes

      }, 1000);



    } catch (error) {

      logError('[VoiceRecorder] Erreur complète upload/save:', error);

      Alert.alert('Erreur', `Impossible d'enregistrer la note: ${error.message}`);

      setIsTranscribing(false);

      setTranscriptionProgress(0);

    }

  };



  // Fonction pour afficher le badge du type de note

  const getTypeBadge = (type) => {

    const badges = {

      'prestation': { 

        label: '💼 Prestation', 

        color: '#10B981', 

        textColor: '#ffffff' 

      },

      'client_info': { 

        label: '👤 Info client', 

        color: '#3B82F6', 

        textColor: '#ffffff' 

      },

      'note_perso': { 

        label: '📝 Note perso', 

        color: '#6B7280', 

        textColor: '#ffffff' 

      }

    };



    const badge = badges[type] || badges['note_perso'];

    

    return (

      <View style={{

        backgroundColor: badge.color,

        paddingHorizontal: 8,

        paddingVertical: 4,

        borderRadius: 12,

        marginLeft: 8

      }}>

        <Text style={{ 

          color: badge.textColor, 

          fontSize: 12, 

          fontWeight: '600' 

        }}>

          {badge.label}

        </Text>

      </View>

    );

  };



  // ... (reste du composant avec le rendu UI)



  return (

    <View style={styles.container}>

      {/* UI d'enregistrement */}

      {/* ... */}

      

      {/* Affichage de l'analyse si disponible */}

      {analysisResult && (

        <View style={styles.analysisContainer}>

          {getTypeBadge(analysisResult.type)}

          {analysisResult.type === 'prestation' && analysisResult.data && (

            <View style={styles.prestationDetails}>

              <Text style={styles.prestationText}>

                📐 {analysisResult.data.quantite} {analysisResult.data.unite}

              </Text>

              <Text style={styles.prestationText}>

                🔨 {analysisResult.data.categorie}

              </Text>

            </View>

          )}

        </View>

      )}

    </View>

  );

}
