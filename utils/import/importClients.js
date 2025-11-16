/**
 * Module d'import de clients depuis CSV/XLSX
 * 
 * FONCTIONNALITÉS ACTUELLES :
 * - Sélection de fichier via expo-document-picker (CSV/XLS/XLSX)
 * - Parsing CSV/XLSX avec détection automatique du séparateur (; ou ,)
 * - Mapping automatique des colonnes via COLUMN_MAPPING (insensible à la casse/accents)
 * - Validation : nom obligatoire, email optionnel mais validé si présent
 * - Insertion par batch (500 clients max) dans Supabase avec RLS (user_id)
 * - Gestion d'erreurs avec rapport (imported, skipped, errors)
 * 
 * LIMITATIONS ACTUELLES :
 * - Mapping fixe basé sur des alias prédéfinis (pas de mapping personnalisé)
 * - Pas de mémoire utilisateur pour les mappings récurrents
 * - Pas de modale de confirmation de mapping avant import
 * - Validation stricte : nom obligatoire, ignore les lignes sans nom
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as XLSX from 'xlsx';
import { supabase } from '../../supabaseClient';
import logger from '../logger';
import { prepareClientData } from '../addressFormatter';

/**
 * Type pour une ligne brute du fichier
 * @typedef {Record<string, any>} RawClientRow
 */

/**
 * Type pour une ligne parsée et validée
 * @typedef {Object} ParsedClientRow
 * @property {string} name - Nom du client (obligatoire)
 * @property {string} [firstName] - Prénom
 * @property {string} [type] - Type (Client/Prospect/Autre)
 * @property {string} [phone] - Téléphone
 * @property {string} [email] - Email
 * @property {string} [address] - Adresse complète
 * @property {string} [postalCode] - Code postal
 * @property {string} [city] - Ville
 * @property {string} [notes] - Notes/commentaires
 */

/**
 * Résultat de l'import
 * @typedef {Object} ImportResult
 * @property {number} imported - Nombre de clients importés
 * @property {number} skipped - Nombre de lignes ignorées
 * @property {Array<{line: number, reason: string}>} errors - Erreurs rencontrées
 */

/**
 * Mapping des colonnes possibles vers les champs normalisés
 * Insensible à la casse et aux accents
 */
const COLUMN_MAPPING = {
  // Nom
  name: ['nom', 'name', 'client', 'client name', 'nom client'],
  firstName: ['prenom', 'firstname', 'first_name', 'prénom', 'prenom client'],
  // Type
  type: ['type', 'statut', 'status', 'categorie', 'category'],
  // Contact
  phone: ['telephone', 'phone', 'tel', 'téléphone', 'mobile', 'portable'],
  email: ['email', 'e-mail', 'mail', 'courriel'],
  // Adresse
  address: ['adresse', 'address', 'rue', 'street', 'voie'],
  postalCode: ['cp', 'code_postal', 'postal_code', 'postalcode', 'code postal', 'zip'],
  city: ['ville', 'city', 'commune'],
  // Notes
  notes: ['notes', 'note', 'commentaires', 'comments', 'remarques', 'remarque'],
};

/**
 * Normalise le nom d'une colonne (insensible à la casse, supprime accents/espaces)
 */
function normalizeColumnName(colName) {
  if (!colName) return '';
  return colName
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/\s+/g, '_'); // Remplace espaces par underscore
}

/**
 * Trouve le champ correspondant à une colonne
 */
function findFieldForColumn(columnName) {
  const normalized = normalizeColumnName(columnName);
  
  for (const [field, aliases] of Object.entries(COLUMN_MAPPING)) {
    for (const alias of aliases) {
      if (normalized === normalizeColumnName(alias)) {
        return field;
      }
    }
  }
  
  return null;
}

/**
 * Parse un fichier CSV
 */
