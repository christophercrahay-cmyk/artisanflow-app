// services/transcriptionService.js
// ✅ SÉCURISÉ : Utilise Edge Functions Supabase au lieu d'appeler OpenAI directement

import { supabase } from '../supabaseClient';
import * as FileSystem from 'expo-file-system/legacy';

// URL de l'Edge Function (construite depuis le client Supabase)
const getEdgeFunctionUrl = () => {
  const supabaseUrl = supabase.supabaseUrl;
  if (!supabaseUrl) {
    throw new Error('URL Supabase non disponible dans le client');
  }
  return `${supabaseUrl}/functions/v1/transcribe-audio`;
};

/**
 * Transcrit un audio avec Whisper API via Edge Function
 * @param {string} audioUri - Chemin vers le fichier audio M4A (local ou Storage)
 * @param {string} storagePath - Chemin dans Supabase Storage (optionnel, si déjà uploadé)
 * @returns {Promise<string>} Texte transcrit
 */
export const transcribeAudio = async (audioUri, storagePath = null) => {
  try {
    console.log('[Transcription] Début:', audioUri);
    
    // Récupérer la session d'authentification
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      throw new Error('Utilisateur non authentifié');
    }

    let filePath = storagePath;

    // Si pas de storagePath fourni, uploader le fichier local vers Storage
    if (!filePath && audioUri) {
      console.log('[Transcription] Upload du fichier vers Storage...');
      
      // Lire le fichier local
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error(`Fichier audio introuvable: ${audioUri}`);
      }

      const fileContent = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convertir Base64 en Uint8Array
      const binaryString = atob(fileContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Upload vers Storage
      const fileName = `transcribe_${Date.now()}.m4a`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voices')
        .upload(fileName, bytes, {
          contentType: 'audio/m4a',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Erreur upload Storage: ${uploadError.message}`);
      }

      filePath = uploadData.path;
      console.log('[Transcription] Fichier uploadé:', filePath);
    }

    if (!filePath) {
      throw new Error('Aucun fichier audio fourni (audioUri ou storagePath requis)');
    }

    // Appel Edge Function
    const edgeFunctionUrl = getEdgeFunctionUrl();
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filePath: filePath,
        language: 'fr',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'TRANSCRIBE_FAILED', message: response.statusText }));
      const errorMessage = errorData.message || errorData.error || `Erreur ${response.status}`;
      throw new Error(`Erreur transcription: ${errorMessage}`);
    }

    const data = await response.json();
    const transcription = data.transcription || '';
    
    console.log('[Transcription] ✅ Succès:', transcription.substring(0, 50) + '...');
    
    return transcription;
    
  } catch (error) {
    console.error('[Transcription] Erreur:', error);
    throw error;
  }
};

/**
 * Corrige l'orthographe et la grammaire d'une transcription via Edge Function
 * @param {string} text - Texte brut de Whisper
 * @returns {Promise<string>} Texte corrigé
 */
export const correctNoteText = async (text) => {
  try {
    console.log('[Correction] Texte original:', text);
    
    // Si texte vide ou trop court, retourner tel quel
    if (!text || !text.trim() || text.trim().length < 3) {
      return text;
    }

    // Récupérer la session d'authentification
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.warn('[Correction] Utilisateur non authentifié, retour du texte original');
      return text;
    }

    // Appel Edge Function
    const supabaseUrl = supabase.supabaseUrl;
    if (!supabaseUrl) {
      throw new Error('URL Supabase non disponible dans le client');
    }

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/correct-text`;
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'CORRECT_FAILED', message: response.statusText }));
      const errorMessage = errorData.message || errorData.error || `Erreur ${response.status}`;
      // En cas d'erreur, retourner le texte original (pas de throw)
      console.warn(`[Correction] Erreur Edge Function: ${errorMessage}`);
      return text;
    }

    const data = await response.json();
    const correctedText = data.correctedText || text;
    
    console.log('[Correction] ✅ Texte corrigé:', correctedText.substring(0, 50) + '...');
    
    return correctedText;
    
  } catch (error) {
    console.error('[Correction] Erreur:', error);
    // ⚠️ En cas d'erreur, retourner le texte original (pas de blocage)
    console.warn('[Correction] Fallback vers texte original');
    return text;
  }
};

/**
 * Retranscrit un audio existant (si première tentative a échoué)
 */
export const retranscribeNote = async (noteId, audioUri) => {
  try {
    const text = await transcribeAudio(audioUri);
    // Mettre à jour la note dans la DB
    // await updateNoteTranscription(noteId, text);
    return text;
  } catch (error) {
    console.error('[Retranscription] Erreur:', error);
    throw error;
  }
};
