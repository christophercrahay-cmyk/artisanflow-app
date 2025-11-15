/**
 * Génère un template CSV pour l'import de clients
 */

import * as FileSystem from 'expo-file-system/legacy';

/**
 * Génère le contenu CSV du template
 */
export function generateCSVTemplateContent(): string {
  const headers = ['Nom', 'Téléphone', 'Email', 'Adresse', 'CodePostal', 'Ville'];
  const exampleRow = ['Exemple Client', '0123456789', 'client@exemple.fr', '123 Rue Exemple', '75001', 'Paris'];
  
  return [headers.join(';'), exampleRow.join(';')].join('\n');
}

/**
 * Crée un fichier temporaire pour télécharger le template CSV
 */
export async function createCSVTemplateFile(): Promise<string> {
  const content = generateCSVTemplateContent();
  const fileName = `template_import_clients_${Date.now()}.csv`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;
  
  // Utiliser l'API legacy d'expo-file-system (compatible avec le reste du projet)
  await FileSystem.writeAsStringAsync(fileUri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  
  return fileUri;
}