async function parseCSV(fileUri) {
  try {
    // Lire le fichier
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Détecter le séparateur (virgule ou point-virgule)
    const firstLine = fileContent.split('\n')[0];
    const hasSemicolon = firstLine.includes(';');
    const delimiter = hasSemicolon ? ';' : ',';

    // Parser ligne par ligne
    const lines = fileContent.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('Fichier CSV vide');
    }

    // Première ligne = headers
    const headers = lines[0]
      .split(delimiter)
      .map(h => h.trim().replace(/^["']|["']$/g, '')); // Supprimer guillemets

    // Créer le mapping colonne -> champ
    const columnMap = {};
    headers.forEach((header, index) => {
      const field = findFieldForColumn(header);
      if (field) {
        columnMap[index] = field;
      }
    });

    // Parser les lignes de données
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const values = line.split(delimiter).map(v => {
        // Supprimer guillemets et trim
        return v.trim().replace(/^["']|["']$/g, '');
      });

      const row = {};
      Object.entries(columnMap).forEach(([colIndex, field]) => {
        const value = values[parseInt(colIndex)]?.trim();
        if (value) {
          row[field] = value;
        }
      });

      rows.push(row);
    }

    return rows;
  } catch (error) {
    logger.error('ImportClients', 'Erreur parsing CSV', error);
    throw new Error(`Erreur lors du parsing CSV: ${error.message}`);
  }
}

/**
 * Parse un fichier XLSX
 */
async function parseXLSX(fileUri) {
  try {
    // Lire le fichier en base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convertir base64 en Uint8Array pour xlsx
    // xlsx peut lire directement depuis base64
    const workbook = XLSX.read(base64, { type: 'base64' });

    // Prendre la première feuille
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error('Aucune feuille trouvée dans le fichier Excel');
    }

    const worksheet = workbook.Sheets[firstSheetName];

    // Convertir en JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    if (jsonData.length === 0) {
      throw new Error('Feuille Excel vide');
    }

    // Première ligne = headers
    const headers = jsonData[0].map(h => String(h || '').trim());

    // Créer le mapping colonne -> champ
    const columnMap = {};
    headers.forEach((header, index) => {
      const field = findFieldForColumn(header);
      if (field) {
        columnMap[index] = field;
      }
    });

    // Parser les lignes de données
    const rows = [];
    for (let i = 1; i < jsonData.length; i++) {
      const values = jsonData[i];
      if (!values || values.length === 0) continue;

      const row = {};
      Object.entries(columnMap).forEach(([colIndex, field]) => {
        const value = String(values[parseInt(colIndex)] || '').trim();
        if (value) {
          row[field] = value;
        }
      });

      rows.push(row);
    }

    return rows;
  } catch (error) {
    logger.error('ImportClients', 'Erreur parsing XLSX', error);
    throw new Error(`Erreur lors du parsing Excel: ${error.message}`);
  }
}

/**
 * Parse un fichier de clients (CSV ou XLSX)
 * @param {string} fileUri - URI du fichier local
 * @param {'csv' | 'xlsx'} fileType - Type de fichier
 * @returns {Promise<ParsedClientRow[]>}
 */
export async function parseClientsFromFile(fileUri, fileType) {
  try {
    logger.info('ImportClients', `Parsing fichier ${fileType}`, { fileUri });

    let rawRows;
    if (fileType === 'csv') {
      rawRows = await parseCSV(fileUri);
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      rawRows = await parseXLSX(fileUri);
    } else {
      throw new Error(`Type de fichier non supporté: ${fileType}`);
    }

    logger.info('ImportClients', `${rawRows.length} lignes brutes parsées`);

    // Valider et nettoyer les lignes
    const parsedRows = [];
    const errors = [];

    rawRows.forEach((rawRow, index) => {
      const lineNumber = index + 2; // +2 car ligne 1 = headers, index 0-based

      // Vérifier que le nom existe
      const name = (rawRow.name || '').trim();
      if (!name) {
        errors.push({ line: lineNumber, reason: 'Nom manquant' });
        return;
      }

      // Nettoyer et valider les données
      const parsed = {
        name: name,
        firstName: (rawRow.firstName || '').trim() || undefined,
        type: (rawRow.type || '').trim() || undefined,
        phone: (rawRow.phone || '').trim() || undefined,
        email: (rawRow.email || '').trim() || undefined,
        address: (rawRow.address || '').trim() || undefined,
        postalCode: (rawRow.postalCode || '').trim() || undefined,
        city: (rawRow.city || '').trim() || undefined,
        notes: (rawRow.notes || '').trim().slice(0, 2000) || undefined, // Limiter à 2000 caractères
      };

      // Validation email basique (optionnel)
      if (parsed.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.email)) {
        // On accepte quand même mais on log
        logger.warn('ImportClients', `Email invalide ligne ${lineNumber}: ${parsed.email}`);
      }

      parsedRows.push(parsed);
    });

    logger.info('ImportClients', `${parsedRows.length} lignes valides, ${errors.length} erreurs`);
    
    return parsedRows;
  } catch (error) {
    logger.error('ImportClients', 'Erreur parseClientsFromFile', error);
    throw error;
  }
}

