/**
 * Service d'import universel basé sur GPT
 * Remplace l'ancien système d'import avec parsing manuel
 */

import { supabase } from '../../supabaseClient';
import logger from '../../utils/logger';
import type {
  ImportAnalysis,
  ImportProcessResult,
  ImportAnalyzeRequest,
  ImportProcessRequest,
} from '../../types/import';
import * as FileSystem from 'expo-file-system/legacy';
import { decode as atob } from 'base-64';

const SUPABASE_FUNCTIONS_URL = `${supabase.supabaseUrl}/functions/v1`;

/**
 * Analyse un fichier avec GPT et retourne un JSON structuré
 * @param fileUrl URL du fichier dans Supabase Storage
 * @param fileId ID du fichier (optionnel, si fileUrl non fourni)
 * @param bucketName Nom du bucket (requis si fileId fourni)
 * @returns Analyse complète avec summary et entities
 */
export async function analyzeImportFile(
  fileUrl?: string,
  fileId?: string,
  bucketName?: string
): Promise<ImportAnalysis> {
  try {
    logger.info('AIImportService', 'Début analyse fichier', { fileUrl, fileId, bucketName });

    const body: ImportAnalyzeRequest = {};
    if (fileUrl) {
      body.fileUrl = fileUrl;
    } else if (fileId && bucketName) {
      body.fileId = fileId;
      body.bucketName = bucketName;
    } else {
      throw new Error('fileUrl ou (fileId + bucketName) requis');
    }

    // Récupérer le token d'auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/ai-import-analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: supabase.supabaseKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erreur analyse: ${response.statusText}`);
    }

    const analysis: ImportAnalysis = await response.json();
    logger.success('AIImportService', 'Analyse terminée', {
      clients: analysis.summary.clients,
      projects: analysis.summary.projects,
      quotes: analysis.summary.quotes,
    });

    return analysis;
  } catch (error: any) {
    logger.error('AIImportService', 'Erreur analyse fichier', error);
    throw error;
  }
}

/**
 * Traite l'import et insère les données dans Supabase
 * @param analysis Analyse retournée par analyzeImportFile
 * @returns Résultat de l'import avec compteurs
 */
export async function processImport(analysis: ImportAnalysis): Promise<ImportProcessResult> {
  try {
    logger.info('AIImportService', 'Début traitement import', {
      clients: analysis.summary.clients,
      projects: analysis.summary.projects,
    });

    // Récupérer le token d'auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Utilisateur non authentifié');
    }

    const body: ImportProcessRequest = {
      analysis,
    };

    const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/ai-import-process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: supabase.supabaseKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Erreur traitement: ${response.statusText}`);
    }

    const result: ImportProcessResult = await response.json();
    logger.success('AIImportService', 'Import terminé', result.imported);

    return result;
  } catch (error: any) {
    logger.error('AIImportService', 'Erreur traitement import', error);
    throw error;
  }
}

/**
 * Upload un fichier dans Supabase Storage pour l'import
 * @param fileUri URI locale du fichier
 * @param fileName Nom du fichier
 * @param fileMimeType Type MIME du fichier (optionnel, détecté depuis l'extension si non fourni)
 * @returns Chemin du fichier dans Storage (filePath) pour utilisation avec fileId + bucketName
 */
export async function uploadImportFile(
  fileUri: string,
  fileName: string,
  fileMimeType?: string | null
): Promise<string> {
  try {
    logger.info('AIImportService', 'Upload fichier', { fileName, fileUri, fileMimeType });

    // Récupérer l'utilisateur pour le chemin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Fonction helper pour détecter le type MIME depuis l'extension
    function detectMimeTypeFromExtension(name: string): string {
      const lowerName = name.toLowerCase();
      if (lowerName.endsWith('.csv')) {
        return 'text/csv';
      } else if (lowerName.endsWith('.xlsx')) {
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else if (lowerName.endsWith('.xls')) {
        return 'application/vnd.ms-excel';
      } else if (lowerName.endsWith('.pdf')) {
        return 'application/pdf';
      } else if (lowerName.endsWith('.json')) {
        return 'application/json';
      }
      return 'text/csv'; // Par défaut pour CSV
    }

    // Déterminer le type MIME
    // 1. Utiliser le mimeType fourni s'il est valide
    // 2. Sinon, détecter depuis l'extension du fichier
    let mimeType: string;
    
    // TOUJOURS utiliser la détection depuis l'extension pour éviter les problèmes de mimeType mal formaté
    // Le mimeType du fichier peut être "application/json, text/csv" ce qui cause des erreurs
    logger.info('AIImportService', `MimeType fourni: ${fileMimeType || 'aucun'}, détection depuis extension: ${fileName}`);
    mimeType = detectMimeTypeFromExtension(fileName);
    logger.info('AIImportService', `Type MIME final utilisé (depuis extension): ${mimeType}`);

    // Format React Native pour Supabase Storage
    // Supabase Storage accepte directement un objet avec uri, type, name
    // IMPORTANT: Utiliser le mimeType nettoyé pour éviter les erreurs
    const fileObject = {
      uri: fileUri,
      type: mimeType, // Utiliser le mimeType nettoyé
      name: fileName,
    };

    logger.info('AIImportService', `Upload avec type: ${mimeType}, fileObject.type: ${fileObject.type}`);

    // Lire le fichier en Base64 puis convertir en Uint8Array (React Native)
    const base64Data = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const uint8Array = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Upload dans le bucket 'imports'
    const filePath = `${user.id}/${Date.now()}_${fileName}`;
    const { data, error } = await supabase.storage
      .from('imports')
      .upload(filePath, uint8Array, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      // Si le bucket n'existe pas, créer un message d'erreur clair
      if (error.message.includes('Bucket not found')) {
        throw new Error(
          'Bucket "imports" non trouvé. Créez-le dans Supabase Storage ou utilisez un bucket existant.'
        );
      }
      throw error;
    }

    // Retourner le filePath pour utiliser avec fileId + bucketName
    // (le bucket est privé, donc l'URL publique ne fonctionne pas)
    logger.success('AIImportService', 'Fichier uploadé', { filePath });
    return filePath; // Retourner le chemin au lieu de l'URL publique
  } catch (error: any) {
    logger.error('AIImportService', 'Erreur upload fichier', error);
    throw error;
  }
}

