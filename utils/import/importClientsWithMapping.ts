/**
 * Module d'import de clients avec mapping adaptatif
 * Version améliorée qui retourne headers + rows brutes pour permettre le mapping
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as XLSX from 'xlsx';
import logger from '../logger';
import { NormalizedHeader } from '../clientImportMapping';

/**
 * Résultat du parsing d'un fichier (headers + rows brutes)
 */
export interface ParsedFileResult {
  headers: string[];
  rows: Record<string, any>[];
}

/**
 * Parse une ligne CSV en tenant compte des guillemets et virgules dans les valeurs
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (!insideQuotes && (char === '"' || char === "'")) {
      // Début d'une valeur entre guillemets
      insideQuotes = true;
      quoteChar = char;
      continue;
    }

    if (insideQuotes && char === quoteChar) {
      if (nextChar === quoteChar) {
        // Guillemet échappé (doublé)
        currentValue += char;
        i++; // Skip le prochain guillemet
        continue;
      }
      if (nextChar === delimiter || nextChar === '\n' || nextChar === '\r' || !nextChar) {
        // Fin de la valeur entre guillemets
        insideQuotes = false;
        quoteChar = '';
        continue;
      }
    }

    if (!insideQuotes && char === delimiter) {
      // Fin d'une valeur
      values.push(currentValue.trim());
      currentValue = '';
      continue;
    }

    currentValue += char;
  }

  // Ajouter la dernière valeur
  values.push(currentValue.trim());

  return values;
}

/**
 * Parse un fichier CSV et retourne headers + rows brutes
 */
export async function parseCSVWithHeaders(fileUri: string): Promise<ParsedFileResult> {
  try {
    // Lire le fichier
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Supprimer le BOM UTF-8 si présent
    const contentWithoutBOM = fileContent.replace(/^\uFEFF/, '');

    // Détecter le séparateur (virgule ou point-virgule)
    // Analyser les premières lignes pour déterminer le séparateur le plus fréquent
    const firstLines = contentWithoutBOM.split('\n').slice(0, 5).filter(l => l.trim());
    let semicolonCount = 0;
    let commaCount = 0;

    firstLines.forEach(line => {
      // Compter les séparateurs non entre guillemets
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"' || line[i] === "'") {
          inQuotes = !inQuotes;
        } else if (!inQuotes) {
          if (line[i] === ';') semicolonCount++;
          if (line[i] === ',') commaCount++;
        }
      }
    });

    const delimiter = semicolonCount > commaCount ? ';' : ',';

    // Parser ligne par ligne
    const lines = contentWithoutBOM.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length === 0) {
      throw new Error('Fichier CSV vide');
    }

    // Première ligne = headers
    const headerValues = parseCSVLine(lines[0], delimiter);
    const headers = headerValues.map((h) => h.trim().replace(/^["']|["']$/g, ''));

    if (headers.length === 0) {
      throw new Error('Aucune ligne d\'en-têtes détectée');
    }

    // Parser les lignes de données en objets avec clés = headers
    const rows: Record<string, any>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const values = parseCSVLine(line, delimiter);

      // S'assurer qu'on a le bon nombre de valeurs (pad avec des chaînes vides si nécessaire)
      while (values.length < headers.length) {
        values.push('');
      }

      // Créer un objet avec les headers comme clés
      const row: Record<string, any> = {};
      headers.forEach((header, index) => {
        const value = values[index] || '';
        // Nettoyer la valeur : supprimer guillemets externes et trim
        const cleanValue = value
          .replace(/^["']|["']$/g, '') // Supprimer guillemets externes
          .replace(/""/g, '"') // Remplacer guillemets doublés par un seul
          .trim();
        row[header] = cleanValue;
      });

      rows.push(row);
    }

    logger.info('ImportClients', `CSV parsé: ${headers.length} colonnes, ${rows.length} lignes`);
    return { headers, rows };
  } catch (error: any) {
    logger.error('ImportClients', 'Erreur parsing CSV', error);
    throw new Error(`Erreur lors du parsing CSV: ${error.message}`);
  }
}

/**
 * Parse un fichier XLSX et retourne headers + rows brutes
 */
export async function parseXLSXWithHeaders(fileUri: string): Promise<ParsedFileResult> {
  try {
    // Lire le fichier en base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Parser avec xlsx
    const workbook = XLSX.read(base64, { type: 'base64' });

    // Prendre la première feuille
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error('Aucune feuille trouvée dans le fichier Excel');
    }

    const worksheet = workbook.Sheets[firstSheetName];

    // Convertir en JSON avec headers
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    if (jsonData.length === 0) {
      throw new Error('Feuille Excel vide');
    }

    // Première ligne = headers
    const headers = jsonData[0].map((h) => String(h || '').trim()).filter((h) => h);

    if (headers.length === 0) {
      throw new Error('Aucune ligne d\'en-têtes détectée');
    }

    // Parser les lignes de données en objets avec clés = headers
    const rows: Record<string, any>[] = [];
    for (let i = 1; i < jsonData.length; i++) {
      const values = jsonData[i];
      if (!values || values.length === 0) continue;

      // Créer un objet avec les headers comme clés
      const row: Record<string, any> = {};
      headers.forEach((header, index) => {
        row[header] = String(values[index] || '').trim();
      });

      rows.push(row);
    }

    return { headers, rows };
  } catch (error: any) {
    logger.error('ImportClients', 'Erreur parsing XLSX', error);
    throw new Error(`Erreur lors du parsing Excel: ${error.message}`);
  }
}

/**
 * Parse un fichier et retourne headers + rows brutes
 */
export async function parseFileWithHeaders(
  fileUri: string,
  fileType: 'csv' | 'xlsx' | 'xls'
): Promise<ParsedFileResult> {
  if (fileType === 'csv') {
    return await parseCSVWithHeaders(fileUri);
  } else if (fileType === 'xlsx' || fileType === 'xls') {
    return await parseXLSXWithHeaders(fileUri);
  } else {
    throw new Error(`Type de fichier non supporté: ${fileType}`);
  }
}

