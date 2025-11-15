import { useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { PendingCapture } from '../types/capture';
import { showSuccess, showError } from '../components/Toast';
import { compressImage } from '../services/imageCompression';
import logger from '../utils/logger';

/**
 * Hook pour attacher une capture à un projet
 */
export function useAttachCaptureToProject() {
  const attachCapture = useCallback(async (
    capture: PendingCapture,
    projectId: string,
    clientId: string,
    projectName?: string
  ): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      switch (capture.type) {
        case 'photo':
          await attachPhoto(capture, projectId, clientId, user.id, projectName);
          break;
        case 'audio':
          await attachAudio(capture, projectId, clientId, user.id, projectName);
          break;
        case 'note':
          await attachNote(capture, projectId, clientId, user.id, projectName);
          break;
        default:
          throw new Error(`Type de capture non supporté: ${(capture as any).type}`);
      }
    } catch (err: any) {
      logger.error('AttachCapture', 'Erreur attachement', err);
      throw err;
    }
  }, []);

  return { attachCapture };
}

// Fonctions internes pour chaque type de capture

async function attachPhoto(
  capture: Extract<PendingCapture, { type: 'photo' }>,
  projectId: string,
  clientId: string,
  userId: string,
  projectName?: string
) {
  try {
    // Récupérer l'URI depuis capture.data ou capture directement
    const fileUri = (capture as any).data?.fileUri || (capture as any).fileUri;
    
    if (!fileUri) {
      logger.error('AttachPhoto', 'URI manquant', { capture });
      throw new Error('URI de la photo manquant');
    }
    
    logger.info('AttachPhoto', 'Compression image', { fileUri });
    
    // Compresser l'image si nécessaire
    const compressed = await compressImage(fileUri);
    
    // Convertir en bytes
    const resp = await fetch(compressed.uri);
    const arrayBuffer = await resp.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Upload vers Storage
    const fileName = `projects/${projectId}/${Date.now()}.jpg`;
    const { error: uploadErr } = await supabase.storage
      .from('project-photos')
      .upload(fileName, bytes, { contentType: 'image/jpeg', upsert: false });

    if (uploadErr) {
      logger.error('AttachPhoto', 'Erreur upload', uploadErr);
      throw uploadErr;
    }

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage.from('project-photos').getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;

    // Capturer taken_at et géolocalisation (GPS optionnel)
    const takenAt = new Date().toISOString();
    let latitude: number | null = null;
    let longitude: number | null = null;

    // La géolocalisation est OPTIONNELLE (module natif requis)
    // L'app fonctionne sans GPS, les photos sont juste sans coordonnées
    try {
      const locationModule = await import('expo-location');
      const Location = locationModule.default || locationModule;
      
      if (Location && typeof Location.requestForegroundPermissionsAsync === 'function') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeout: 5000, // Timeout 5s pour ne pas bloquer
          });
          latitude = location.coords.latitude;
          longitude = location.coords.longitude;
        }
      }
    } catch (locationErr) {
      // Silencieux : géolocalisation optionnelle
      console.log('[AttachPhoto] GPS non disponible (normal en dev/web), photo enregistrée sans coordonnées');
    }

    // Insérer dans la base de données
    const photoData: any = {
      project_id: projectId,
      client_id: clientId,
      user_id: userId,
      url: publicUrl,
      taken_at: takenAt,
    };

    if (latitude !== null && longitude !== null) {
      photoData.latitude = latitude;
      photoData.longitude = longitude;
    }

    const { error: insertErr } = await supabase.from('project_photos').insert([photoData]);

    if (insertErr) {
      logger.error('AttachPhoto', 'Erreur insertion DB', insertErr);
      throw insertErr;
    }

    logger.success('AttachPhoto', 'Photo attachée avec succès');
    showSuccess(`✅ Photo ajoutée au chantier "${projectName || 'chantier'}"`);
  } catch (err: any) {
    logger.error('AttachPhoto', 'Exception', err);
    throw new Error(err.message || 'Impossible d\'attacher la photo');
  }
}

async function attachAudio(
  capture: Extract<PendingCapture, { type: 'audio' }>,
  projectId: string,
  clientId: string,
  userId: string,
  projectName?: string
) {
  try {
    // Récupérer l'URI depuis capture.data ou capture directement
    const fileUri = (capture as any).data?.fileUri || (capture as any).fileUri;
    
    if (!fileUri) {
      logger.error('AttachAudio', 'URI manquant', { capture });
      throw new Error('URI de l\'audio manquant');
    }
    
    // Convertir le fichier audio en bytes
    const resp = await fetch(fileUri);
    const arrayBuffer = await resp.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Upload vers Storage
    const fileName = `rec_${projectId}_${Date.now()}.m4a`;
    const { error: uploadErr } = await supabase.storage
      .from('voices')
      .upload(fileName, bytes, { contentType: 'audio/m4a', upsert: false });

    if (uploadErr) {
      logger.error('AttachAudio', 'Erreur upload', uploadErr);
      throw uploadErr;
    }

    // Récupérer duration_ms depuis capture.data ou capture directement
    const durationMs = (capture as any).data?.durationMs || (capture as any).durationMs || null;
    logger.info('AttachAudio', 'Duration récupérée', { durationMs });

    // Insérer dans la base de données
    const noteData = {
      project_id: projectId,
      client_id: clientId,
      user_id: userId,
      type: 'voice',
      storage_path: fileName,
      duration_ms: durationMs,
    };

    const { error: insertErr } = await supabase.from('notes').insert([noteData]);

    if (insertErr) {
      logger.error('AttachAudio', 'Erreur insertion DB', insertErr);
      throw insertErr;
    }

    logger.success('AttachAudio', 'Note vocale attachée avec succès');
    showSuccess(`✅ Vocal ajouté au chantier "${projectName || 'chantier'}"`);
  } catch (err: any) {
    logger.error('AttachAudio', 'Exception', err);
    throw new Error(err.message || 'Impossible d\'attacher la note vocale');
  }
}

async function attachNote(
  capture: Extract<PendingCapture, { type: 'note' }>,
  projectId: string,
  clientId: string,
  userId: string,
  projectName?: string
) {
  try {
    // Récupérer le contenu depuis capture.data ou capture directement
    const content = (capture as any).data?.content || (capture as any).content;
    
    if (!content) {
      logger.error('AttachNote', 'Contenu manquant', { capture });
      throw new Error('Contenu de la note manquant');
    }
    
    // Insérer directement dans la base de données
    const noteData = {
      project_id: projectId,
      client_id: clientId,
      user_id: userId,
      type: 'text',
      transcription: content,
    };

    const { error: insertErr } = await supabase.from('notes').insert([noteData]);

    if (insertErr) {
      logger.error('AttachNote', 'Erreur insertion DB', insertErr);
      throw insertErr;
    }

    logger.success('AttachNote', 'Note texte attachée avec succès');
    showSuccess(`✅ Note ajoutée au chantier "${projectName || 'chantier'}"`);
  } catch (err: any) {
    logger.error('AttachNote', 'Exception', err);
    throw new Error(err.message || 'Impossible d\'attacher la note');
  }
}