/**
 * Importe les clients parsés dans Supabase
 * @param {string} userId - ID de l'utilisateur
 * @param {ParsedClientRow[]} rows - Lignes parsées
 * @returns {Promise<ImportResult>}
 */
export async function importClientsFromParsedRows(userId, rows) {
  try {
    if (!userId) {
      throw new Error('userId est requis');
    }

    if (!rows || rows.length === 0) {
      return { imported: 0, skipped: 0, errors: [] };
    }

    logger.info('ImportClients', `Début import ${rows.length} clients pour user ${userId}`);
    if (rows.length > 0) {
      logger.info('ImportClients', `Première ligne reçue:`, JSON.stringify(rows[0], null, 2));
    }

    // Préparer les données pour Supabase
    const clientsToInsert = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const lineNumber = i + 2; // +2 car ligne 1 = headers

      try {
        // Construire le nom complet (concaténer firstName si présent)
        const fullName = row.firstName 
          ? `${row.firstName} ${row.name}`.trim()
          : row.name;

        if (!fullName || !fullName.trim()) {
          logger.warn('ImportClients', `Ligne ${lineNumber} ignorée: nom vide`);
          errors.push({ line: lineNumber, reason: 'Nom vide' });
          continue;
        }

        // Utiliser prepareClientData pour formater correctement
        const clientData = await prepareClientData(
          {
            name: fullName,
            phone: row.phone,
            email: row.email,
            address: row.address,
            postalCode: row.postalCode,
            city: row.city,
          },
          userId
        );

        logger.info('ImportClients', `ClientData préparé ligne ${lineNumber}:`, JSON.stringify(clientData, null, 2));

        // Ajouter les champs supplémentaires si la table les supporte
        // Note: type et notes peuvent ne pas exister dans la table, Supabase les ignorera si nécessaire
        if (row.type) {
          clientData.type = row.type;
        }
        if (row.notes) {
          clientData.notes = row.notes;
        }

        clientsToInsert.push(clientData);
      } catch (error) {
        logger.error('ImportClients', `Erreur préparation ligne ${lineNumber}`, error);
        errors.push({ line: lineNumber, reason: error.message || 'Erreur de préparation' });
      }
    }

    logger.info('ImportClients', `${clientsToInsert.length} clients préparés pour insertion, ${errors.length} erreurs de préparation`);

    if (clientsToInsert.length === 0) {
      logger.warn('ImportClients', 'Aucun client à insérer');
      return {
        imported: 0,
        skipped: rows.length,
        errors: errors,
      };
    }

    // Insérer par batch (500 max par batch pour Supabase)
    const BATCH_SIZE = 500;
    let imported = 0;
    const batchErrors = [];

    for (let i = 0; i < clientsToInsert.length; i += BATCH_SIZE) {
      const batch = clientsToInsert.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      
      logger.info('ImportClients', `Insertion batch ${batchNumber} (${batch.length} clients)`);
      if (batch.length > 0) {
        logger.info('ImportClients', `Premier client du batch:`, JSON.stringify(batch[0], null, 2));
      }
      
      try {
        const { data, error } = await supabase
          .from('clients')
          .insert(batch)
          .select();

        if (error) {
          logger.error('ImportClients', `Erreur insertion batch ${batchNumber}`, error);
          logger.error('ImportClients', `Détails erreur:`, JSON.stringify(error, null, 2));
          batchErrors.push({
            line: i + 1,
            reason: `Erreur batch: ${error.message}`,
          });
          // Continuer avec le batch suivant
          continue;
        }

        imported += data?.length || 0;
        logger.info('ImportClients', `Batch ${batchNumber} inséré avec succès: ${data?.length || 0} clients`);
        if (data && data.length > 0) {
          logger.info('ImportClients', `Premier client inséré:`, JSON.stringify(data[0], null, 2));
        }
      } catch (error) {
        logger.error('ImportClients', `Exception insertion batch ${batchNumber}`, error);
        logger.error('ImportClients', `Détails exception:`, JSON.stringify(error, null, 2));
        batchErrors.push({
          line: i + 1,
          reason: `Exception: ${error.message}`,
        });
      }
    }

    const skipped = rows.length - imported - errors.length - batchErrors.length;

    logger.success('ImportClients', `Import terminé: ${imported} importés, ${skipped} ignorés`);

    return {
      imported,
      skipped: Math.max(0, skipped),
      errors: [...errors, ...batchErrors],
    };
  } catch (error) {
    logger.error('ImportClients', 'Erreur importClientsFromParsedRows', error);
    throw error;
  }
}

