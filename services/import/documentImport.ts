/**
 * Service d'import de documents (CSV/XLS/JSON/PDF)
 * 
 * ⚠️ OBSOLÈTE : Ce service est remplacé par aiImportService.ts
 * 
 * Ce fichier conserve uniquement pickImportFile() qui est réutilisé.
 * L'ancienne fonction importClientsFromFile() était un stub et a été supprimée.
 * 
 * NOUVEAU SYSTÈME : Utiliser services/import/aiImportService.ts
 * - uploadImportFile() : Upload le fichier
 * - analyzeImportFile() : Analyse avec GPT
 * - processImport() : Importe en base
 */

import * as DocumentPicker from 'expo-document-picker';
import logger from '../../utils/logger';

/**
 * Types MIME supportés pour l'import
 */
export type SupportedImportMime =
  | 'text/csv'
  | 'application/vnd.ms-excel'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'application/json'
  | 'application/pdf';

/**
 * Résultat de la sélection de fichier
 */
export interface ImportResult {
  cancelled: boolean;
  uri?: string;
  name?: string;
  size?: number | null;
  mimeType?: string | null;
}

/**
 * Sélectionne un fichier à importer
 * @returns {Promise<ImportResult>} Résultat de la sélection
 * @throws {Error} Si le module natif n'est pas disponible ou en cas d'erreur
 */
export async function pickImportFile(): Promise<ImportResult> {
  try {
    logger.info('DocumentImport', 'Ouverture du sélecteur de fichiers');

    const res = await DocumentPicker.getDocumentAsync({
      type: [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/json',
        'application/pdf',
      ],
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (res.canceled) {
      logger.info('DocumentImport', 'Sélection annulée par l\'utilisateur');
      return { cancelled: true };
    }

    const file = res.assets?.[0];

    if (!file) {
      throw new Error('Aucun fichier sélectionné');
    }

    logger.success('DocumentImport', `Fichier sélectionné: ${file.name}`, {
      uri: file.uri,
      size: file.size,
      mimeType: file.mimeType,
    });

    return {
      cancelled: false,
      uri: file.uri,
      name: file.name,
      size: file.size ?? null,
      mimeType: file.mimeType ?? null,
    };
  } catch (error: any) {
    // Détecter l'erreur spécifique du module natif non disponible
    const errorMessage = error?.message || '';
    const isNativeModuleError =
      errorMessage.includes('Cannot find native module') ||
      errorMessage.includes("native module 'ExpoDocumentPicker'") ||
      errorMessage.includes('ExpoDocumentPicker') ||
      error?.code === 'ERR_MODULE_NOT_FOUND';

    if (isNativeModuleError) {
      logger.error('DocumentImport', 'Module natif non disponible', error);
      throw new Error(
        "Module 'expo-document-picker' non disponible. Rebuild le Dev Client avec EAS après installation du module.\n\nCommandes à exécuter:\n  npx expo install expo-document-picker\n  eas build --profile development --platform android"
      );
    }

    logger.error('DocumentImport', 'Erreur sélection fichier', error);
    throw new Error('Impossible de sélectionner un fichier. Réessaie plus tard.');
  }
}

/**
 * ⚠️ SUPPRIMÉ : importClientsFromFile()
 * 
 * Cette fonction était un stub et a été remplacée par le nouveau système d'import basé sur GPT.
 * 
 * Utiliser à la place :
 * 1. uploadImportFile() depuis aiImportService.ts
 * 2. analyzeImportFile() depuis aiImportService.ts  
 * 3. processImport() depuis aiImportService.ts
 */

