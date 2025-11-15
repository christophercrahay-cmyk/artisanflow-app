/**
 * Système de logs complet pour ArtisanFlow
 * - Console (Metro)
 * - Fichier local artisanflow.log
 * - Format clair avec horodatage
 */

import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const LOG_FILE = 'artisanflow.log';
const MAX_LOG_FILE_SIZE = 1024 * 1024; // 1MB

class ArtisanLogger {
  constructor() {
    this.logBuffer = [];
    this.maxBufferSize = 100;
    this.logFilePath = `${FileSystem.documentDirectory}${LOG_FILE}`;
    this.initialized = false;
  }

  /**
   * Initialise le système de logs (rotation si trop gros)
   */
  async init() {
    if (this.initialized) {return;}

    try {
      // Vérifier si fichier existe
      const fileInfo = await FileSystem.getInfoAsync(this.logFilePath);
      
      if (fileInfo.exists) {
        // Vérifier taille
        const size = fileInfo.size || 0;
        if (size > MAX_LOG_FILE_SIZE) {
          // Rotation : archiver ancien
          const archivePath = `${FileSystem.documentDirectory}artisanflow.old.log`;
          await FileSystem.moveAsync({
            from: this.logFilePath,
            to: archivePath,
          });
          console.log('📦 [Logger] Fichier log archivé (> 1MB)');
        }
      }

      // Début session
      await this.writeToFile(`\n\n=== SESSION STARTED ${this.getTimestamp()} ===\n`);
      this.initialized = true;
      
    } catch (err) {
      console.error('🔴 [Logger] Erreur init:', err);
    }
  }

  /**
   * Format horodatage ISO
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Format message de log avec préfixe emoji
   */
  formatMessage(level, category, message, data = null) {
    const timestamp = this.getTimestamp();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    
    return `[${timestamp}] ${level} [${category}] ${message}${dataStr}`;
  }

  /**
   * Écriture dans fichier (async)
   */
  async writeToFile(message) {
    try {
      await FileSystem.writeAsStringAsync(this.logFilePath, message, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch (err) {
      console.error('🔴 [Logger] Erreur écriture fichier:', err);
    }
  }

  /**
   * Ajoute au buffer en mémoire
   */
  addToBuffer(logEntry) {
    this.logBuffer.push(logEntry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift(); // Retirer le plus ancien
    }
  }

  /**
   * LOG INFO (vert) - Action normale réussie
   */
  info(category, message, data = null) {
    const logEntry = this.formatMessage('✅ INFO', category, message, data);
    console.log(logEntry);
    this.addToBuffer(logEntry);
    this.writeToFile(`${logEntry  }\n`);
  }

  /**
   * LOG WARN (orange) - Avertissement non bloquant
   */
  warn(category, message, data = null) {
    const logEntry = this.formatMessage('⚠️ WARN', category, message, data);
    console.warn(logEntry);
    this.addToBuffer(logEntry);
    this.writeToFile(`${logEntry  }\n`);
  }

  /**
   * LOG ERROR (rouge) - Erreur bloquante
   */
  error(category, message, error = null) {
    const errorData = error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : null;
    
    const logEntry = this.formatMessage('🔴 ERROR', category, message, errorData);
    console.error(logEntry);
    this.addToBuffer(logEntry);
    this.writeToFile(`${logEntry  }\n`);
  }

  /**
   * LOG DEBUG (bleu) - Debug technique
   */
  debug(category, message, data = null) {
    if (__DEV__) {
      const logEntry = this.formatMessage('🔵 DEBUG', category, message, data);
      console.log(logEntry);
      this.addToBuffer(logEntry);
      this.writeToFile(`${logEntry  }\n`);
    }
  }

  /**
   * LOG SUCCESS (vert foncé) - Action critique réussie
   */
  success(category, message, data = null) {
    const logEntry = this.formatMessage('🎉 SUCCESS', category, message, data);
    console.log(logEntry);
    this.addToBuffer(logEntry);
    this.writeToFile(`${logEntry  }\n`);
  }

  /**
   * Récupère logs depuis fichier
   */
  async getLogs() {
    try {
      const fileInfo = await FileSystem.getInfoAsync(this.logFilePath);
      if (!fileInfo.exists) {
        return 'Aucun log pour le moment';
      }

      const content = await FileSystem.readAsStringAsync(this.logFilePath);
      return content;
    } catch (err) {
      console.error('🔴 [Logger] Erreur lecture logs:', err);
      return 'Erreur lecture logs';
    }
  }

  /**
   * Récupère logs en mémoire (derniers N)
   */
  getRecentLogs(count = 50) {
    return this.logBuffer.slice(-count);
  }

  /**
   * Efface tous les logs
   */
  async clearLogs() {
    try {
      await this.writeToFile('');
      this.logBuffer = [];
      this.info('Logger', 'Journaux effacés');
      console.log('🗑️ [Logger] Tous les logs effacés');
    } catch (err) {
      console.error('🔴 [Logger] Erreur effacement:', err);
    }
  }

  /**
   * Exporte logs (pour partage)
   */
  async exportLogs() {
    try {
      const logs = await this.getLogs();
      return logs;
    } catch (err) {
      console.error('🔴 [Logger] Erreur export:', err);
      return null;
    }
  }
}

// Instance singleton
const logger = new ArtisanLogger();

// Init au démarrage (non bloquant)
logger.init().catch(err => console.error('Init logger:', err));

export default logger;

