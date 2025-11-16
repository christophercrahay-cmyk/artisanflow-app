import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from './logger';

const LAST_PROJECT_KEY = '@artisanflow:last_selected_project';

/**
 * Sauvegarde le dernier chantier sélectionné
 */
export async function saveLastProject(projectId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_PROJECT_KEY, projectId);
    logger.info('LastProject', 'Chantier sauvegardé', { projectId });
  } catch (error) {
    logger.error('LastProject', 'Erreur sauvegarde', error);
  }
}

/**
 * Récupère le dernier chantier sélectionné
 */
export async function getLastProject(): Promise<string | null> {
  try {
    const projectId = await AsyncStorage.getItem(LAST_PROJECT_KEY);
    if (projectId) {
      logger.info('LastProject', 'Chantier récupéré', { projectId });
    }
    return projectId;
  } catch (error) {
    logger.error('LastProject', 'Erreur récupération', error);
    return null;
  }
}

/**
 * Efface le dernier chantier sélectionné
 */
export async function clearLastProject(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LAST_PROJECT_KEY);
    logger.info('LastProject', 'Chantier effacé');
  } catch (error) {
    logger.error('LastProject', 'Erreur effacement', error);
  }
}

